import React from "react";
import { ShieldCheck } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | ScienceOne",
  description: "How ScienceOne protects your data and privacy.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="flex-1 bg-background">
      <section className="relative w-full py-24 overflow-hidden bg-[#011410] border-b border-primary/10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="container mx-auto px-4 md:px-8 relative z-10 flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-8 ring-1 ring-primary/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6">
            Privacy <span className="text-primary">Policy</span>
          </h1>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl prose prose-emerald dark:prose-invert">
          <h2>1. Data Collection</h2>
          <p>
            ScienceOne collects minimal personal data. If you subscribe to our newsletter, we securely store your email address. We do not sell your personal data to third parties.
          </p>
          <h2>2. Cookies and Analytics</h2>
          <p>
            We use essential cookies to ensure the site functions properly and anonymous analytics to understand which scientific topics our readers are most interested in.
          </p>
          <h2>3. Third-Party Links</h2>
          <p>
            Our articles often contain links to external peer-reviewed journals and institutions. ScienceOne is not responsible for the privacy practices of these external sites.
          </p>
        </div>
      </section>
    </div>
  );
}
