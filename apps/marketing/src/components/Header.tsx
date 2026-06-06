import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ArrowUpRight, MessageSquareCode, LayoutDashboard, Shield } from 'lucide-react';
import TrafficCloudMark from './brand/TrafficCloudMark';
import { usePanelAdmin } from '../lib/usePanelAdmin';

const PANEL_HREF = '/app/';
const ADMIN_HREF = '/app/admin';

interface HeaderProps {
  onContactClick: () => void;
  activeSection: string;
}

export default function Header({ onContactClick, activeSection }: HeaderProps) {
  const { isAdmin } = usePanelAdmin();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navItems = [
    { name: 'Головна', id: 'hero' },
    { name: 'Можливості', id: 'about' },
    { name: 'Pro', id: 'pricing' },
    { name: 'Контакти', id: 'contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 pt-[env(safe-area-inset-top)] ${
          scrolled
            ? 'bg-gray-950/95 md:bg-gray-950/75 md:backdrop-blur-md border-b border-gray-800/60 py-3 shadow-lg'
            : 'bg-transparent py-4 sm:py-5 border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Logo Brand Brand */}
          <div 
            onClick={() => scrollToSection('hero')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="relative w-9 h-9 flex items-center justify-center overflow-visible">
              <TrafficCloudMark size={32} variant="logo" />
            </div>
            <span className="font-sans font-extrabold text-sm md:text-base tracking-widest text-white leading-tight">
              TRAFFIC CLOUD
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`relative px-4 py-2 text-sm font-medium tracking-wide transition-colors ${
                    isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 rounded-lg bg-gray-800/40 border border-gray-800"
                      transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                    />
                  )}
                  <span className="relative z-10">{item.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="hidden md:flex items-center gap-3">
            {isAdmin ? (
              <a
                href={ADMIN_HREF}
                className="px-4 py-2.5 rounded-lg text-xs font-medium tracking-wider uppercase border border-amber-500/40 text-amber-100 hover:text-white hover:border-amber-400/60 hover:bg-amber-950/40 transition-all flex items-center gap-2"
              >
                <Shield className="w-4 h-4 text-amber-300" />
                <span>Адмін-панель</span>
              </a>
            ) : null}
            <a
              href={PANEL_HREF}
              className="px-4 py-2.5 rounded-lg text-xs font-medium tracking-wider uppercase border border-gray-700 text-gray-300 hover:text-white hover:border-gray-600 hover:bg-gray-900/80 transition-all flex items-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4 text-blue-400" />
              <span>{isAdmin ? 'Панель' : 'Увійти'}</span>
            </a>
            <button
              onClick={onContactClick}
              className="relative overflow-hidden shimmer-btn bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs tracking-wider px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-[0_4px_20px_rgba(59,130,246,0.25)] hover:shadow-[0_4px_25px_rgba(59,130,246,0.35)] transition-all cursor-pointer group uppercase"
            >
              <span>Почати Співпрацю</span>
              <ArrowUpRight className="w-4 h-4 text-blue-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>

          {/* Mobile hamburger menu */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 hover:text-white cursor-pointer touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav Drawer overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-x-0 top-[calc(4rem+env(safe-area-inset-top))] z-40 md:hidden bg-gray-950/98 border-b border-gray-800/80 shadow-2xl"
          >
            <div className="px-5 pt-3 pb-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`text-left px-4 py-3 rounded-lg text-sm font-medium tracking-wide border transition-all ${
                      activeSection === item.id
                        ? 'bg-blue-950/40 border-blue-800 text-blue-400'
                        : 'border-transparent text-gray-400 hover:bg-gray-900 hover:text-white'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
              
              {isAdmin ? (
                <a
                  href={ADMIN_HREF}
                  onClick={() => setIsOpen(false)}
                  className="w-full py-3 rounded-lg text-amber-100 font-medium text-sm text-center flex items-center justify-center gap-2 border border-amber-500/40 bg-amber-950/30 uppercase"
                >
                  <Shield className="w-4 h-4 text-amber-300" />
                  <span>Адмін-панель</span>
                </a>
              ) : null}
              <a
                href={PANEL_HREF}
                onClick={() => setIsOpen(false)}
                className="w-full py-3 rounded-lg text-white font-medium text-sm text-center flex items-center justify-center gap-2 border border-gray-700 bg-gray-900 uppercase"
              >
                <LayoutDashboard className="w-4 h-4 text-blue-400" />
                <span>{isAdmin ? 'Панель' : 'Увійти в панель'}</span>
              </a>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onContactClick();
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 py-3 rounded-lg text-white font-medium text-sm text-center flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(59,130,246,0.2)] uppercase"
              >
                <MessageSquareCode className="w-4 h-4" />
                <span>Зв'язатись у Telegram</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
