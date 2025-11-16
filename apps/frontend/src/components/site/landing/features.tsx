'use client';

const FEATURES = [
  { icon: '✓', title: 'Verified Sellers', desc: 'All dealers verified' },
  { icon: '🔒', title: 'Secure Payments', desc: 'Safe transaction' },
  { icon: '📋', title: 'Complete History', desc: 'Full vehicle report' },
  { icon: '🚗', title: '5000+ Cars', desc: 'Browse inventory' },
];

export function LandingFeatures() {
  return (
    <div className="mb-14 grid grid-cols-2 gap-5 md:grid-cols-4">
      {FEATURES.map((f) => (
        <div
          key={f.title}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm transition-all hover:border-cyan-500/30"
        >
          <div className="mb-3 text-3xl">{f.icon}</div>
          <div className="mb-1 font-semibold">{f.title}</div>
          <div className="text-sm text-gray-400">{f.desc}</div>
        </div>
      ))}
    </div>
  );
}


