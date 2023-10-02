
const inputElement = document.getElementById('text');
const outputElement = document.getElementById('output');
const toggleSwitch = document.getElementById('toggleSwitch');
const toggleStatus = document.getElementById('toggleStatus');
const tweetDebug = document.getElementById('tweetDebug');

toggleSwitch.addEventListener('change', (event) => {
    if (event.target.checked) {
        toggleStatus.textContent = "sus the vibe";
        
        chrome.runtime.sendMessage({ action: 'startAnalysis' });
    } else {
        toggleStatus.textContent = "let it slide";
        
        chrome.runtime.sendMessage({ action: 'stopAnalysis' });
    }
});

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     if (message.action === 'debugTweetData') {
//         const tweetElement = document.createElement('div');
//         tweetElement.innerHTML = `
//             <strong>Text:</strong> ${message.text} <br>
//             <strong>Color:</strong> ${message.color} <br>
//             <strong>Sentiment:</strong> ${message.sentiment}
//         `;
//         tweetDebug.appendChild(tweetElement);
//     }
// });

document.addEventListener('DOMContentLoaded', function() {
    let toggleSwitch = document.getElementById('toggleSwitch');
    
    chrome.storage.sync.get('isColorizingEnabled', function(data) {
        toggleSwitch.checked = data.isColorizingEnabled || false;
    });

    toggleSwitch.addEventListener('change', function() {
        chrome.storage.sync.set({ 'isColorizingEnabled': toggleSwitch.checked });
    });
});



// switchElement.addEventListener('change', (e) => {
//   if(e.target.checked) {
//       chrome.runtime.sendMessage({ action: 'startAnalysis' });
//       updateDebugDiv(true);
//   } else {
//       chrome.runtime.sendMessage({ action: 'stopAnalysis' });
//       updateDebugDiv(false);
//   }
//   chrome.storage.local.set({ shouldAnalyze: e.target.checked });
// });

// setInterval(() => {
//   console.log('interval running')
//   chrome.storage.local.get(['tweetDebug'], (result) => {

//       const debugDiv = document.getElementById('tweetDebug');
//       debugDiv.textContent = result.tweetDebug || "No recent activity.";
//   });
// }, 1000);


// function handleToggleChange(event) {
//   const isChecked = event.target.checked;

  
//   chrome.storage.sync.set({ shouldAnalyze: isChecked }, () => {
//       if (chrome.runtime.lastError) {
//           console.error('Failed to update shouldAnalyze:', chrome.runtime.lastError);
//           return;
//       }

//       console.log(`Updated shouldAnalyze to ${isChecked}`);
//   });

//   updateDebugDiv(isChecked);
// }


