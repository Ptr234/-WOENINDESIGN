import { Metadata } from 'next';

interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  noIndex?: boolean;
}

const defaultConfig = {
  siteName: 'Women in Design Uganda',
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://womenindesignuganda.com',
  defaultImage: '/images/og-default.jpg',
  defaultDescription: 'Empowering female designers and suppliers across Uganda through community, collaboration, and professional growth opportunities.',
  twitterHandle: '@WomenInDesignUG',
};

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    ogImage = defaultConfig.defaultImage,
    noIndex = false,
  } = config;

  const fullTitle = title.includes(defaultConfig.siteName) 
    ? title 
    : `${title} | ${defaultConfig.siteName}`;

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: keywords.length > 0 ? keywords.join(', ') : undefined,
    authors: [{ name: defaultConfig.siteName }],
    creator: defaultConfig.siteName,
    publisher: defaultConfig.siteName,
    robots: noIndex ? 'noindex, nofollow' : 'index, follow',
    
    openGraph: {
      title: fullTitle,
      description,
      url: defaultConfig.siteUrl,
      siteName: defaultConfig.siteName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_UG',
      type: 'website',
    },
    
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
      creator: defaultConfig.twitterHandle,
    },
    
    alternates: {
      canonical: defaultConfig.siteUrl,
    },
    
    other: {
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'black-translucent',
      'theme-color': '#064420',
      'msapplication-TileColor': '#064420',
    },
  };

  return metadata;
}

// Common page metadata configurations
export const pageMetadata = {
  home: {
    title: 'Women in Design Uganda',
    description: 'Discover talented female designers and suppliers across Uganda. Connect with professionals for interior design, architecture, graphic design, and more.',
    keywords: ['women designers Uganda', 'female designers Uganda', 'interior design Uganda', 'architecture Uganda', 'graphic design', 'design services'],
  },
  
  about: {
    title: 'About Us',
    description: 'Learn about Women in Design Uganda\'s mission to empower female designers and suppliers through community, collaboration, and professional growth.',
    keywords: ['women in design Uganda', 'female empowerment', 'design community', 'Uganda designers'],
  },
  
  designers: {
    title: 'Find Designers',
    description: 'Browse and connect with talented female designers in Uganda. Find experts in interior design, architecture, graphic design, and more.',
    keywords: ['hire designers Uganda', 'female designers', 'interior designers Uganda', 'architects Uganda', 'graphic designers'],
  },
  
  suppliers: {
    title: 'Find Suppliers',
    description: 'Discover quality suppliers and vendors in Uganda. Find materials, furniture, fixtures, and products for your design projects.',
    keywords: ['suppliers Uganda', 'design materials Uganda', 'furniture suppliers', 'fixtures Uganda', 'design products'],
  },
  
  contact: {
    title: 'Contact Us',
    description: 'Get in touch with Women in Design Uganda. We\'d love to hear from you and help with any questions about our platform.',
    keywords: ['contact women in design Uganda', 'support', 'help', 'get in touch'],
  },
  
  help: {
    title: 'Help Center',
    description: 'Find answers to frequently asked questions about using the Women in Design Uganda platform. Get help with account setup, payments, and more.',
    keywords: ['help', 'FAQ', 'support', 'how to use', 'platform guide'],
  },
  
  privacy: {
    title: 'Privacy Policy',
    description: 'Read our privacy policy to understand how Women in Design Uganda collects, uses, and protects your personal information.',
    keywords: ['privacy policy', 'data protection', 'personal information', 'privacy'],
  },
  
  login: {
    title: 'Sign In',
    description: 'Sign in to your Women in Design Uganda account to access your dashboard, portfolio, messages, and more.',
    keywords: ['login', 'sign in', 'account access'],
  },
  
  register: {
    title: 'Create Account',
    description: 'Join Women in Design Uganda today. Create your account as a designer, client, or supplier and start connecting with the community.',
    keywords: ['register', 'sign up', 'create account', 'join community'],
  },
  
  dashboard: {
    title: 'Dashboard',
    description: 'Manage your Women in Design Uganda account, view projects, messages, analytics, and more from your personal dashboard.',
    keywords: ['dashboard', 'account management', 'projects', 'analytics'],
    noIndex: true,
  },
  
  profile: {
    title: 'Profile',
    description: 'Manage your Women in Design Uganda profile, update your information, and showcase your work.',
    keywords: ['profile', 'account settings', 'portfolio'],
    noIndex: true,
  },
  
  settings: {
    title: 'Settings',
    description: 'Manage your Women in Design Uganda account settings, privacy preferences, and security options.',
    keywords: ['settings', 'account preferences', 'privacy', 'security'],
    noIndex: true,
  },
};