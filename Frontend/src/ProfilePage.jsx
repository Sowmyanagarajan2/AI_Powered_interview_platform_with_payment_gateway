import React, { useEffect, useState } from 'react';
import './ProfilePage.css';

const ProfilePage = ({ user, onStartInterview, onViewCourses, onLogout }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('sessionToken');
      
      if (!token) {
        setError('No session token found');
        return;
      }

      const response = await fetch(
        (process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000') + '/api/user/profile',
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfileData(data.user);
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  const profile = profileData || user;

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-brand">
            <span className="brand-dot"></span>
            PrepAI
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* Profile Card */}
        <div className="profile-card">
          {error && <div className="error-message">{error}</div>}

          {/* User Info Section */}
          <div className="profile-section">
            <div className="profile-avatar">
              {profile?.picture ? (
                <img src={profile.picture} alt={profile.name} />
              ) : (
                <div className="avatar-placeholder">
                  {profile?.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="profile-info">
              <h1>{profile?.name || 'User'}</h1>
              <p className="email">{profile?.email}</p>
              <p className="member-since">
                Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Recently'}
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="stats-section">
            <div className="stat-box">
              <div className="stat-value">{profile?.interviewsCompleted || 0}</div>
              <div className="stat-label">Interviews Completed</div>
            </div>

            <div className="stat-box">
              <div className="stat-value">{profile?.averageScore || 0}%</div>
              <div className="stat-label">Average Score</div>
            </div>

            <div className="stat-box">
              <div className="stat-value">{profile?.totalScore || 0}</div>
              <div className="stat-label">Total Score</div>
            </div>

            <div className="stat-box">
              <div className="stat-value">
                {profile?.lastInterviewDate 
                  ? new Date(profile.lastInterviewDate).toLocaleDateString() 
                  : 'Never'}
              </div>
              <div className="stat-label">Last Interview</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-section">
            <button className="start-interview-btn" onClick={onStartInterview}>
              <span className="btn-icon">▶</span>
              Start New Interview
            </button>

            <button className="view-courses-btn" onClick={onViewCourses}>
              <span className="btn-icon">📚</span>
              Interview Courses
            </button>

            <button className="view-history-btn" disabled>
              <span className="btn-icon">📋</span>
              View Interview History
            </button>
          </div>

          {/* Quick Stats */}
          <div className="quick-stats">
            <div className="stat-item">
              <span className="label">Status:</span>
              <span className="value active">Active</span>
            </div>
            <div className="stat-item">
              <span className="label">Current Streak:</span>
              <span className="value">0 days</span>
            </div>
            <div className="stat-item">
              <span className="label">Profile Level:</span>
              <span className="value">Beginner</span>
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="welcome-message">
          <p>Welcome back, <strong>{profile?.name?.split(' ')[0] || 'User'}</strong>! Ready to practice?</p>
          <p className="subtitle">Practice makes perfect. Start an interview session to improve your skills.</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
