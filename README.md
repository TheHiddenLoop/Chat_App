# 💬 Chatty – Real-Time Chat Based Web Application

## 📍 Live Demo  
🌐 [https://chat-app-5t98.onrender.com/](https://chat-app-5t98.onrender.com/)

---

## 📘 Overview / Description

**Chatty** is a full-stack web-based messaging platform that enables real-time communication with secure authentication, friend management, group and private chats, media sharing, and a built-in AI chatbot. Designed for both individuals and organizations, Chatty offers a seamless, responsive, and highly interactive user experience accessible across devices.

---

## ✨ Features

- ⚡ **Instant Messaging**: Real-time 1-to-1 and group chat  
- 🔒 **Secure JWT Authentication**: Protects user data and privacy  
- 🧑‍🤝‍🧑 **Friend Management**: Send, accept, reject, and manage friend requests  
- 🖼️ **Media Sharing**: Share images (future support for docs/videos)  
- 📖 **Chat History**: Persistent, searchable logs  
- ✅ **Read Receipts & Typing Indicators**: Interactive chat UX  
- 🤖 **AI Assistant**: Smart chatbot for instant responses  
- 🔔 **Push Notifications**: Real-time message/request alerts  
- 🛡️ **End-to-End Encryption** *(planned)*  
- ♿ **Responsive UI**: Mobile/tablet/desktop ready  
- 🌐 **Cross-Device**: Use anywhere via web browser  

---

## ⚙️ Installation

**Prerequisites**:  
- Node.js (v14+), npm, MongoDB  
- (Optional) Cloudinary account for image uploads  

**Clone the repo:**

```bash
git clone https://github.com/yourusername/chatty.git
cd chatty
```

**Backend Setup:**

```bash
cd backend
npm install
```

**Frontend Setup:**

```bash
cd ../frontend
npm install
```

**Configure environment variables**  
See `.env` instructions below.

**Run development servers:**

_Backend:_

```bash
cd backend
npm run dev
```

_Frontend:_

```bash
cd frontend
npm run dev
```

🔗 App runs at: [http://localhost:5173](http://localhost:5173)

---

## 🚀 Usage

1. Visit: [http://localhost:5173](http://localhost:5173) *(or live URL above)*  
2. Register or log in  
3. Add friends via search, manage requests  
4. Start 1-to-1  
5. Share media and interact with the AI bot  
6. Update profile and settings  
7. Receive real-time notifications  

---

## 🖼️ Screenshots

> Screens available in `/assets/screens/`

- Login  
- Chat Interface  
- Friend Requests  
- AI Bot Interface  

---

## 🧱 Tech Stack / Built With

- **Frontend**: React.js, Tailwind CSS  
- **Backend**: Node.js, Express.js  
- **Database**: MongoDB + Mongoose  
- **Real-Time**: Socket.io  
- **Auth**: JWT (JSON Web Token)  
- **Media Storage**: Local or Cloudinary  
- **Testing**: Jest, React Testing Library, Supertest  

---

## 🔌 API Endpoints (Backend Overview)

| Path                   | Method | Description                     |
|------------------------|--------|---------------------------------|
| `/api/auth/signup`     | POST   | Register new user               |
| `/api/auth/login`      | POST   | User login                      |
| `/api/auth/logout`     | POST   | Logout user                     |
| `/api/auth/update-profile` | PUT | Update profile info             |
| `/api/friends/`        | GET/POST | Manage/add friends             |
| `/api/messages/`       | GET/POST | Send and retrieve messages     |
| `/api/bot/`            | POST   | Interact with AI assistant      |

🔐 *All routes are secured. Authentication required.*

---

## 🔐 Environment Variables

**Backend** (`backend/.env`):

```env
MONGODB_URI=
PORT=5001
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NODE_ENV=development
GEMINI_API_KEY=
EMAIL_USER=
EMAIL_PASS=

#FRONTEND_URL=https://chat-app-ipof.onrender.com       for deployment
FRONTEND_URL=http://localhost:5173    #for development

---

## 📦 Deployment

**Build frontend:**

```bash
cd frontend
npm run build
```

**Serve static files from `frontend/dist`**

**Cloud Hosting Recommendations**:
- Render

**Media Hosting**:
- Cloudinary 

---

## ✅ Testing

**Frontend:**

```bash
cd frontend
npm test
```

**Backend:**  
- Unit & integration tests via Jest + Supertest

📂 See `/assets/test-report/` for manual test results

---

## 🛠️ Known Issues

- Mobile app version not available  
- Group chat moderation/roles not yet implemented  
- End-to-end encryption not active (planned)  
- Not optimized for very large-scale user base  

---

## 🤝 Contributing

---

## 📝 License

This project is licensed under the **MIT License**. See `LICENSE` file.

---

## 👨‍💻 Author / Maintainers

**TheHiddenLoop**  
(University of Mumbai)
