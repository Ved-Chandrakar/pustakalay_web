import React, { useState } from 'react';
import type { User } from '../App';
import serverUrl from '../pages/server';
// import { Library } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${serverUrl}p_login_web.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const result = await response.json();

      if (result.success) {
        // Successfully logged in
        const user: User = {
          id: result.data.id,
          email: result.data.email,
          name: result.data.name,
          role: result.data.role
        };
        onLogin(user);
      } else {
        // Login failed
        setError(result.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#004E92',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '15px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        display: 'flex',
        overflow: 'hidden',
        maxWidth: '900px',
        width: '100%',
        minHeight: '600px'
      }}>
        {/* Left page - Library Info */}
        <div style={{
          flex: 1,
          padding: '40px 30px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          // background: 'linear-gradient(135deg, #ffffff 0%, #11176eff 100%)',
          background: '#8bc7f5ff',
          // borderRight: '3px solid linear-gradient(135deg, #ffffff 0%, #1a1a1bff 100%)'
        }}>
        <div style={{
          textAlign: 'center',
          color: '#2c3e50'
        }}>
            <img 
              src="/src/assets/Pustakalaya 3.png" 
              alt="Pustakalaya Logo"
              style={{ 
                width: '325px',
                height: '325px',
                marginBottom: '20px',
                marginLeft:'20px',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
              }} 
            />
            
            {/* <h1 style={{
              fontSize: '4.0rem',
              fontWeight: 'bold',
              marginBottom: '15px',
              fontFamily: 'serif',
              color: '#141985ff',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              स्मृति पुस्तकालय
            </h1> */}
          </div>
        </div>

        {/* Right page - Login Form */}
        <div style={{
          flex: 1,
          padding: '40px 30px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: '#8bc7f5ff'
        }}>
          <div style={{ maxWidth: '320px', margin: '0 auto', width: '100%' }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '30px'
            }}>
              <h2 style={{
                fontSize: '2rem',
                marginBottom: '10px',
                color: '#1b0e80ff',
                fontWeight: 'bold'
              }}>
                Login to Library
              </h2>
              <div style={{
                width: '60px',
                height: '3px',
                background: '#231398ff',
                margin: '0 auto',
                borderRadius: '2px'
              }}></div>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#0a0f75ff',
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    border: '2px solid #0b157bff',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    background: 'rgba(255,255,255,0.95)',
                    outline: 'none',
                    fontFamily: 'inherit',
                    boxShadow: '0 2px 10px rgba(116, 146, 255, 0.2)'
                  }}
                />
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#0a0f75ff',
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 45px 12px 15px',
                      border: '2px solid #0b157bff',
                      borderRadius: '10px',
                      fontSize: '1rem',
                      background: 'rgba(255,255,255,0.95)',
                      outline: 'none',
                      fontFamily: 'inherit',
                      boxShadow: '0 2px 10px rgba(104, 153, 249, 0.2)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#0b157bff',
                      fontSize: '1.2rem',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '24px',
                      height: '24px',
                      borderRadius: '4px',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(11, 21, 123, 0.1)'}
                    onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      // Eye slash icon (hide password)
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        <path d="M2 2L22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      // Eye icon (show password)
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div style={{
                  textAlign: 'center',
                  marginBottom: '20px',
                  color: '#dc3545',
                  fontSize: '0.9rem',
                  background: '#ffe6e6',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #dc3545'
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '15px 20px',
                  background: isLoading 
                    ? '#ddd' 
                    : '#0b157bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 15px rgba(64, 40, 243, 0.3)',
                  transition: 'all 0.3s ease'
                }}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div style={{
              textAlign: 'center',
              marginTop: '30px',
              fontSize: '0.85rem',
              color: '#666'
            }}>
              <div style={{
                background: 'rgba(255,255,255,0.9)',
                padding: '15px',
                borderRadius: '10px',
                border: '1px solid rgba(116, 185, 255, 0.3)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                <p style={{ 
                  margin: '0 0 5px 0', 
                  fontWeight: 'bold',
                  color: '#060475ff'
                }}>
                  Powered by SSIPMT
                </p>
                <p style={{ 
                  margin: '0 0 5px 0', 
                  fontSize: '0.8rem',
                  color: '#031c5bff'
                }}>
                  Government Digital Library Management System
                </p>
                <p style={{ 
                  margin: '0', 
                  fontSize: '0.75rem',
                  color: '#0f1677ff'
                }}>
                  Version 1.0
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Only essential styles */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;
