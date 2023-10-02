const MAX_CONCURRENT_ANALYSIS = 5; 
let currentAnalyses = 0; 


function getSentimentFromBackground(text) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: 'analyzeTweet', tweetText: text}, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Message sending error:', chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
            } else {
                resolve(response);
            }
        });
    });
}

async function colorizeTweet(tweet) {
    if (currentAnalyses >= MAX_CONCURRENT_ANALYSIS) {
        return; 
    }
    currentAnalyses++;
    tweet.setAttribute('data-holdAnalysis', 'true'); 
    const textContent = tweet.innerText;

    try {
        const result = await getSentimentFromBackground(textContent);
        
        switch (result.sentiment) {
            case 'POSITIVE':
                tweet.style.backgroundColor = '#566659';
                break;
            case 'NEGATIVE':
                tweet.style.backgroundColor = '#614243';
                break;
            case 'NEUTRAL':
            default:
                break;
        }
        
        tweet.setAttribute('data-colored', 'true'); 
        tweet.removeAttribute('data-holdAnalysis'); 
    } catch (error) {
        tweet.removeAttribute('data-holdAnalysis'); 
        console.error('Error getting sentiment:', error);
    }
    currentAnalyses--;
}

let isColorizing = false;
const colorizeTweets = async () => {
    isColorizing = true;
    const tweets = document.querySelectorAll('article[role="article"]:not([data-colored]):not([data-holdAnalysis])');

    for (let tweet of tweets) {
        await colorizeTweet(tweet);
    }
    isColorizing = false;
};

let scrollTimeout;
document.addEventListener('scroll', () => {
    if (isColorizing || currentAnalyses >= MAX_CONCURRENT_ANALYSIS) return;

    chrome.storage.sync.get('isColorizingEnabled', function(data) {
        if (data.isColorizingEnabled) {
            colorizeTweets();
        }
    });
});
