'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { UserRole } from '@/types';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'client' as UserRole,
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
          phone: formData.phone || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        router.push('/auth/verify?email=' + encodeURIComponent(formData.email));
      } else {
        // Handle different types of errors
        if (data.errors) {
          // Validation errors - show specific field errors
          const errorMessages = [];
          if (data.errors.email) errorMessages.push(`Email: ${data.errors.email.join(', ')}`);
          if (data.errors.password) errorMessages.push(`Password: ${data.errors.password.join(', ')}`);
          if (data.errors.firstName) errorMessages.push(`First Name: ${data.errors.firstName.join(', ')}`);
          if (data.errors.lastName) errorMessages.push(`Last Name: ${data.errors.lastName.join(', ')}`);
          if (data.errors.role) errorMessages.push(`Role: ${data.errors.role.join(', ')}`);
          setError(errorMessages.join(' | '));
        } else {
          setError(data.error || data.message || 'Registration failed');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
          <p style={{ color: '#556b2f', fontSize: '1rem' }}>Join our community of designers and clients</p>
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
              Create Account
            </h2>
            <p style={{ 
              color: '#556b2f', 
              fontSize: '0.875rem',
              marginBottom: '1.5rem'
            }}>
              Fill in your details to get started
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Input
                  label="First Name"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  required
                />
                <Input
                  label="Last Name"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  required
                />
              </div>
              
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
              />

              <Input
                label="Phone (Optional)"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 234 567 8900"
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  fontWeight: '500', 
                  color: '#2d4016'
                }}>
                  Account Type
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    background: 'white',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#90ee90'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  required
                >
                  <option value="client">Client - I need design services</option>
                  <option value="designer">Designer - I provide design services</option>
                  <option value="supplier">Supplier - I supply design materials</option>
                </select>
              </div>

              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                helper="Must be 8+ characters with uppercase, lowercase, number, and special character (@$!%*?&)"
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
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
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div style={{ 
              marginTop: '1.5rem', 
              textAlign: 'center' 
            }}>
              <div style={{ fontSize: '0.875rem', color: '#556b2f' }}>
                Already have an account?{' '}
                <Link 
                  href="/auth/login" 
                  style={{ 
                    color: '#90ee90', 
                    textDecoration: 'none',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}