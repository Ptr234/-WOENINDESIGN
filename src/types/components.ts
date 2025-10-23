import { ReactNode } from 'react';
import {
  User,
  DesignerProfile,
  SupplierProfile,
  ClientProfile,
  Portfolio,
  Review,
  SearchFilters,
  SupplierSearchFilters,
  HiringRequest,
  Payment,
  PlatformStats,
  Product,
  UserRole,
  DesignSpecialty,
  SupplierCategory
} from './index';

export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

export interface LayoutProps extends BaseComponentProps {
  user?: User;
  showNavigation?: boolean;
  showFooter?: boolean;
}

export interface HeaderProps extends BaseComponentProps {
  user?: User;
  onLogout?: () => void;
  showSearch?: boolean;
}

export interface FooterProps extends BaseComponentProps {
  showContactInfo?: boolean;
  showSocialLinks?: boolean;
}

export interface NavigationProps extends BaseComponentProps {
  user?: User;
  currentPath?: string;
  isMobile?: boolean;
}

export interface SearchBarProps extends BaseComponentProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onFilterChange?: (filters: SearchFilters | SupplierSearchFilters) => void;
  showFilters?: boolean;
  initialQuery?: string;
  type?: 'designers' | 'suppliers' | 'all';
}

export interface FilterPanelProps extends BaseComponentProps {
  type: 'designers' | 'suppliers';
  filters: SearchFilters | SupplierSearchFilters;
  onFilterChange: (filters: SearchFilters | SupplierSearchFilters) => void;
  onClear: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export interface DesignerCardProps extends BaseComponentProps {
  designer: DesignerProfile;
  onClick?: (designer: DesignerProfile) => void;
  showContactInfo?: boolean;
  compact?: boolean;
}

export interface SupplierCardProps extends BaseComponentProps {
  supplier: SupplierProfile;
  onClick?: (supplier: SupplierProfile) => void;
  showContactInfo?: boolean;
  compact?: boolean;
}

export interface PortfolioGalleryProps extends BaseComponentProps {
  portfolio: Portfolio[];
  onItemClick?: (item: Portfolio) => void;
  editable?: boolean;
  onEdit?: (item: Portfolio) => void;
  onDelete?: (id: string) => void;
  onAdd?: () => void;
}

export interface PortfolioItemProps extends BaseComponentProps {
  item: Portfolio;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  editable?: boolean;
}

export interface ReviewsListProps extends BaseComponentProps {
  reviews: Review[];
  editable?: boolean;
  onAddReview?: () => void;
  showAddButton?: boolean;
}

export interface ReviewCardProps extends BaseComponentProps {
  review: Review;
  showClientInfo?: boolean;
}

export interface UserProfileFormProps extends BaseComponentProps {
  user: User | DesignerProfile | SupplierProfile | ClientProfile;
  onSave: (data: Partial<User>) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  errors?: Record<string, string>;
}

export interface DesignerProfileFormProps extends BaseComponentProps {
  designer: DesignerProfile;
  onSave: (data: Partial<DesignerProfile>) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  errors?: Record<string, string>;
}

export interface SupplierProfileFormProps extends BaseComponentProps {
  supplier: SupplierProfile;
  onSave: (data: Partial<SupplierProfile>) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  errors?: Record<string, string>;
}

export interface AuthFormProps extends BaseComponentProps {
  type: 'login' | 'register';
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  isLoading?: boolean;
  errors?: Record<string, string>;
  redirectPath?: string;
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  icon?: ReactNode;
  fullWidth?: boolean;
}

export interface InputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  maxLength?: number;
  validation?: RegExp | ((value: string) => Promise<string | null> | string | null);
  debounceMs?: number;
  showCharacterCount?: boolean;
  helperText?: string;
  success?: string;
}

export interface TextareaProps extends BaseComponentProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  maxLength?: number;
}

export interface SelectProps extends BaseComponentProps {
  label?: string;
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  searchable?: boolean;
}

export interface CheckboxProps extends BaseComponentProps {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  error?: string;
  required?: boolean;
}

export interface RadioGroupProps extends BaseComponentProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export interface FileUploadProps extends BaseComponentProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  onUpload: (files: File[]) => void;
  onRemove?: (index: number) => void;
  files?: File[];
  preview?: boolean;
  disabled?: boolean;
  error?: string;
  label?: string;
}

export interface ImageGalleryProps extends BaseComponentProps {
  images: string[];
  alt?: string;
  onImageClick?: (index: number) => void;
  showThumbnails?: boolean;
  autoPlay?: boolean;
  editable?: boolean;
  onDelete?: (index: number) => void;
  onReorder?: (from: number, to: number) => void;
}

export interface PaginationProps extends BaseComponentProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxPagesToShow?: number;
}

export interface LoadingSpinnerProps extends BaseComponentProps {
  size?: 'xs' | 'small' | 'medium' | 'large' | 'xl';
  color?: string;
  text?: string;
  variant?: 'spin' | 'dots' | 'pulse' | 'bars';
  overlay?: boolean;
  fullScreen?: boolean;
}

export interface AlertProps extends BaseComponentProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  dismissible?: boolean;
  icon?: ReactNode;
}

export interface ToastProps extends AlertProps {
  duration?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
}

export interface BadgeProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium' | 'large';
  rounded?: boolean;
}

export interface AvatarProps extends BaseComponentProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'small' | 'medium' | 'large' | 'xl';
  rounded?: boolean;
  onClick?: () => void;
}

export interface RatingProps extends BaseComponentProps {
  value: number;
  max?: number;
  readonly?: boolean;
  onChange?: (rating: number) => void;
  size?: 'small' | 'medium' | 'large';
  showValue?: boolean;
}

export interface StatsCardProps extends BaseComponentProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  color?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
    period: string;
  };
}

export interface HiringRequestCardProps extends BaseComponentProps {
  request: HiringRequest;
  currentUserId: string;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onCancel?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

export interface PaymentCardProps extends BaseComponentProps {
  payment: Payment;
  onViewDetails?: (id: string) => void;
  onRefund?: (id: string) => void;
  showActions?: boolean;
}

export interface ProductCardProps extends BaseComponentProps {
  product: Product;
  onClick?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
  editable?: boolean;
  showPrice?: boolean;
}

export interface BreadcrumbProps extends BaseComponentProps {
  items: Array<{
    label: string;
    href?: string;
    active?: boolean;
  }>;
  separator?: ReactNode;
}

export interface TabsProps extends BaseComponentProps {
  items: Array<{
    key: string;
    label: string;
    content: ReactNode;
    disabled?: boolean;
  }>;
  activeKey?: string;
  onChange?: (key: string) => void;
  variant?: 'default' | 'pills' | 'underline';
}

export interface AccordionProps extends BaseComponentProps {
  items: Array<{
    key: string;
    title: string;
    content: ReactNode;
    disabled?: boolean;
  }>;
  activeKeys?: string[];
  onChange?: (keys: string[]) => void;
  allowMultiple?: boolean;
}

export interface DataTableProps<T> extends BaseComponentProps {
  data: T[];
  columns: Array<{
    key: keyof T;
    title: string;
    render?: (value: unknown, item: T) => ReactNode;
    sortable?: boolean;
    width?: string;
  }>;
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
  onRowClick?: (item: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  pagination?: PaginationProps;
  selectable?: boolean;
  onSelectionChange?: (selectedItems: T[]) => void;
}

export interface PageProps {
  params?: Record<string, string>;
  searchParams?: Record<string, string | string[] | undefined>;
}

export interface LayoutPageProps extends PageProps {
  children: ReactNode;
}

export interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export interface NotFoundPageProps {
  message?: string;
  showBackButton?: boolean;
}