// Static data for Firebase hosting demo
// This will be replaced with Firebase Firestore data later

export const staticDesigners = [
  {
    id: '1',
    name: 'Sarah Nakamya',
    specialty: ['Interior Design', 'Space Planning'],
    location: 'Kampala, Uganda',
    rating: 4.9,
    completedProjects: 127,
    yearsOfExperience: 8,
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    isVerified: true,
    sampleWorkTitle: 'Modern Living Space',
    sampleWorkDescription: 'Contemporary design with African touches'
  },
  {
    id: '2',
    name: 'Grace Mbabazi',
    specialty: ['Architecture', 'Sustainable Design'],
    location: 'Entebbe, Uganda',
    rating: 4.7,
    completedProjects: 89,
    yearsOfExperience: 6,
    profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    isVerified: true,
    sampleWorkTitle: 'Eco-Friendly Office',
    sampleWorkDescription: 'Green building design with local materials'
  },
  {
    id: '3',
    name: 'Patricia Kiconco',
    specialty: ['Graphic Design', 'UX/UI Design'],
    location: 'Jinja, Uganda',
    rating: 4.8,
    completedProjects: 156,
    yearsOfExperience: 5,
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    isVerified: true,
    sampleWorkTitle: 'Brand Identity Design',
    sampleWorkDescription: 'Modern branding for local businesses'
  },
  {
    id: '4',
    name: 'Rebecca Namuli',
    specialty: ['Fashion Design', 'Product Design'],
    location: 'Mbarara, Uganda',
    rating: 4.6,
    completedProjects: 73,
    yearsOfExperience: 4,
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    isVerified: false,
    sampleWorkTitle: 'Sustainable Fashion Line',
    sampleWorkDescription: 'Eco-friendly clothing with traditional patterns'
  },
  {
    id: '5',
    name: 'Dorothy Aceng',
    specialty: ['Landscape Design', 'Interior Design'],
    location: 'Gulu, Uganda',
    rating: 4.9,
    completedProjects: 92,
    yearsOfExperience: 7,
    profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    isVerified: true,
    sampleWorkTitle: 'Garden Paradise',
    sampleWorkDescription: 'Tropical landscape design for hotels'
  },
  {
    id: '6',
    name: 'Esther Nalwoga',
    specialty: ['Industrial Design', 'Product Design'],
    location: 'Mukono, Uganda',
    rating: 4.5,
    completedProjects: 64,
    yearsOfExperience: 3,
    profileImage: null, // Test fallback
    isVerified: true,
    sampleWorkTitle: 'Smart Furniture Design',
    sampleWorkDescription: 'Innovative furniture for small spaces'
  }
];

export const staticSuppliers = [
  {
    id: '1',
    businessName: 'Kampala Design Materials',
    category: ['Furniture', 'Lighting', 'Textiles'],
    location: 'Industrial Area, Kampala',
    rating: 4.8,
    businessDescription: 'Leading supplier of high-quality design materials and furniture in Uganda.',
    deliveryAreas: ['Kampala', 'Entebbe', 'Wakiso', 'Mukono'],
    minimumOrder: 500000,
    paymentMethods: ['Cash', 'Mobile Money', 'Bank Transfer'],
    businessHours: 'Mon-Fri 8AM-6PM, Sat 9AM-4PM',
    isVerified: true,
    productCount: 156,
    sampleProducts: ['Modern Sofas', 'Designer Lighting', 'Premium Textiles']
  },
  {
    id: '2',
    businessName: 'Uganda Craft Collective',
    category: ['Decor & Accessories', 'Textiles & Fabrics'],
    location: 'Ntinda, Kampala',
    rating: 4.7,
    businessDescription: 'Authentic Ugandan crafts and textiles for modern interiors.',
    deliveryAreas: ['Kampala', 'Entebbe'],
    minimumOrder: 200000,
    paymentMethods: ['Cash', 'Mobile Money'],
    businessHours: 'Mon-Sat 9AM-7PM',
    isVerified: true,
    productCount: 89,
    sampleProducts: ['Handwoven Baskets', 'Traditional Fabrics', 'Wooden Sculptures']
  },
  {
    id: '3',
    businessName: 'Elite Construction Supplies',
    category: ['Construction Materials', 'Hardware'],
    location: 'Namanve Industrial Park',
    rating: 4.6,
    businessDescription: 'Premium construction materials for residential and commercial projects.',
    deliveryAreas: ['Kampala', 'Entebbe', 'Jinja', 'Mukono'],
    minimumOrder: 1000000,
    paymentMethods: ['Cash', 'Bank Transfer', 'Credit Card'],
    businessHours: 'Mon-Fri 7AM-6PM, Sat 8AM-2PM',
    isVerified: true,
    productCount: 234,
    sampleProducts: ['Steel', 'Cement', 'Tiles']
  },
  {
    id: '4',
    businessName: 'Green Gardens Uganda',
    category: ['Outdoor & Garden', 'Plants'],
    location: 'Kira, Wakiso',
    rating: 4.9,
    businessDescription: 'Landscape supplies and plants for beautiful outdoor spaces.',
    deliveryAreas: ['Kampala', 'Wakiso', 'Mukono'],
    minimumOrder: 150000,
    paymentMethods: ['Cash', 'Mobile Money'],
    businessHours: 'Daily 7AM-6PM',
    isVerified: false,
    productCount: 67,
    sampleProducts: ['Palm Trees', 'Garden Tools', 'Irrigation Systems']
  },
  {
    id: '5',
    businessName: 'Modern Kitchen Solutions',
    category: ['Kitchen & Bath Fixtures', 'Appliances'],
    location: 'Bugolobi, Kampala',
    rating: 4.8,
    businessDescription: 'Complete kitchen and bathroom fixtures for modern homes.',
    deliveryAreas: ['Kampala', 'Entebbe', 'Mukono'],
    minimumOrder: 800000,
    paymentMethods: ['Cash', 'Mobile Money', 'Bank Transfer'],
    businessHours: 'Mon-Fri 8AM-6PM, Sat 9AM-5PM',
    isVerified: true,
    productCount: 123,
    sampleProducts: ['Kitchen Cabinets', 'Bathroom Fixtures', 'Appliances']
  },
  {
    id: '6',
    businessName: 'Paint & Finishes Pro',
    category: ['Paint & Finishes', 'Tools'],
    location: 'Ntinda, Kampala',
    rating: 4.4,
    businessDescription: 'Professional paint and finishing materials for all projects.',
    deliveryAreas: ['Kampala'],
    minimumOrder: 100000,
    paymentMethods: ['Cash', 'Mobile Money'],
    businessHours: 'Mon-Sat 8AM-7PM',
    isVerified: true,
    productCount: 78,
    sampleProducts: ['Premium Paints', 'Brushes', 'Wallpapers']
  }
];

export const specialties = [
  'Interior Design',
  'Architecture', 
  'Landscape Design',
  'Graphic Design',
  'Fashion Design',
  'Product Design',
  'Industrial Design',
  'UX/UI Design'
];

export const supplierCategories = [
  'Furniture',
  'Lighting',
  'Textiles & Fabrics',
  'Construction Materials',
  'Decor & Accessories',
  'Kitchen & Bath Fixtures',
  'Flooring',
  'Paint & Finishes',
  'Hardware',
  'Outdoor & Garden'
];

export const locations = [
  'Kampala',
  'Entebbe', 
  'Mukono',
  'Jinja',
  'Mbale',
  'Mbarara',
  'Gulu',
  'Fort Portal'
];