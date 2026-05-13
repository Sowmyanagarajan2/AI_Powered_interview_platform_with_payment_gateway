require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { verifyGoogleToken } = require('./googleAuth');
const User = require('./models/User');
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
// Secret for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/prepai';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware to verify JWT
const verifyJWT = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Routes
app.post('/api/auth/google', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const payload = await verifyGoogleToken(token);
    
    // Find or create user in database
    let user = await User.findOne({ googleId: payload.sub });
    
    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture
      });
      await user.save();
      console.log('New user created:', user.email);
    } else {
      // Update existing user
      user.updatedAt = new Date();
      await user.save();
    }
    
    // Generate JWT token for session
    const sessionToken = jwt.sign(
      {
        id: user._id,
        googleId: user.googleId,
        email: user.email,
        name: user.name,
        provider: 'google'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      sessionToken,
      user: {
        id: user._id,
        googleId: user.googleId,
        email: user.email,
        name: user.name,
        picture: user.picture,
        interviewsCompleted: user.interviewsCompleted,
        averageScore: user.averageScore
      }
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Authorization Error: Invalid token' });
  }
});

// Get user profile
app.get('/api/user/profile', verifyJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        googleId: user.googleId,
        email: user.email,
        name: user.name,
        picture: user.picture,
        interviewsCompleted: user.interviewsCompleted,
        averageScore: user.averageScore,
        totalScore: user.totalScore,
        lastInterviewDate: user.lastInterviewDate,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Verify token endpoint
app.post('/api/auth/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required', valid: false });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found', valid: false });
    }

    res.json({
      success: true,
      valid: true,
      user: {
        id: user._id,
        googleId: user.googleId,
        email: user.email,
        name: user.name,
        picture: user.picture,
        interviewsCompleted: user.interviewsCompleted,
        averageScore: user.averageScore
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid or expired token', valid: false });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});