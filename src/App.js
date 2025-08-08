import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Modal,
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Analytics } from '@vercel/analytics/react';
import { auth, googleProvider } from './firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import emailjs from 'emailjs-com';

function App() {
  // Auth & UI
  const [user, setUser] = useState(null);

  // Poem logic
  const [poem, setPoem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [thoughts, setThoughts] = useState('');
  const [name, setName] = useState('');
  const [sending, setSending] = useState(false);

  // UI/UX
  const [alert, setAlert] = useState({ show: false, message: '', variant: '' });
  const [darkMode, setDarkMode] = useState(false);
  const [poemTruncated, setPoemTruncated] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  // --- FIREBASE AUTH ---
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);

  // --- INITIALIZE EMAILJS ONCE ---
  useEffect(() => {
    // Replace with your EmailJS User ID
    emailjs.init('Plj7s7ue_5BQW9Bky');
  }, []);

  // --- THEME ---
  useEffect(() => {
    fetchRandomPoem();
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
      document.body.className = savedTheme + '-mode';
    } else {
      document.body.className = 'light-mode';
    }
    // eslint-disable-next-line
  }, []);

  // Auto-dismiss alert after 4 seconds
  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert(prev => ({ ...prev, show: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [alert.show]);

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    const themeClass = newTheme ? 'dark-mode' : 'light-mode';
    document.body.className = themeClass;
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  // --- Google Auth Handlers ---
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // setUser updates automatically via onAuthStateChanged
    } catch (error) {
      setAlert({ show: true, message: 'Google sign-in failed.', variant: 'danger' });
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
    setName('');
    setThoughts('');
  };

  // --- Get a Poem ---
  const fetchRandomPoem = async () => {
    try {
      setLoading(true);
      setPoemTruncated(false);
      const response = await fetch('https://poetrydb.org/random');
      const data = await response.json();
      if (data[0] && data[0].lines && data[0].lines.length > 28) {
        data[0].lines = data[0].lines.slice(0, 28);
        setPoemTruncated(true);
      }
      setPoem(data[0]);
      setThoughts('');
    } catch (error) {
      console.error('Error fetching poem:', error);
      setAlert({ show: true, message: 'Failed to fetch poem. Please try again.', variant: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleNewPoem = () => {
    fetchRandomPoem();
    setThoughts('');
  };

  // --- Email Sending ---
  const sendEmail = async (e) => {
    e.preventDefault();

    if (!user) {
      setAlert({ show: true, message: 'Please sign in with Google to send the email.', variant: 'warning' });
      return;
    }
    if (!name || !thoughts) {
      setAlert({ show: true, message: 'Please fill in all fields.', variant: 'warning' });
      return;
    }
    setSending(true);

    try {
      await emailjs.send(
        'service_0s2jmcw', // Replace with your EmailJS Service ID
        'template_5buuqtp', // Replace with your EmailJS Template ID
        {
          to_name: name,
          to_email: user.email,
          poem_title: poem?.title || 'Unknown',
          poem_author: poem?.author || 'Unknown',
          poem_content: poem?.lines?.join('\n') || 'Poem content unavailable',
          user_thoughts: thoughts,
          from_name: 'ResponsePoetry',
        }
      );

      setAlert({ show: true, message: 'Your thoughts have been sent successfully!', variant: 'success' });
      setThoughts('');
      setName('');
    } catch (error) {
      console.error('Email sending failed:', error);
      setAlert({ show: true, message: 'Failed to send email. Please try again.', variant: 'danger' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="app-background">
      {/* Theme Toggle */}
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {darkMode ? '☀️' : '🌙'}
      </button>

      {/* About Button */}
      <button
        className="about-toggle"
        onClick={() => setShowAbout(true)}
        title="About this app"
      >
        ℹ️
      </button>

      {/* Auth Buttons */}
      <div style={{ position: 'fixed', top: 30, right: 160, zIndex: 1000 }}>
        {user ? (
          <Button className="btn-custom-outline" size="sm" variant="outline-primary" onClick={handleSignOut}>
            Sign Out
          </Button>
        ) : (
          <Button className="btn-custom-outline" size="sm" variant="outline-primary" onClick={handleGoogleSignIn}>
            Sign In
          </Button>
        )}
      </div>

      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={12}>
            {/* Header */}
            <div className="app-header">
              <h1 className="app-title">A Poem A Day</h1>
              <p className="app-subtitle">ResponsePoetry. Read. Write. Repeat.</p>
            </div>

            {/* Poem Display */}
            <Card className="poem-card">
              <Card.Header>
                <h3 className="poem-header-title">Today's Poem</h3>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" />
                    <p className="loading-text">Loading poem...</p>
                  </div>
                ) : poem ? (
                  <>
                    <div className="poem-meta">
                      <h4 className="poem-title">{poem.title}</h4>
                      <p className="poem-author">by {poem.author}</p>
                    </div>
                    <div className="poem-content">
                      {poem.lines?.map((line, index) => (
                        <p key={index} className="poem-line">
                          {line}
                        </p>
                      ))}
                      {poemTruncated && (
                        <div className="truncation-notice">
                          This poem has been truncated to 28 lines for better reading experience.
                        </div>
                      )}
                    </div>
                    <div className="text-center mt-5">
                      <Button
                        className="btn-custom-outline"
                        onClick={handleNewPoem}
                        disabled={loading}
                      >
                        Get New Poem
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-5">
                    <p className="text-muted">No poem available</p>
                    <Button className="btn-custom-primary" onClick={fetchRandomPoem}>
                      Try Again
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Thoughts Form */}
            {poem && (
              <Card className="thoughts-card">
                <Card.Header>
                  <h4 className="thoughts-header-title">Send the Poem to Yourself</h4>
                </Card.Header>
                <Card.Body>
                  {!user ? (
                    <div className="text-center py-4">
                      <Button
                        onClick={handleGoogleSignIn}
                        className="btn-custom-outline"
                        variant="primary"
                        style={{ minWidth: 220, fontWeight: 500, fontSize: '1rem', letterSpacing: '0.5px' }}
                      >
                        Sign in to Email your thoughts.
                      </Button>
                    </div>
                  ) : (
                    <Form onSubmit={sendEmail}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Enter your name"
                              value={name}
                              onChange={e => setName(e.target.value)}
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                              type="email"
                              value={user.email || ''}
                              readOnly
                              disabled
                              required
                              style={{ backgroundColor: '#f8fafc', cursor: 'not-allowed', color: '#555' }}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Form.Group className="mb-4">
                        <Form.Label>Your Thoughts</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={5}
                          placeholder="What does this poem mean to you? How does it make you feel?"
                          value={thoughts}
                          onChange={e => setThoughts(e.target.value)}
                          required
                        />
                      </Form.Group>
                      <div className="text-center">
                        <Button
                          type="submit"
                          className="btn-custom-primary"
                          disabled={sending}
                          style={{ minWidth: 180 }}
                        >
                          {sending ? (
                            <>
                              <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="me-2"
                              />
                              Sending...
                            </>
                          ) : (
                            'Email My Thoughts'
                          )}
                        </Button>
                      </div>

                      {/* Alert near button */}
                      {alert.show && (
                        <Alert
                          variant={alert.variant}
                          onClose={() => setAlert({ ...alert, show: false })}
                          dismissible
                          className="mt-3"
                        >
                          {alert.message}
                        </Alert>
                      )}
                    </Form>
                  )}
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>

      {/* About Modal */}
      <Modal show={showAbout} onHide={() => setShowAbout(false)} size="lg" centered className="about-modal">
        <Modal.Header closeButton className="about-modal-header">
          <Modal.Title>About Poetry Database</Modal.Title>
        </Modal.Header>
        <Modal.Body className="about-modal-body">
          <div className="about-content">
            <div className="about-description">
              <h5>What is ResponsePoetry?</h5>
              <p>
                Response poetry is a creative writing practice where a poet reads an existing poem and creates a new poem that directly responds to, engages with,
                or is inspired by the original work. This form of literary dialogue allows poets to enter into conversation with other voices, themes, and perspectives
                through verse.
              </p>

              <h5>How it Works</h5>
              <ul>
                <li>
                  <strong>Read:</strong> Each visit brings you a new poem from our curated collection
                </li>
                <li>
                  <strong>Ruminate:</strong> Email your reflections to yourself for future reference
                </li>
                <li>
                  <strong>Repeat:</strong> Return daily to continue your poetic journey
                </li>
              </ul>

              <h5>Why?</h5>
              <p>Writing is half motivation and half writing. ReflectionPoetry brings both into one webapp.</p>

              <h5>Features</h5>
              <ul>
                <li>🌙 Dark/Light mode for comfortable reading</li>
                <li>📧 Email your thoughts to yourself</li>
                <li>📱 Responsive design for all devices</li>
                <li>🎨 Beautiful, distraction-free interface</li>
                <li>📚 Curated poems from classical and contemporary poets</li>
              </ul>
            </div>
            <div className="about-footer">
              <p className="text-center">
                <em>Built with ❤️ for the ones who call themselves a poet, and for those who don't yet :)</em>
              </p>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <Analytics />
    </div>
  );
}

export default App;
