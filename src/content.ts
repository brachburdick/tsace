
import { useState } from 'react';

const interpretSentiment = (distilbertResults: any) => {
    const maxEmotion = Math.max(
        distilbertResults.sadness,
        distilbertResults.joy,
        distilbertResults.fear,
        distilbertResults.anger,
        distilbertResults.surprise,
        distilbertResults.disgust
    );

    if (maxEmotion === distilbertResults.joy) {
        return 'positive';
    } else if (maxEmotion === distilbertResults.sadness ||
               maxEmotion === distilbertResults.fear ||
               maxEmotion === distilbertResults.anger ||
               maxEmotion === distilbertResults.disgust) {
        return 'negative';
    } else {
        return 'neutral';
    }
}

const analyzeSentiment = async (text: string): Promise<any> => {
    const API_ENDPOINT = 'https://tsace.vercel.app/api/sentimentAnalysis';
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
        });

        if (!response.ok) {
            console.error('Failed to get sentiment', response.statusText);
            return 'neutral'; 
        }

        const distilbertResults = await response.json();
        return interpretSentiment(distilbertResults); 
    } catch (error) {
        console.error("Failed to analyze sentiment:", error);
        return 'neutral'; 
    }
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === "rescanTweets") {
        const tweets = scanTweets(); 
        sendResponse(tweets.length ? tweets : []);
    }
});

function scanTweets(): string[] {
    const tweetsElements = document.querySelectorAll('article[role="article"]');
    return Array.from(tweetsElements).map(tweet => (tweet as HTMLElement).innerText);
}

const colorizeTweets = async (): Promise<void> => {
    const tweets = document.querySelectorAll('article[role="article"]:not([data-colored])');
    tweets.forEach(async (tweet) => {
        const textContent = (tweet as HTMLElement).innerText;
        chrome.runtime.sendMessage({command: "currentTweet", text: textContent});
        
        const sentiment = await analyzeSentiment(textContent);
        switch(sentiment) {
            case 'positive':
                (tweet as HTMLElement).style.backgroundColor = '#D5E8D4';
                break;
            case 'negative':
                (tweet as HTMLElement).style.backgroundColor = '#E8D4D5';
                break;
            case 'neutral':
            default:
                (tweet as HTMLElement).style.backgroundColor = '#E5E5E5';
                break;
        }

        (tweet as HTMLElement).setAttribute('data-colored', 'true');
    });
};

document.addEventListener('scroll', colorizeTweets);

function addScriptToWindow(scriptLocation: string): void {
    try {
        const container = document.head || document.documentElement;
        const script = document.createElement("script");
        script.setAttribute("async", "false");
        script.setAttribute("type", "text/javascript");
        script.setAttribute("src", scriptLocation);
        container.insertBefore(script, container.children[0]);
        container.removeChild(script);
    } catch (e) {
        console.error("Failed to inject script\n", e);
    }
}

addScriptToWindow(chrome.extension.getURL("/build/injected.js"));

export {};
