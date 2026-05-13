# MongoDB Setup Guide

## Quick Start - Local MongoDB

### Option 1: Using MongoDB Community Server (Local Installation)

**Windows:**
1. Download MongoDB Community Edition from https://www.mongodb.com/try/download/community
2. Run the installer (accepts default installation)
3. MongoDB will be installed as a Windows Service (running by default)
4. Default connection: `mongodb://localhost:27017`

**Check if MongoDB is running:**
```powershell
# Open Services (services.msc) or use PowerShell:
Get-Service -Name "MongoDB"
```

### Option 2: Using MongoDB Atlas (Cloud - Recommended for Production)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a new project and cluster
4. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/prepai`
5. Add connection string to `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/prepai
   ```

---

## Running the Application

### Terminal 1 - Backend:
```powershell
cd d:\FSD_203\Real_time_project\Backend
npm start
```

Expected output:
```
Server running on port 5000
MongoDB connected
```

### Terminal 2 - Frontend:
```powershell
cd d:\FSD_203\Real_time_project\Frontend
npm start
```

---

## Testing the Full Flow

1. **Open browser:** http://localhost:3000
2. **Click "Login with Google"** - Complete OAuth flow
3. **You should see Profile Page** with:
   - Your Google profile picture
   - Your name and email
   - Interview statistics (0 completed initially)
   - "Start New Interview" button
4. **Click "Start New Interview"** to begin interview session
5. **Complete interview** and return to profile (score will update)
6. **Click "Logout"** to return to login

---

## Database Verification

### Using MongoDB Compass (Visual Client)

1. Download MongoDB Compass from https://www.mongodb.com/products/compass
2. Connection string: `mongodb://localhost:27017`
3. Browse to `prepai` > `users` collection
4. See your profile data after first login

### Using MongoDB Shell

```powershell
# Connect to MongoDB
mongosh

# Use prepai database
use prepai

# View all users
db.users.find()

# View specific user
db.users.findOne({ email: "your-email@gmail.com" })

# Check user stats
db.users.find({}, { name: 1, email: 1, interviewsCompleted: 1, averageScore: 1 })
```

---

## Troubleshooting

### Error: "MongoDB connection error: connect ECONNREFUSED"

**Solution:** MongoDB is not running
```powershell
# Windows: Start MongoDB service
net start MongoDB

# Or check if running:
Get-Service -Name "MongoDB"
```

### Error: "Cannot find module 'mongoose'"

**Solution:** Install mongoose
```powershell
cd Backend
npm install mongoose
```

### User not saving to database

**Check:**
1. MongoDB is running (`mongosh` command should work)
2. MONGODB_URI is correct in `.env`
3. Backend logs show "MongoDB connected"
4. Network tab shows `/api/auth/google` returns 200

### Profile page shows "Loading..." forever

**Check:**
1. Backend is running on port 5000
2. Token is saved in localStorage
3. Check browser console for errors
4. Check backend logs for "/api/user/profile" request

---

## MongoDB Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,
  googleId: String (unique, indexed),
  email: String (unique, indexed),
  name: String,
  picture: String,
  interviewsCompleted: Number,
  totalScore: Number,
  averageScore: Number,
  lastInterviewDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Example Document:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "googleId": "112345678901234567890",
  "email": "user@gmail.com",
  "name": "John Doe",
  "picture": "https://lh3.googleusercontent.com/...",
  "interviewsCompleted": 2,
  "totalScore": 170,
  "averageScore": 85,
  "lastInterviewDate": "2026-05-08T10:30:00.000Z",
  "createdAt": "2026-05-08T09:00:00.000Z",
  "updatedAt": "2026-05-08T10:30:00.000Z"
}
```

---

## Environment Variables

### Backend (.env)
```
GOOGLE_CLIENT_ID=787416318454-...apps.googleusercontent.com
FRONTEND_URL=http://localhost:3000
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
MONGODB_URI=mongodb://localhost:27017/prepai
```

### Frontend (.env.local)
```
REACT_APP_GOOGLE_CLIENT_ID=787416318454-...apps.googleusercontent.com
REACT_APP_BACKEND_URL=http://localhost:5000
```

---

## API Endpoints (Updated)

### Google Authentication
**POST** `/api/auth/google`
```json
Request:
{
  "token": "google-id-token"
}

Response:
{
  "success": true,
  "sessionToken": "jwt-token-here",
  "user": {
    "id": "mongo-user-id",
    "googleId": "google-id",
    "email": "user@gmail.com",
    "name": "John Doe",
    "picture": "url",
    "interviewsCompleted": 0,
    "averageScore": 0
  }
}
```

### Verify Token
**POST** `/api/auth/verify`
```json
Request:
{
  "token": "jwt-session-token"
}

Response:
{
  "success": true,
  "valid": true,
  "user": { ...user data }
}
```

### Get User Profile
**GET** `/api/user/profile`
```
Header: Authorization: Bearer <jwt-token>

Response:
{
  "success": true,
  "user": { ...user data with full history }
}
```

---

## Next Steps

1. **Set up local MongoDB** (if using MongoDB Community)
2. **Start backend and frontend** as shown above
3. **Test Google OAuth login** flow
4. **Verify data** is being saved in MongoDB
5. **Track profile updates** as you complete interviews

---

## Production Deployment

For production, use **MongoDB Atlas** (managed cloud database):

1. Create free MongoDB Atlas account
2. Set `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/prepai`
3. Add production JWT_SECRET
4. Deploy backend and frontend to production

---

For more MongoDB help: https://docs.mongodb.com/
For Mongoose documentation: https://mongoosejs.com/
