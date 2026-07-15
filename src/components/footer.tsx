import React from "react";
import Link from "next/link";
import { Atom, ArrowRight, Mail } from "lucide-react";
import { Button } from "./ui/button";

export function Footer() {
  return (
    <footer className="w-full bg-primary pt-16 pb-8 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-2xl h-32 bg-white/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Brand & Vision (Takes up 4 cols on large) */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 text-white transition-all duration-300">
                <Atom className="w-5 h-5 animate-[spin_10s_linear_infinite] will-change-transform" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">Science<span className="font-normal opacity-80">One</span></span>
            </Link>
            <p className="text-white/90 text-sm leading-relaxed max-w-sm">
              Where data, theories, and discoveries converge. We bring you the bleeding edge of global scientific breakthroughs, crafted for the curious mind.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="h-9 w-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/90 hover:bg-white/30 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
              <a href="#" className="h-9 w-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/90 hover:bg-white/30 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
              <a href="#" className="h-9 w-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/90 hover:bg-white/30 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
              </a>
            </div>
          </div>

          {/* Categories */}
          <div className="lg:col-span-2 space-y-5">
            <h4 className="text-white font-bold tracking-wider text-sm uppercase">Explore</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/discover?category=Bio-Tech" prefetch={false} className="text-white/80 hover:text-white font-medium transition-colors inline-flex items-center gap-2 group">
                  Bio-Tech
                </Link>
              </li>
              <li>
                <Link href="/discover?category=Cosmos" prefetch={false} className="text-white/80 hover:text-white font-medium transition-colors inline-flex items-center gap-2 group">
                  Cosmos
                </Link>
              </li>
              <li>
                <Link href="/discover?category=Life-Science" prefetch={false} className="text-white/80 hover:text-white font-medium transition-colors inline-flex items-center gap-2 group">
                  Life-Science
                </Link>
              </li>
              <li>
                <Link href="/discover?category=Deep-Dive" prefetch={false} className="text-white/80 hover:text-white font-medium transition-colors inline-flex items-center gap-2 group">
                  Deep-Dive
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Company */}
          <div className="lg:col-span-2 space-y-5">
            <h4 className="text-white font-bold tracking-wider text-sm uppercase">Company</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/about" className="text-white/80 hover:text-white font-medium transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="/editorial-policy" className="text-white/80 hover:text-white font-medium transition-colors">Editorial Policy</Link>
              </li>
              <li>
                <Link href="/privacy" className="text-white/80 hover:text-white font-medium transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="text-white/80 hover:text-white font-medium transition-colors">Terms of Service</Link>
              </li>
            </ul>
          </div>

          {/* Newsletter (Takes up 4 cols on large) */}
          <div className="lg:col-span-4 space-y-5 bg-black/10 p-6 rounded-2xl border border-white/10 shadow-inner">
            <h4 className="text-white font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
              <Mail className="w-4 h-4 text-white/80" /> Stay Updated
            </h4>
            <p className="text-white/90 text-sm leading-relaxed">
              Get the latest scientific discoveries and deep-dives delivered straight to your inbox every week.
            </p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="your.email@example.com" 
                className="flex-1 min-w-0 bg-white/20 border border-white/20 rounded-lg px-4 text-sm text-white placeholder-white/60 focus:outline-none focus:border-white transition-colors"
                required
              />
              <Button type="button" className="bg-white text-primary hover:bg-white/90 px-4 shrink-0 rounded-lg">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/20 flex items-center justify-center text-center text-xs text-white/70 font-medium">
          <p>&copy; {new Date().getFullYear()} ScienceOne.net. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
