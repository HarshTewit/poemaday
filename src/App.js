import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Modal } from 'react-bootstrap';
import emailjs from 'emailjs-com';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Analytics } from "@vercel/analytics"
function App() {
  const [poem, setPoem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [thoughts, setThoughts] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [sending, setSending] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', variant: '' });
  const [darkMode, setDarkMode] = useState(false);
  const [poemTruncated, setPoemTruncated] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  useEffect(() => {
    fetchRandomPoem();
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
      document.body.className = savedTheme + '-mode';
    } else {
      document.body.className = 'light-mode';
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    const themeClass = newTheme ? 'dark-mode' : 'light-mode';
    document.body.className = themeClass;
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

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
    } catch (error) {
      console.error('Error fetching poem:', error);
      setAlert({
        show: true,
        message: 'Failed to fetch poem. Please try again.',
        variant: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = async (e) => {
    e.preventDefault();
    
    if (!email || !name || !thoughts) {
      setAlert({
        show: true,
        message: 'Please fill in all fields.',
        variant: 'warning'
      });
      return;
    }

    setSending(true);

    const templateParams = {
      to_name: name,
      to_email: email,
      poem_title: poem?.title || 'Unknown',
      poem_author: poem?.author || 'Unknown',
      poem_content: poem?.lines?.join('\n') || 'Poem content unavailable',
      user_thoughts: thoughts,
      from_name: 'ResponsePoetry'
    };

    try {
      emailjs.init('Plj7s7ue_5BQW9Bky');
      
      await emailjs.send(
        'service_0s2jmcw',
        'template_5buuqtp',
        templateParams
      );

      setAlert({
        show: true,
        message: 'Your thoughts have been sent successfully!',
        variant: 'success'
      });

      setThoughts('');
      setEmail('');
      setName('');
    } catch (error) {
      console.error('Error sending email:', error);
      setAlert({
        show: true,
        message: 'Failed to send email. Please try again.',
        variant: 'danger'
      });
    } finally {
      setSending(false);
    }
  };

  const handleNewPoem = () => {
    fetchRandomPoem();
    setThoughts('');
  };

  return (
     <div className="app-background">
      {/* Theme Toggle Button */}
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

      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={12}>
            {/* Header */}
            <div className="app-header">
              <h1 className="app-title">
                A Poem A Day
              </h1>
              <p className="app-subtitle">
                ResonsePoetry. Read. Write. Repeat.
              </p>
            </div>

            {/* Alert */}
            {alert.show && (
              <Alert 
                variant={alert.variant} 
                onClose={() => setAlert({ ...alert, show: false })} 
                dismissible
                className="mb-4"
              >
                {alert.message}
              </Alert>
            )}

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
                  <h4 className="thoughts-header-title">Share Your Thoughts</h4>
                </Card.Header>
                <Card.Body>
                  <Form onSubmit={sendEmail}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Name</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
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
                        onChange={(e) => setThoughts(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <div className="text-center">
                      <Button 
                        type="submit" 
                        className="btn-custom-primary"
                        disabled={sending}
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
                  </Form>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>

      {/* About Modal */}
      <Modal 
        show={showAbout} 
        onHide={() => setShowAbout(false)}
        size="lg"
        centered
        className="about-modal"
      >
        <Modal.Header closeButton className="about-modal-header">
          <Modal.Title>About Poetry Database</Modal.Title>
        </Modal.Header>
        <Modal.Body className="about-modal-body">
          <div className="about-content">
             
              {/* <blockquote>
                <p>"Poetry is the journal of the sea animal living on land, wanting to fly in the air."</p>
                <footer>— Carl Sandburg</footer>
              </blockquote> */}
             
            
            <div className="about-description">
              <h5>What is ResponsePoetry ?</h5>
              <p>
              Response poetry is a creative writing practice where a poet reads an existing poem and creates a new poem that 
              directly responds to, engages with, or is inspired by the original work. This form of literary dialogue allows poets to 
              enter into conversation with other voices, themes, and perspectives through verse.
              </p>
              
              <h5>How it Works</h5>
              <ul>
                <li><strong>Read:</strong> Each visit brings you a new poem from our curated collection</li>
                <li><strong>Reciprocate:</strong> Write your thoughts, feelings, and interpretations</li>
                <li><strong>Ruminate:</strong> Email your reflections to yourself for future reference</li>
                <li><strong>Repeat:</strong> Return daily to continue your poetic journey</li>
              </ul>
              
              <h5>Why?</h5>
              <p>
                Writing is half motivation and half writing. ReflectionPoetry brings both into one webapp. 
              </p>
              
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
                <em>Built with ❤️ for the ones who call themselves a poet, and for those who don't.</em>
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
