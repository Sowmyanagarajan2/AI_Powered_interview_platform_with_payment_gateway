import React, { useState, useEffect } from 'react';
import InterviewSession from './InterviewSession';
import Login from './Login';
import ProfilePage from './ProfilePage';
import InterviewCourses from './InterviewCourses';
import './index.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
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
        setCurrentPage('profile');
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
    setUser(null);
    setIsLoggedIn(false);
    setCurrentPage('login');
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="App loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="App">
      {isLoggedIn ? (
        currentPage === 'profile' ? (
          <ProfilePage user={user} onStartInterview={() => navigateTo('interview')} onViewCourses={() => navigateTo('courses')} onLogout={handleLogout} />
        ) : currentPage === 'interview' ? (
          <InterviewSession onBackToProfile={() => navigateTo('profile')} user={user} />
        ) : currentPage === 'courses' ? (
          <InterviewCourses user={user} onBackToHome={() => navigateTo('profile')} />
        ) : null
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
