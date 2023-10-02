import { pipeline, env } from '@xenova/transformers';


env.allowLocalModels = false;
env.backends.onnx.wasm.numThreads = 1;

class PipelineSingleton {
    static task = 'text-classification';
    static model = 'Xenova/distilbert-base-uncased-finetuned-sst-2-english';
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = pipeline(this.task, this.model, { progress_callback });
        }
        return this.instance;
    }
}

let modelInstance = null;
PipelineSingleton.getInstance((data) => {
}).then(instance => {
    modelInstance = instance;
});

const classify = async (text) => {
    if (!modelInstance) {
        console.error("Model is not yet initialized!");
        throw new Error("Model is not yet initialized!");
    }
    let result = await modelInstance(text);
    return result;
};

let shouldAnalyze = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case 'analyzeTweet':
            classify(message.tweetText).then(result => {
                if (result && result.length > 0) {
                    const sentiment = result[0].label;
                    sendResponse({ sentiment: sentiment });
                } else {
                    console.error("Classification did not produce expected result.");
                    sendResponse({ sentiment: "UNKNOWN" });
                }
            }).catch(error => {
                console.error("Error during message processing:", error);
                sendResponse({status: "Error", error: error.message});
            });

            return true;  

        default:
            sendResponse({status: "Unknown action"});
            break;
    }
});
