import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Loader from './components/Loader';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import ContactForm from './components/ContactForm';
import ScrollProgressBar from './components/ScrollProgressBar';
import { ScrollReveal } from './components/ScrollReveal';
import { ArrowUp } from 'lucide-react';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('hero');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isLoading) return;

    const sections = ['hero', 'about', 'contact'];
    const observers = sections.map((secId) => {
      const el = document.getElementById(secId);
      if (!el) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(secId);
          }
        },
        { rootMargin: '-30% 0px -65% 0px' }
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

  useEffect(() => {
    if (isLoading) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let lastFrame = 0;
    const frameInterval = 1000 / 24;

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
        this.size = Math.random() * 1.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.25;
        this.speedY = -Math.random() * 0.35 - 0.08;
        this.maxAlpha = Math.random() * 0.35 + 0.08;
        this.alpha = Math.random() * this.maxAlpha;
        const colors = ['rgba(59, 130, 246, ', 'rgba(6, 182, 212, '];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.alpha < this.maxAlpha) this.alpha += 0.008;
        if (this.y < 0 || this.x < 0 || this.x > width) {
          this.x = Math.random() * width;
          this.y = height + 10;
          this.alpha = 0;
        }
      }

      draw(context: CanvasRenderingContext2D) {
        context.fillStyle = `${this.color}${this.alpha})`;
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fill();
      }
    }

    const count = Math.min(28, Math.floor(width / 40));
    const particles: Particle[] = Array.from({ length: count }, () => new Particle());

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const render = (time: number) => {
      animationFrameId = requestAnimationFrame(render);
      if (document.hidden) return;
      if (time - lastFrame < frameInterval) return;
      lastFrame = time;
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.update();
        p.draw(ctx);
      });
    };
    animationFrameId = requestAnimationFrame(render);

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
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <div key="loader-wrapper">
            <Loader onComplete={() => setIsLoading(false)} />
          </div>
        )}
      </AnimatePresence>

      {!isLoading && (
        <div id="traffic-cloud-homepage" className="min-h-screen relative flex flex-col bg-gray-950 text-gray-100">
          <ScrollProgressBar />
          <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-50" />

          <Header onContactClick={scrollToContact} activeSection={activeSection} />

          <main className="flex-grow relative z-10">
            <Hero onContactClick={scrollToContact} />
            <About />
            <ContactForm />
          </main>

          <footer className="relative bg-gray-950 border-t border-gray-900 py-12 z-20 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
              <ScrollReveal variant="up" amount={0.25}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <span className="font-sans font-extrabold text-white tracking-widest text-base">
                      TRAFFIC CLOUD
                    </span>
                    <p className="text-xs text-gray-500 font-sans mt-2 max-w-md">
                      Панель для Telegram outreach: акаунти, джерела, кампанії та аналітика.
                    </p>
                  </div>
                  <p className="text-[10px] text-gray-600 font-sans">
                    © {new Date().getFullYear()} Traffic Cloud
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </footer>

          <AnimatePresence>
            {showScrollTop && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="fixed bottom-6 right-6 z-30 p-3 rounded-full bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-white shadow-xl cursor-pointer"
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
