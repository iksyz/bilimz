import React from "react";
import { ShieldCheck, Scale, FileText } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editorial Policy | ScienceOne",
  description: "Our standards for scientific journalism, accuracy, and editorial independence.",
};

export default function EditorialPolicyPage() {
  return (
    <div className="flex-1 bg-background">
      <section className="relative w-full py-24 overflow-hidden bg-[#011410] border-b border-primary/10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="container mx-auto px-4 md:px-8 relative z-10 flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-8 ring-1 ring-primary/20">
            <FileText className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6">
            Editorial <span className="text-primary">Policy</span>
          </h1>
          <p className="text-[#a7f3d0]/70 text-lg max-w-2xl mx-auto leading-relaxed">
            ScienceOne is committed to the highest standards of scientific journalism, ensuring accuracy, objectivity, and transparency in every article we publish.
          </p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl prose prose-emerald dark:prose-invert">
          <h2>1. Accuracy and Fact-Checking</h2>
          <p>
            Every piece of content on ScienceOne undergoes rigorous fact-checking. We rely exclusively on peer-reviewed journals, statements from accredited institutions, and direct interviews with field experts.
          </p>

          <h2>2. Objectivity and Bias</h2>
          <p>
            We strive to present scientific discoveries objectively, avoiding sensationalism. When scientific consensus is still forming, we ensure that multiple credible perspectives are represented accurately.
          </p>

          <h2>3. Corrections Policy</h2>
          <p>
            Science is an iterative process. When new evidence emerges or if an error is made, we are committed to promptly correcting the record and adding a transparent update note to the original article.
          </p>

          <h2>4. AI and Automation</h2>
          <p>
            While we leverage advanced technologies to format and deliver news, all core reporting and scientific analysis are overseen, verified, and published by our human editorial team (Emre Ipekyuz, Siir Kaya, Wei Chen, Lukas Weber).
          </p>
        </div>
      </section>
    </div>
  );
}
