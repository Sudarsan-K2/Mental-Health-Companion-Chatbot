const API_URL = "http://127.0.0.1:8001";
let isLoginMode = true; 

// =========================================================
//  1. PAGE LOAD CHECKS 
// =========================================================
window.onload = function() {
    const userId = localStorage.getItem("user_id");
    const username = localStorage.getItem("username");
    const path = window.location.pathname;

    // Check if we are on the main page (index.html or root /)
    if (path.includes("index.html") || path === "/") {
        if (!userId) {
            window.location.href = "login.html"; 
        } else {
            const nameDisplay = document.getElementById("displayUsername");
            if (nameDisplay) nameDisplay.innerText = username;
        }
    } 
    // Check if we are on the login page
    else if (path.includes("login.html")) {
        if (userId) {
            window.location.href = "index.html"; 
        }
    }
};

// =========================================================
//  2. LOGIN & REGISTER LOGIC 
// =========================================================
async function handleLogin() {
    const userField = document.getElementById("loginUser").value;
    const passField = document.getElementById("loginPass").value;
    const errorMsg = document.getElementById("loginError");

    if (!userField || !passField) {
        errorMsg.innerText = "Please fill in all fields.";
        return;
    }

    const endpoint = isLoginMode ? "/login" : "/register";

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: userField, password: passField })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("user_id", data.user_id);
            localStorage.setItem("username", userField);
            window.location.href = "index.html";
        } else {
            errorMsg.innerText = data.detail || "Authentication failed";
        }
    } catch (err) {
        console.error(err);
        errorMsg.innerText = "Server Error. Is app.py running?";
    }
}

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    const title = document.querySelector(".login-header h2");
    const btn = document.querySelector(".auth-btn");
    const link = document.querySelector(".toggle-link span");
    const error = document.getElementById("loginError");

    if(title) title.innerText = isLoginMode ? "Welcome Back" : "Create Account";
    if(btn) btn.innerText = isLoginMode ? "Login" : "Sign Up";
    if(link) link.innerText = isLoginMode ? "Create an Account" : "Login instead";
    if(error) error.innerText = "";
}

function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

// =========================================================
//  3. CHAT & DASHBOARD LOGIC (With Auto-Scroll Fix)
// =========================================================

function scrollToBottom() {
    const chatBox = document.getElementById("chatBox");
    if (chatBox) {
        setTimeout(() => {
            chatBox.scrollTop = chatBox.scrollHeight;
        }, 50);
    }
}

function speak(text) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.includes("Female") || v.name.includes("Google US English"));
    if (preferred) utterance.voice = preferred;
    window.speechSynthesis.speak(utterance);
}

function addMessage(text, sender) {
    const chatBox = document.getElementById("chatBox");
    if (!chatBox) return; 

    const div = document.createElement("div");
    div.className = `message ${sender === 'user' ? 'user-msg' : 'bot-msg'}`;
    div.innerHTML = `<p>${text}</p>`;
    chatBox.appendChild(div);
    scrollToBottom();
}

function updateDashboard(emotion) {
    // This updates the UI based on TEXT chat emotion
    const emotionTitle = document.getElementById("currentEmotion");
    const emotionIcon = document.getElementById("emotionIcon");
    const emotionTip = document.getElementById("emotionTip");
    
    if (!emotionTitle) return;

    let icon = "😐";
    let tip = "I am listening...";
    const emo = emotion ? emotion.toLowerCase() : "neutral";

    if (emo.includes("joy") || emo.includes("happy")) {
        icon = "😊"; tip = "Keep holding onto this feeling!";
    } else if (emo.includes("sad") || emo.includes("grief")) {
        icon = "💙"; tip = "It is okay to not be okay.";
    } else if (emo.includes("anger") || emo.includes("annoy")) {
        icon = "😠"; tip = "Take a deep breath. Count to 10.";
    } else if (emo.includes("fear") || emo.includes("anx")) {
        icon = "😰"; tip = "You are safe. Focus on your breathing.";
    }

    emotionTitle.innerText = emotion || "Neutral";
    if(emotionIcon) emotionIcon.innerText = icon;
    if(emotionTip) emotionTip.innerText = tip;
}

function showTyping() {
    const chatBox = document.getElementById("chatBox");
    if (!chatBox || document.getElementById("typingLoader")) return;

    const div = document.createElement("div");
    div.className = "typing-indicator";
    div.id = "typingLoader";
    div.innerHTML = `<span></span><span></span><span></span>`;
    chatBox.appendChild(div);
    scrollToBottom();
}

function removeTyping() {
    const loader = document.getElementById("typingLoader");
    if (loader) loader.remove();
}

async function sendMessage() {
    const input = document.getElementById("userInput");
    if (!input) return;
    
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    input.value = '';
    showTyping(); 

    const userId = localStorage.getItem("user_id");

    try {
        const response = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text, user_id: userId }) 
        });

        const data = await response.json();
        
        removeTyping();
        addMessage(data.reply, 'bot'); 
        updateDashboard(data.emotion);
        speak(data.reply);

    } catch (error) {
        removeTyping();
        addMessage("⚠️ Brain Offline.", 'bot');
    }
}

function startVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Voice not supported.");
        return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    const btn = document.getElementById("micBtn");
    
    btn.style.color = "#ff7675"; 
    recognition.onstart = () => console.log("Listening...");
    recognition.onend = () => btn.style.color = "white";

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        document.getElementById("userInput").value = transcript;
        sendMessage();
    };
    recognition.start();
}

// =========================================================
//  4. HISTORY FEATURE 
// =========================================================

async function loadHistory() {
    const modal = document.getElementById("historyModal");
    const list = document.getElementById("historyList");
    const userId = localStorage.getItem("user_id");

    modal.style.display = "flex";
    list.innerHTML = "<p>Loading...</p>";

    try {
        const response = await fetch(`${API_URL}/history/${userId}`);
        const chats = await response.json();

        list.innerHTML = "";
        
        if(chats.length === 0) {
            list.innerHTML = "<p>No history found.</p>";
            return;
        }

        chats.reverse().forEach(chat => {
            const item = document.createElement("div");
            item.className = "history-item";
            
            const date = new Date(chat.timestamp).toLocaleString();
            const shortMsg = chat.user_message.length > 40 ? chat.user_message.substring(0, 40) + "..." : chat.user_message;

            item.innerHTML = `
                <div class="history-date">${date}</div>
                <div class="history-user"><strong>You:</strong> ${shortMsg}</div>
                <div class="history-bot">Mood: ${chat.emotion_detected}</div>
            `;

            item.onclick = () => restoreChat(chat);
            list.appendChild(item);
        });

    } catch (error) {
        list.innerHTML = "<p style='color:red'>Failed to load history.</p>";
    }
}

function restoreChat(chat) {
    closeHistory();
    const chatBox = document.getElementById("chatBox");
    chatBox.innerHTML = ''; 

    const notice = document.createElement("div");
    notice.style.textAlign = "center";
    notice.style.fontSize = "0.8rem";
    notice.style.opacity = "0.5";
    notice.style.margin = "10px 0";
    notice.innerText = `--- Memory from ${new Date(chat.timestamp).toLocaleDateString()} ---`;
    chatBox.appendChild(notice);

    addMessage(chat.user_message, 'user');
    addMessage(chat.bot_reply, 'bot');
    updateDashboard(chat.emotion_detected);
}

function closeHistory() {
    document.getElementById("historyModal").style.display = "none";
}

const inputField = document.getElementById("userInput");
if (inputField) {
    inputField.addEventListener("keypress", (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}

/* =========================================
   5. COMPUTER VISION (NEW: CLICK TO START)
   ========================================= */

const video = document.getElementById('video');
const cameraBtn = document.getElementById('cameraBtn');
let isCameraOn = false; 
let detectionInterval;  

// A. Load the AI Models Silently
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('./weights'),
    faceapi.nets.faceExpressionNet.loadFromUri('./weights')
]).then(() => {
    console.log("AI Models Loaded. Waiting for user to click Camera button.");
}).catch(err => console.error("Model Error:", err));

// B. Button Click Event (The Switch)
if (cameraBtn) {
    cameraBtn.addEventListener('click', () => {
        if (!isCameraOn) {
            startCamera();
        } else {
            stopCamera();
        }
    });
}

// C. Function to START Camera
function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: {} })
        .then(stream => {
            video.srcObject = stream;
            isCameraOn = true;
            cameraBtn.innerText = "🛑"; // Change icon to Stop
            cameraBtn.style.color = "#ff7675"; // Make it red
            
            startDetection(); // Start the brain
        })
        .catch(err => console.error("Camera Error:", err));
}

// D. Function to STOP Camera
function stopCamera() {
    const stream = video.srcObject;
    if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
    }
    video.srcObject = null;
    
    isCameraOn = false;
    cameraBtn.innerText = "📷"; // Change icon back to Camera
    cameraBtn.style.color = ""; // Reset color
    
    clearInterval(detectionInterval); // Stop the brain loop
    
    // Reset UI to Neutral
    const emotionLabel = document.getElementById("currentEmotion"); 
    const emotionIcon = document.getElementById("emotionIcon");
    if(emotionLabel) emotionLabel.innerText = "Neutral";
    if(emotionIcon) emotionIcon.innerText = "😐";
}

// E. The Detection Loop
// E. The Detection Loop (SENSITIVITY BOOSTED)
function startDetection() {
    video.addEventListener('play', () => {
        // Clear old timers
        if (detectionInterval) clearInterval(detectionInterval);

        detectionInterval = setInterval(async () => {
            if (!video.srcObject) return;

            // 1. Detect faces with BETTER SENSITIVITY
            // inputSize: 512 -> Sees more detail (good for faces further away)
            // scoreThreshold: 0.3 -> Accepts faces even if it's only 30% sure
            const detections = await faceapi.detectAllFaces(
                video, 
                new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.3 })
            ).withFaceExpressions();

            // 2. Debug Log
            console.log(`Scan result: ${detections.length} faces found`);

            if (detections.length > 0) {
                const expressions = detections[0].expressions;
                
                // Find the strongest emotion
                const mood = Object.keys(expressions).reduce((a, b) => 
                    expressions[a] > expressions[b] ? a : b
                );
                
                console.log("Mood:", mood); 
                updateMoodUI_Camera(mood);
            }
        }, 3000); // Check every 3 seconds
    }, { once: true });
}

// Helper: Update UI for Camera (Renamed to avoid conflict)
function updateMoodUI_Camera(mood) {
    const emotionLabel = document.getElementById("currentEmotion"); 
    const emotionIcon = document.getElementById("emotionIcon");

    const iconMap = {
        neutral: "😐", happy: "😄", sad: "😢", angry: "😠", 
        fearful: "😨", disgusted: "🤢", surprised: "😲"
    };

    if(emotionLabel) {
        emotionLabel.innerText = mood.charAt(0).toUpperCase() + mood.slice(1);
        emotionLabel.style.color = '#00b894'; 
    }

    if(emotionIcon) {
        emotionIcon.innerText = iconMap[mood] || "😐";
    }
}