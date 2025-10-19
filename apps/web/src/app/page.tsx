export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">
          Welcome to GhitDesk
        </h1>
        <p className="text-text-muted text-lg">
          Modern Help Desk System with Next.js 15 & Turbopack
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <div className="bg-surface p-6 rounded-lg border border-border">
            <h3 className="text-success font-semibold mb-2">✓ Next.js 15</h3>
            <p className="text-text-muted text-sm">App Router + Turbopack</p>
          </div>
          <div className="bg-surface p-6 rounded-lg border border-border">
            <h3 className="text-primary font-semibold mb-2">✓ Tailwind v4</h3>
            <p className="text-text-muted text-sm">CSS-first approach</p>
          </div>
          <div className="bg-surface p-6 rounded-lg border border-border">
            <h3 className="text-warning font-semibold mb-2">✓ Design System</h3>
            <p className="text-text-muted text-sm">@ghit/ui package</p>
          </div>
        </div>
      </div>
    </main>
  );
}
