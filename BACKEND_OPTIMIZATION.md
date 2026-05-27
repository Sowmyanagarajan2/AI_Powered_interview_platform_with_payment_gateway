# Backend Optimization Implementation Guide

This file contains ready-to-implement solutions for backend performance issues.

---

## 1. Add Response Compression & Caching

**File to modify:** `Backend/server.js`

**Add to top of file after dependencies:**

```javascript
const compression = require('compression');
const rateLimit = require('express-rate-limit');
```

**Add to middleware section (after app.use(express.json())):**

```javascript
// Enable gzip compression for all responses > 1KB
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6  // Balance between compression speed and ratio
}));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                     // 10 requests per IP per windowMs
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: (req) => req.path === '/api/health'
});

app.use('/api/', apiLimiter);
```

---

## 2. Implement Token Verification Cache

**Create new file:** `Backend/tokenCache.js`

```javascript
class TokenCache {
  constructor(ttlMs = 5 * 60 * 1000) {
    this.cache = new Map();
    this.ttl = ttlMs;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.ttl
    });
  }

  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value;
  }

  clear() {
    this.cache.clear();
  }

  // Cleanup expired entries every minute
  startCleanup() {
    this.cleanupInterval = setInterval(() => {
      for (const [key, entry] of this.cache.entries()) {
        if (Date.now() > entry.expiresAt) {
          this.cache.delete(key);
        }
      }
    }, 60 * 1000);
  }

  stopCleanup() {
    clearInterval(this.cleanupInterval);
  }
}

module.exports = new TokenCache();
```

**Update googleAuth.js:**

```javascript
const tokenCache = require('./tokenCache');

async function verifyGoogleToken(token) {
  try {
    // Check cache first
    const cached = tokenCache.get(token);
    if (cached) {
      console.log('Token verification cache hit');
      return cached;
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    
    // Cache for 5 minutes
    tokenCache.set(token, payload);
    
    return payload;
  } catch (error) {
    throw new Error('Invalid Google token');
  }
}

module.exports = { verifyGoogleToken };
```

---

## 3. Optimize Database Queries

**Update server.js authentication route:**

```javascript
// Use lean() for read-only queries and avoid unnecessary updates
app.post('/api/auth/google', authLimiter, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const payload = await verifyGoogleToken(token);
    
    // Find existing user - use lean for read-only
    let user = await User.findOne({ googleId: payload.sub }).lean();
    
    if (!user) {
      // Create new user if doesn't exist
      const newUser = new User({
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture
      });
      user = await newUser.save();
      console.log('New user created:', user.email);
    } else {
      // Only update if session is stale (> 1 hour old)
      const lastUpdate = new Date(user.updatedAt);
      if (Date.now() - lastUpdate > 3600000) {  // 1 hour
        user = await User.findByIdAndUpdate(
          user._id,
          { updatedAt: new Date() },
          { new: true }
        ).lean();
      }
    }
    
    // Generate JWT token
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
```

**Update profile endpoint with query optimization:**

```javascript
app.get('/api/user/profile', verifyJWT, async (req, res) => {
  try {
    // Use projection to select only needed fields and lean for better performance
    const user = await User.findById(req.user.id)
      .select('_id googleId email name picture interviewsCompleted averageScore totalScore lastInterviewDate createdAt')
      .lean();
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add cache headers
    res.set('Cache-Control', 'private, max-age=300');  // 5 minutes
    res.set('ETag', `"${JSON.stringify(user).length}"`);

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});
```

---

## 4. Configure MongoDB Connection Pooling

**Update mongoose.connect() in server.js:**

```javascript
mongoose.connect(MONGODB_URI, {
  // Connection pooling
  maxPoolSize: 10,          // Increase for high concurrency
  minPoolSize: 5,
  maxIdleTimeMS: 30000,     // Close idle connections after 30s
  
  // Timeouts and retry
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  retryWrites: true,
  
  // Network
  family: 4,                // Use IPv4
  
  // Application
  appName: 'PrepAI-Backend'
})
.then(() => {
  console.log('MongoDB connected with optimized pooling');
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
```

---

## 5. Add Input Validation Middleware

**Create new file:** `Backend/validation.js`

```javascript
const { body, validationResult } = require('express-validator');

// Middleware to check validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: errors.array() 
    });
  }
  next();
};

// Google auth validation
const validateGoogleAuth = [
  body('token')
    .isString()
    .trim()
    .isLength({ min: 100, max: 10000 })
    .withMessage('Invalid token format'),
  handleValidationErrors
];

// Token verification validation
const validateTokenVerify = [
  body('token')
    .isString()
    .trim()
    .isLength({ min: 100, max: 10000 })
    .withMessage('Invalid token format'),
  handleValidationErrors
];

module.exports = {
  validateGoogleAuth,
  validateTokenVerify,
  handleValidationErrors
};
```

**Update server.js to use validation:**

```javascript
const { validateGoogleAuth, validateTokenVerify } = require('./validation');

app.post('/api/auth/google', authLimiter, validateGoogleAuth, async (req, res) => {
  // ... existing code
});

app.post('/api/auth/verify', validateTokenVerify, async (req, res) => {
  // ... existing code
});
```

---

## 6. Add Proper Logging

**Create new file:** `Backend/logger.js`

```javascript
// Using console for simplicity, but use Winston/Pino for production
const logger = {
  error: (message, error = null) => {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error || '');
  },
  warn: (message) => {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`);
  },
  info: (message) => {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`);
  },
  debug: (message) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEBUG] ${new Date().toISOString()}: ${message}`);
    }
  }
};

module.exports = logger;
```

---

## 7. Updated package.json Dependencies

```json
{
  "name": "backend",
  "version": "1.0.0",
  "description": "PrepAI Backend API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "compression": "^1.7.4",
    "cors": "^2.8.6",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "express-rate-limit": "^7.1.5",
    "express-validator": "^7.0.0",
    "google-auth-library": "^10.6.2",
    "jsonwebtoken": "^9.0.3",
    "mongoose": "^9.6.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

---

## 8. Optimized Complete server.js Template

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const { verifyGoogleToken } = require('./googleAuth');
const User = require('./models/User');
const { validateGoogleAuth, validateTokenVerify } = require('./validation');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Compression
app.use(compression({
  level: 6
}));

app.use(express.json());

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many auth attempts'
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/api/', apiLimiter);

// Secrets
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/prepai';

// MongoDB Connection with optimization
mongoose.connect(MONGODB_URI, {
  maxPoolSize: 10,
  minPoolSize: 5,
  socketTimeoutMS: 45000
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// JWT Verification Middleware
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
app.post('/api/auth/google', authLimiter, validateGoogleAuth, async (req, res) => {
  try {
    const { token } = req.body;
    const payload = await verifyGoogleToken(token);
    
    let user = await User.findOne({ googleId: payload.sub }).lean();
    
    if (!user) {
      user = new User({
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture
      });
      await user.save();
      console.log('New user created:', user.email);
    }
    
    const sessionToken = jwt.sign(
      { id: user._id, googleId: user.googleId, email: user.email, name: user.name, provider: 'google' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      sessionToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        interviewsCompleted: user.interviewsCompleted,
        averageScore: user.averageScore
      }
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Authorization Error' });
  }
});

app.get('/api/user/profile', verifyJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('_id googleId email name picture interviewsCompleted averageScore totalScore')
      .lean();
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.set('Cache-Control', 'private, max-age=300');
    res.json({ success: true, user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.post('/api/auth/verify', validateTokenVerify, async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('_id email name picture').lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found', valid: false });
    }

    res.json({ success: true, valid: true, user });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token', valid: false });
  }
});

app.get('/api/health', (req, res) => {
  res.set('Cache-Control', 'public, max-age=60');
  res.json({ status: 'OK' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## Installation Instructions

```bash
cd Backend

# Install new dependencies
npm install compression express-rate-limit express-validator

# Optional: Install nodemon for development
npm install --save-dev nodemon

# Run server
npm start
```

