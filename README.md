# 🚀 UNIBEN AI Assistant

Your friendly campus companion for University of Benin! 🌟

## 📋 Prerequisites

Before running this project, you'll need:

### 🔑 API Keys & Tokens

1. **Google Gemini API Key**
   - Get it from: [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Add to `server/.env`: `GEMINI_API_KEY=your-key-here`

2. **Mapbox Access Token**
   - Get it from: [Mapbox Account](https://account.mapbox.com/)
   - Add to `server/.env`: `MAPBOX_ACCESS_TOKEN=your-token-here`
   - Add to `client/.env.local`: `VITE_MAPBOX_ACCESS_TOKEN=your-token-here`

### 🛠️ System Requirements

- **Node.js** (v18 or higher)
- **MongoDB** (local or Atlas)
- **npm** or **yarn**

## 🚀 Quick Start

### 1. Clone & Install

```bash
# Install server dependencies
cd uniben-ai-assistant/server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Environment Setup

#### Server (.env)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/uniben-assistant

# AI & Maps
GEMINI_API_KEY=your-gemini-api-key-here
MAPBOX_ACCESS_TOKEN=your-mapbox-access-token-here

# Security
JWT_SECRET=your-super-secret-jwt-key-change-in-production-2024
```

#### Client (.env.local)
```env
VITE_API_URL=http://localhost:5000/api
VITE_MAPBOX_ACCESS_TOKEN=your-mapbox-access-token-here
```

### 3. Start Services

```bash
# Terminal 1: Start MongoDB
mongod

# Terminal 2: Start Backend
cd uniben-ai-assistant/server
npm run dev

# Terminal 3: Start Frontend
cd ../client
npm run dev
```

### 4. Access Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 🎯 Features

- **🤖 AI Chatbot**: Powered by Google Gemini with function calling
- **🗺️ Campus Navigation**: Interactive 3D Mapbox maps
- **📚 Quiz System**: AI-generated quizzes from PDF uploads
- **👥 User Management**: Guest, Student, and Staff authentication
- **🎨 Multiple Themes**: UNIBEN, Dark, and Ocean themes
- **📱 Responsive Design**: Works on all devices

## 🏗️ Project Structure

```
uniben-ai-assistant/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/         # Login components
│   │   │   ├── chat/         # Chat interface
│   │   │   ├── shared/       # Reusable components
│   │   │   └── admin/        # Admin panel (coming soon)
│   │   ├── context/          # React context
│   │   ├── services/         # API services
│   │   └── styles/           # Global styles
│   └── package.json
│
└── server/                    # Express Backend
    ├── src/
    │   ├── models/           # MongoDB models
    │   ├── controllers/      # Route handlers
    │   ├── routes/           # API routes
    │   ├── services/         # Business logic
    │   ├── middleware/       # Express middleware
    │   └── config/           # Configuration
    └── package.json
```

## 🔧 Development Scripts

### Server
```bash
cd server
npm run dev      # Start with nodemon
npm start        # Production start
npm test         # Run tests
```

### Client
```bash
cd client
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login/guest` - Guest login
- `POST /api/auth/login/student` - Student login
- `POST /api/auth/login/staff` - Staff login

### Chat
- `POST /api/chat/message` - Send chat message
- `GET /api/chat/conversations` - Get user conversations
- `POST /api/chat/conversations` - Create new conversation

### Admin (Coming Soon)
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

## 🎨 Design System

### Colors
- **Primary**: Emerald (#10B981)
- **Secondary**: Teal (#14B8A6)
- **Neutral**: Slate grays
- **Accent**: Warm orange (#F59E0B)

### Typography
- **Font Family**: Manrope (Display), Inter (Body)
- **Weights**: 400, 500, 600, 700, 800

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd client
npm run build
# Deploy to Vercel
```

### Backend (Render)
```bash
cd server
# Deploy to Render with build command: npm start
```

### Database (MongoDB Atlas)
- Create cluster on MongoDB Atlas
- Update `MONGODB_URI` in production environment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please contact the development team or create an issue in the repository.

---

**Built with ❤️ for UNIBEN students and staff**