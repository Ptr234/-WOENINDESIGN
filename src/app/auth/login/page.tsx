'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        // Store the JWT token in localStorage
        localStorage.setItem('token', data.data.token);
        router.push('/dashboard');
      } else {
        setError(data.error || data.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'linear-gradient(135deg, #f5f5dc, #e8e8e8)', 
      padding: '3rem 1rem',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div style={{ maxWidth: '28rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: '#2d4016',
            marginBottom: '0.5rem'
          }}>
            Women in Design
          </h1>
          <p style={{ color: '#556b2f', fontSize: '1rem' }}>Connect with designers and suppliers</p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '15px',
          boxShadow: '0 10px 40px rgba(85, 107, 47, 0.15)',
          border: '1px solid rgba(144, 238, 144, 0.2)',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '1.5rem 1.5rem 0' }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              color: '#2d4016',
              marginBottom: '0.5rem'
            }}>
              Sign In
            </h2>
            <p style={{ 
              color: '#556b2f', 
              fontSize: '0.875rem',
              marginBottom: '1.5rem'
            }}>
              Enter your credentials to access your account
            </p>
          </div>
          <div style={{ padding: '0 1.5rem 1.5rem' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {error && (
                <div style={{ 
                  background: '#fef2f2', 
                  border: '1px solid #fecaca', 
                  color: '#dc2626', 
                  padding: '0.75rem 1rem', 
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}>
                  {error}
                </div>
              )}
              
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />

              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: loading ? '#9ca3af' : 'linear-gradient(135deg, #556b2f, #2d4016)',
                  color: 'white',
                  padding: '0.75rem 1rem',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.875rem',
                  boxShadow: '0 4px 15px rgba(85, 107, 47, 0.3)'
                }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div style={{ 
              marginTop: '1.5rem', 
              textAlign: 'center', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.5rem'
            }}>
              <Link 
                href="/auth/reset-password" 
                style={{ 
                  fontSize: '0.875rem', 
                  color: '#90ee90', 
                  textDecoration: 'none',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
              >
                Forgot your password?
              </Link>
              <div style={{ fontSize: '0.875rem', color: '#556b2f' }}>
                Don't have an account?{' '}
                <Link 
                  href="/auth/register" 
                  style={{ 
                    color: '#90ee90', 
                    textDecoration: 'none',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}