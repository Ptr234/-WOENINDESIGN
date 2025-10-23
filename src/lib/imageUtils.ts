// Image utility functions for dynamic image loading and optimization

export interface ImageConfig {
  quality?: number;
  width?: number;
  height?: number;
  format?: 'jpg' | 'webp' | 'png';
}

// Generate placeholder image with proper dimensions and WID branding
export function generatePlaceholder(width: number = 400, height: number = 300, category: string = 'design'): string {
  const colors = {
    design: '#6B7B5A',      // WID Primary Green
    fashion: '#D4A574',     // WID Accent Gold
    architecture: '#A8B494', // WID Sage Green
    portrait: '#B5C4A4',    // WID Light Green
    product: '#6B7B5A',     // WID Primary Green
    landscape: '#A8B494',   // WID Sage Green
    business: '#D4A574'     // WID Accent Gold
  };

  const color = colors[category as keyof typeof colors] || colors.design;
  
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:${color};stop-opacity:0.1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <g transform="translate(${width/2}, ${height/2})">
        <circle r="20" fill="${color}" opacity="0.3"/>
        <path d="M-12,-8 L12,-8 L12,8 L-12,8 Z M-8,-4 L8,-4 L8,4 L-8,4 Z" fill="white" opacity="0.8"/>
      </g>
    </svg>
  `)}`
}

// Optimize image URL with parameters
export function optimizeImageUrl(url: string, config: ImageConfig = {}): string {
  if (!url) return '';
  
  const { quality = 85, width, height, format = 'jpg' } = config;
  
  // Handle Unsplash URLs
  if (url.includes('unsplash.com')) {
    const params = new URLSearchParams();
    
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    params.append('fit', 'crop');
    params.append('crop', 'center');
    params.append('q', quality.toString());
    params.append('fm', format);
    
    return `${url}&${params.toString()}`;
  }
  
  // Handle other image URLs (Cloudinary, etc.)
  if (url.includes('cloudinary.com')) {
    // Add Cloudinary transformations
    const transformations = [];
    
    if (width && height) {
      transformations.push(`w_${width},h_${height},c_fill`);
    }
    transformations.push(`q_${quality}`);
    transformations.push(`f_${format}`);
    
    return url.replace('/upload/', `/upload/${transformations.join(',')}/`);
  }
  
  return url;
}

// Preload critical images
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

// Create responsive image sizes string
export function createSizes(breakpoints: { [key: string]: string } = {}): string {
  const defaultBreakpoints = {
    sm: '100vw',
    md: '50vw',
    lg: '33vw',
    xl: '25vw',
    ...breakpoints
  };
  
  return Object.entries(defaultBreakpoints)
    .map(([breakpoint, size]) => `(max-width: ${getBreakpointValue(breakpoint)}px) ${size}`)
    .join(', ');
}

function getBreakpointValue(breakpoint: string): number {
  const breakpoints: { [key: string]: number } = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  };
  
  return breakpoints[breakpoint] || 768;
}

// Image loading states
export interface ImageLoadingState {
  isLoading: boolean;
  isLoaded: boolean;
  hasError: boolean;
  progress?: number;
}

// Create image loading state manager
export function createImageLoadingState(): [ImageLoadingState, {
  setLoading: () => void;
  setLoaded: () => void;
  setError: () => void;
  setProgress: (progress: number) => void;
}] {
  let state: ImageLoadingState = {
    isLoading: true,
    isLoaded: false,
    hasError: false,
    progress: 0
  };
  
  return [
    state,
    {
      setLoading: () => { state = { ...state, isLoading: true, isLoaded: false, hasError: false }; },
      setLoaded: () => { state = { ...state, isLoading: false, isLoaded: true, hasError: false, progress: 100 }; },
      setError: () => { state = { ...state, isLoading: false, isLoaded: false, hasError: true }; },
      setProgress: (progress: number) => { state = { ...state, progress }; }
    }
  ];
}

// Generate deterministic image selection for consistent display
export function selectImageForId(images: string[], id: string): string {
  if (!images.length) return '';
  
  // Create a simple hash from the id
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const index = Math.abs(hash) % images.length;
  return images[index];
}

// Image categories with curated collections
export const imageCollections = {
  portraits: [
    'https://images.unsplash.com/photo-1494790108755-2616b612b494',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956'
  ],
  design: [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7',
    'https://images.unsplash.com/photo-1560472355-536de3962603',
    'https://images.unsplash.com/photo-1572044162444-ad60f128bdea',
    'https://images.unsplash.com/photo-1590736969955-71cc94901144'
  ],
  fashion: [
    'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d',
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b',
    'https://images.unsplash.com/photo-1558769132-cb1aea458c5e',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62'
  ],
  architecture: [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00',
    'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09',
    'https://images.unsplash.com/photo-1505904267569-f02eaeb45a4c',
    'https://images.unsplash.com/photo-1511818966892-d7d671e672a2'
  ]
} as const;