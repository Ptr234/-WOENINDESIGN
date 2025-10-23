export type UserRole = 'designer' | 'client' | 'supplier';

export interface User {
  id: string;
  email: string;
  password?: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUser extends Omit<User, 'password'> {
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
}

export interface PasswordReset {
  email: string;
  token?: string;
  newPassword?: string;
}

export type DesignSpecialty = 
  | 'Interior Design'
  | 'Architecture'
  | 'Landscape Design'
  | 'Graphic Design'
  | 'Industrial Design'
  | 'Fashion Design'
  | 'Product Design'
  | 'UX/UI Design';

export interface Portfolio {
  id: string;
  title: string;
  description: string;
  images: string[];
  projectType: DesignSpecialty;
  completedAt: Date;
  clientName?: string;
  featured: boolean;
}

export interface Review {
  id: string;
  clientId: string;
  clientName: string;
  rating: number;
  comment: string;
  projectId?: string;
  createdAt: Date;
}

export interface DesignerProfile extends User {
  role: 'designer';
  specialty: DesignSpecialty[];
  yearsOfExperience: number;
  biography: string;
  location: string;
  hourlyRate?: number;
  portfolio: Portfolio[];
  reviews: Review[];
  averageRating: number;
  totalProjects: number;
  isVerified: boolean;
  availability: 'available' | 'busy' | 'unavailable';
  skills: string[];
  education?: string[];
  certifications?: string[];
  website?: string;
  socialMedia?: {
    instagram?: string;
    linkedin?: string;
    behance?: string;
    dribbble?: string;
  };
}

export type SupplierCategory = 
  | 'Sanitaryware'
  | 'Paint'
  | 'Furniture'
  | 'Lighting'
  | 'Flooring'
  | 'Hardware'
  | 'Textiles'
  | 'Appliances'
  | 'Building Materials'
  | 'Decorative Items';

export interface Product {
  id: string;
  name: string;
  description: string;
  category: SupplierCategory;
  price?: number;
  images: string[];
  specifications?: Record<string, string>;
  inStock: boolean;
}

export interface SupplierProfile extends User {
  role: 'supplier';
  businessName: string;
  businessDescription: string;
  category: SupplierCategory[];
  location: string;
  products: Product[];
  contactInfo: {
    businessPhone: string;
    businessEmail: string;
    address: string;
    website?: string;
  };
  businessHours: string;
  deliveryAreas: string[];
  minimumOrder?: number;
  paymentMethods: string[];
  isVerified: boolean;
}

export interface ClientProfile extends User {
  role: 'client';
  projectHistory: string[];
  preferredDesignStyles: string[];
  budget?: {
    min: number;
    max: number;
  };
}

export interface SearchFilters {
  specialty?: DesignSpecialty[];
  location?: string;
  minRating?: number;
  availability?: DesignerProfile['availability'];
  priceRange?: {
    min: number;
    max: number;
  };
  experience?: {
    min: number;
    max: number;
  };
}

export interface SupplierSearchFilters {
  category?: SupplierCategory[];
  location?: string;
  deliveryArea?: string;
  hasProducts?: boolean;
}

export interface SearchResults<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface HiringRequest {
  id: string;
  clientId: string;
  designerId: string;
  projectTitle: string;
  projectDescription: string;
  budget: number;
  timeline: string;
  status: 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  messages?: Message[];
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  attachments?: string[];
}

export interface Payment {
  id: string;
  hiringRequestId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  transactionId?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface PlatformStats {
  totalDesigners: number;
  totalSuppliers: number;
  totalClients: number;
  totalProjects: number;
  activeUsers: number;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ImageUpload {
  file: File;
  preview?: string;
  progress?: number;
  uploaded?: boolean;
  url?: string;
}

// Messaging types
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  type: 'text' | 'image' | 'file';
  created_at: string;
  read_at?: string;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  message_id: string;
  filename: string;
  file_url: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

export interface Conversation {
  id: string;
  participants?: User[];
  subject?: string;
  last_message?: string;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
  unread_count?: number;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  joined_at: string;
  last_read_at?: string;
}