import React from "react";
import { Scale } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | ScienceOne",
  description: "Terms and conditions for using ScienceOne.",
};

export default function TermsPage() {
  return (
    <div className="flex-1 bg-background">
      <section className="relative w-full py-24 overflow-hidden bg-[#011410] border-b border-primary/10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="container mx-auto px-4 md:px-8 relative z-10 flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-8 ring-1 ring-primary/20">
            <Scale className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6">
            Terms of <span className="text-primary">Service</span>
          </h1>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl prose prose-emerald dark:prose-invert">
          <h2>1. Terms of Use</h2>
          <p>
            By accessing ScienceOne, you agree to be bound by these terms. All content provided is for informational and educational purposes only.
          </p>
          <h2>2. Intellectual Property</h2>
          <p>
            Original articles, graphics, and design elements are the property of ScienceOne. You may share our content provided proper attribution and a link to the original article are given.
          </p>
          <h2>3. Disclaimers</h2>
          <p>
            While we strive for scientific accuracy, ScienceOne makes no warranties about the completeness or reliability of the information. Any action you take upon the information on this website is strictly at your own risk.
          </p>
        </div>
      </section>
    </div>
  );
}
