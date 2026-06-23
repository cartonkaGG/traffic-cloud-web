import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, MessageSquareCode, BarChart3, Link2, Shield } from 'lucide-react';
import TrafficCloudMark from './brand/TrafficCloudMark';
import { FEATURES } from '../config/features';
import { usePanelAdmin } from '../lib/usePanelAdmin';
import { openPanelFromSite } from '../lib/openPanel';
import SiteAuthMenu from './SiteAuthMenu';

interface HeaderProps {
  onContactClick: () => void;
  activeSection: string;
}

const PANEL_OFFERS = '/app/affiliate/offers';
const PANEL_STATS = '/app/affiliate/stats';

export default function Header({ onContactClick, activeSection }: HeaderProps) {
  const { isAdmin } = usePanelAdmin();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const affiliate = FEATURES.affiliateOnlyMode;

  const navItems = affiliate
    ? [
        { name: 'Головна', id: 'hero', href: null as string | null },
        { name: 'Офери', id: 'offers', href: PANEL_OFFERS },
        { name: 'Статистика', id: 'stats', href: PANEL_STATS },
        { name: 'Контакти', id: 'contact', href: null }
      ]
    : [
        { name: 'Головна', id: 'hero', href: null },
        { name: 'Можливості', id: 'about', href: null },
        { name: 'Pro', id: 'pricing', href: null },
        { name: 'Контакти', id: 'contact', href: null }
      ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsOpen(false);
    const element = document.getElementById(id);
    if (!element) return;
    const headerOffset = 80;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
  };

  const handleNav = (item: (typeof navItems)[number]) => {
    if (item.href) {
      setIsOpen(false);
      window.location.assign(item.href);
      return;
    }
    scrollToSection(item.id);
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

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              const isPanelLink = Boolean(item.href);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNav(item)}
                  className={`relative px-4 py-2 text-sm font-medium tracking-wide transition-colors ${
                    isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                  } ${isPanelLink ? 'text-emerald-300/90 hover:text-emerald-200' : ''}`}
                >
                  {isActive && !isPanelLink && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 rounded-lg bg-gray-800/40 border border-gray-800"
                      transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {item.id === 'offers' ? <Link2 className="h-3.5 w-3.5" /> : null}
                    {item.id === 'stats' ? <BarChart3 className="h-3.5 w-3.5" /> : null}
                    {item.name}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {isAdmin ? (
              <button
                type="button"
                onClick={() => openPanelFromSite('admin')}
                className="px-4 py-2.5 rounded-lg text-xs font-medium tracking-wider uppercase border border-amber-500/40 text-amber-100 hover:text-white hover:border-amber-400/60 hover:bg-amber-950/40 transition-all flex items-center gap-2"
              >
                <Shield className="w-4 h-4 text-amber-300" />
                <span>Адмін</span>
              </button>
            ) : null}
            {affiliate ? <SiteAuthMenu /> : (
              <a
                href="/app/auth"
                className="relative overflow-hidden shimmer-btn bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium text-xs tracking-wider px-5 py-2.5 rounded-lg uppercase"
              >
                Увійти
              </a>
            )}
          </div>

          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 hover:text-white cursor-pointer touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

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
                    type="button"
                    onClick={() => handleNav(item)}
                    className={`text-left px-4 py-3 rounded-lg text-sm font-medium tracking-wide border transition-all ${
                      activeSection === item.id
                        ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                        : 'border-transparent text-gray-400 hover:bg-gray-900 hover:text-white'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>

              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    openPanelFromSite('admin');
                  }}
                  className="w-full py-3 rounded-lg text-amber-100 font-medium text-sm text-center flex items-center justify-center gap-2 border border-amber-500/40 bg-amber-950/30 uppercase"
                >
                  <Shield className="w-4 h-4 text-amber-300" />
                  <span>Адмін</span>
                </button>
              ) : null}

              <div className="pt-1">
                <SiteAuthMenu />
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onContactClick();
                }}
                className="w-full py-3 rounded-lg text-white font-medium text-sm text-center flex items-center justify-center gap-2 border border-gray-700 bg-gray-900 uppercase"
              >
                <MessageSquareCode className="w-4 h-4" />
                <span>Telegram</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
