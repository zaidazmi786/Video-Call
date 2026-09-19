# 🎥 Milo — Video Calling App

A full-stack real-time video calling application built with **React**, **Node.js**, **Socket.io**, and **WebRTC**. Supports multi-user video calls, screen sharing, in-call chat, and meeting history — all secured with user authentication.

---

## ✨ Features

- 🔐 **User Authentication** — Register/Login with hashed passwords (bcrypt) and token-based sessions
- 📹 **Multi-user Video Calls** — Peer-to-peer video/audio via WebRTC
- 🖥️ **Screen Sharing** — Share your screen mid-call, auto-reverts to camera when stopped
- 💬 **In-call Chat** — Real-time text chat alongside video, with unread message badge
- 🎙️ **Mic/Camera Controls** — Toggle audio and video on the fly
- 📜 **Meeting History** — Every joined meeting is logged with date and code, viewable per user
- 📱 **Responsive UI** — Works across desktop and mobile screen sizes

---

## 🛠️ Tech Stack

**Frontend**
- React (Vite)
- React Router DOM
- Material UI (MUI)
- Axios
- Socket.io-client
- WebRTC (`RTCPeerConnection`)

**Backend**
- Node.js + Express
- Socket.io (signaling server)
- MongoDB + Mongoose
- bcrypt (password hashing)
- CORS

---

## 📁 Project Structure

```
Zoom_clone/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── userController.js      # login, register, meeting history
│   │   │   └── socketManager.js       # WebRTC signaling via socket.io
│   │   ├── models/
│   │   │   ├── user.model.js
│   │   │   └── meetings.model.js
│   │   ├── routes/
│   │   │   └── user.routes.js
│   │   └── app.js                     # Express app entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── contexts/
    │   │   └── AuthContext.jsx        # auth state + API calls
    │   ├── pages/
    │   │   ├── Landing.jsx
    │   │   ├── authentication.jsx
    │   │   ├── home.jsx
    │   │   ├── history.jsx
    │   │   └── VideoMeet.jsx          # core video call logic
    │   ├── style/
    │   ├── environment.js             # backend base URL
    │   └── App.jsx
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- A MongoDB connection string (local or MongoDB Atlas)

### 1. Clone the repo
```bash
git clone <your-repo-url>
cd Zoom_clone
```

### 2. Backend setup
```bash
cd backend
npm install
```

Update your MongoDB connection string in `src/app.js`:
```javascript
await mongoose.connect("your-mongodb-connection-string")
```

Run the backend:
```bash
npm run dev
```
Server starts on `http://localhost:8080`.

### 3. Frontend setup
```bash
cd frontend
npm install
```

Set your backend URL in `src/environment.js`:
```javascript
const server = "http://localhost:8080"; // or your deployed backend URL
export default server;
```

Run the frontend:
```bash
npm run dev
```
App starts on `http://localhost:5173`.

---

## 🔌 API Endpoints

| Method | Endpoint                          | Description                |
|--------|------------------------------------|-----------------------------|
| POST   | `/api/v1/users/register`          | Register a new user         |
| POST   | `/api/v1/users/login`             | Login and receive a token   |
| GET    | `/api/v1/users/get_all_activity`  | Fetch a user's meeting history |
| POST   | `/api/v1/users/add_to_activity`   | Log a joined meeting         |

---

## 🌐 Deployment

Both frontend and backend can be deployed independently on **Render**:

- **Backend** → Deploy as a *Web Service* (Node environment)
- **Frontend** → Deploy as a *Static Site* (`npm run build`, publish `dist/`)

> ⚠️ After deploying the backend, update `frontend/src/environment.js` with the live backend URL before deploying the frontend. Also add a SPA rewrite rule (`/* → /index.html`) on the frontend static site so React Router routes work on refresh.

---

## 🧠 How It Works

1. **Signaling** — Socket.io handles exchanging WebRTC offers, answers, and ICE candidates between peers.
2. **Media** — `getUserMedia`/`getDisplayMedia` capture camera, mic, and screen; streams are attached to `RTCPeerConnection` via track senders.
3. **Rendering** — Each remote peer's stream is rendered in its own `<video>` tile inside a responsive grid.
4. **Persistence** — On joining a meeting, the meeting code is saved against the logged-in user for later viewing in **History**.

---

## 📄 License

This project is open source and available for personal or educational use.