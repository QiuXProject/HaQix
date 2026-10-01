import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Flame, ArrowLeft, Download, ExternalLink, Info, Calendar, ShieldCheck, PlusCircle } from 'lucide-react';
import { AddGamePage } from './AddGamePage';

/* ───────────────── Particle System ───────────────── */
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  speedX: number;
  speedY: number;
  life: number;
  maxLife: number;
}

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const counterRef = useRef(0);

  const createParticle = useCallback((w: number, h: number): Particle => {
    counterRef.current++;
    return {
      id: counterRef.current,
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 2 + 0.5,
      opacity: 0,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: -Math.random() * 0.4 - 0.1,
      life: 0,
      maxLife: Math.random() * 400 + 200,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Init particles
    for (let i = 0; i < 60; i++) {
      const p = createParticle(canvas.width, canvas.height);
      p.life = Math.random() * p.maxLife; // offset start
      particlesRef.current.push(p);
    }

    const animate = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((p) => {
        p.life++;
        p.x += p.speedX;
        p.y += p.speedY;

        // fade in/out
        const progress = p.life / p.maxLife;
        if (progress < 0.1) p.opacity = progress / 0.1;
        else if (progress > 0.8) p.opacity = (1 - progress) / 0.2;
        else p.opacity = 1;

        p.opacity *= 0.35;

        // reset
        if (p.life >= p.maxLife) {
          Object.assign(p, createParticle(canvas.width, canvas.height));
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(226, 26, 34, ${p.opacity})`;
        ctx.fill();
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [createParticle]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[5]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}

/* ───────────────── Animated Counter / Typing ───────────────── */
function TypedText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, 35);
    return () => clearInterval(interval);
  }, [started, text]);

  return (
    <span>
      {displayed}
      <span className="animate-blink text-[#e21a22]">|</span>
    </span>
  );
}

/* ───────────────── Main App ───────────────── */
function App() {
  const [loaded, setLoaded] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'game-detail' | 'add-game'>('home');

  useEffect(() => {
    // Trigger entrance animations after mount
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    // Reset scroll when changing view or game
    window.scrollTo(0, 0);
  }, [selectedGameId, currentView]);

  const patternStyle = {
    backgroundImage: `
      linear-gradient(45deg, #121212 25%, transparent 25%, transparent 75%, #121212 75%, #121212),
      linear-gradient(45deg, #121212 25%, transparent 25%, transparent 75%, #121212 75%, #121212)
    `,
    backgroundSize: '48px 48px',
    backgroundPosition: '0 0, 24px 24px',
  };

  const games = [
    { id: 1, title: 'Elden Ring', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.png' },
    { id: 2, title: 'God of War', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1tmu.png' },
    { id: 3, title: 'Red Dead Redemption II', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1q1f.png', isRDR: true },
    { id: 4, title: 'The Witcher 3: Wild Hunt', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.png' },
    { id: 5, title: 'Horizon Zero Dawn', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2fbx.png' },
    { id: 6, title: 'Cyberpunk 2077', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2mvt.png' },
  ];

  /* 3D tilt handler for game cards */
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)';
  };

  const MAGNET_LINK = "magnet:?xt=urn:btih:18A89755E51616C9E8E904FF360E364DEB4B0922&dn=Red+Dead+Redemption+2%3A+Ultimate+Edition+%28Build+1491.50+%2B+UE+Unlocker%2C+MULTi13%29+%5BFitGirl+Repack%5D&tr=udp%3A%2F%2Fopentor.net%3A6969&tr=udp%3A%2F%2Fopentracker.i2p.rocks%3A6969%2Fannounce&tr=http%3A%2F%2Ftracker.gbitt.info%3A80%2Fannounce&tr=http%3A%2F%2Ftracker.ccp.ovh%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.ccp.ovh%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce&tr=udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&tr=udp%3A%2F%2Fexodus.desync.com%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.theoks.net%3A6969%2Fannounce&tr=https%3A%2F%2Ftracker.tamersunion.org%3A443%2Fannounce&tr=http%3A%2F%2Fopen.acgnxtracker.com%3A80%2Fannounce&tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&tr=udp%3A%2F%2Fopentracker.i2p.rocks%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969%2Fannounce&tr=udp%3A%2F%2Fcoppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.zer0day.to%3A1337%2Fannounce";

  return (
    <div className="min-h-screen bg-[#070707] text-white font-sans relative overflow-x-hidden flex flex-col items-center selection:bg-[#e21a22] selection:text-white">

      {/* ── Styles & Keyframes ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        .font-montserrat { font-family: 'Montserrat', sans-serif; }

        /* ── Entrance Animations ── */
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.7); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* ── Glitch on Logo ── */
        @keyframes glitch1 {
          0%, 90%, 100% { clip-path: inset(0 0 0 0); transform: translate(0); }
          92% { clip-path: inset(20% 0 30% 0); transform: translate(-4px, 2px); }
          94% { clip-path: inset(50% 0 10% 0); transform: translate(4px, -2px); }
          96% { clip-path: inset(10% 0 60% 0); transform: translate(-2px, 1px); }
          98% { clip-path: inset(40% 0 20% 0); transform: translate(3px, -1px); }
        }
        @keyframes glitch2 {
          0%, 90%, 100% { clip-path: inset(0 0 0 0); transform: translate(0); }
          91% { clip-path: inset(60% 0 5% 0); transform: translate(3px, -2px); }
          93% { clip-path: inset(10% 0 50% 0); transform: translate(-3px, 1px); }
          95% { clip-path: inset(30% 0 30% 0); transform: translate(2px, -1px); }
          97% { clip-path: inset(5% 0 70% 0); transform: translate(-4px, 2px); }
        }

        .glitch-wrapper {
          position: relative;
          display: inline-block;
        }
        .glitch-wrapper::before,
        .glitch-wrapper::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        .glitch-wrapper::before {
          color: #e21a22;
          animation: glitch1 5s infinite linear;
          z-index: -1;
        }
        .glitch-wrapper::after {
          color: #00d4ff;
          animation: glitch2 5s infinite linear;
          z-index: -1;
        }

        /* ── Glow Pulse on red HAQIX ── */
        @keyframes redGlow {
          0%, 100% { text-shadow: 0 0 8px rgba(226,26,34,0.4), 0 0 30px rgba(226,26,34,0.15); }
          50%      { text-shadow: 0 0 16px rgba(226,26,34,0.7), 0 0 60px rgba(226,26,34,0.3), 0 0 100px rgba(226,26,34,0.1); }
        }
        .red-glow {
          animation: redGlow 3s ease-in-out infinite;
        }

        /* ── Blink cursor ── */
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-blink { animation: blink 0.7s step-end infinite; }

        /* ── Border sweep on search ── */
        @keyframes borderSweep {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .search-glow {
          position: relative;
        }
        .search-glow::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 14px;
          background: linear-gradient(90deg, #262626, #e21a22, #262626, #e21a22, #262626);
          background-size: 300% 100%;
          animation: borderSweep 4s ease infinite;
          z-index: -1;
          opacity: 0.5;
          transition: opacity 0.4s;
        }
        .search-glow:focus-within::before {
          opacity: 1;
        }

        /* ── Fire flicker ── */
        @keyframes fireFlicker {
          0%, 100% { transform: scale(1) rotate(0deg); filter: brightness(1); }
          25%  { transform: scale(1.1) rotate(-3deg); filter: brightness(1.3); }
          50%  { transform: scale(0.95) rotate(2deg); filter: brightness(0.9); }
          75%  { transform: scale(1.08) rotate(-1deg); filter: brightness(1.2); }
        }
        .fire-flicker {
          animation: fireFlicker 1.5s ease-in-out infinite;
        }

        /* ── Nav link underline ── */
        .nav-link {
          position: relative;
          overflow: hidden;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 2px;
          background: #e21a22;
          transform: translateX(-110%);
          transition: transform 0.35s cubic-bezier(0.65, 0, 0.35, 1);
        }
        .nav-link:hover::after {
          transform: translateX(0);
        }

        /* ── Checkerboard drift ── */
        @keyframes checkerDrift {
          0%   { transform: translate(0, 0); }
          100% { transform: translate(48px, 48px); }
        }
        .checker-drift {
          animation: checkerDrift 12s linear infinite;
        }

        /* ── Smooth card transition ── */
        .game-card {
          transition: transform 0.25s ease-out, box-shadow 0.3s ease;
        }

        /* ── Scrollbar styling ── */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #070707; }
        ::-webkit-scrollbar-thumb { background: #262626; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #e21a22; }

        /* ── Smooth scroll ── */
        html { scroll-behavior: smooth; }
      `}} />

      {/* ── Particle Canvas ── */}
      <ParticleCanvas />

      {/* ── Animated Checkerboard Background ── */}
      <div
        className="absolute top-0 left-0 w-[calc(100%+96px)] h-[750px] pointer-events-none checker-drift"
        style={{
          ...patternStyle,
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)',
        }}
      />

      {/* ── Ambient red gradient ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#e21a22] rounded-full opacity-[0.03] blur-[150px] pointer-events-none" />

      {/* ── Navigation ── */}
      <nav
        className="w-full flex justify-between items-center px-8 md:px-[60px] py-6 z-10 max-w-[1920px]"
        style={{
          opacity: loaded ? 1 : 0,
          transform: loaded ? 'translateY(0)' : 'translateY(-30px)',
          transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
        }}
      >
        <div 
          onClick={() => {
            setCurrentView('home');
            setSelectedGameId(null);
          }}
          className="text-[32px] font-black tracking-[-0.03em] font-montserrat cursor-pointer hover:text-[#e21a22] transition-colors duration-300"
        >
          HAQIX
        </div>
        <div className="flex items-center gap-6 md:gap-10">
          <div className="hidden md:flex gap-10 text-[14px] text-[#a3a3a3] font-medium font-montserrat items-center">
            <button
              onClick={() => {
                setCurrentView('home');
                setSelectedGameId(null);
              }}
              className={`nav-link transition-colors duration-300 ${currentView === 'home' ? 'text-white' : 'hover:text-white'}`}
            >
              Strona główna
            </button>
            <a href="#" className="nav-link hover:text-white transition-colors duration-300">Torrenty</a>
            <a href="#" className="nav-link hover:text-white transition-colors duration-300">Kategorie</a>
            <a href="mailto:hxsupport@proton.me" className="nav-link hover:text-white transition-colors duration-300">Kontakt</a>
          </div>

          {/* Przycisk DODAJ GRĘ w nawigacji */}
          <button
            onClick={() => {
              setCurrentView('add-game');
              setSelectedGameId(null);
            }}
            className="flex items-center gap-2 bg-[#e21a22] hover:bg-[#ff2d35] text-white px-4 md:px-5 py-2.5 rounded-xl font-black font-montserrat text-xs md:text-sm tracking-wide transition-all shadow-lg shadow-red-950/40 hover:scale-105 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>DODAJ GRĘ</span>
          </button>
        </div>
      </nav>

      {/* ── Main Section ── */}
      <main className="flex-1 w-full max-w-[1240px] flex flex-col items-center z-10 px-6 pt-10 md:pt-16">
        
        {currentView === 'add-game' ? (
          /* ──────── ADD GAME PAGE ──────── */
          <AddGamePage onBack={() => setCurrentView('home')} />
        ) : selectedGameId === null ? (
          /* ──────── HOME PAGE ──────── */
          <>
            {/* Giant Logo with Glitch */}
            <h1
              className="glitch-wrapper text-[clamp(80px,15vw,230px)] leading-[0.8] font-black tracking-[-0.04em] font-montserrat mb-8 md:mb-12"
              data-text="HAQIX"
              style={{
                opacity: loaded ? 1 : 0,
                transform: loaded ? 'scale(1)' : 'scale(0.7)',
                transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s',
              }}
            >
              HAQIX
            </h1>

            {/* Subheadings */}
            <h2
              className="text-[clamp(24px,4vw,52px)] font-black tracking-tight leading-none mb-2 font-montserrat"
              style={{
                opacity: loaded ? 1 : 0,
                transform: loaded ? 'translateY(0)' : 'translateY(40px)',
                transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s',
              }}
            >
              TU ZNAJDZIESZ
            </h2>
            <h3
              className="text-[clamp(24px,4vw,52px)] font-black tracking-tight leading-none mb-12 md:mb-16 font-montserrat"
              style={{
                opacity: loaded ? 1 : 0,
                transform: loaded ? 'translateY(0)' : 'translateY(40px)',
                transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.75s',
              }}
            >
              TORRENTY GIER NA <span className="text-[#e21a22] red-glow">HAQIX</span>
            </h3>

            {/* Search Bar with animated border */}
            <div
              className="search-glow w-full max-w-[760px] flex items-stretch bg-[#111] rounded-xl overflow-hidden mb-12 shadow-2xl h-[60px] z-10"
              style={{
                opacity: loaded ? 1 : 0,
                transform: loaded ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
                transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.9s',
              }}
            >
              <input
                type="text"
                placeholder=""
                className="flex-1 bg-transparent text-[#e5e5e5] px-6 text-[16px] focus:outline-none placeholder-[#737373] font-medium w-full"
              />
              <button className="bg-[#e21a22] hover:bg-[#ff2d35] transition-all duration-300 w-[80px] flex items-center justify-center hover:w-[90px] group">
                <Search className="w-6 h-6 text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" strokeWidth={2.5} />
              </button>
            </div>

            {/* Typed placeholder overlay */}
            <div
              className="w-full max-w-[760px] relative -mt-[72px] mb-12 h-[60px] pointer-events-none z-20"
              style={{
                opacity: loaded ? 1 : 0,
                transition: 'opacity 0.5s ease 1.4s',
              }}
            >
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[#737373] font-medium text-[16px]">
                <TypedText text="Wyszukaj grę..." delay={1600} />
              </span>
            </div>

            {/* Actions bar: Most popular badge + Dodaj Grę button */}
            <div
              className="flex flex-wrap items-center justify-center gap-4 mb-10"
              style={{
                opacity: loaded ? 1 : 0,
                transform: loaded ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.9)',
                transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1) 1.1s',
              }}
            >
              <div className="flex items-center gap-3 bg-[#0d0d0d] border border-[#262626] rounded-xl px-6 py-3 shadow-md">
                <span className="fire-flicker inline-flex">
                  <Flame className="w-[18px] h-[18px] text-[#e21a22]" fill="#e21a22" strokeWidth={1.5} />
                </span>
                <span className="text-[13px] font-semibold tracking-wide text-[#d4d4d4] font-montserrat">
                  NAJPOPULARNIEJSZE TORRENTY
                </span>
              </div>

              <button
                onClick={() => {
                  setCurrentView('add-game');
                  setSelectedGameId(null);
                }}
                className="flex items-center gap-2.5 bg-[#181818] hover:bg-[#202020] border border-[#333] hover:border-[#e21a22] text-white rounded-xl px-6 py-3 shadow-md font-montserrat font-bold text-[13px] tracking-wide transition-all hover:scale-105 active:scale-95 group cursor-pointer"
              >
                <PlusCircle className="w-[18px] h-[18px] text-[#e21a22] group-hover:rotate-90 transition-transform duration-300" />
                <span>ZAPROPONUJ / DODAJ GRĘ</span>
              </button>
            </div>

            {/* Game Cards Grid */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5 pb-24">
              {games.map((game, index) => (
                <div
                  key={game.id}
                  onClick={() => {
                    if (game.id === 3) {
                      setSelectedGameId(3);
                      setCurrentView('game-detail');
                    }
                  }}
                  className="game-card relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#111] group cursor-pointer border border-[#1f1f1f] shadow-lg"
                  style={{
                    opacity: loaded ? 1 : 0,
                    transform: loaded ? 'translateY(0)' : 'translateY(60px)',
                    transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${1.3 + index * 0.12}s`,
                  }}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  <img
                    src={game.image}
                    alt={game.title}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-4">
                    <span className="font-montserrat font-bold text-sm text-white drop-shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      {game.title}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#e21a22] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </div>
              ))}
            </div>
          </>
        ) : (
          /* ──────── GAME DETAIL PAGE (RDR2) ──────── */
          <div className="w-full animate-[fadeIn_0.6s_ease-out]">
            {/* Back button */}
            <button
              onClick={() => {
                setSelectedGameId(null);
                setCurrentView('home');
              }}
              className="flex items-center gap-2 text-[#a3a3a3] hover:text-white transition-colors mb-8 group cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              <span className="font-montserrat font-medium text-sm">Wróć do listy</span>
            </button>

            {/* Banner Section */}
            <div className="relative w-full aspect-[21/9] rounded-3xl overflow-hidden border border-[#262626] mb-12 shadow-2xl group">
              <img
                src="https://images.igdb.com/igdb/image/upload/t_1080p/sc7xsk.jpg"
                alt="RDR2 Banner"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-transparent to-black/30" />
              
              <div className="absolute bottom-8 left-8 right-8">
                <div className="flex items-center gap-4 mb-4">
                  <span className="bg-[#e21a22] text-white px-3 py-1 rounded text-[10px] font-black tracking-widest uppercase">Ultimate Edition</span>
                  <div className="flex items-center gap-1 text-yellow-500">
                     {[...Array(5)].map((_, i) => <ShieldCheck key={i} className="w-4 h-4" fill="currentColor" />)}
                  </div>
                </div>
                <h2 className="text-[clamp(24px,5vw,56px)] font-black font-montserrat leading-tight drop-shadow-2xl">
                  Red Dead Redemption 2 <br /> <span className="text-[#e21a22]">Ultimate Edition</span>
                </h2>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid md:grid-cols-3 gap-12 mb-16">
              {/* Left Column: Title & Buttons */}
              <div className="md:col-span-2">
                <h1 className="text-2xl md:text-3xl font-black font-montserrat mb-6 leading-snug">
                  Red Dead Redemption 2: Ultimate Edition – Build 1491.50 + UE Unlocker + Bonus Content
                </h1>

                <div className="flex flex-wrap gap-4 mb-10">
                  <a
                    href={MAGNET_LINK}
                    className="flex items-center gap-3 bg-[#e21a22] hover:bg-[#ff2d35] text-white px-8 py-4 rounded-xl font-black font-montserrat transition-all hover:scale-105 active:scale-95 shadow-xl shadow-red-900/20"
                  >
                    <Download className="w-6 h-6" />
                    POBIERZ TORRENT
                  </a>
                  <a
                    href="https://www.qbittorrent.org/download"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-[#0056b3] hover:bg-[#007bff] text-white px-8 py-4 rounded-xl font-black font-montserrat transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-900/20"
                  >
                    <ExternalLink className="w-6 h-6" />
                    POBIERZ QBITTORRENT
                  </a>
                </div>

                <div className="space-y-6 text-[#a3a3a3] leading-relaxed text-lg font-medium">
                  <p>
                    Red Dead Redemption 2 to epicka opowieść o życiu w Ameryce u progu nowoczesności. Arthur Morgan i gang Van der Lindego to wyjęci spod prawa bandyci, którzy muszą uciekać przed stróżami prawa i łowcami nagród.
                  </p>
                  <p>
                    Aby przetrwać, muszą napadać, kraść i walczyć z przeciwnościami losu w samym sercu dzikiej Ameryki. Coraz głębsze wewnętrzne spory grożą rozłamem gangu, a Arthur musi dokonać wyboru między własnymi ideałami a lojalnością wobec ludzi, którzy go wychowali.
                  </p>
                  <p>
                    Wydanie Ultimate Edition oferuje całą zawartość trybu fabularnego z edycji Special Edition oraz dodatkowe bonusy do trybu online, w tym stroje, premie do rangi, konia kary kasztanowaty czystej krwi angielskiej i bezpłatny dostęp do dodatkowego uzbrojenia.
                  </p>
                </div>
              </div>

              {/* Right Column: Sidebar Info */}
              <div className="space-y-8">
                <div className="bg-[#111] border border-[#262626] rounded-2xl p-6 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#1a1a1a] rounded-lg flex items-center justify-center text-[#e21a22]">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#737373] uppercase font-bold tracking-widest">Data wydania</p>
                      <p className="font-bold">26 Października 2018</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#1a1a1a] rounded-lg flex items-center justify-center text-[#e21a22]">
                      <Info className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#737373] uppercase font-bold tracking-widest">Rozmiar pliku</p>
                      <p className="font-bold">119.2 GB</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#1a1a1a] rounded-lg flex items-center justify-center text-[#e21a22]">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#737373] uppercase font-bold tracking-widest">Status Cracka</p>
                      <p className="font-bold text-green-500">SPRAWDZONY / DZIAŁA</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#111] to-[#070707] border border-[#262626] rounded-2xl p-6">
                  <h4 className="font-black font-montserrat text-sm mb-4 uppercase tracking-wider">Wymagania systemowe</h4>
                  <ul className="text-xs space-y-3 text-[#737373] font-medium">
                    <li><strong className="text-white">OS:</strong> Windows 10 (64-bit)</li>
                    <li><strong className="text-white">CPU:</strong> Intel Core i7-4770K / AMD Ryzen 5 1500X</li>
                    <li><strong className="text-white">RAM:</strong> 12 GB</li>
                    <li><strong className="text-white">GPU:</strong> Nvidia GTX 1060 6GB / AMD RX 480 4GB</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer accent line */}
      <div
        className="w-full h-[2px] bg-gradient-to-r from-transparent via-[#e21a22] to-transparent opacity-30"
        style={{
          opacity: loaded ? 0.3 : 0,
          transition: 'opacity 1s ease 2.2s',
        }}
      />
    </div>
  );
}

export default App;
