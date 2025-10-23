import { NextRequest } from 'next/server';
import { 
  User, 
  DesignerProfile, 
  SupplierProfile, 
  ClientProfile,
  LoginCredentials,
  RegisterData,
  SearchFilters,
  SupplierSearchFilters,
  SearchResults,
  HiringRequest,
  Payment,
  PlatformStats,
  APIResponse,
  PaginationParams,
  Portfolio,
  Review
} from './index';

export interface AuthenticatedRequest extends NextRequest {
  user?: User;
}

export interface AuthAPI {
  login: {
    body: LoginCredentials;
    response: APIResponse<{ user: User; token: string }>;
  };
  register: {
    body: RegisterData;
    response: APIResponse<{ user: User; token: string }>;
  };
  logout: {
    response: APIResponse<{ message: string }>;
  };
  resetPassword: {
    body: { email: string };
    response: APIResponse<{ message: string }>;
  };
  confirmPasswordReset: {
    body: { token: string; newPassword: string };
    response: APIResponse<{ message: string }>;
  };
  refreshToken: {
    response: APIResponse<{ token: string }>;
  };
  verifyToken: {
    body: { token: string };
    response: APIResponse<{ user: User }>;
  };
}

export interface DesignersAPI {
  getDesigners: {
    query: SearchFilters & PaginationParams;
    response: APIResponse<SearchResults<DesignerProfile>>;
  };
  getDesigner: {
    params: { id: string };
    response: APIResponse<DesignerProfile>;
  };
  createDesigner: {
    body: Partial<DesignerProfile>;
    response: APIResponse<DesignerProfile>;
  };
  updateDesigner: {
    params: { id: string };
    body: Partial<DesignerProfile>;
    response: APIResponse<DesignerProfile>;
  };
  deleteDesigner: {
    params: { id: string };
    response: APIResponse<{ message: string }>;
  };
  addPortfolioItem: {
    params: { id: string };
    body: Omit<Portfolio, 'id'>;
    response: APIResponse<Portfolio>;
  };
  updatePortfolioItem: {
    params: { designerId: string; portfolioId: string };
    body: Partial<Portfolio>;
    response: APIResponse<Portfolio>;
  };
  deletePortfolioItem: {
    params: { designerId: string; portfolioId: string };
    response: APIResponse<{ message: string }>;
  };
  addReview: {
    params: { id: string };
    body: Omit<Review, 'id' | 'createdAt'>;
    response: APIResponse<Review>;
  };
}

export interface SuppliersAPI {
  getSuppliers: {
    query: SupplierSearchFilters & PaginationParams;
    response: APIResponse<SearchResults<SupplierProfile>>;
  };
  getSupplier: {
    params: { id: string };
    response: APIResponse<SupplierProfile>;
  };
  createSupplier: {
    body: Partial<SupplierProfile>;
    response: APIResponse<SupplierProfile>;
  };
  updateSupplier: {
    params: { id: string };
    body: Partial<SupplierProfile>;
    response: APIResponse<SupplierProfile>;
  };
  deleteSupplier: {
    params: { id: string };
    response: APIResponse<{ message: string }>;
  };
}

export interface UsersAPI {
  getProfile: {
    response: APIResponse<User | DesignerProfile | SupplierProfile | ClientProfile>;
  };
  updateProfile: {
    body: Partial<User>;
    response: APIResponse<User>;
  };
  uploadProfilePicture: {
    body: FormData;
    response: APIResponse<{ url: string }>;
  };
  deleteAccount: {
    response: APIResponse<{ message: string }>;
  };
}

export interface HiringAPI {
  createHiringRequest: {
    body: Omit<HiringRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>;
    response: APIResponse<HiringRequest>;
  };
  getHiringRequests: {
    query: PaginationParams & { status?: HiringRequest['status'] };
    response: APIResponse<SearchResults<HiringRequest>>;
  };
  getHiringRequest: {
    params: { id: string };
    response: APIResponse<HiringRequest>;
  };
  updateHiringRequest: {
    params: { id: string };
    body: Partial<Pick<HiringRequest, 'status' | 'projectDescription' | 'budget' | 'timeline'>>;
    response: APIResponse<HiringRequest>;
  };
  cancelHiringRequest: {
    params: { id: string };
    response: APIResponse<{ message: string }>;
  };
}

export interface PaymentsAPI {
  createPayment: {
    body: {
      hiringRequestId: string;
      amount: number;
      paymentMethod: string;
    };
    response: APIResponse<Payment>;
  };
  getPayments: {
    query: PaginationParams;
    response: APIResponse<SearchResults<Payment>>;
  };
  getPayment: {
    params: { id: string };
    response: APIResponse<Payment>;
  };
  processPayment: {
    params: { id: string };
    body: { transactionId: string };
    response: APIResponse<Payment>;
  };
  refundPayment: {
    params: { id: string };
    body: { reason: string };
    response: APIResponse<Payment>;
  };
}

export interface SearchAPI {
  searchDesigners: {
    query: { q: string } & SearchFilters & PaginationParams;
    response: APIResponse<SearchResults<DesignerProfile>>;
  };
  searchSuppliers: {
    query: { q: string } & SupplierSearchFilters & PaginationParams;
    response: APIResponse<SearchResults<SupplierProfile>>;
  };
  searchAll: {
    query: { q: string } & PaginationParams;
    response: APIResponse<{
      designers: DesignerProfile[];
      suppliers: SupplierProfile[];
      total: number;
    }>;
  };
}

export interface AdminAPI {
  getStats: {
    response: APIResponse<PlatformStats>;
  };
  verifyUser: {
    params: { id: string };
    response: APIResponse<{ message: string }>;
  };
  suspendUser: {
    params: { id: string };
    body: { reason: string };
    response: APIResponse<{ message: string }>;
  };
  getAllUsers: {
    query: PaginationParams & { role?: User['role'] };
    response: APIResponse<SearchResults<User>>;
  };
}

export interface UploadAPI {
  uploadImage: {
    body: FormData;
    response: APIResponse<{ url: string; publicId: string }>;
  };
  uploadMultipleImages: {
    body: FormData;
    response: APIResponse<{ urls: string[]; publicIds: string[] }>;
  };
  deleteImage: {
    body: { publicId: string };
    response: APIResponse<{ message: string }>;
  };
}

export type APIEndpoints = {
  '/api/auth/login': AuthAPI['login'];
  '/api/auth/register': AuthAPI['register'];
  '/api/auth/logout': AuthAPI['logout'];
  '/api/auth/reset-password': AuthAPI['resetPassword'];
  '/api/auth/confirm-reset': AuthAPI['confirmPasswordReset'];
  '/api/auth/refresh': AuthAPI['refreshToken'];
  '/api/auth/verify': AuthAPI['verifyToken'];
  
  '/api/designers': DesignersAPI['getDesigners'] | DesignersAPI['createDesigner'];
  '/api/designers/[id]': DesignersAPI['getDesigner'] | DesignersAPI['updateDesigner'] | DesignersAPI['deleteDesigner'];
  '/api/designers/[id]/portfolio': DesignersAPI['addPortfolioItem'];
  '/api/designers/[designerId]/portfolio/[portfolioId]': DesignersAPI['updatePortfolioItem'] | DesignersAPI['deletePortfolioItem'];
  '/api/designers/[id]/reviews': DesignersAPI['addReview'];
  
  '/api/suppliers': SuppliersAPI['getSuppliers'] | SuppliersAPI['createSupplier'];
  '/api/suppliers/[id]': SuppliersAPI['getSupplier'] | SuppliersAPI['updateSupplier'] | SuppliersAPI['deleteSupplier'];
  
  '/api/users/profile': UsersAPI['getProfile'] | UsersAPI['updateProfile'];
  '/api/users/upload-avatar': UsersAPI['uploadProfilePicture'];
  '/api/users/delete': UsersAPI['deleteAccount'];
  
  '/api/hiring': HiringAPI['getHiringRequests'] | HiringAPI['createHiringRequest'];
  '/api/hiring/[id]': HiringAPI['getHiringRequest'] | HiringAPI['updateHiringRequest'] | HiringAPI['cancelHiringRequest'];
  
  '/api/payments': PaymentsAPI['getPayments'] | PaymentsAPI['createPayment'];
  '/api/payments/[id]': PaymentsAPI['getPayment'] | PaymentsAPI['processPayment'] | PaymentsAPI['refundPayment'];
  
  '/api/search/designers': SearchAPI['searchDesigners'];
  '/api/search/suppliers': SearchAPI['searchSuppliers'];
  '/api/search/all': SearchAPI['searchAll'];
  
  '/api/admin/stats': AdminAPI['getStats'];
  '/api/admin/users/[id]/verify': AdminAPI['verifyUser'];
  '/api/admin/users/[id]/suspend': AdminAPI['suspendUser'];
  '/api/admin/users': AdminAPI['getAllUsers'];
  
  '/api/upload/image': UploadAPI['uploadImage'];
  '/api/upload/images': UploadAPI['uploadMultipleImages'];
  '/api/upload/delete': UploadAPI['deleteImage'];
};

export interface RouteHandler<T extends keyof APIEndpoints> {
  endpoint: T;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  handler: (request: AuthenticatedRequest) => Promise<Response>;
}