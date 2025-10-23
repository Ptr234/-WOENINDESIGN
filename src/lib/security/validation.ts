import { z } from 'zod';

// User validation schemas
export const userRegistrationSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters'),
  
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters'),
  
  email: z.string()
    .email('Invalid email address')
    .max(254, 'Email is too long'),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  
  role: z.enum(['designer', 'client', 'supplier'], {
    errorMap: () => ({ message: 'Invalid role selected' }),
  }),
});

export const userLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const userUpdateSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters')
    .optional(),
  
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters')
    .optional(),
  
  email: z.string()
    .email('Invalid email address')
    .max(254, 'Email is too long')
    .optional(),
  
  phone: z.string()
    .regex(/^\+?[\d\s-()]+$/, 'Invalid phone number format')
    .max(20, 'Phone number is too long')
    .optional(),
  
  profilePicture: z.string()
    .url('Invalid profile picture URL')
    .max(500, 'Profile picture URL is too long')
    .optional(),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
});

// Designer profile validation
export const designerProfileSchema = z.object({
  specialty: z.array(z.enum([
    'Interior Design',
    'Architecture',
    'Landscape Design',
    'Graphic Design',
    'Industrial Design',
    'Fashion Design',
    'Product Design',
    'UX/UI Design'
  ])).min(1, 'At least one specialty is required').max(5, 'Maximum 5 specialties allowed'),
  
  yearsOfExperience: z.number()
    .min(0, 'Years of experience cannot be negative')
    .max(50, 'Years of experience seems too high'),
  
  hourlyRate: z.number()
    .min(5, 'Hourly rate must be at least $5')
    .max(10000, 'Hourly rate seems too high')
    .optional(),
  
  biography: z.string()
    .max(1000, 'Biography must be less than 1000 characters')
    .optional(),
  
  location: z.string()
    .max(100, 'Location must be less than 100 characters')
    .optional(),
  
  availability: z.enum(['available', 'busy', 'unavailable']).optional(),
});

// Supplier profile validation
export const supplierProfileSchema = z.object({
  businessName: z.string()
    .min(1, 'Business name is required')
    .max(100, 'Business name must be less than 100 characters'),
  
  businessType: z.enum([
    'Sanitaryware',
    'Paint',
    'Furniture',
    'Lighting',
    'Flooring',
    'Hardware',
    'Textiles',
    'Appliances',
    'Building Materials',
    'Decorative Items'
  ]),
  
  businessDescription: z.string()
    .max(1000, 'Business description must be less than 1000 characters')
    .optional(),
  
  location: z.string()
    .max(100, 'Location must be less than 100 characters')
    .optional(),
  
  businessEmail: z.string()
    .email('Invalid business email address')
    .max(254, 'Business email is too long'),
  
  businessPhone: z.string()
    .regex(/^\+?[\d\s-()]+$/, 'Invalid business phone number format')
    .max(20, 'Business phone number is too long'),
  
  website: z.string()
    .url('Invalid website URL')
    .max(255, 'Website URL is too long')
    .optional(),
});

// Message validation
export const messageSchema = z.object({
  conversationId: z.string().uuid('Invalid conversation ID'),
  content: z.string()
    .min(1, 'Message content is required')
    .max(1000, 'Message is too long'),
  type: z.enum(['text', 'image', 'file']).default('text'),
});

export const conversationSchema = z.object({
  participants: z.array(z.string().uuid('Invalid participant ID'))
    .min(2, 'At least 2 participants required')
    .max(10, 'Maximum 10 participants allowed'),
  subject: z.string()
    .max(255, 'Subject is too long')
    .optional(),
});

// Search validation
export const searchSchema = z.object({
  q: z.string()
    .max(100, 'Search query is too long')
    .optional(),
  
  specialty: z.array(z.string()).optional(),
  location: z.string().max(100, 'Location is too long').optional(),
  minRating: z.number().min(0).max(5).optional(),
  maxRate: z.number().min(0).max(10000).optional(),
  minRate: z.number().min(0).max(10000).optional(),
  
  page: z.number().min(1).max(1000).default(1),
  limit: z.number().min(1).max(100).default(20),
  
  sortBy: z.enum(['created_at', 'average_rating', 'experience', 'first_name']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// File upload validation
export const fileUploadSchema = z.object({
  filename: z.string()
    .min(1, 'Filename is required')
    .max(255, 'Filename is too long')
    .regex(/^[a-zA-Z0-9._-]+\.[a-zA-Z0-9]+$/, 'Invalid filename format'),
  
  fileType: z.string()
    .regex(/^[a-zA-Z0-9]+\/[a-zA-Z0-9.-]+$/, 'Invalid file type'),
  
  fileSize: z.number()
    .min(1, 'File size must be greater than 0')
    .max(50 * 1024 * 1024, 'File size too large (max 50MB)'),
});

// Portfolio item validation
export const portfolioItemSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  
  category: z.string()
    .min(1, 'Category is required')
    .max(50, 'Category must be less than 50 characters'),
  
  tags: z.array(z.string().max(30, 'Tag is too long'))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
  
  projectDate: z.string().datetime('Invalid project date').optional(),
  
  clientName: z.string()
    .max(100, 'Client name must be less than 100 characters')
    .optional(),
  
  isPublic: z.boolean().default(true),
});

// Hiring request validation
export const hiringRequestSchema = z.object({
  designerId: z.string().uuid('Invalid designer ID'),
  
  projectTitle: z.string()
    .min(1, 'Project title is required')
    .max(100, 'Project title must be less than 100 characters'),
  
  projectDescription: z.string()
    .min(10, 'Project description must be at least 10 characters')
    .max(2000, 'Project description must be less than 2000 characters'),
  
  budget: z.number()
    .min(50, 'Budget must be at least $50')
    .max(1000000, 'Budget seems too high'),
  
  timeline: z.string()
    .max(200, 'Timeline description is too long'),
  
  projectType: z.enum([
    'Interior Design',
    'Architecture',
    'Landscape Design',
    'Graphic Design',
    'Industrial Design',
    'Fashion Design',
    'Product Design',
    'UX/UI Design'
  ]),
  
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  
  location: z.string()
    .max(100, 'Location must be less than 100 characters')
    .optional(),
  
  contactPreferences: z.object({
    email: z.boolean().default(true),
    phone: z.boolean().default(false),
    video: z.boolean().default(false),
  }).optional(),
});

// Input sanitization helpers
export const sanitizeString = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limit length
};

export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace invalid characters
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .toLowerCase();
};

// SQL injection prevention helpers
export const validateUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const sanitizeSearchQuery = (query: string): string => {
  return query
    .replace(/[%_\\]/g, '\\$&') // Escape SQL wildcards
    .replace(/[^\w\s-]/g, '') // Remove special characters except space and hyphen
    .trim()
    .substring(0, 100); // Limit length
};

// Validation middleware helper
export const validateRequest = <T>(schema: z.ZodSchema<T>) => {
  return (data: unknown): { success: true; data: T } | { success: false; errors: Record<string, string[]> } => {
    try {
      const validatedData = schema.parse(data);
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string[]> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(err.message);
        });
        return { success: false, errors };
      }
      return { success: false, errors: { general: ['Validation failed'] } };
    }
  };
};