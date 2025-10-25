'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Star, Users, Phone, Mail, MapPin, Heart, CheckCircle, Menu, X } from 'lucide-react';

export default function MobileTestPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Test Header */}
      <header className="mobile-nav-fixed bg-gradient-to-r from-green-800 to-green-700 text-white shadow-lg">
        <div className="mobile-container">
          <div className="mobile-flex mobile-justify-between mobile-items-center h-16">
            <h1 className="mobile-heading-3 font-bold">Mobile Test</h1>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden touch-target text-white"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Content with proper top spacing */}
      <div className="pt-20">
        {/* Typography Test Section */}
        <section className="mobile-section bg-white">
          <div className="mobile-container">
            <h2 className="mobile-heading-1 text-gray-800 mb-6">Typography Test</h2>
            
            <h1 className="mobile-heading-1 text-gray-800">Mobile Heading 1</h1>
            <h2 className="mobile-heading-2 text-gray-700">Mobile Heading 2</h2>
            <h3 className="mobile-heading-3 text-gray-600">Mobile Heading 3</h3>
            <p className="mobile-body text-gray-600">
              This is mobile body text that should be easily readable on all mobile devices. 
              The font size is optimized to prevent zoom on iOS devices.
            </p>
            <p className="mobile-small text-gray-500">
              This is small text for captions and metadata.
            </p>
          </div>
        </section>

        {/* Button Test Section */}
        <section className="mobile-section bg-gray-50">
          <div className="mobile-container">
            <h2 className="mobile-heading-2 text-gray-800 mb-6">Button Test</h2>
            
            <div className="mobile-flex mobile-flex-col mobile-gap-md mobile-mb-lg">
              <button className="mobile-btn mobile-btn-primary">
                Primary Button
                <ArrowRight size={16} />
              </button>
              
              <button className="mobile-btn mobile-btn-secondary">
                Secondary Button
                <Heart size={16} />
              </button>
              
              <Link href="#" className="mobile-btn mobile-btn-primary mobile-w-full">
                Full Width Link Button
                <CheckCircle size={16} />
              </Link>
            </div>
            
            <div className="mobile-grid grid-cols-2 mobile-gap-md">
              <button className="mobile-btn mobile-btn-primary">Left</button>
              <button className="mobile-btn mobile-btn-secondary">Right</button>
            </div>
          </div>
        </section>

        {/* Card Test Section */}
        <section className="mobile-section bg-white">
          <div className="mobile-container">
            <h2 className="mobile-heading-2 text-gray-800 mb-6">Card Test</h2>
            
            <div className="mobile-grid mobile-grid-responsive">
              <div className="mobile-card">
                <div className="mobile-card-header">
                  <h3 className="mobile-heading-3 text-gray-800">Card Title</h3>
                </div>
                <div className="mobile-card-content">
                  <p className="mobile-body text-gray-600">
                    This is a test card with proper mobile spacing and responsive design.
                  </p>
                </div>
                <div className="mobile-card-footer">
                  <button className="mobile-btn mobile-btn-primary mobile-w-full">
                    Action Button
                  </button>
                </div>
              </div>

              <div className="mobile-card">
                <img 
                  src="/images/WOMEN.jpeg"
                  alt="Test Image"
                  className="mobile-image-card mb-4"
                />
                <h3 className="mobile-heading-3 text-gray-800 mb-3">Image Card</h3>
                <p className="mobile-body text-gray-600 mb-4">
                  Card with responsive image that adapts to different screen sizes.
                </p>
                <button className="mobile-btn mobile-btn-secondary mobile-w-full">
                  View More
                </button>
              </div>

              <div className="mobile-card">
                <div className="mobile-flex mobile-items-center mobile-gap-md mobile-mb-md">
                  <img 
                    src="/images/WOMEN.jpeg"
                    alt="Profile"
                    className="mobile-image-profile"
                  />
                  <div>
                    <h3 className="mobile-heading-3 text-gray-800">Sarah Nakamya</h3>
                    <p className="mobile-small text-green-600">Interior Designer</p>
                    <div className="mobile-flex mobile-items-center mobile-gap-sm">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="mobile-small text-gray-600">4.9</span>
                    </div>
                  </div>
                </div>
                <p className="mobile-body text-gray-600">
                  Professional profile card layout for mobile display.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Form Test Section */}
        <section className="mobile-section bg-gray-50">
          <div className="mobile-container">
            <h2 className="mobile-heading-2 text-gray-800 mb-6">Form Test</h2>
            
            <div className="mobile-card max-w-md mx-auto">
              <form className="mobile-flex mobile-flex-col mobile-gap-md">
                <div className="mobile-form-group">
                  <label className="mobile-label">Full Name</label>
                  <input 
                    type="text" 
                    className="mobile-input"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="mobile-form-group">
                  <label className="mobile-label">Email Address</label>
                  <input 
                    type="email" 
                    className="mobile-input"
                    placeholder="your.email@example.com"
                  />
                </div>
                
                <div className="mobile-form-group">
                  <label className="mobile-label">Phone Number</label>
                  <input 
                    type="tel" 
                    className="mobile-input"
                    placeholder="+256 700 123 456"
                  />
                </div>
                
                <div className="mobile-form-group">
                  <label className="mobile-label">Role</label>
                  <select className="mobile-input mobile-select">
                    <option value="">Select your role</option>
                    <option value="client">Client</option>
                    <option value="designer">Designer</option>
                    <option value="supplier">Supplier</option>
                  </select>
                </div>
                
                <div className="mobile-form-group">
                  <label className="mobile-label">Message</label>
                  <textarea 
                    className="mobile-input mobile-textarea"
                    placeholder="Tell us about your project..."
                    rows={4}
                  ></textarea>
                </div>
                
                <button type="submit" className="mobile-btn mobile-btn-primary mobile-w-full">
                  Submit Form
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Grid System Test */}
        <section className="mobile-section bg-white">
          <div className="mobile-container">
            <h2 className="mobile-heading-2 text-gray-800 mb-6">Grid System Test</h2>
            
            <h3 className="mobile-heading-3 text-gray-700 mb-4">Responsive Grid (1 → 2 → 3 columns)</h3>
            <div className="mobile-grid mobile-grid-responsive mobile-mb-xl">
              {[1, 2, 3, 4, 5, 6].map(num => (
                <div key={num} className="mobile-card mobile-text-center">
                  <h4 className="mobile-heading-3 text-green-600">Item {num}</h4>
                  <p className="mobile-body text-gray-600">Grid item content</p>
                </div>
              ))}
            </div>
            
            <h3 className="mobile-heading-3 text-gray-700 mb-4">Two Column Grid</h3>
            <div className="mobile-grid grid-cols-2 mobile-gap-md">
              <div className="mobile-card mobile-text-center">
                <Phone className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="mobile-heading-3">Call Us</h4>
                <p className="mobile-small text-gray-600">+256 700 123 456</p>
              </div>
              <div className="mobile-card mobile-text-center">
                <Mail className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="mobile-heading-3">Email Us</h4>
                <p className="mobile-small text-gray-600">info@wid.community</p>
              </div>
            </div>
          </div>
        </section>

        {/* Image Test Section */}
        <section className="mobile-section bg-gray-50">
          <div className="mobile-container">
            <h2 className="mobile-heading-2 text-gray-800 mb-6">Image Test</h2>
            
            <div className="mobile-grid mobile-gap-lg">
              <div>
                <h3 className="mobile-heading-3 text-gray-700 mb-4">Hero Image</h3>
                <img 
                  src="/images/WOMEN.jpeg"
                  alt="Hero Image Test"
                  className="mobile-image-hero"
                />
              </div>
              
              <div>
                <h3 className="mobile-heading-3 text-gray-700 mb-4">Card Images</h3>
                <div className="mobile-grid grid-cols-2 mobile-gap-md">
                  <img 
                    src="/images/1000579811.jpg"
                    alt="Card Image 1"
                    className="mobile-image-card"
                  />
                  <img 
                    src="/images/1000579832.jpg"
                    alt="Card Image 2"
                    className="mobile-image-card"
                  />
                </div>
              </div>
              
              <div>
                <h3 className="mobile-heading-3 text-gray-700 mb-4">Profile Images</h3>
                <div className="mobile-flex mobile-gap-md mobile-items-center">
                  <img 
                    src="/images/WOMEN.jpeg"
                    alt="Profile 1"
                    className="mobile-image-profile"
                  />
                  <img 
                    src="/images/WOMEN.jpeg"
                    alt="Profile 2"
                    className="mobile-image-profile"
                  />
                  <img 
                    src="/images/WOMEN.jpeg"
                    alt="Profile 3"
                    className="mobile-image-profile"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Touch Target Test */}
        <section className="mobile-section bg-white">
          <div className="mobile-container">
            <h2 className="mobile-heading-2 text-gray-800 mb-6">Touch Target Test</h2>
            
            <div className="mobile-grid grid-cols-4 mobile-gap-md mobile-text-center">
              <button className="touch-target bg-green-100 rounded-lg">
                <Phone size={20} className="text-green-600" />
              </button>
              <button className="touch-target bg-blue-100 rounded-lg">
                <Mail size={20} className="text-blue-600" />
              </button>
              <button className="touch-target bg-purple-100 rounded-lg">
                <MapPin size={20} className="text-purple-600" />
              </button>
              <button className="touch-target bg-red-100 rounded-lg">
                <Heart size={20} className="text-red-600" />
              </button>
            </div>
            
            <p className="mobile-body text-gray-600 mt-4 mobile-text-center">
              All touch targets are minimum 44px × 44px for optimal accessibility
            </p>
          </div>
        </section>

        {/* Animation Test */}
        <section className="mobile-section bg-gray-50">
          <div className="mobile-container">
            <h2 className="mobile-heading-2 text-gray-800 mb-6">Animation Test</h2>
            
            <div className="mobile-grid mobile-grid-responsive">
              <div className="mobile-card mobile-animate-fade-in">
                <h3 className="mobile-heading-3 text-gray-800 mb-3">Fade In Animation</h3>
                <p className="mobile-body text-gray-600">
                  This card uses the fade-in animation for smooth entrance.
                </p>
              </div>
              
              <div className="mobile-card mobile-animate-slide-up">
                <h3 className="mobile-heading-3 text-gray-800 mb-3">Slide Up Animation</h3>
                <p className="mobile-body text-gray-600">
                  This card slides up from the bottom with smooth timing.
                </p>
              </div>
              
              <div className="mobile-card mobile-gpu-accelerated">
                <h3 className="mobile-heading-3 text-gray-800 mb-3">GPU Accelerated</h3>
                <p className="mobile-body text-gray-600">
                  This card is optimized for smooth animations and transitions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Spacing Test */}
        <section className="mobile-section bg-white">
          <div className="mobile-container">
            <h2 className="mobile-heading-2 text-gray-800 mb-6">Spacing Test</h2>
            
            <div className="mobile-flex mobile-flex-col mobile-gap-sm mobile-mb-md">
              <div className="bg-green-100 p-4 rounded">Small Gap (8px)</div>
              <div className="bg-green-100 p-4 rounded">Between Elements</div>
            </div>
            
            <div className="mobile-flex mobile-flex-col mobile-gap-md mobile-mb-md">
              <div className="bg-blue-100 p-4 rounded">Medium Gap (16px)</div>
              <div className="bg-blue-100 p-4 rounded">Between Elements</div>
            </div>
            
            <div className="mobile-flex mobile-flex-col mobile-gap-lg mobile-mb-md">
              <div className="bg-purple-100 p-4 rounded">Large Gap (24px)</div>
              <div className="bg-purple-100 p-4 rounded">Between Elements</div>
            </div>
            
            <div className="mobile-flex mobile-flex-col mobile-gap-xl">
              <div className="bg-red-100 p-4 rounded">Extra Large Gap (32px)</div>
              <div className="bg-red-100 p-4 rounded">Between Elements</div>
            </div>
          </div>
        </section>

        {/* Utility Classes Test */}
        <section className="mobile-section bg-gray-50">
          <div className="mobile-container">
            <h2 className="mobile-heading-2 text-gray-800 mb-6">Utility Classes Test</h2>
            
            <div className="mobile-grid mobile-gap-md">
              <div className="mobile-card mobile-text-center">
                <h3 className="mobile-heading-3">Centered Text</h3>
                <p className="mobile-body">This text is centered on all devices</p>
              </div>
              
              <div className="mobile-card">
                <div className="mobile-flex mobile-justify-between mobile-items-center">
                  <span>Space Between</span>
                  <ArrowRight size={16} />
                </div>
              </div>
              
              <div className="mobile-card">
                <div className="mobile-flex mobile-justify-center mobile-items-center mobile-gap-md">
                  <Phone size={16} />
                  <span>Centered Content</span>
                  <Mail size={16} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Mobile Bottom Navigation Test */}
      <div className="lg:hidden mobile-nav-bottom">
        <div className="mobile-container">
          <div className="mobile-grid grid-cols-5 mobile-gap-sm">
            <Link href="/landing" className="mobile-nav-item">
              <span className="text-xl">🏠</span>
              <span className="mobile-nav-label">Home</span>
            </Link>
            <Link href="/landing/designers" className="mobile-nav-item">
              <span className="text-xl">🎨</span>
              <span className="mobile-nav-label">Designers</span>
            </Link>
            <Link href="/landing/suppliers" className="mobile-nav-item">
              <span className="text-xl">🏪</span>
              <span className="mobile-nav-label">Suppliers</span>
            </Link>
            <Link href="/auth/login" className="mobile-nav-item">
              <span className="text-xl">👤</span>
              <span className="mobile-nav-label">Account</span>
            </Link>
            <Link href="/mobile-test" className="mobile-nav-item active">
              <span className="text-xl">⚙️</span>
              <span className="mobile-nav-label">Test</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Safe Area */}
      <div className="mobile-safe-bottom lg:hidden h-20"></div>
    </div>
  );
}