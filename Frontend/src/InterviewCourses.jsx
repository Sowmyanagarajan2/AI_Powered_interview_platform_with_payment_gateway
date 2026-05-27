import React, { useCallback, useEffect, useState } from 'react';
import './InterviewCourses.css';

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

  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      // Simulating API call - in production, this would fetch from backend
      // Removed artificial 500ms delay; set mock data immediately for better perceived performance
      setCourses(mockCourses);
      // Load enrolled courses from localStorage
      // if in production this would be an API call to get enrolled courses for the user
      // const response = await axios.get('/api/user/enrolled-courses');
      // setCourses(response.data.courses);
      const enrolled = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
      setEnrolledCourses(enrolled);
      setLoading(false);
    } catch (err) {
      console.error('Error loading courses:', err);
      setError('Failed to load courses');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handleEnrollCourse = async (courseId) => {
    try {
      if (enrolledCourses.includes(courseId)) {
        alert('You are already enrolled in this course!');
        return;
      }

      // Simulate backend enrollment call
      // In production, this would call the backend
      // const token = localStorage.getItem('sessionToken');
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

  // Sharing helpers
  const shareCourseEmail = (course) => {
    const subject = `Check out this course: ${course.title}`;
    const body = `${course.title}%0D%0A%0D%0A${course.description}%0D%0A%0D%0APrice: $${course.price}%0D%0A%0D%0AView on PrepAI: ${window.location.origin}${window.location.pathname}`;
    const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${body}`;
    window.open(mailto, '_self');
  };

  const shareCourseWhatsApp = (course) => {
    const text = `${course.title} - ${course.description} \nPrice: $${course.price} \n${window.location.origin}${window.location.pathname}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const EmailIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 5.5C3 4.67157 3.67157 4 4.5 4H19.5C20.3284 4 21 4.67157 21 5.5V18.5C21 19.3284 20.3284 20 19.5 20H4.5C3.67157 20 3 19.3284 3 18.5V5.5Z" stroke="#333" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 6.5L12 13L3 6.5" stroke="#333" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const WhatsappIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 12.004C21 16.9706 16.9706 21 12.004 21C10.035 21 8.195 20.4 6.76 19.36L3 20.5L4.22 16.88C3.18 15.45 2.58 13.61 2.58 11.64C2.58 6.67 6.61 2.64 11.58 2.64C16.55 2.64 20.58 6.67 20.58 11.64V12.004H21Z" stroke="#25D366" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17.2 14.2C16.8 14.6 15.9 15.1 15.5 15.2C15.1 15.3 14.6 15.3 14.1 15.1C13.6 14.9 12.7 14.5 11.6 13.5C10.5 12.5 9.9 11.5 9.7 11.1C9.5 10.7 9.6 10.2 9.7 9.9C9.8 9.6 10.3 8.8 10.5 8.5C10.7 8.2 10.9 8.1 11.1 8.1C11.3 8.1 11.6 8.1 11.9 8.2C12.2 8.3 12.7 8.5 13.1 8.9C13.5 9.3 13.9 9.8 14.1 10.1C14.3 10.4 14.4 10.6 14.3 10.8C14.2 11 13.8 11.4 13.6 11.6C13.4 11.8 13.2 11.9 12.9 12C12.6 12.1 12.1 12.2 11.6 12.2" stroke="#25D366" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

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
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div className="share-buttons">
                      <button className="share-btn" onClick={() => shareCourseEmail(course)} aria-label="Share via Email">
                        <span className="share-icon"><EmailIcon /></span>
                      </button>
                      <button className="share-btn" onClick={() => shareCourseWhatsApp(course)} aria-label="Share on WhatsApp">
                        <span className="share-icon"><WhatsappIcon /></span>
                      </button>
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
