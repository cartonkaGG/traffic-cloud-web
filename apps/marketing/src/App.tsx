import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Loader from './components/Loader';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Sources from './components/Sources';
import Stats from './components/Stats';
import ContactForm from './components/ContactForm';
import { ShieldCheck, Cpu, ArrowUp, Send, Check } from 'lucide-react';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('hero');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Intersection Observer to track active sections
  useEffect(() => {
    if (isLoading) return;

    const sections = ['hero', 'about', 'sources', 'stats', 'contact'];
    const observers = sections.map((secId) => {
      const el = document.getElementById(secId);
      if (!el) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(secId);
          }
        },
        {
          rootMargin: '-30% 0px -65% 0px', // Matches centered scroll visibility
        }
      );
      observer.observe(el);
      return { observer, el };
    });

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observers.forEach((obs) => {
        if (obs) obs.observer.unobserve(obs.el);
      });
    };
  }, [isLoading]);

  // Cyber 3D Space Background - Spawns floating particles
  useEffect(() => {
    if (isLoading) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle class containing positions & speed
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      maxAlpha: number;
      alpha: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.35;
        this.speedY = -Math.random() * 0.5 - 0.1; // Float upwards
        this.maxAlpha = Math.random() * 0.4 + 0.1;
        this.alpha = 0;
        
        const colors = [
          'rgba(99, 102, 241, ', // Indigo
          'rgba(59, 130, 246, ', // Blue
          'rgba(244, 63, 94, ',  // Rose
          'rgba(6, 182, 212, '   // Cyan
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Fade in gradually
        if (this.alpha < this.maxAlpha) {
          this.alpha += 0.01;
        }

        // Reset particle if it leaves bounds
        if (this.y < 0 || this.x < 0 || this.x > width) {
          this.x = Math.random() * width;
          this.y = height + 10;
          this.alpha = 0;
          this.size = Math.random() * 2 + 0.5;
          this.speedY = -Math.random() * 0.4 - 0.1;
        }
      }

      draw(context: CanvasRenderingContext2D) {
        context.shadowBlur = 6;
        context.shadowColor = 'rgba(99, 102, 241, 0.3)';
        context.fillStyle = `${this.color}${this.alpha})`;
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fill();
        context.shadowBlur = 0; // Reset shadow
      }
    }

    const particleCount = Math.min(60, Math.floor(width / 24));
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.update();
        p.draw(ctx);
      });
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isLoading]);

  const scrollToContact = () => {
    const contactSec = document.getElementById('contact');
    if (contactSec) {
      const headerOffset = 85;
      const elementPosition = contactSec.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {/* 1. Cyber Loader overlay */}
      <AnimatePresence mode="wait">
        {isLoading && (
          <div key="loader-wrapper">
            <Loader onComplete={() => setIsLoading(false)} />
          </div>
        )}
      </AnimatePresence>

      {/* Main content wrapper */}
      {!isLoading && (
        <div id="traffic-cloud-homepage" className="min-h-screen relative flex flex-col bg-gray-950 text-gray-100">
          
          {/* Transparent Canvas Particle layer */}
          <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0 opacity-80"
          />

          {/* 2. Scroll Active Header */}
          <Header onContactClick={scrollToContact} activeSection={activeSection} />

          {/* 3. Sections Container */}
          <main className="flex-grow relative z-10">
            {/* Hero Main visual panel */}
            <Hero onContactClick={scrollToContact} />
            
            {/* About us info panels */}
            <About />
            
            {/* Interactive Traffic channel selections and graphics */}
            <Sources />
            
            {/* Living dashboards graphs */}
            <Stats />
            
            {/* Verified lead form with LocalStorage feed logs */}
            <ContactForm />
          </main>

          {/* 4. Elegant footer */}
          <footer className="relative bg-gray-950 border-t border-gray-900 py-12 z-20 overflow-hidden">
            <div className="absolute inset-0 bg-radial-[circle_at_bottom,rgba(99,102,241,0.03)_10%,transparent_60%] pointer-events-none" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                
                {/* Brand Foot */}
                <div className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 glow-blue animate-pulse" />
                    <span className="font-sans font-extrabold text-white tracking-widest text-base">
                      TRAFFIC CLOUD
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-sans mt-2 max-w-sm">
                    Професійна закупівля медіа-трафіку для високого конверсійного ROI. 
                    Ми перетворюємо покази у стабільних лояльних покупців.
                  </p>
                </div>

                {/* Foot indicators */}
                <div className="md:col-span-4 flex flex-col items-center justify-center font-mono text-[10px] text-gray-500 gap-2">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                    <span>SYSTEM COMPLIANCE APPROVED</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-gray-600" />
                    <span>ENGINE VERSION: v1.4.2</span>
                  </div>
                </div>

                {/* Developer link or corporate credits */}
                <div className="md:col-span-3 flex flex-col items-center md:items-end text-center md:text-right">
                  <span className="text-xs text-gray-500 font-mono">TG HUB: @trafficcloud_team</span>
                  <p className="text-[10px] text-gray-600 font-sans mt-1">
                    © {new Date().getFullYear()} Traffic Cloud Team. All Rights Reserved.
                  </p>
                </div>

              </div>
            </div>
          </footer>

          {/* 5. Floating Quick Scroll to Top button */}
          <AnimatePresence>
            {showScrollTop && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                onClick={scrollToTop}
                className="fixed bottom-6 right-6 z-30 p-3 rounded-full bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-white shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="Нагору"
              >
                <ArrowUp className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>

        </div>
      )}
    </>
  );
}
