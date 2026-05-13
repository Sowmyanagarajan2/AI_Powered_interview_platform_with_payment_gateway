import React, { useState, useEffect } from 'react';
import './InterviewCourses.css';

const InterviewCourses = ({ user, onBackToHome }) => { //destructuring user and onBackToHome from props
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const mockCourses = [
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
//when page opens do this
  useEffect(() => {
    loadCourses();
  }, []); //empty dependency array means this runs once on component mount

  const loadCourses = async () => { //api call to load courses - currently simulating with mock data and timeout
    try {
      setLoading(true);
      // Simulating API call - in production, this would fetch from backend
      setTimeout(() => {
        setCourses(mockCourses);
        // Load enrolled courses from localStorage

        //if iot production then this would be an API call to get enrolled courses for the user
        // const response =await.axios.get('/api/user/enrolled-courses');
        // setCourses(response.data.courses);
        const enrolled = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
        setEnrolledCourses(enrolled);
        setLoading(false);
      }, 500); //500 display time to show loading state
    } catch (err) {
      console.error('Error loading courses:', err);
      setError('Failed to load courses');
      setLoading(false);
    }
  };

  const handleEnrollCourse = async (courseId) => {
    try {
      if (enrolledCourses.includes(courseId)) {
        alert('You are already enrolled in this course!');
        return;
      }

      // Simulate backend enrollment call
      const token = localStorage.getItem('sessionToken');
    
      // In production, this would call the backend
      // const response = await fetch(
      //   (process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000') + '/api/courses/enroll',
      //   {
      //     method: 'POST',
      //     headers: {
      //       'Authorization': `Bearer ${token}`,
      //       'Content-Type': 'application/json'
      //     },
      //     body: JSON.stringify({ courseId, userId: user._id })
      //   }
      // );

      // For now, just update local state
      const updatedEnrolled = [...enrolledCourses, courseId];
      setEnrolledCourses(updatedEnrolled);
      localStorage.setItem('enrolledCourses', JSON.stringify(updatedEnrolled));
      alert('Successfully enrolled in the course!');
    } catch (err) {
      console.error('Enrollment error:', err);
      setError('Failed to enroll in course');
    }
  };


  const filteredCourses = selectedFilter === 'all' 
    ? courses 
    : courses.filter(c => c.category === selectedFilter);

  const categories = ['all', ...new Set(courses.map(c => c.category))];

  // Cart handlers
  const handleAddToCart = (courseId) => {
    if (cart.includes(courseId) || enrolledCourses.includes(courseId)) return;
    setCart([...cart, courseId]);
  };

  const handleRemoveFromCart = (courseId) => {
    setCart(cart.filter(id => id !== courseId));
  };

  const handleOpenCart = () => setShowCart(true);
  const handleCloseCart = () => setShowCart(false);

  // Razorpay Payment Integration
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    const totalAmount = cart.reduce((sum, id) => sum + (courses.find(c => c.id === id)?.price || 0), 0);
    const options = {
      key: 'RAZORPAY_TEST_KEY', // TODO: Replace with your Razorpay Test API Key
      amount: Math.round(totalAmount * 100), // Amount in paise
      currency: 'INR',
      name: 'PrepAI Interview Courses',
      description: 'Course Purchase',
      image: '',
      handler: function (response) {
        setPaymentSuccess(true);
        // Mark all cart items as enrolled
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
      },
      modal: {
        ondismiss: function () {
          setPaymentProcessing(false);
        }
      }
    };
    setPaymentProcessing(true);
    const rzp = new window.Razorpay(options);
    rzp.open();
    setPaymentProcessing(false);
  };

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
                        <button className="cart-remove-btn" onClick={() => handleRemoveFromCart(id)}>✕</button>
                      </li>
                    );
                  })}
                </ul>
                <div className="cart-total">
                  Total: <b>${cart.reduce((sum, id) => sum + (courses.find(c => c.id === id)?.price || 0), 0).toFixed(2)}</b>
                </div>
                <button className="cart-checkout-btn" onClick={handleCheckout} disabled={paymentProcessing}>
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
        <div className="filter-scroll">
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

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Courses Grid */}
      <div className="courses-container">
        <div className="courses-grid">
          {filteredCourses.map(course => (
            <div key={course.id} className="course-card">
              <div className="course-image">{course.image}</div>
              <div className="course-content">
                <div className="course-category">{course.category}</div>
                <h3 className="course-title">{course.title}</h3>
                <p className="course-description">{course.description}</p>
                <div className="course-meta">
                  <div className="meta-item">
                    <span className="meta-icon">⏱️</span>
                    <span>{course.duration}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-icon">📊</span>
                    <span>{course.level}</span>
                  </div>
                </div>
                <div className="course-stats">
                  <div className="stat">
                    <span className="star">⭐</span>
                    <span className="rating">{course.rating}</span>
                  </div>
                  <div className="stat">
                    <span className="student-icon">👥</span>
                    <span className="students">{course.students.toLocaleString()}</span>
                  </div>
                </div>
                <div className="course-footer">
                  <div className="price-section">
                    <span className="price">${course.price}</span>
                  </div>
                  {enrolledCourses.includes(course.id) ? (
                    <button className="enroll-btn enrolled" disabled>✓ Enrolled</button>
                  ) : cart.includes(course.id) ? (
                    <button className="cart-btn added" disabled>Added to Cart</button>
                  ) : (
                    <>
                      <button className="cart-btn" onClick={() => handleAddToCart(course.id)}>Add to Cart</button>
                      <button className="enroll-btn" onClick={() => handleEnrollCourse(course.id)}>Enroll Now</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {filteredCourses.length === 0 && (
          <div className="no-courses">
            <p>No courses found in this category</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="courses-footer">
        <p>Enroll in courses and start your interview preparation journey today! 🚀</p>
      </div>
    </div>
  );
};

export default InterviewCourses;
