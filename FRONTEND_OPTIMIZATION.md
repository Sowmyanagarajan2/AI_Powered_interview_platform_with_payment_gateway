# Frontend Optimization Implementation Guide

This file contains ready-to-implement solutions for frontend performance issues.

---

## 1. Fix Timer Performance in InterviewSession

**File to modify:** `Frontend/src/InterviewSession.jsx`

**Replace the useEffect hook with timer (around line 268):**

```javascript
// BEFORE (causes 240+ re-renders per minute):
useEffect(() => {
  if (isFinished) {
    return undefined;
  }

  setSecondsRemaining(SESSION_DURATION_SECONDS);
  const endTime = Date.now() + SESSION_DURATION_SECONDS * 1000;

  const timerId = setInterval(() => {
    const nextSeconds = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
    setSecondsRemaining(nextSeconds);

    if (nextSeconds === 0) {
      setIsFinished(true);
      clearInterval(timerId);
    }
  }, 250);

  return () => clearInterval(timerId);
}, [sessionKey, isFinished]);

// AFTER (only 60 re-renders per minute):
useEffect(() => {
  if (isFinished) {
    return undefined;
  }

  const endTime = Date.now() + SESSION_DURATION_SECONDS * 1000;
  const calculateRemainingSeconds = () => Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
  
  setSecondsRemaining(calculateRemainingSeconds());

  const timerId = setInterval(() => {
    const nextSeconds = calculateRemainingSeconds();
    
    setSecondsRemaining(prev => {
      // Only update state if seconds actually changed
      if (prev !== nextSeconds) {
        if (nextSeconds === 0) {
          setIsFinished(true);
          clearInterval(timerId);
        }
        return nextSeconds;
      }
      return prev;
    });
  }, 100);  // Check more frequently but update state less often

  return () => clearInterval(timerId);
}, [sessionKey, isFinished]);
```

---

## 2. Memoize Child Components in InterviewSession

**Add at the top of file:**

```javascript
import React, { useEffect, useState, useMemo, useCallback } from 'react';
```

**Wrap each component definition with React.memo:**

```javascript
// BEFORE
const TopBar = ({ timeRemaining, isTimeUp, onBack }) => (
  <div className="topbar">
    // ... content
  </div>
);

// AFTER
const TopBar = React.memo(({ timeRemaining, isTimeUp, onBack }) => (
  <div className="topbar">
    // ... content
  </div>
));
```

**Do this for all these components:**

```javascript
const TopBar = React.memo(({ timeRemaining, isTimeUp, onBack }) => (
  // ... component
));

const ProgressBar = React.memo(({ progress, questionNumber, totalQuestions }) => (
  // ... component
));

const SessionStats = React.memo(({ answered, skipped, avgScore, remaining }) => (
  // ... component
));

const SkillBreakdown = React.memo(({ skills }) => (
  // ... component
));

const LeftPanel = React.memo(({ answered, skipped, avgScore, remaining }) => {
  const skills = [
    { name: 'Technical', percentage: 50, color: '#00D48A' },
    { name: 'HR', percentage: 50, color: '#F59E0B' },
    { name: 'MCQ', percentage: 100, color: '#2451B7' },
    { name: 'Randomized', percentage: 100, color: '#8B5CF6' }
  ];

  return (
    <div className="left-panel">
      <SessionStats answered={answered} skipped={skipped} avgScore={avgScore} remaining={remaining} />
      <SkillBreakdown skills={skills} />
    </div>
  );
});

const QuestionCard = React.memo(({ questionNumber, question }) => (
  // ... component
));

const OptionList = React.memo(({ options, selectedOption, correctAnswer, showResult, onSelect }) => (
  // ... component
));

const ActionButtons = React.memo(({ canSubmit, showResult, onSkip, onVoice, onSubmit }) => (
  // ... component
));

const MainPanel = React.memo(({
  question,
  questionNumber,
  selectedOption,
  feedback,
  onOptionSelect,
  onSkip,
  onSubmit
}) => {
  const handleVoice = useCallback(() => alert('Voice recording started'), []);

  return (
    <div className="main-panel">
      {/* ... component content */}
    </div>
  );
});

const AICoach = React.memo(({ feedback, hints, keywords }) => (
  // ... component
));

const ConfidenceMeter = React.memo(({ score, trend }) => (
  // ... component
));

const RightPanel = React.memo(({ question }) => {
  const hints = useMemo(() => {
    return question.type === 'Technical'
      ? [
          'Think about the core concept before choosing',
          'Eliminate options that do not match the topic',
          'Connect the answer to real project usage'
        ]
      : [
          'Choose the option that shows ownership',
          'Prefer clear communication and collaboration',
          'Look for a professional action, not blame'
        ];
  }, [question.type]);

  return (
    <div className="right-panel">
      <AICoach
        feedback={`Current question is from ${question.topic}. Focus on the strongest practical answer.`}
        hints={hints}
        keywords={[question.type, question.topic, question.difficulty]}
      />
      <ConfidenceMeter score={74} trend="up" />
    </div>
  );
});

const SummaryScreen = React.memo(({
  totalQuestions,
  answered,
  skipped,
  correct,
  wrong,
  score,
  timeRemaining,
  onRestart
}) => (
  // ... component
));
```

**Optimize question shuffling:**

```javascript
// BEFORE
const [questions, setQuestions] = useState(() =>
  shuffleQuestions(questionSeed).slice(0, SESSION_QUESTION_COUNT)
);

// AFTER - Use Fisher-Yates shuffle
const fisherYatesShuffle = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const [questions, setQuestions] = useState([]);

// In useEffect, initialize questions only once
useEffect(() => {
  setQuestions(useMemo(
    () => fisherYatesShuffle(questionSeed).slice(0, SESSION_QUESTION_COUNT),
    []
  ));
}, []);
```

---

## 3. Implement Lazy Loading in App.jsx

**File to modify:** `Frontend/src/App.jsx`

```javascript
import React, { useState, useEffect, Suspense, lazy } from 'react';
import './index.css';

// Lazy load all page components
const InterviewSession = lazy(() => import('./InterviewSession'));
const Login = lazy(() => import('./Login'));
const ProfilePage = lazy(() => import('./ProfilePage'));
const InterviewCourses = lazy(() => import('./InterviewCourses'));

// Loading component
const LoadingFallback = () => (
  <div className="App loading">
    <div className="loading-spinner">Loading...</div>
  </div>
);

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cache verification result
  const VERIFICATION_CACHE_KEY = 'sessionVerified';
  const VERIFICATION_TTL = 5 * 60 * 1000; // 5 minutes

  useEffect(() => {
    verifySession();
  }, []);

  const verifySession = async () => {
    try {
      const token = localStorage.getItem('sessionToken');
      
      if (!token) {
        setLoading(false);
        return;
      }

      // Check if recently verified
      const cached = sessionStorage.getItem(VERIFICATION_CACHE_KEY);
      if (cached) {
        try {
          const { user: cachedUser, expiry } = JSON.parse(cached);
          if (Date.now() < expiry) {
            setUser(cachedUser);
            setIsLoggedIn(true);
            setLoading(false);
            return;
          }
        } catch (e) {
          sessionStorage.removeItem(VERIFICATION_CACHE_KEY);
        }
      }

      // Verify token with backend
      const response = await fetch(
        (process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000') + '/api/auth/verify',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ token })
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsLoggedIn(true);
        
        // Cache the result
        sessionStorage.setItem(VERIFICATION_CACHE_KEY, JSON.stringify({
          user: data.user,
          expiry: Date.now() + VERIFICATION_TTL
        }));
      } else {
        localStorage.removeItem('sessionToken');
      }
    } catch (error) {
      console.error('Session verification error:', error);
      localStorage.removeItem('sessionToken');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData, token) => {
    localStorage.setItem('sessionToken', token);
    setUser(userData);
    setIsLoggedIn(true);
    setCurrentPage('profile');
  };

  const handleLogout = () => {
    localStorage.removeItem('sessionToken');
    sessionStorage.removeItem(VERIFICATION_CACHE_KEY);
    setUser(null);
    setIsLoggedIn(false);
    setCurrentPage('login');
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return <LoadingFallback />;
  }

  return (
    <div className="App">
      <Suspense fallback={<LoadingFallback />}>
        {isLoggedIn ? (
          <>
            {currentPage === 'profile' && (
              <ProfilePage 
                user={user} 
                onStartInterview={() => navigateTo('interview')} 
                onViewCourses={() => navigateTo('courses')} 
                onLogout={handleLogout} 
              />
            )}
            {currentPage === 'interview' && (
              <InterviewSession 
                onBackToProfile={() => navigateTo('profile')} 
                user={user} 
              />
            )}
            {currentPage === 'courses' && (
              <InterviewCourses 
                user={user} 
                onBackToHome={() => navigateTo('profile')} 
              />
            )}
          </>
        ) : (
          <Login onLogin={handleLogin} />
        )}
      </Suspense>
    </div>
  );
}

export default App;
```

---

## 4. Optimize InterviewCourses Component

**File to modify:** `Frontend/src/InterviewCourses.jsx`

```javascript
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './InterviewCourses.css';

// Move mock data outside component to prevent recreation
const MOCK_COURSES = [
  {
    id: 1,
    title: 'Java Interview Mastery',
    description: 'Master Java interview questions covering OOP, Collections, Multithreading, and more.',
    category: 'Java',
    price: 29.99,
    rating: 4.8,
    students: 2450,
    duration: '15 hours',
    level: 'Intermediate',
    image: '☕'
  },
  {
    id: 2,
    title: 'JavaScript & React Interview Guide',
    description: 'Complete guide to JavaScript and React interview questions with real-world examples.',
    category: 'JavaScript',
    price: 24.99,
    rating: 4.7,
    students: 3200,
    duration: '12 hours',
    level: 'Intermediate',
    image: '⚛️'
  },
  {
    id: 3,
    title: 'System Design Interview Prep',
    description: 'Learn to design scalable systems and ace your system design interviews.',
    category: 'System Design',
    price: 39.99,
    rating: 4.9,
    students: 1800,
    duration: '20 hours',
    level: 'Advanced',
    image: '🏗️'
  },
  {
    id: 4,
    title: 'Data Structures & Algorithms',
    description: 'Complete DSA course with interview-focused problems and solutions.',
    category: 'DSA',
    price: 34.99,
    rating: 4.8,
    students: 4100,
    duration: '18 hours',
    level: 'Intermediate',
    image: '📊'
  },
  {
    id: 5,
    title: 'Python Interview Bootcamp',
    description: 'Python-specific interview questions and practical coding challenges.',
    category: 'Python',
    price: 27.99,
    rating: 4.6,
    students: 2800,
    duration: '14 hours',
    level: 'Intermediate',
    image: '🐍'
  },
  {
    id: 6,
    title: 'SQL & Database Interview Guide',
    description: 'Master SQL queries, database design, and optimization for interviews.',
    category: 'Database',
    price: 22.99,
    rating: 4.5,
    students: 1950,
    duration: '10 hours',
    level: 'Beginner',
    image: '🗄️'
  },
  {
    id: 7,
    title: 'Frontend Interview Crash Course',
    description: 'HTML, CSS, JavaScript, and front-end frameworks interview prep.',
    category: 'Frontend',
    price: 26.99,
    rating: 4.7,
    students: 3500,
    duration: '13 hours',
    level: 'Intermediate',
    image: '🎨'
  },
  {
    id: 8,
    title: 'Behavioral & HR Interview Master',
    description: 'Ace behavioral rounds with tips on STAR method and real scenarios.',
    category: 'Behavioral',
    price: 19.99,
    rating: 4.4,
    students: 2200,
    duration: '8 hours',
    level: 'Beginner',
    image: '🎯'
  }
];

const InterviewCourses = ({ user, onBackToHome }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Load courses and enrolled courses - REMOVE 500ms delay
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      // Immediately set mock data (removed 500ms setTimeout)
      setCourses(MOCK_COURSES);
      
      const enrolled = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
      setEnrolledCourses(enrolled);
    } catch (err) {
      console.error('Error loading courses:', err);
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoize filtered courses
  const filteredCourses = useMemo(() => {
    return selectedFilter === 'all' 
      ? courses 
      : courses.filter(c => c.category === selectedFilter);
  }, [selectedFilter, courses]);

  // Memoize categories
  const categories = useMemo(() => {
    return ['all', ...new Set(courses.map(c => c.category))];
  }, [courses]);

  // Memoize callbacks
  const handleEnrollCourse = useCallback(async (courseId) => {
    if (enrolledCourses.includes(courseId)) {
      alert('You are already enrolled in this course!');
      return;
    }

    try {
      const updatedEnrolled = [...enrolledCourses, courseId];
      setEnrolledCourses(updatedEnrolled);
      localStorage.setItem('enrolledCourses', JSON.stringify(updatedEnrolled));
      alert('Successfully enrolled in the course!');
    } catch (err) {
      console.error('Enrollment error:', err);
      setError('Failed to enroll in course');
    }
  }, [enrolledCourses]);

  const handleAddToCart = useCallback((courseId) => {
    if (cart.includes(courseId) || enrolledCourses.includes(courseId)) return;
    setCart(prev => [...prev, courseId]);
  }, [cart, enrolledCourses]);

  const handleRemoveFromCart = useCallback((courseId) => {
    setCart(prev => prev.filter(id => id !== courseId));
  }, []);

  const handleOpenCart = useCallback(() => setShowCart(true), []);
  const handleCloseCart = useCallback(() => setShowCart(false), []);

  const handleCheckout = useCallback(async () => {
    if (cart.length === 0) return;
    const totalAmount = cart.reduce((sum, id) => sum + (courses.find(c => c.id === id)?.price || 0), 0);
    const options = {
      key: 'RAZORPAY_TEST_KEY',
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      name: 'PrepAI Interview Courses',
      description: 'Course Purchase',
      image: '',
      handler: function (response) {
        setPaymentSuccess(true);
        const updatedEnrolled = [...enrolledCourses, ...cart];
        setEnrolledCourses(updatedEnrolled);
        localStorage.setItem('enrolledCourses', JSON.stringify(updatedEnrolled));
        setCart([]);
      },
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
      },
      theme: {
        color: '#764ba2',
      }
    };
    setPaymentProcessing(true);
    const rzp = new window.Razorpay(options);
    rzp.open();
    setPaymentProcessing(false);
  }, [cart, courses, enrolledCourses, user]);

  if (loading) {
    return (
      <div className="interview-courses">
        <div className="loading">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="interview-courses">
      {/* Cart Modal */}
      {showCart && (
        <div className="cart-modal-overlay" onClick={handleCloseCart}>
          <div className="cart-modal" onClick={e => e.stopPropagation()}>
            <h2>Your Cart</h2>
            {cart.length === 0 ? (
              <div className="cart-empty">Your cart is empty.</div>
            ) : (
              <>
                <ul className="cart-list">
                  {cart.map(id => {
                    const course = courses.find(c => c.id === id);
                    return (
                      <li key={id} className="cart-item">
                        <span>{course?.title}</span>
                        <span>${course?.price}</span>
                        <button 
                          className="cart-remove-btn" 
                          onClick={() => handleRemoveFromCart(id)}
                        >
                          ✕
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <div className="cart-total">
                  Total: <b>${cart.reduce((sum, id) => sum + (courses.find(c => c.id === id)?.price || 0), 0).toFixed(2)}</b>
                </div>
                <button 
                  className="cart-checkout-btn" 
                  onClick={handleCheckout} 
                  disabled={paymentProcessing}
                >
                  {paymentProcessing ? 'Processing Payment...' : 'Pay Now'}
                </button>
                {paymentSuccess && <div className="cart-success">Payment successful! Courses enrolled.</div>}
              </>
            )}
            <button className="cart-close-btn" onClick={handleCloseCart}>Close</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="courses-header">
        <div className="header-top">
          <div className="header-brand">
            <span className="brand-dot"></span>
            PrepAI
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="cart-btn" onClick={handleOpenCart}>
              🛒 Cart ({cart.length})
            </button>
            <button className="back-btn" onClick={onBackToHome}>
              ← Back to Home
            </button>
          </div>
        </div>
        <div className="header-content">
          <h1>Interview Preparation Courses</h1>
          <p>Master interview skills with industry-expert instructors</p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="courses-filter">
        <div className="filter-buttons">
          {categories.map(category => (
            <button
              key={category}
              className={`filter-btn ${selectedFilter === category ? 'active' : ''}`}
              onClick={() => setSelectedFilter(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="courses-grid">
        {filteredCourses.map(course => (
          <div key={course.id} className="course-card">
            <div className="course-image">{course.image}</div>
            <div className="course-content">
              <div className="course-header">
                <h3>{course.title}</h3>
                <div className="course-meta">
                  <span className="course-level">{course.level}</span>
                  <span className="course-rating">⭐ {course.rating}</span>
                </div>
              </div>
              <p className="course-description">{course.description}</p>
              <div className="course-info">
                <span className="course-duration">⏱️ {course.duration}</span>
                <span className="course-students">👥 {course.students.toLocaleString()}</span>
              </div>
              <div className="course-footer">
                <div className="course-price">${course.price}</div>
                <div className="course-buttons">
                  {enrolledCourses.includes(course.id) ? (
                    <button className="btn-enrolled" disabled>✓ Enrolled</button>
                  ) : cart.includes(course.id) ? (
                    <button 
                      className="btn-added" 
                      onClick={() => handleRemoveFromCart(course.id)}
                    >
                      Remove from Cart
                    </button>
                  ) : (
                    <>
                      <button 
                        className="btn-enroll" 
                        onClick={() => handleEnrollCourse(course.id)}
                      >
                        Enroll Now
                      </button>
                      <button 
                        className="btn-cart" 
                        onClick={() => handleAddToCart(course.id)}
                      >
                        🛒 Add to Cart
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InterviewCourses;
```

---

## 5. Fix Login.jsx - Remove Password Storage

**File to modify:** `Frontend/src/Login.jsx`

**Update useEffect and handlers:**

```javascript
import React, { useEffect, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import './Login.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Only load saved email, NOT password
  useEffect(() => {
    const savedEmail = sessionStorage.getItem('savedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberEmail(true);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (rememberEmail) {
      sessionStorage.setItem('savedEmail', email);
    } else {
      sessionStorage.removeItem('savedEmail');
    }

    onLogin({ email, rememberEmail });
  };

  const handleRememberChange = (e) => {
    const shouldRemember = e.target.checked;
    setRememberEmail(shouldRemember);

    if (!shouldRemember) {
      sessionStorage.removeItem('savedEmail');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(
        `${backendUrl}/api/auth/google`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            token: credentialResponse.credential
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Authentication failed');
      }

      const data = await response.json();
      
      if (data.success) {
        onLogin(
          {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            picture: data.user.picture,
            interviewsCompleted: data.user.interviewsCompleted,
            averageScore: data.user.averageScore,
            provider: 'google',
            rememberMe: true
          },
          data.sessionToken
        );
      }
    } catch (err) {
      console.error('Google auth error:', err);
      setError('Access blocked: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component
};

export default Login;
```

---

## 6. Updated Frontend package.json

```json
{
  "name": "interview-session-react",
  "version": "1.0.0",
  "description": "Interview Session UI built with React",
  "private": true,
  "dependencies": {
    "@react-oauth/google": "^0.13.5",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "GENERATE_SOURCEMAP=false react-scripts start",
    "build": "GENERATE_SOURCEMAP=false react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "analyze": "source-map-explorer 'build/static/js/*.js'"
  },
  "eslintConfig": {
    "extends": [
      "react-app"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "source-map-explorer": "^2.5.3"
  }
}
```

---

## 7. Create .env.production File

**Create:** `Frontend/.env.production`

```
GENERATE_SOURCEMAP=false
REACT_APP_BACKEND_URL=YOUR_PRODUCTION_BACKEND_URL
```

---

## 8. Installation & Testing

```bash
cd Frontend

# Install dependencies
npm install

# Build with optimizations
npm run build

# Analyze bundle size
npm run analyze

# Test locally
npm start
```

---

## Performance Testing Checklist

After implementing these optimizations, test with these tools:

**Chrome DevTools:**
1. **Performance Tab:** Record session, check for jank in 60fps timeline
2. **Lighthouse:** Run audit, target 85+ scores
3. **Coverage Tab:** Check unused CSS/JS

**Metrics to Monitor:**
- First Contentful Paint (FCP) - Target: < 1.8s
- Largest Contentful Paint (LCP) - Target: < 2.5s
- Cumulative Layout Shift (CLS) - Target: < 0.1
- Time to Interactive (TTI) - Target: < 3.8s

**Test Commands:**
```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse https://your-site.com --view
```

