import { Atom } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark min-h-screen flex flex-col bg-[#011a14] text-[#ecfdf5] selection:bg-primary/30 selection:text-primary">
      <header className="sticky top-0 z-40 border-b border-primary/10 bg-[#011a14]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-1.5 rounded-lg border border-primary/20">
            <Atom className="h-5 w-5 text-primary animate-pulse" />
          </div>
          <span className="font-bold tracking-tight text-lg text-white">
            ScienceOne<span className="text-primary">.admin</span>
          </span>
        </div>
        <nav className="text-sm font-semibold">
          <Link href="/" className="text-[#a7f3d0] hover:text-primary transition-all hover:scale-[1.02]">
            Portala Dön &rarr;
          </Link>
        </nav>
      </header>
      <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
