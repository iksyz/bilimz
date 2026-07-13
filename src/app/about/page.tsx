import React from "react";
import { Atom, MapPin, Mail, Globe } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | ScienceOne",
  description: "Learn more about ScienceOne, our mission, and our global headquarters.",
};

export default function AboutPage() {
  return (
    <div className="flex-1 bg-background">
      {/* Hero Section */}
      <section className="relative w-full py-24 md:py-32 overflow-hidden bg-[#011410] border-b border-primary/10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 max-w-2xl h-64 bg-primary/5 blur-[100px] pointer-events-none rounded-full" />
        
        <div className="container mx-auto px-4 md:px-8 relative z-10 flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-8 ring-1 ring-primary/20">
            <Atom className="w-8 h-8 animate-[spin_10s_linear_infinite]" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6">
            Where Data Meets <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-300">Discovery.</span>
          </h1>
          <p className="text-[#a7f3d0]/70 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            ScienceOne is a global editorial platform dedicated to uncovering the most profound breakthroughs across biotechnology, astrophysics, quantum mechanics, and deep space exploration.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            
            {/* Our Mission */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight text-foreground border-b pb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                We believe that the future of humanity lies in our ability to understand the cosmos and our own biology. Our mission is to bridge the gap between complex scientific research and the curious minds of the public, delivering accurate, engaging, and cutting-edge news.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                With a diverse team of researchers, correspondents, and science writers, ScienceOne provides unparalleled insights into the phenomena shaping our world and the universe beyond.
              </p>
            </div>

            {/* Headquarters */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight text-foreground border-b pb-4">Global Headquarters</h2>
              <div className="bg-muted/50 rounded-2xl p-8 border border-border/50 space-y-8">
                
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-primary/10 text-primary shrink-0 mt-1">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">Office Location</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Talaytepe, Laleş Blv.,<br />
                      21070 Kayapınar/Diyarbakır,<br />
                      Turkey
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-primary/10 text-primary shrink-0 mt-1">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">Global Reach</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Serving a worldwide audience of researchers, students, and science enthusiasts.
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
