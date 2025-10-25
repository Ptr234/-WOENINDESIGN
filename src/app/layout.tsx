import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/responsive.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "WID Uganda - Women in Design Platform",
    template: "%s | WID Uganda"
  },
  description: "Connecting women designers, clients, and suppliers across Uganda. Find talented designers, showcase your work, and grow your creative business.",
  keywords: ["design", "Uganda", "women", "creative", "marketplace", "portfolio", "designers", "suppliers"],
  authors: [{ name: "WID Uganda Team" }],
  creator: "WID Uganda",
  publisher: "WID Uganda",
  formatDetection: {
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://wid-uganda-platform.vercel.app'),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_UG",
    url: "/",
    title: "WID Uganda - Women in Design Platform",
    description: "Connecting women designers, clients, and suppliers across Uganda",
    siteName: "WID Uganda",
    images: [
      {
        url: "/logo.webp",
        width: 1200,
        height: 630,
        alt: "WID Uganda Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WID Uganda - Women in Design Platform",
    description: "Connecting women designers, clients, and suppliers across Uganda",
    images: ["/logo.webp"],
    creator: "@WIDUganda",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/logo.webp", sizes: "32x32", type: "image/webp" },
      { url: "/logo.webp", sizes: "16x16", type: "image/webp" },
    ],
    apple: [
      { url: "/logo.webp", sizes: "180x180", type: "image/webp" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/logo.webp",
        color: "#7c3aed",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WID Uganda",
  },
  other: {
    "msapplication-TileColor": "#7c3aed",
    "msapplication-config": "/browserconfig.xml",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Preconnect to important domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://wid-uganda-backend.onrender.com" />
        
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="https://zmxyjaczsgrvtvonqtlu.supabase.co" />
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('SW registered: ', registration);
                  }).catch(function(registrationError) {
                    console.log('SW registration failed: ', registrationError);
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-white text-gray-900`}
        suppressHydrationWarning
      >
        <div id="root" className="relative">
          {children}
        </div>
        
        {/* Accessibility improvements */}
        <div id="skip-link" className="sr-only">
          <a href="#main-content" className="absolute top-0 left-0 bg-blue-600 text-white p-2 z-50 transform -translate-y-full focus:translate-y-0 transition-transform">
            Skip to main content
          </a>
        </div>
        
        {/* Install prompt for PWA */}
        <div id="install-prompt" className="hidden fixed bottom-4 left-4 right-4 bg-purple-600 text-white p-4 rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Install WID Uganda</h3>
              <p className="text-sm text-purple-100">Get the app for a better experience</p>
            </div>
            <div className="flex gap-2">
              <button id="install-button" className="bg-white text-purple-600 px-4 py-2 rounded text-sm font-medium">
                Install
              </button>
              <button id="dismiss-install" className="text-purple-200 hover:text-white">
                ✕
              </button>
            </div>
          </div>
        </div>
        
        {/* PWA Install Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              let deferredPrompt;
              const installPrompt = document.getElementById('install-prompt');
              const installButton = document.getElementById('install-button');
              const dismissButton = document.getElementById('dismiss-install');
              
              window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                deferredPrompt = e;
                if (installPrompt) installPrompt.classList.remove('hidden');
              });
              
              if (installButton) {
                installButton.addEventListener('click', async () => {
                  if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    deferredPrompt = null;
                    if (installPrompt) installPrompt.classList.add('hidden');
                  }
                });
              }
              
              if (dismissButton) {
                dismissButton.addEventListener('click', () => {
                  if (installPrompt) installPrompt.classList.add('hidden');
                });
              }
              
              window.addEventListener('appinstalled', () => {
                if (installPrompt) installPrompt.classList.add('hidden');
                deferredPrompt = null;
              });
            `,
          }}
        />
      </body>
    </html>
  );
}
