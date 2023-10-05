import { loadTokenizer } from "./bert_tokenizer.ts";
import * as ort from "onnxruntime-web";

ort.env.wasm.numThreads = 1;
ort.env.wasm.simd = true;

const options = {
  executionProviders: ["wasm"],
  graphOptimizationLevel: "all"
};

var downLoadingModel = true;
const model = chrome.runtime.getURL("/xtremedistill-go-emotion-int8.onnx");

const session = ort.InferenceSession.create(model);
session.then((t) => {
  downLoadingModel = false;
  //warmup the VM
  for (var i = 0; i < 10; i++) {
    console.log("Inference warmup " + i);
    lm_inference("this is a warmup inference");
  }
});

const tokenizer = loadTokenizer();
const EMOJI_DEFAULT_DISPLAY = [
  ["Emotion", "Score"],
  ["admiration 👏", 0],
  ["amusement 😂", 0],
  ["neutral 😐", 0],
  ["approval 👍", 0],
  ["joy 😃", 0],
  ["gratitude 🙏", 0]
];

const EMOJIS = [
  "admiration 👏",
  "amusement 😂",
  "anger 😡",
  "annoyance 😒",
  "approval 👍",
  "caring 🤗",
  "confusion 😕",
  "curiosity 🤔",
  "desire 😍",
  "disappointment 😞",
  "disapproval 👎",
  "disgust 🤮",
  "embarrassment 😳",
  "excitement 🤩",
  "fear 😨",
  "gratitude 🙏",
  "grief 😢",
  "joy 😃",
  "love ❤️",
  "nervousness 😬",
  "optimism 🤞",
  "pride 😌",
  "realization 💡",
  "relief😅",
  "remorse 😞",
  "sadness 😞",
  "surprise 😲",
  "neutral 😐"
];
const EMOJI_SENTIMENT = {
  "admiration 👏": "POSITIVE",
  "amusement 😂": "POSITIVE",
  "anger 😡": "NEGATIVE",
  "annoyance 😒": "NEGATIVE",
  "approval 👍": "POSITIVE",
  "caring 🤗": "POSITIVE",
  "confusion 😕": "NEGATIVE",
  "curiosity 🤔": "POSITIVE",
  "desire 😍": "POSITIVE",
  "disappointment 😞": "NEGATIVE",
  "disapproval 👎": "NEGATIVE",
  "disgust 🤮": "NEGATIVE",
  "embarrassment 😳": "NEGATIVE",
  "excitement 🤩": "POSITIVE",
  "fear 😨": "NEGATIVE",
  "gratitude 🙏": "POSITIVE",
  "grief 😢": "NEGATIVE",
  "joy 😃": "POSITIVE",
  "love ❤️": "POSITIVE",
  "nervousness 😬": "NEGATIVE",
  "optimism 🤞": "POSITIVE",
  "pride 😌": "POSITIVE",
  "realization 💡": "POSITIVE",
  "relief😅": "POSITIVE",
  "remorse 😞": "NEGATIVE",
  "sadness 😞": "NEGATIVE",
  "surprise 😲": "POSITIVE",
  "neutral 😐": "NEUTRAL"
};

function isDownloading() {
  return downLoadingModel;
}

function sortResult(a, b) {
  if (a[1] === b[1]) {
    return 0;
  } else {
    return a[1] < b[1] ? 1 : -1;
  }
}

function sigmoid(t) {
  return 1 / (1 + Math.pow(Math.E, -t));
}

//text encoder
function create_model_input(encoded) {
  var input_ids = new Array(encoded.length + 2);
  var attention_mask = new Array(encoded.length + 2);
  var token_type_ids = new Array(encoded.length + 2);
  input_ids[0] = BigInt(101);
  attention_mask[0] = BigInt(1);
  token_type_ids[0] = BigInt(0);
  var i = 0;
  for (; i < encoded.length; i++) {
    input_ids[i + 1] = BigInt(encoded[i]);
    attention_mask[i + 1] = BigInt(1);
    token_type_ids[i + 1] = BigInt(0);
  }
  input_ids[i + 1] = BigInt(102);
  attention_mask[i + 1] = BigInt(1);
  token_type_ids[i + 1] = BigInt(0);
  const sequence_length = input_ids.length;
  input_ids = new ort.Tensor("int64", BigInt64Array.from(input_ids), [
    1,
    sequence_length
  ]);
  attention_mask = new ort.Tensor("int64", BigInt64Array.from(attention_mask), [
    1,
    sequence_length
  ]);
  token_type_ids = new ort.Tensor("int64", BigInt64Array.from(token_type_ids), [
    1,
    sequence_length
  ]);
  return {
    input_ids: input_ids,
    attention_mask: attention_mask,
    token_type_ids: token_type_ids
  };
}

async function lm_inference(text) {
  try {
    const encoded_ids = await tokenizer.then((t) => {
      return t.tokenize(text);
    });
    if (encoded_ids.length === 0) {
      return [0.0, EMOJI_DEFAULT_DISPLAY];
    }
    const start = performance.now();
    const model_input = create_model_input(encoded_ids);
    const output = await session.then((s) => {
      return s.run(model_input, ["output_0"]);
    });
    const duration = (performance.now() - start).toFixed(1);
    const probs = output["output_0"].data
      .map(sigmoid)
      .map((t) => Math.floor(t * 100));

    const result = [];
    for (var i = 0; i < EMOJIS.length; i++) {
      const t = [EMOJIS[i], probs[i]];
      result[i] = t;
    }
    result.sort(sortResult);

    const result_list = [];
    result_list[0] = ["Emotion", "Score"];
    for (i = 0; i < 6; i++) {
      result_list[i + 1] = result[i];
    }
    return [duration, result_list];
  } catch (e) {
    return [0.0, EMOJI_DEFAULT_DISPLAY];
  }
}

export let inference = lm_inference;
export let columnNames = EMOJI_DEFAULT_DISPLAY;
export let modelDownloadInProgress = isDownloading;

let shouldAnalyze = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case "analyzeTweet":
      lm_inference(message.tweetText)
        .then((result) => {
          if (result && result[1] && result[1].length > 1) {
            let topEmotion;
            for (let emotion of result[1]) {
              // Iterate over the sorted emotions
              console.log(emotion[0]);
              if (
                EMOJI_SENTIMENT[emotion[0]] !== "NEUTRAL" &&
                emotion[0] !== "Emotion"
              ) {
                topEmotion = emotion;
                break; // Break the loop once a non-NEUTRAL sentiment is found
              }
            }
            console.log(message.tweetText, topEmotion);
            sendResponse({ sentiment: EMOJI_SENTIMENT[topEmotion[0]] });
          } else {
            console.error("Classification did not produce expected result.");
            sendResponse({ sentiment: "UNKNOWN" });
          }
        })
        .catch((error) => {
          console.error("Error during message processing:", error);
          sendResponse({ status: "Error", error: error.message });
        });
      return true;

    default:
      sendResponse({ status: "Unknown action" });
      break;
  }
});
