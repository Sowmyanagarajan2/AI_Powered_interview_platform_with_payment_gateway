# PrepAI Project - Setup & Configuration

## Project Overview
PrepAI is a React-based interview preparation platform with Google OAuth authentication and a Node.js/Express backend for secure token verification.

**Tech Stack:**
- **Frontend:** React 18, @react-oauth/google
- **Backend:** Express 5, google-auth-library, jsonwebtoken
- **Authentication:** Google OAuth 2.0

---

## Prerequisites
- Node.js (v14+)
- npm or yarn
- Google Cloud Project with OAuth 2.0 credentials

---

## Getting Started

### 1. Backend Setup

**Navigate to Backend folder:**
```bash
cd d:\FSD_203\Real_time_project\Backend
npm install
```

**Start the server:**
```bash
npm start
```
Server will run on `http://localhost:5000`

---

### 2. Frontend Setup

**Navigate to Frontend folder:**
```bash
cd d:\FSD_203\Real_time_project\Frontend
npm install
```

**Start the development server:**
```bash
npm start
```
Frontend will run on `http://localhost:3000`

---

## Configuration

### Backend Environment (.env)
Located at: `Backend/.env`

```
GOOGLE_CLIENT_ID=787416318454-7588eme12rd4htsfo3jqqppvi6f1b9o2.apps.googleusercontent.com
FRONTEND_URL=http://localhost:3000
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
```

**Important:** Change `JWT_SECRET` for production!

### Frontend Environment (.env.local)
Located at: `Frontend/.env.local`

```
REACT_APP_GOOGLE_CLIENT_ID=787416318454-7588eme12rd4htsfo3jqqppvi6f1b9o2.apps.googleusercontent.com
REACT_APP_BACKEND_URL=http://localhost:5000
```

---

## API Endpoints

### Google Authentication
**POST** `/api/auth/google`

**Request:**
```json
{
  "token": "google-id-token"
}
```

**Response (Success):**
```json
{
  "success": true,
  "sessionToken": "jwt-token",
  "user": {
    "id": "google-user-id",
    "email": "user@example.com",
    "name": "User Name",
    "picture": "profile-picture-url"
  }
}
```

**Response (Error):**
```json
{
  "error": "Authorization Error: Invalid token"
}
```

### Health Check
**GET** `/api/health`

**Response:**
```json
{
  "status": "OK"
}
```

---

## Authentication Flow

1. User clicks "Login with Google" button
2. Google OAuth popup appears
3. User authorizes the app
4. Google returns ID token to frontend
5. Frontend sends token to `POST /api/auth/google`
6. Backend verifies token using `googleAuth.js`
7. Backend generates JWT session token
8. Frontend stores session token (optional)
9. User logged in, redirected to InterviewSession

---

## File Structure

```
Real_time_project/
├── Backend/
│   ├── .env                 # Backend environment config
│   ├── server.js            # Express server & routes
│   ├── googleAuth.js        # Google token verification
│   ├── package.json
│   └── node_modules/
│
├── Frontend/
│   ├── .env.local           # Frontend environment config
│   ├── src/
│   │   ├── App.jsx          # Main app component
│   │   ├── Login.jsx        # Login with Google OAuth
│   │   ├── InterviewSession.jsx
│   │   ├── index.js         # React entry point with GoogleOAuthProvider
│   │   ├── Login.css
│   │   ├── InterviewSession.css
│   │   └── data/
│   │       └── questionSeed.js
│   ├── public/
│   ├── package.json
│   └── node_modules/
│
└── PROJECT_SETUP.md         # This file
```

---

## Key Components

### Login Component (Frontend/src/Login.jsx)
- Email/password form
- Google OAuth button
- Error handling
- Loading states

### Server (Backend/server.js)
- CORS middleware
- Google token verification endpoint
- JWT token generation
- Health check endpoint

### Token Verification (Backend/googleAuth.js)
- Verifies Google ID tokens
- Extracts user payload
- Error handling

---

## Troubleshooting

**Error: "Authorization Error: Invalid token"**
- Verify GOOGLE_CLIENT_ID is correct
- Ensure token hasn't expired
- Check backend logs for details

**Error: "CORS error"**
- Verify FRONTEND_URL in backend .env matches frontend origin
- Check if backend is running on port 5000

**Google OAuth button not showing**
- Verify REACT_APP_GOOGLE_CLIENT_ID in .env.local
- Check if @react-oauth/google package is installed
- Ensure GoogleOAuthProvider wraps App in index.js

**"Connect ECONNREFUSED" when clicking Google login**
- Ensure backend is running (`npm start` in Backend folder)
- Verify REACT_APP_BACKEND_URL in .env.local

---

## Next Steps (Optional Enhancements)

1. **Database Integration**
   - Add MongoDB/PostgreSQL for user data persistence
   - Store user profile after first login

2. **Security**
   - Install helmet.js for security headers
   - Add rate limiting with express-ratelimit
   - Use HTTPS in production

3. **Password Reset**
   - Implement password reset flow
   - Add email verification

4. **User Profile**
   - Store session token in localStorage
   - Create user profile page
   - Implement logout functionality

---

## Running in Production

1. Change `JWT_SECRET` in Backend/.env
2. Update `FRONTEND_URL` to production domain
3. Update Google Cloud Console redirect URIs
4. Set `NODE_ENV=production`
5. Use environment variables from server config (not .env file)
6. Deploy both frontend and backend to hosting services

---

## Support
For issues or questions, check the server logs and browser console for error details.
