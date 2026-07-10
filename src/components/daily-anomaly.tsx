import { Zap } from "lucide-react";

export function DailyAnomaly() {
  return (
    <section className="w-full max-w-3xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
      <div className="bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg p-4 md:p-6 shadow-sm flex items-start gap-4">
        <div className="bg-emerald-100 p-2 rounded-full text-emerald-600 shrink-0 mt-1">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
            The Daily Anomaly
          </h3>
          <p className="text-foreground/80 md:text-lg font-medium leading-snug">
            If you could fold a standard piece of paper 42 times, it would reach the Moon.
          </p>
        </div>
      </div>
    </section>
  );
}
