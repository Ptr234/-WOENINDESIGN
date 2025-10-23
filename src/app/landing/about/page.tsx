'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function AboutUsPage() {
  useEffect(() => {
    const scrollTop = document.getElementById('scrollTop');
    
    const handleScroll = () => {
      if (window.pageYOffset > 300) {
        scrollTop?.classList.add('visible');
      } else {
        scrollTop?.classList.remove('visible');
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      <style jsx>{`
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Poppins', sans-serif;
            color: #1a1a1a;
            overflow-x: hidden;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.7; }
        }
        
        @keyframes shine {
            0%, 100% { transform: translate(-50%, -50%); }
            50% { transform: translate(50%, 50%); }
        }
        
        @keyframes ripple {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(1.5); opacity: 0; }
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
        
        .hero {
            background: linear-gradient(135deg, rgba(45, 64, 22, 0.85) 0%, rgba(85, 107, 47, 0.85) 100%), 
                        url('https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80');
            background-size: cover;
            background-position: center;
            background-attachment: fixed;
            height: 500px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
        }
        
        .hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at 30% 50%, rgba(144, 238, 144, 0.15) 0%, transparent 50%);
        }
        
        .hero h1 {
            font-size: 72px;
            font-weight: 800;
            color: white;
            text-align: center;
            position: relative;
            z-index: 1;
            text-shadow: 0 4px 20px rgba(0,0,0,0.3);
            letter-spacing: 2px;
        }
        
        .intro-section {
            padding: 120px 8%;
            background: white;
            position: relative;
        }
        
        .section-label {
            color: #90ee90;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 3px;
            margin-bottom: 25px;
            display: flex;
            align-items: center;
            gap: 12px;
            text-transform: uppercase;
        }
        
        .section-label::before,
        .section-label::after {
            content: '';
            width: 10px;
            height: 10px;
            background: #90ee90;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }
        
        .intro-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 80px;
            margin-bottom: 80px;
            align-items: start;
        }
        
        .intro-title {
            font-size: 52px;
            font-weight: 800;
            line-height: 1.2;
            color: #1a1a1a;
        }
        
        .intro-title .highlight {
            color: #2d4016;
            position: relative;
            display: inline-block;
        }
        
        .intro-text {
            display: flex;
            flex-direction: column;
            gap: 25px;
        }
        
        .intro-text p {
            color: #666;
            line-height: 1.9;
            font-size: 15px;
        }
        
        .features {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 50px;
            margin-bottom: 100px;
        }
        
        .feature-card {
            display: flex;
            gap: 25px;
            align-items: flex-start;
            padding: 10px;
            transition: transform 0.3s;
        }
        
        .feature-card:hover {
            transform: translateY(-5px);
        }
        
        .feature-icon {
            width: 70px;
            height: 70px;
            background: linear-gradient(135deg, #90ee90 0%, #7bcf7b 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 28px;
            flex-shrink: 0;
            box-shadow: 0 8px 25px rgba(144, 238, 144, 0.3);
            position: relative;
            overflow: hidden;
        }
        
        .feature-icon::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
            animation: shine 3s infinite;
        }
        
        .feature-icon.alt {
            background: linear-gradient(135deg, #2d4016 0%, #556b2f 100%);
            box-shadow: 0 8px 25px rgba(45, 64, 22, 0.3);
        }
        
        .feature-content h3 {
            font-size: 19px;
            font-weight: 700;
            margin-bottom: 12px;
            color: #1a1a1a;
        }
        
        .feature-content p {
            color: #666;
            line-height: 1.7;
            font-size: 14px;
        }
        
        .image-gallery {
            display: grid;
            grid-template-columns: 1.3fr 1fr;
            gap: 35px;
            margin-top: 60px;
        }
        
        .gallery-image {
            border-radius: 25px;
            overflow: hidden;
            position: relative;
            background: #f5f5dc;
            aspect-ratio: 16/10;
            box-shadow: 0 15px 40px rgba(0,0,0,0.1);
            transition: all 0.4s;
        }
        
        .gallery-image:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 50px rgba(144, 238, 144, 0.15);
        }
        
        .gallery-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .gallery-image:first-child {
            transform: translateY(40px);
        }
        
        .gallery-image:first-child:hover {
            transform: translateY(32px);
        }
        
        .play-btn {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #90ee90 0%, #7bcf7b 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 28px;
            cursor: pointer;
            transition: all 0.4s;
            box-shadow: 0 8px 30px rgba(144, 238, 144, 0.4);
        }
        
        .play-btn::before {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 2px solid rgba(255,255,255,0.5);
            animation: ripple 2s infinite;
        }
        
        .play-btn:hover {
            background: linear-gradient(135deg, #2d4016 0%, #556b2f 100%);
            transform: translate(-50%, -50%) scale(1.15);
            box-shadow: 0 10px 40px rgba(45, 64, 22, 0.5);
        }
        
        .team-section {
            padding: 120px 8%;
            background: linear-gradient(180deg, #f5f5dc 0%, #e8e8e8 100%);
            position: relative;
        }
        
        .team-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 200px;
            background: radial-gradient(ellipse at top, rgba(144, 238, 144, 0.05) 0%, transparent 70%);
        }
        
        .team-section .section-label {
            justify-content: center;
            color: #2d4016;
        }
        
        .team-section .section-label::before,
        .team-section .section-label::after {
            background: #2d4016;
        }
        
        .team-title {
            text-align: center;
            font-size: 52px;
            font-weight: 800;
            margin-bottom: 25px;
            color: #1a1a1a;
        }
        
        .team-title .highlight {
            color: #90ee90;
        }
        
        .team-description {
            text-align: center;
            color: #666;
            max-width: 650px;
            margin: 0 auto 80px;
            line-height: 1.9;
            font-size: 15px;
        }
        
        .team-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 35px;
        }
        
        .team-card {
            background: white;
            border-radius: 20px;
            overflow: hidden;
            transition: all 0.4s;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
            position: relative;
        }
        
        .team-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 5px;
            background: linear-gradient(90deg, #2d4016 0%, #90ee90 100%);
            transform: scaleX(0);
            transition: transform 0.4s;
        }
        
        .team-card:hover::before {
            transform: scaleX(1);
        }
        
        .team-card:hover {
            transform: translateY(-15px);
            box-shadow: 0 20px 50px rgba(144, 238, 144, 0.15);
        }
        
        .team-image {
            width: 100%;
            aspect-ratio: 3/4;
            background: linear-gradient(135deg, #f5f5dc 0%, #e8e8e8 100%);
            overflow: hidden;
            position: relative;
        }
        
        .team-image::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 50%;
            background: linear-gradient(to top, rgba(45, 64, 22, 0.1) 0%, transparent 100%);
        }
        
        .team-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.4s;
        }
        
        .team-card:hover .team-image img {
            transform: scale(1.1);
        }
        
        .team-info {
            padding: 30px 25px;
            text-align: center;
        }
        
        .team-name {
            background: linear-gradient(135deg, #90ee90 0%, #7bcf7b 100%);
            color: white;
            padding: 12px 25px;
            border-radius: 30px;
            font-weight: 700;
            margin-bottom: 12px;
            display: inline-block;
            font-size: 15px;
            box-shadow: 0 5px 15px rgba(144, 238, 144, 0.3);
            transition: all 0.3s;
        }
        
        .team-card:hover .team-name {
            background: linear-gradient(135deg, #2d4016 0%, #556b2f 100%);
            transform: scale(1.05);
        }
        
        .team-position {
            color: #666;
            font-size: 13px;
            margin-bottom: 18px;
            font-weight: 500;
        }
        
        .team-social {
            display: flex;
            justify-content: center;
            gap: 10px;
        }
        
        .team-social a {
            width: 38px;
            height: 38px;
            border: 2px solid #e0e0e0;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #666;
            transition: all 0.3s;
            text-decoration: none;
            font-size: 14px;
        }
        
        .team-social a:hover {
            background: linear-gradient(135deg, #2d4016 0%, #90ee90 100%);
            color: white;
            border-color: transparent;
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(45, 64, 22, 0.3);
        }
        
        .scroll-top {
            position: fixed;
            bottom: 35px;
            right: 35px;
            width: 55px;
            height: 55px;
            background: linear-gradient(135deg, #90ee90 0%, #7bcf7b 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            cursor: pointer;
            transition: all 0.4s;
            opacity: 0;
            pointer-events: none;
            font-size: 20px;
            font-weight: bold;
            box-shadow: 0 8px 25px rgba(144, 238, 144, 0.3);
            z-index: 999;
        }
        
        .scroll-top.visible {
            opacity: 1;
            pointer-events: all;
        }
        
        .scroll-top:hover {
            background: linear-gradient(135deg, #2d4016 0%, #556b2f 100%);
            transform: translateY(-8px);
            box-shadow: 0 12px 30px rgba(144, 238, 144, 0.5);
        }
        
        @media (max-width: 1024px) {
            .intro-content {
                grid-template-columns: 1fr;
                gap: 40px;
            }
            
            .features {
                grid-template-columns: 1fr;
                gap: 30px;
            }
            
            .team-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .image-gallery {
                grid-template-columns: 1fr;
            }
            
            .gallery-image:first-child {
                transform: translateY(0);
            }
        }
        
        @media (max-width: 768px) {
            .hero h1 {
                font-size: 48px;
            }
            
            .intro-title,
            .team-title {
                font-size: 36px;
            }
            
            .team-grid {
                grid-template-columns: 1fr;
            }
        }
      `}</style>
      
      <div style={{ fontFamily: "'Poppins', sans-serif", color: '#1a1a1a', overflowX: 'hidden' }}>
        {/* Hero Section */}
        <section className="hero">
          <h1>About Us</h1>
        </section>

        {/* Introduction Section */}
        <section className="intro-section">
          <div className="section-label">Who We Are</div>
          
          <div className="intro-content">
            <div>
              <h2 className="intro-title">
                Empowering <span className="highlight">Women Designers<br/>Across Uganda</span>
              </h2>
            </div>
            <div className="intro-text">
              <p>Women in Design is a transformative platform dedicated to supporting, mentoring, and celebrating women in creative fields across Uganda. We believe diverse voices make design stronger and communities more vibrant.</p>
              <p>Through our comprehensive marketplace, mentorship programs, networking events, and resources, we create opportunities for women designers to connect, learn, and grow together while delivering exceptional design services to our clients.</p>
            </div>
          </div>

          {/* Features */}
          <div className="features">
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <div className="feature-content">
                <h3>Inclusive Community</h3>
                <p>Join a supportive network of designers, suppliers, and clients committed to empowering women in Uganda's creative industries.</p>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon alt">🎓</div>
              <div className="feature-content">
                <h3>Professional Development</h3>
                <p>Access workshops, training programs, and mentorship opportunities designed to advance your skills and grow your business.</p>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✨</div>
              <div className="feature-content">
                <h3>Quality Marketplace</h3>
                <p>Connect with verified suppliers and access high-quality materials while showcasing your design expertise to potential clients.</p>
              </div>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="image-gallery">
            <div className="gallery-image">
              <img 
                src="https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                alt="Women designers collaborating on creative projects in Uganda"
              />
            </div>
            <div className="gallery-image">
              <img 
                src="https://images.unsplash.com/photo-1600607687644-c7171b42498b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"
                alt="Interior design workspace showcasing creative process"
              />
              <div 
                className="play-btn"
                onClick={() => alert('Video showcasing our community impact would play here')}
              >
                ▶
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="team-section">
          <div className="section-label">Our Leadership</div>
          <h2 className="team-title"><span className="highlight">Meet</span> Our Team</h2>
          <p className="team-description">Our leadership team brings decades of combined experience in design, technology, and community building across Uganda. Together, we're committed to creating meaningful change in the creative industry.</p>
          
          <div className="team-grid">
            <div className="team-card">
              <div className="team-image">
                <img 
                  src="https://images.unsplash.com/photo-1494790108755-2616b612b47c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
                  alt="Sarah Nakamya - Founder & CEO"
                />
              </div>
              <div className="team-info">
                <div className="team-name">Sarah Nakamya</div>
                <div className="team-position">Founder & CEO</div>
                <div className="team-social">
                  <a href="#">f</a>
                  <a href="#">t</a>
                  <a href="#">in</a>
                  <a href="#">ig</a>
                </div>
              </div>
            </div>
            
            <div className="team-card">
              <div className="team-image">
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
                  alt="Grace Mukisa - Head of Community"
                />
              </div>
              <div className="team-info">
                <div className="team-name">Grace Mukisa</div>
                <div className="team-position">Head of Community</div>
                <div className="team-social">
                  <a href="#">f</a>
                  <a href="#">t</a>
                  <a href="#">in</a>
                  <a href="#">ig</a>
                </div>
              </div>
            </div>
            
            <div className="team-card">
              <div className="team-image">
                <img 
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
                  alt="Esther Nalubega - Platform Director"
                />
              </div>
              <div className="team-info">
                <div className="team-name">Esther Nalubega</div>
                <div className="team-position">Platform Director</div>
                <div className="team-social">
                  <a href="#">f</a>
                  <a href="#">t</a>
                  <a href="#">in</a>
                  <a href="#">ig</a>
                </div>
              </div>
            </div>
            
            <div className="team-card">
              <div className="team-image">
                <img 
                  src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
                  alt="Patricia Nankya - Business Development"
                />
              </div>
              <div className="team-info">
                <div className="team-name">Patricia Nankya</div>
                <div className="team-position">Business Development</div>
                <div className="team-social">
                  <a href="#">f</a>
                  <a href="#">t</a>
                  <a href="#">in</a>
                  <a href="#">ig</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Impact Section */}
        <section className="intro-section">
          <div className="section-label">Our Impact</div>
          
          <div className="intro-content">
            <div>
              <h2 className="intro-title">
                Building <span className="highlight">Sustainable Futures<br/>for Women Designers</span>
              </h2>
            </div>
            <div className="intro-text">
              <p>Since 2021, we've supported over 500 women designers across 15+ cities in Uganda, helping them build successful businesses and connect with quality clients. Our verified supplier network ensures access to materials at competitive prices.</p>
              <p>Every project on our platform represents economic empowerment, gender equality, and the transformation of Uganda's creative industries. We're not just a marketplace—we're a movement creating lasting change.</p>
            </div>
          </div>

          {/* Achievement Stats */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '40px', 
            marginBottom: '80px',
            textAlign: 'center' 
          }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #f5f5dc 0%, #e8e8e8 100%)', 
              padding: '40px 30px', 
              borderRadius: '20px',
              boxShadow: '0 10px 30px rgba(144, 238, 144, 0.1)'
            }}>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#90ee90', marginBottom: '10px' }}>500+</div>
              <div style={{ color: '#666', fontSize: '16px', fontWeight: '600' }}>Women Designers Supported</div>
            </div>
            <div style={{ 
              background: 'linear-gradient(135deg, #f5f5dc 0%, #e8e8e8 100%)', 
              padding: '40px 30px', 
              borderRadius: '20px',
              boxShadow: '0 10px 30px rgba(144, 238, 144, 0.1)'
            }}>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#556b2f', marginBottom: '10px' }}>1,200+</div>
              <div style={{ color: '#666', fontSize: '16px', fontWeight: '600' }}>Successful Projects</div>
            </div>
            <div style={{ 
              background: 'linear-gradient(135deg, #f5f5dc 0%, #e8e8e8 100%)', 
              padding: '40px 30px', 
              borderRadius: '20px',
              boxShadow: '0 10px 30px rgba(144, 238, 144, 0.1)'
            }}>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#2d4016', marginBottom: '10px' }}>15+</div>
              <div style={{ color: '#666', fontSize: '16px', fontWeight: '600' }}>Cities Covered</div>
            </div>
          </div>

          {/* Call to Action */}
          <div style={{ 
            background: 'linear-gradient(135deg, #2d4016 0%, #556b2f 100%)', 
            padding: '60px 40px', 
            borderRadius: '25px', 
            textAlign: 'center',
            color: 'white'
          }}>
            <h3 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '20px' }}>Join Our Community</h3>
            <p style={{ fontSize: '16px', marginBottom: '30px', opacity: 0.9 }}>
              Whether you're a designer looking to grow your business or a client seeking exceptional design services, 
              we invite you to be part of our transformative journey.
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/auth/register" style={{ textDecoration: 'none' }}>
                <button style={{
                  background: 'linear-gradient(135deg, #90ee90 0%, #7bcf7b 100%)',
                  color: 'white',
                  padding: '15px 35px',
                  border: 'none',
                  borderRadius: '30px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: '0 5px 20px rgba(144, 238, 144, 0.3)'
                }}>
                  Join Our Platform
                </button>
              </Link>
              <Link href="/landing" style={{ textDecoration: 'none' }}>
                <button style={{
                  background: 'transparent',
                  color: 'white',
                  padding: '15px 35px',
                  border: '2px solid white',
                  borderRadius: '30px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}>
                  Explore Platform
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Scroll to Top Button */}
        <div className="scroll-top" id="scrollTop" onClick={scrollToTop}>↑</div>
      </div>
    </>
  );
}