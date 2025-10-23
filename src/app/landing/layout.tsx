export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-gray-100">
      <main>
        {children}
      </main>
    </div>
  );
}