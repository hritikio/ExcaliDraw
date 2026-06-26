import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fdfaf4] doodle-grid">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          {/* Logo mark */}
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="flex-shrink-0">
            <rect x="2" y="2" width="28" height="28" rx="4" fill="#6c63ff" stroke="#1a1a2e" strokeWidth="2"/>
            <path d="M8 22 L14 10 L20 18 L23 14 L26 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <circle cx="8" cy="22" r="1.5" fill="white"/>
          </svg>
          <span className="font-bold text-lg text-[#1a1a2e] tracking-tight">sketchpad</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-[#1a1a2e]/70 font-medium">
          <a href="#features" className="hover:text-[#6c63ff] transition-colors">Features</a>
          <a href="#how" className="hover:text-[#6c63ff] transition-colors">How it works</a>
          <a href="#open" className="hover:text-[#6c63ff] transition-colors">Open Source</a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/signin"
            className="text-sm font-medium text-[#1a1a2e]/80 hover:text-[#1a1a2e] transition-colors px-3 py-1.5"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="btn-sketch bg-[#6c63ff] text-white text-sm font-semibold px-4 py-2 rounded-md"
          >
            Start for free →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-white border-2 border-[#1a1a2e] rounded-full px-4 py-1.5 text-sm font-medium text-[#1a1a2e] mb-8 animate-fade-up">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          Open source · free forever
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-[#1a1a2e] leading-tight mb-6 animate-fade-up tracking-tight">
          Draw. Think.{" "}
          <span className="pencil-underline text-[#6c63ff]">Collaborate.</span>
        </h1>

        <p className="text-lg md:text-xl text-[#1a1a2e]/60 max-w-2xl mx-auto mb-10 animate-fade-up-delay leading-relaxed">
          A whiteboard that feels like sketching on paper. No bloat, no noise —
          just you, your ideas, and an infinite canvas.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up-delay-2">
          <Link
            href="/signup"
            className="btn-sketch bg-[#1a1a2e] text-white font-bold px-8 py-3.5 rounded-md text-base w-full sm:w-auto"
          >
            Open the canvas
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-sketch bg-white text-[#1a1a2e] font-semibold px-8 py-3.5 rounded-md text-base w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            View on GitHub
          </a>
        </div>

        {/* Hero canvas mock */}
        <div className="relative mt-16 mx-auto max-w-4xl animate-fade-up-delay-2">
          <div className="card-sketchy rounded-xl overflow-hidden bg-white">
            {/* Toolbar mock */}
            <div className="bg-[#1a1a2e] px-4 py-2.5 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="flex-1 flex justify-center gap-4">
                {["✏️","⬜","⭕","➡️","🔤","🖐️"].map((icon, i) => (
                  <span
                    key={i}
                    className={`text-lg cursor-pointer opacity-80 hover:opacity-100 ${i === 0 ? "bg-[#6c63ff] p-1 rounded" : ""}`}
                  >
                    {icon}
                  </span>
                ))}
              </div>
            </div>
            {/* Canvas area */}
            <div className="bg-[#fdfaf4] relative overflow-hidden" style={{ height: "340px" }}>
              {/* Doodle grid lines */}
              <svg width="100%" height="100%" className="absolute inset-0 opacity-30">
                <defs>
                  <pattern id="smallGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#6c63ff" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#smallGrid)"/>
              </svg>

              {/* Drawn shapes — random sketch elements */}
              <svg width="100%" height="100%" className="absolute inset-0">
                {/* Box */}
                <rect x="60" y="60" width="160" height="100" rx="4" fill="white" stroke="#1a1a2e" strokeWidth="2" strokeDasharray="none"/>
                <text x="140" y="115" textAnchor="middle" fill="#1a1a2e" fontSize="13" fontFamily="system-ui" fontWeight="500">User Auth</text>

                {/* Arrow */}
                <path d="M 224 110 L 290 110" stroke="#1a1a2e" strokeWidth="2" markerEnd="url(#arrow)"/>
                <defs>
                  <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L6,3 z" fill="#1a1a2e"/>
                  </marker>
                </defs>

                {/* Another box */}
                <rect x="290" y="60" width="160" height="100" rx="4" fill="#f0edff" stroke="#6c63ff" strokeWidth="2"/>
                <text x="370" y="115" textAnchor="middle" fill="#6c63ff" fontSize="13" fontFamily="system-ui" fontWeight="600">Dashboard</text>

                {/* Ellipse shape */}
                <ellipse cx="580" cy="150" rx="90" ry="55" fill="white" stroke="#1a1a2e" strokeWidth="2" strokeDasharray="6 3"/>
                <text x="580" y="155" textAnchor="middle" fill="#1a1a2e" fontSize="12" fontFamily="system-ui">Real-time sync</text>

                {/* Pencil scribble */}
                <path d="M 80 230 Q 130 220 180 235 Q 230 248 280 228 Q 330 210 380 232" stroke="#6c63ff" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7"/>

                {/* Sticky note */}
                <rect x="450" y="230" width="120" height="80" rx="2" fill="#fff9c4" stroke="#1a1a2e" strokeWidth="1.5"/>
                <text x="510" y="268" textAnchor="middle" fill="#1a1a2e" fontSize="11" fontFamily="system-ui">Ship it! 🚀</text>

                {/* Small dots */}
                <circle cx="100" cy="40" r="3" fill="#6c63ff" opacity="0.5"/>
                <circle cx="650" cy="50" r="4" fill="#a29bfe" opacity="0.5"/>
                <circle cx="700" cy="280" r="2.5" fill="#1a1a2e" opacity="0.3"/>
              </svg>

              {/* Cursor */}
              <div className="absolute animate-float" style={{ bottom: "60px", right: "140px" }}>
                <svg width="20" height="24" viewBox="0 0 20 24" fill="none">
                  <path d="M4 2 L4 18 L8 14 L11 20 L13 19 L10 13 L16 13 Z" fill="#6c63ff" stroke="#1a1a2e" strokeWidth="1.5"/>
                </svg>
                <div className="bg-[#6c63ff] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full ml-3 -mt-1 whitespace-nowrap">
                  Hritik ✏️
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black text-[#1a1a2e] mb-3">Built different.</h2>
          <p className="text-[#1a1a2e]/50 text-base">Everything you need, nothing you don&apos;t.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M4 24 L12 8 L18 16 L22 12 L26 16" stroke="#6c63ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <circle cx="4" cy="24" r="2" fill="#6c63ff"/>
                </svg>
              ),
              title: "Infinite canvas",
              desc: "Zoom out to see the big picture. Zoom in to obsess over the details. Your canvas never runs out.",
            },
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <circle cx="14" cy="14" r="11" stroke="#6c63ff" strokeWidth="2.5" strokeDasharray="4 2"/>
                  <circle cx="8" cy="12" r="3" fill="#a29bfe"/>
                  <circle cx="20" cy="12" r="3" fill="#6c63ff"/>
                  <circle cx="14" cy="20" r="3" fill="#1a1a2e"/>
                </svg>
              ),
              title: "Real-time collab",
              desc: "See teammates' cursors live. Leave comments. Work together the way sketching was meant to be.",
            },
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <rect x="4" y="6" width="20" height="16" rx="3" stroke="#6c63ff" strokeWidth="2.5" fill="none"/>
                  <path d="M4 11 L24 11" stroke="#6c63ff" strokeWidth="1.5"/>
                  <circle cx="8" cy="8.5" r="1.2" fill="#6c63ff"/>
                  <circle cx="12" cy="8.5" r="1.2" fill="#a29bfe"/>
                </svg>
              ),
              title: "Export anywhere",
              desc: "PNG, SVG, or JSON. Share a link or embed it. Your work, your format.",
            },
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M14 4 L14 24 M4 14 L24 14" stroke="#6c63ff" strokeWidth="2.5" strokeLinecap="round"/>
                  <rect x="8" y="8" width="12" height="12" rx="2" stroke="#a29bfe" strokeWidth="1.5" fill="none"/>
                </svg>
              ),
              title: "Component library",
              desc: "Drop in pre-made shapes for wireframes, flowcharts, or system diagrams in seconds.",
            },
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M6 22 L12 10 L18 18 L22 13" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <path d="M6 22 L12 10 L18 18 L22 13" stroke="#6c63ff" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeDasharray="2 4" opacity="0.6"/>
                </svg>
              ),
              title: "Undo everything",
              desc: "Full history. Go back 500 steps. Experiment without fear.",
            },
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M14 5 L16.5 11 L23 11.5 L18 16 L20 22.5 L14 19 L8 22.5 L10 16 L5 11.5 L11.5 11 Z" stroke="#6c63ff" strokeWidth="2" fill="none" strokeLinejoin="round"/>
                </svg>
              ),
              title: "Keyboard-first",
              desc: "Every tool has a shortcut. Power users will feel right at home.",
            },
          ].map((f, i) => (
            <div key={i} className="card-sketchy p-6 rounded-xl">
              <div className="mb-4">{f.icon}</div>
              <h3 className="font-bold text-[#1a1a2e] text-base mb-2">{f.title}</h3>
              <p className="text-[#1a1a2e]/55 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-[#1a1a2e] py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
              Up and running in{" "}
              <span className="text-[#a29bfe]">30 seconds.</span>
            </h2>
            <p className="text-white/40 text-base">No installs. No setup. Just open and draw.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Create a board", body: "Click \u201cOpen the canvas\u201d and you\u2019re in. No account needed to try it out." },
              { step: "02", title: "Start sketching", body: "Grab the pencil, drop shapes, write notes. It feels exactly like paper." },
              { step: "03", title: "Share a link", body: "Copy your board link and send it to anyone. They join instantly, no setup." },
            ].map((s, i) => (
              <div key={i} className="relative">
                <div className="text-[#6c63ff]/30 font-black text-6xl leading-none mb-3 select-none">{s.step}</div>
                <h3 className="text-white font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{s.body}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 -right-4 text-white/20 text-2xl">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open source section */}
      <section id="open" className="max-w-5xl mx-auto px-6 py-20">
        <div className="card-sketchy rounded-2xl p-10 md:p-14 bg-white text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#f0edff] rounded-xl mb-6 border-2 border-[#1a1a2e]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#6c63ff">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </div>
          <h2 className="text-3xl font-black text-[#1a1a2e] mb-3">
            Proudly open source.
          </h2>
          <p className="text-[#1a1a2e]/55 max-w-lg mx-auto mb-8 text-base leading-relaxed">
            Built in public. Every line of code is yours to read, fork, and contribute to.
            No vendor lock-in, no black boxes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-sketch bg-[#1a1a2e] text-white font-bold px-7 py-3 rounded-md text-sm flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              Star on GitHub
            </a>
            <Link
              href="/signup"
              className="btn-sketch bg-[#6c63ff] text-white font-bold px-7 py-3 rounded-md text-sm"
            >
              Try it free →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-[#6c63ff] py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Your next idea deserves a better canvas.
          </h2>
          <p className="text-white/70 mb-8 text-base">
            Free to use. No credit card. Open forever.
          </p>
          <Link
            href="/signup"
            className="inline-block btn-sketch bg-white text-[#1a1a2e] font-black px-10 py-4 rounded-md text-base"
          >
            Open the canvas — it&apos;s free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-[#1a1a2e]/10 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#1a1a2e]/40">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
              <rect x="2" y="2" width="28" height="28" rx="4" fill="#6c63ff" stroke="#1a1a2e" strokeWidth="2"/>
              <path d="M8 22 L14 10 L20 18 L23 14 L26 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
            <span className="font-semibold text-[#1a1a2e]/60">sketchpad</span>
          </div>
          <p>Built with ❤️ · Open source · MIT License</p>
          <div className="flex gap-5">
            <Link href="/signin" className="hover:text-[#6c63ff] transition-colors">Sign in</Link>
            <Link href="/signup" className="hover:text-[#6c63ff] transition-colors">Sign up</Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#6c63ff] transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
