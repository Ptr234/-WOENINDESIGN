'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Star, MapPin, Clock, Award, Users, Heart, Shield, Package, Truck } from 'lucide-react';
import ContactButton from '@/components/messaging/ContactButton';

interface SupplierProfile {
  id: string;
  businessName: string;
  category: string[];
  location: string;
  rating: number;
  totalOrders: number;
  yearsInBusiness: number;
  description: string;
  services: string[];
  products: Array<{
    id: string;
    name: string;
    category: string;
    image: string;
    price: string;
  }>;
  businessImage: string;
  isVerified: boolean;
  deliveryAreas: string[];
  businessHours: string;
  minimumOrder: number;
  paymentMethods: string[];
}

export default function SupplierProfilePage() {
  const params = useParams();
  const [supplier, setSupplier] = useState<SupplierProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await fetch('/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          if (data.success) {
            setCurrentUser(data.data.user);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };

    const fetchSupplierProfile = async () => {
      try {
        const response = await fetch(`/api/public/suppliers/${params.id}`);
        const data = await response.json();
        
        if (data.success) {
          setSupplier(data.data);
        } else {
          // Fallback to mock data if API fails
          const mockSupplier: SupplierProfile = {
            id: params.id as string,
            businessName: 'Kampala Design Materials',
            category: ['Furniture', 'Lighting', 'Textiles', 'Decor'],
            location: 'Industrial Area, Kampala',
            rating: 4.8,
            totalOrders: 230,
            yearsInBusiness: 12,
            description: 'Leading supplier of high-quality design materials and furniture in Uganda. We specialize in modern and contemporary pieces that blend international standards with local craftsmanship.',
            services: [
              'Custom Furniture',
              'Bulk Supply',
              'Installation Service',
              'Design Consultation',
              'Delivery Service',
              'After-sales Support'
            ],
            products: [
              {
                id: '1',
                name: 'Modern Sofa Set',
                category: 'Furniture',
                image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
                price: 'UGX 2,500,000'
              },
              {
                id: '2',
                name: 'Designer Lighting',
                category: 'Lighting',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
                price: 'UGX 450,000'
              },
              {
                id: '3',
                name: 'Premium Textiles',
                category: 'Textiles',
                image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
                price: 'UGX 180,000'
              },
              {
                id: '4',
                name: 'Office Furniture',
                category: 'Furniture',
                image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
                price: 'UGX 1,800,000'
              },
              {
                id: '5',
                name: 'Decorative Items',
                category: 'Decor',
                image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
                price: 'UGX 320,000'
              },
              {
                id: '6',
                name: 'Kitchen Cabinets',
                category: 'Furniture',
                image: 'https://images.unsplash.com/photo-1556912173-46c336c7fd55?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
                price: 'UGX 3,200,000'
              }
            ],
            businessImage: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            isVerified: true,
            deliveryAreas: ['Kampala', 'Entebbe', 'Wakiso', 'Mukono'],
            businessHours: 'Mon-Fri 8AM-6PM, Sat 9AM-4PM',
            minimumOrder: 500000,
            paymentMethods: ['Cash', 'Mobile Money', 'Bank Transfer', 'Credit Card']
          };
          setSupplier(mockSupplier);
        }
      } catch (error) {
        console.error('Error fetching supplier profile:', error);
        // Fallback to mock data on error
        const mockSupplier: SupplierProfile = {
          id: params.id as string,
          businessName: 'Kampala Design Materials',
          category: ['Furniture', 'Lighting', 'Textiles', 'Decor'],
          location: 'Industrial Area, Kampala',
          rating: 4.8,
          totalOrders: 230,
          yearsInBusiness: 12,
          description: 'Leading supplier of high-quality design materials and furniture in Uganda. We specialize in modern and contemporary pieces that blend international standards with local craftsmanship.',
          services: [
            'Custom Furniture',
            'Bulk Supply',
            'Installation Service',
            'Design Consultation',
            'Delivery Service',
            'After-sales Support'
          ],
          products: [
            {
              id: '1',
              name: 'Modern Sofa Set',
              category: 'Furniture',
              image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
              price: 'UGX 2,500,000'
            },
            {
              id: '2',
              name: 'Designer Lighting',
              category: 'Lighting',
              image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
              price: 'UGX 450,000'
            },
            {
              id: '3',
              name: 'Premium Textiles',
              category: 'Textiles',
              image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
              price: 'UGX 180,000'
            },
            {
              id: '4',
              name: 'Office Furniture',
              category: 'Furniture',
              image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
              price: 'UGX 1,800,000'
            },
            {
              id: '5',
              name: 'Decorative Items',
              category: 'Decor',
              image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
              price: 'UGX 320,000'
            },
            {
              id: '6',
              name: 'Kitchen Cabinets',
              category: 'Furniture',
              image: 'https://images.unsplash.com/photo-1556912173-46c336c7fd55?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
              price: 'UGX 3,200,000'
            }
          ],
          businessImage: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          isVerified: true,
          deliveryAreas: ['Kampala', 'Entebbe', 'Wakiso', 'Mukono'],
          businessHours: 'Mon-Fri 8AM-6PM, Sat 9AM-4PM',
          minimumOrder: 500000,
          paymentMethods: ['Cash', 'Mobile Money', 'Bank Transfer', 'Credit Card']
        };
        setSupplier(mockSupplier);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    fetchSupplierProfile();
  }, [params.id]);

  const handleContactClick = () => {
    setShowLoginPrompt(true);
  };

  const handleLoginRedirect = () => {
    window.location.href = '/auth/login?redirect=/suppliers';
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f5f5dc'
      }}>
        <div style={{ fontSize: '18px', color: '#556b2f' }}>Loading supplier profile...</div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f5f5dc'
      }}>
        <div style={{ fontSize: '18px', color: '#556b2f' }}>Supplier not found</div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html, body {
            width: 100%;
            height: 100%;
            overflow-x: hidden;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: white;
            color: #2d2d2d;
            margin: 0;
            padding: 0;
        }

        .container {
            display: grid;
            grid-template-columns: 40% 1fr;
            min-height: 100vh;
            background: white;
            width: 100vw;
            overflow-x: hidden;
        }

        .left-panel {
            background: linear-gradient(135deg, #2d4016 0%, #556b2f 100%);
            color: white;
            padding: 8rem 6rem;
            position: sticky;
            top: 0;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        .hero-text h1 {
            font-size: 4rem;
            font-weight: 300;
            line-height: 1.1;
            margin-bottom: 2rem;
            text-transform: lowercase;
        }

        .divider {
            width: 100%;
            height: 1px;
            background: rgba(255, 255, 255, 0.3);
            margin: 2rem 0;
        }

        .tagline {
            font-size: 1.8rem;
            font-weight: 300;
            line-height: 1.3;
            opacity: 0.9;
        }

        .back-button {
            position: absolute;
            top: 2rem;
            left: 2rem;
            color: white;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.9rem;
            opacity: 0.8;
            transition: opacity 0.3s;
        }

        .back-button:hover {
            opacity: 1;
        }

        .right-panel {
            background: white;
            padding: 4rem;
            min-height: 100vh;
            width: 100%;
        }

        .hero-card {
            background: white;
            padding: 3rem;
            margin-bottom: 3rem;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
            align-items: center;
            box-shadow: 0 2px 20px rgba(144, 238, 144, 0.15);
            border-radius: 15px;
            border: 1px solid rgba(144, 238, 144, 0.2);
        }

        .hero-content h2 {
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #90ee90;
            margin-bottom: 1.5rem;
            font-weight: 600;
        }

        .hero-content h3 {
            font-size: 2.5rem;
            font-weight: 400;
            margin-bottom: 1rem;
            line-height: 1.2;
            color: #2d4016;
        }

        .supplier-meta {
            display: flex;
            gap: 2rem;
            margin-bottom: 1.5rem;
            flex-wrap: wrap;
        }

        .meta-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.9rem;
            color: #666;
        }

        .hero-content p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 2rem;
        }

        .contact-btn {
            display: inline-block;
            background: linear-gradient(135deg, #90ee90 0%, #7bcf7b 100%);
            color: white;
            padding: 1rem 2.5rem;
            text-decoration: none;
            font-weight: 600;
            border-radius: 8px;
            transition: all 0.3s;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(144, 238, 144, 0.3);
        }

        .contact-btn:hover {
            background: linear-gradient(135deg, #2d4016 0%, #556b2f 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(144, 238, 144, 0.4);
        }

        .hero-image {
            position: relative;
            height: 400px;
        }

        .shape {
            position: absolute;
            border-radius: 50%;
        }

        .shape.coral {
            width: 120px;
            height: 120px;
            background: #90ee90;
            top: 0;
            right: 0;
            clip-path: polygon(50% 0, 100% 0, 100% 50%);
            border-radius: 0;
        }


        .image-placeholder {
            width: 280px;
            height: 350px;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }

        .image-placeholder img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .services-row {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 2rem;
            margin-bottom: 4rem;
        }

        .service-card {
            padding: 2rem;
            border: 1px solid rgba(144, 238, 144, 0.2);
            transition: all 0.3s;
            border-radius: 12px;
            background: white;
        }

        .service-card:hover {
            border-color: #90ee90;
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(144, 238, 144, 0.15);
        }

        .service-icon {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #f5f5dc 0%, #e8e8e8 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            margin-bottom: 1.5rem;
            border-radius: 12px;
            border: 2px solid rgba(144, 238, 144, 0.3);
        }

        .service-card h4 {
            font-size: 1.3rem;
            margin-bottom: 1rem;
            font-weight: 500;
            color: #2d4016;
        }

        .service-card p {
            color: #666;
            font-size: 0.9rem;
            line-height: 1.6;
        }

        .section-title {
            font-size: 2rem;
            margin-bottom: 3rem;
            font-weight: 400;
            color: #2d4016;
        }

        .products-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 2rem;
        }

        .product-card {
            background: white;
            overflow: hidden;
            transition: transform 0.3s;
            cursor: pointer;
            border-radius: 12px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        }

        .product-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 15px 35px rgba(144, 238, 144, 0.2);
        }

        .product-image {
            width: 100%;
            height: 280px;
            position: relative;
            overflow: hidden;
        }

        .product-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s;
        }

        .product-card:hover .product-image img {
            transform: scale(1.05);
        }

        .price-tag {
            position: absolute;
            top: 15px;
            right: 15px;
            background: rgba(144, 238, 144, 0.9);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
        }

        .product-info {
            padding: 1.5rem;
            border-top: 3px solid #90ee90;
        }

        .product-info h4 {
            font-size: 1.1rem;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: #2d4016;
        }

        .product-info p {
            color: #666;
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .business-info {
            background: linear-gradient(135deg, #f5f5dc 0%, #e8e8e8 100%);
            padding: 2rem;
            border-radius: 15px;
            margin-bottom: 3rem;
            border: 1px solid rgba(144, 238, 144, 0.2);
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
        }

        .info-item {
            display: flex;
            align-items: center;
            gap: 0.8rem;
            color: #666;
            font-size: 0.9rem;
        }

        .info-item strong {
            color: #2d4016;
        }

        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }

        .modal-content {
            background: white;
            padding: 3rem;
            border-radius: 15px;
            max-width: 500px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }

        .modal-content h3 {
            color: #2d4016;
            margin-bottom: 1rem;
            font-size: 1.5rem;
        }

        .modal-content p {
            color: #666;
            margin-bottom: 2rem;
            line-height: 1.6;
        }

        .modal-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
        }

        .modal-btn {
            padding: 0.8rem 2rem;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s;
        }

        .modal-btn.primary {
            background: linear-gradient(135deg, #90ee90 0%, #7bcf7b 100%);
            color: white;
        }

        .modal-btn.secondary {
            background: transparent;
            color: #666;
            border: 2px solid #e0e0e0;
        }

        @media (max-width: 1200px) {
            .container {
                grid-template-columns: 1fr;
            }

            .left-panel {
                position: relative;
                height: auto;
                padding: 4rem 3rem;
            }

            .hero-text h1 {
                font-size: 3rem;
            }

            .hero-card {
                grid-template-columns: 1fr;
            }

            .products-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        @media (max-width: 768px) {
            .left-panel {
                padding: 3rem 2rem;
            }

            .hero-text h1 {
                font-size: 2.5rem;
            }

            .tagline {
                font-size: 1.3rem;
            }

            .right-panel {
                padding: 2rem;
            }

            .services-row {
                grid-template-columns: 1fr;
            }

            .products-grid {
                grid-template-columns: 1fr;
            }

            .hero-content h3 {
                font-size: 1.8rem;
            }

            .supplier-meta {
                flex-direction: column;
                gap: 1rem;
            }

            .info-grid {
                grid-template-columns: 1fr;
            }
        }
      `}</style>
      
      <div className="container">
        <div className="left-panel">
          <Link href="/landing/suppliers" className="back-button">
            <ArrowLeft size={16} />
            Back to Suppliers
          </Link>
          
          <div className="hero-text">
            <h1>quality<br/>supply</h1>
            <div className="divider"></div>
            <p className="tagline">Premium materials for every design</p>
          </div>
        </div>

        <div className="right-panel">
          <div className="hero-card">
            <div className="hero-content">
              <h2>{supplier.category.join(' | ')}</h2>
              <h3>{supplier.businessName}</h3>
              
              <div className="supplier-meta">
                <div className="meta-item">
                  <MapPin size={16} />
                  {supplier.location}
                </div>
                <div className="meta-item">
                  <Star size={16} />
                  {supplier.rating} ({supplier.totalOrders} orders)
                </div>
                <div className="meta-item">
                  <Clock size={16} />
                  {supplier.yearsInBusiness} years in business
                </div>
                {supplier.isVerified && (
                  <div className="meta-item">
                    <Shield size={16} />
                    Verified Supplier
                  </div>
                )}
              </div>
              
              <p>{supplier.description}</p>
              <ContactButton
                targetUserId={supplier.id}
                targetUserName={supplier.businessName}
                targetUserRole="supplier"
                currentUser={currentUser}
              />
            </div>
            <div className="hero-image">
              <div className="shape coral"></div>
              <div className="image-placeholder">
                <img 
                  src={supplier.businessImage || 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'} 
                  alt={supplier.businessName}
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
                  }}
                />
              </div>
            </div>
          </div>

          <div className="business-info">
            <h3 style={{ color: '#2d4016', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Business Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <Clock size={16} />
                <span><strong>Hours:</strong> {supplier.businessHours}</span>
              </div>
              <div className="info-item">
                <Package size={16} />
                <span><strong>Min Order:</strong> UGX {supplier.minimumOrder.toLocaleString()}</span>
              </div>
              <div className="info-item">
                <Truck size={16} />
                <span><strong>Delivery:</strong> {supplier.deliveryAreas.join(', ')}</span>
              </div>
              <div className="info-item">
                <Award size={16} />
                <span><strong>Payment:</strong> {supplier.paymentMethods.join(', ')}</span>
              </div>
            </div>
          </div>

          <div className="services-row">
            {supplier.services.slice(0, 4).map((service, index) => (
              <div key={index} className="service-card">
                <div className="service-icon">
                  {index === 0 && '🛠️'}
                  {index === 1 && '📦'}
                  {index === 2 && '🚚'}
                  {index === 3 && '💬'}
                </div>
                <h4>{service}</h4>
                <p>Professional {service.toLowerCase()} with quality assurance and customer satisfaction guarantee.</p>
              </div>
            ))}
          </div>

          <h2 className="section-title">Featured Products</h2>
          <div className="products-grid">
            {supplier.products.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  <img src={product.image} alt={product.name} />
                  <div className="price-tag">{product.price}</div>
                </div>
                <div className="product-info">
                  <h4>{product.name}</h4>
                  <p>{product.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showLoginPrompt && (
        <div className="modal-overlay" onClick={() => setShowLoginPrompt(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Sign In Required</h3>
            <p>To contact {supplier.businessName} and access full supplier details including pricing and contact information, please sign in or create an account.</p>
            <div className="modal-buttons">
              <button onClick={handleLoginRedirect} className="modal-btn primary">
                Sign In / Register
              </button>
              <button onClick={() => setShowLoginPrompt(false)} className="modal-btn secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}