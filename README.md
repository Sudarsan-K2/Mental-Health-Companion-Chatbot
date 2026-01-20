# EmpathAI: Privacy-First Multimodal Affective Computing Interface

## Table of Contents
1. [Introduction](#1-introduction)
2. [Problem Statement](#2-problem-statement)
3. [Proposed Solution](#3-proposed-solution)
4. [System Architecture](#4-system-architecture)
5. [Technology Stack](#5-technology-stack)
6. [Installation and Setup](#6-installation-and-setup)
7. [Usage Guide](#7-usage-guide)
8. [Future Scope](#8-future-scope)

---

## 1. Introduction
EmpathAI is a real-time, multimodal emotional support companion designed to humanize digital interactions. By integrating local computer vision with advanced Large Language Models (LLMs), the application enables an Artificial Intelligence system to detect human facial expressions and adapt its responses accordingly. This project aims to bridge the gap between static text-based chatbots and genuine empathetic communication, all while prioritizing user privacy through Edge Computing.

## 2. Problem Statement
In the current digital landscape, mental health support is often expensive, stigmatized, or inaccessible. While traditional AI chatbots offer 24/7 availability, they suffer from a significant limitation: they are "blind." They process text input but miss the critical non-verbal cues—such as facial expressions and voice tone—that constitute the majority of human communication. Furthermore, users are increasingly hesitant to utilize emotion-aware tools due to privacy concerns regarding biometric video data being transmitted to cloud servers.

## 3. Proposed Solution
EmpathAI addresses this disconnect by implementing a **Hybrid AI Architecture**.
* **Multimodal Intelligence:** The system combines the semantic understanding of Google Gemini (NLP) with the visual intuition of `face-api.js` (Computer Vision).
* **Privacy-First Design:** We utilize an "Edge AI" approach where all facial detection and emotion recognition happen locally within the user's browser. No video feed is ever recorded or sent to a backend server.
* **Dynamic Adaptation:** The application detects 7 distinct emotional states (Happy, Sad, Neutral, Angry, Fearful, Disgusted, Surprised) and modifies the AI's system prompt in real-time to match the user's mood.

## 4. System Architecture
The application follows a decoupled Client-Server architecture optimized for low latency and high privacy.

**1. Frontend (The Edge Layer):**
* Captures video and audio via the browser (Webcam/Mic).
* Runs the **SSD MobileNet V1** neural network locally to extract emotional classification tags.
* Converts speech to text using the Web Speech API.
* Sends a lightweight JSON payload (Text + Emotion Tag) to the server.

**2. Backend (The Logic Layer):**
* Receives the payload via a **FastAPI** asynchronous endpoint.
* Performs **Context-Aware Prompt Engineering**: It injects the emotion tag into the LLM context window (e.g., "User is sad. Adopt a comforting persona.").
* Queries **Google Gemini Pro** to generate the final response.

**3. Output:**
* The text response is returned to the frontend.
* The browser converts the text to audio (TTS) for a natural, two-way conversation.

## 5. Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend UI** | HTML5, CSS3, JavaScript | Responsive interface with Glassmorphism design. |
| **Computer Vision** | Face-API.js | Browser-based Convolutional Neural Network (CNN). |
| **Backend Framework** | FastAPI (Python) | High-performance, asynchronous web framework. |
| **Generative AI** | Google Gemini Pro | Transformer-based Large Language Model. |
| **Server** | Uvicorn | ASGI server for production deployment. |

## 6. Installation and Setup

Follow these exact steps to run the project locally.

### Step 1: Configuration & Dependencies
1.  Install the required Python packages by running the following command in your terminal:
    ```bash
    pip install fastapi uvicorn google-generativeai python-multipart requests
    ```
2.  Open the file named `inference.py` (located in the backend folder).
3.  Find the configuration line for the API Key and paste your Google Gemini API Key directly there:
    ```python
    # Inside inference.py
    genai.configure(api_key="YOUR_ACTUAL_API_KEY_HERE")
    ```

### Step 2: Running the Application
You need to open **two separate terminal windows** to run the backend and frontend simultaneously.

**Terminal 1 (Backend):**
Navigate to the backend folder and start the API server:
```bash
cd backend
python app.py
```
*The backend server will start running.*

**Terminal 2 (Frontend):**
Open a **new** terminal window, navigate to the frontend folder, and start a local Python HTTP server:
```bash
cd frontend
python -m http.server
```
*This will serve the frontend files (usually at port 8000).*

### Step 3: Access the Interface
1.  Open your web browser (Chrome/Edge/Firefox).
2.  Go to the local address shown in Terminal 2 (usually `http://localhost:8000` or `http://127.0.0.1:8000`).
3.  You will see the **Login Page**.
4.  **Register** a new username and password.
5.  **Login** with your credentials to access the main dashboard.

## 7. Usage Guide
1.  **Permissions:** Allow the browser to access the Webcam and Microphone when prompted.
2.  **Interaction:** Speak clearly or type into the chat box. Ensure your face is well-lit for accurate detection.
3.  **Real-Time Feedback:** Observe the "Current Emotion" indicator on the dashboard, which updates instantly as your expression changes.
4.  **Response:** The AI will reply via text and voice, with a tone calibrated to your detected emotion.


**Disclaimer:** This project is a prototype for an emotional support assistant and is not a replacement for professional medical advice or therapy.
