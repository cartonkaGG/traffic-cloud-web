import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cloud, Menu, X, ArrowUpRight, MessageSquareCode, LayoutDashboard } from 'lucide-react';

const PANEL_HREF = '/app/';

interface HeaderProps {
  onContactClick: () => void;
  activeSection: string;
}

export default function Header({ onContactClick, activeSection }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navItems = [
    { name: 'Головна', id: 'hero' },
    { name: 'Можливості', id: 'about' },
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
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-gray-950/75 backdrop-blur-md border-b border-gray-800/60 py-3 shadow-lg'
            : 'bg-transparent py-5 border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Logo Brand Brand */}
          <div 
            onClick={() => scrollToSection('hero')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-md rounded-full group-hover:bg-blue-500/40 transition-all" />
              <Cloud className="w-8 h-8 text-blue-400 relative z-10 transition-transform duration-300 group-hover:scale-110" />
            </div>
            <div className="flex flex-col">
              <span className="font-sans font-extrabold text-sm md:text-base tracking-widest text-white leading-tight">
                TRAFFIC CLOUD
              </span>
              <span className="font-mono text-[9px] text-gray-500 tracking-wider">
                MEDIA BUYING HUB
              </span>
            </div>
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
            <a
              href={PANEL_HREF}
              className="px-4 py-2.5 rounded-lg text-xs font-medium tracking-wider uppercase border border-gray-700 text-gray-300 hover:text-white hover:border-gray-600 hover:bg-gray-900/80 transition-all flex items-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4 text-blue-400" />
              <span>Увійти</span>
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
              className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 hover:text-white cursor-pointer"
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
            className="fixed inset-x-0 top-16 z-35 md:hidden bg-gray-950/95 border-b border-gray-800/80 backdrop-blur-lg shadow-2xl"
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
              
              <a
                href={PANEL_HREF}
                onClick={() => setIsOpen(false)}
                className="w-full py-3 rounded-lg text-white font-medium text-sm text-center flex items-center justify-center gap-2 border border-gray-700 bg-gray-900 uppercase"
              >
                <LayoutDashboard className="w-4 h-4 text-blue-400" />
                <span>Увійти в панель</span>
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
