import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WID Uganda - Women in Design Platform',
  description: 'Connecting women designers, clients, and suppliers across Uganda. Find talented designers, showcase your work, and grow your creative business.',
  keywords: ['women designers Uganda', 'interior design', 'architecture', 'suppliers', 'creative marketplace'],
  openGraph: {
    title: 'WID Uganda - Women in Design Platform',
    description: 'Connecting women designers, clients, and suppliers across Uganda',
    images: ['/images/WOMEN.jpeg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WID Uganda - Women in Design Platform',
    description: 'Connecting women designers, clients, and suppliers across Uganda',
    images: ['/images/WOMEN.jpeg'],
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  );
}