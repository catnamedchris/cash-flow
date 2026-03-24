export function EmptyState() {
  return (
    <div className="lg:col-span-3 flex items-center justify-center min-h-[60vh] lg:min-h-0">
      <div className="text-center px-8 py-16 animate-[fadeIn_0.8s_ease-out]">
        {/* Illustration */}
        <div className="mx-auto w-48 h-48 mb-8 relative">
          <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
            {/* Grid lines */}
            <line x1="40" y1="40" x2="40" y2="160" className="stroke-edge" strokeWidth="1" />
            <line x1="40" y1="160" x2="170" y2="160" className="stroke-edge" strokeWidth="1" />
            {/* Grid horizontals */}
            <line x1="40" y1="80" x2="170" y2="80" className="stroke-edge-subtle" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="40" y1="120" x2="170" y2="120" className="stroke-edge-subtle" strokeWidth="1" strokeDasharray="4 4" />
            {/* Bars with rounded tops */}
            <rect x="58" y="130" width="20" height="30" rx="4" className="fill-faint/30" />
            <rect x="90" y="110" width="20" height="50" rx="4" className="fill-faint/30" />
            <rect x="122" y="85" width="20" height="75" rx="4" className="fill-faint/30" />
            <rect x="154" y="65" width="20" height="95" rx="4" className="fill-accent/20" />
            {/* Trend line */}
            <path
              d="M 68 125 Q 100 105, 132 80 T 164 55"
              className="stroke-accent/40"
              strokeWidth="2"
              strokeDasharray="6 4"
              strokeLinecap="round"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="40"
                to="0"
                dur="2s"
                repeatCount="indefinite"
              />
            </path>
            {/* Dot at end of trend */}
            <circle cx="164" cy="55" r="4" className="fill-accent/60">
              <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>

        <h3 className="text-lg font-semibold text-heading/70 mb-2">
          Enter your income to begin
        </h3>
        <p className="text-sm text-muted max-w-[240px] mx-auto leading-relaxed">
          Your complete financial picture will appear here
        </p>
      </div>
    </div>
  );
}
