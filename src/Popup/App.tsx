import React, { useState } from "react";

export default function App() {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      if (currentTab && currentTab.id) {
        chrome.tabs.sendMessage(
          currentTab.id,
          { command: "rescanTweets" },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
              setLoading(false);
            } else {
              setTweets(response);
              setLoading(false);
            }
          }
        );
      }
    });
  };

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <button onClick={handleClick}>Sus the vibes</button>
          
        </>
      )}
    </div>
  );
}

