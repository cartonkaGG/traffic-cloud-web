import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Cloud, Radio, Sparkles } from 'lucide-react';

export default function CloudLogo3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  // Set up motion values for mouse mapping (for 3D tilt action)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth out the motion values with spring physics
  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [15, -15]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-15, 15]), springConfig);
  
  // Parallax shifts for child layers (gives deep 3D sensation)
  const childX = useSpring(useTransform(x, [-0.5, 0.5], [-20, 20]), springConfig);
  const childY = useSpring(useTransform(y, [-0.5, 0.5], [-20, 20]), springConfig);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Normalize mouse coords to range [-0.5, 0.5]
    const mouseX = (event.clientX - rect.left) / width - 0.5;
    const mouseY = (event.clientY - rect.top) / height - 0.5;
    
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 800);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className="relative w-full max-w-lg aspect-square flex items-center justify-center cursor-pointer select-none perspective-800"
    >
      {/* 3D Wrapper Layer */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        animate={{
          y: isHovered ? [0, -10, 0] : [0, -15, 0],
        }}
        transition={{
          y: {
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
        className="relative w-[320px] h-[320px] md:w-[400px] md:h-[400px] flex items-center justify-center"
      >
        {/* Dynamic Energy Ring Backdrop */}
        <motion.div
          animate={{
            rotate: 360,
            scale: isHovered ? [1.1, 1.15, 1.1] : [1, 1.05, 1],
          }}
          transition={{
            rotate: { duration: 25, repeat: Infinity, ease: 'linear' },
            scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="absolute inset-0 rounded-full border border-dashed border-indigo-500/30 bg-radial-[circle_at_center,rgba(99,102,241,0.06)_10%,transparent_70%]"
        />

        {/* Ambient Glows Layer 1 (Purple-Pink Glow) */}
        <div className="absolute w-[250px] h-[250px] bg-gradient-to-tr from-purple-600/30 to-pink-600/20 rounded-full blur-[60px] opacity-70 glow-purple" />
        
        {/* Ambient Glows Layer 2 (Blue-Cyan Glow) */}
        <div className="absolute w-[200px] h-[200px] bg-gradient-to-bl from-blue-600/30 to-cyan-500/20 rounded-full blur-[50px] opacity-70 glow-blue translate-x-10 translate-y-10" />

        {/* Floating Data Flow Nodes (Representing active leads / visitor flow entering the Cloud) */}
        {[...Array(6)].map((_, i) => {
          const delay = i * 0.7;
          const initialAngle = (i * 60 * Math.PI) / 180;
          return (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0.8, 1.1, 0.8],
                opacity: [0.2, 0.8, 0.2],
                x: [
                  Math.cos(initialAngle) * 110,
                  Math.cos(initialAngle) * 50,
                  Math.cos(initialAngle) * 20,
                ],
                y: [
                  Math.sin(initialAngle) * 110,
                  Math.sin(initialAngle) * 50,
                  Math.sin(initialAngle) * 20,
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: delay,
                ease: 'easeInOut',
              }}
              style={{ translateZ: '30px' }}
              className={`absolute w-3 h-3 rounded-full ${
                i % 3 === 0 
                  ? 'bg-rose-500 glow-rose' 
                  : i % 3 === 1 
                    ? 'bg-blue-400 glow-blue' 
                    : 'bg-cyan-400 glow-cyan'
              }`}
            />
          );
        })}

        {/* Layered Interactive 3D Cloud SVG */}
        <motion.div
          style={{
            x: childX,
            y: childY,
            translateZ: '60px',
            transformStyle: 'preserve-3d',
          }}
          className="relative z-20 flex items-center justify-center drop-shadow-[0_20px_50px_rgba(99,102,241,0.25)]"
        >
          {/* Main Visual SVG Cloud Object */}
          <svg
            viewBox="0 0 200 130"
            className="w-[260px] md:w-[320px] h-auto pointer-events-none drop-shadow-[0_0_20px_rgba(59,130,246,0.35)]"
          >
            <defs>
              <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.9" /> {/* Indigo-950 */}
                <stop offset="50%" stopColor="#0f172a" stopOpacity="0.85" /> {/* Slate-900 */}
                <stop offset="100%" stopColor="#1e1a3a" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" /> {/* Indigo-500 */}
                <stop offset="50%" stopColor="#f43f5e" /> {/* Rose-500 */}
                <stop offset="100%" stopColor="#06b6d4" /> {/* Cyan-500 */}
              </linearGradient>
              <filter id="neonShadow">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Glowing Cloud Border Layer (Backside) */}
            <motion.path
              d="M150 45a45 45 0 0 0-82.5-18A35 35 0 0 0 35 60a35 35 0 0 0 2.5 13.1A30 30 0 0 0 30 90a30 30 0 0 0 30 30h90a40 40 0 0 0 40-40 40 40 40 0 0 0-40-35z"
              fill="none"
              stroke="url(#glowGrad)"
              strokeWidth={isHovered ? "4" : "2"}
              filter="url(#neonShadow)"
              initial={{ pathLength: 0.9, strokeDashoffset: 0 }}
              animate={{
                strokeDashoffset: [0, 100],
                opacity: isHovered ? 1 : 0.8,
              }}
              transition={{
                strokeDashoffset: { duration: 15, repeat: Infinity, ease: 'linear' },
              }}
            />

            {/* Main Filled Cloud Shape */}
            <path
              d="M150 45a45 45 0 0 0-82.5-18A35 35 0 0 0 35 60a35 35 0 0 0 2.5 13.1A30 30 0 0 0 30 90a30 30 0 0 0 30 30h90a40 40 0 0 0 40-40 40 40 40 0 0 0-40-35z"
              fill="url(#cloudGrad)"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1.5"
            />

            {/* Inner Futuristic Cyber Circuits inside the Cloud */}
            <motion.path
              d="M 60,60 L 90,60 L 105,80 L 140,80"
              fill="none"
              stroke="rgba(99, 102, 241, 0.4)"
              strokeWidth="2"
              strokeDasharray="4 4"
              animate={{
                strokeDashoffset: [-20, 20],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            <motion.path
              d="M 75,40 L 100,40 L 115,55 L 145,55"
              fill="none"
              stroke="rgba(244, 63, 94, 0.4)"
              strokeWidth="2"
              strokeDasharray="5 3"
              animate={{
                strokeDashoffset: [20, -20],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'linear',
              }}
            />

            {/* Central energy junctions */}
            <circle cx="90" cy="60" r="3" fill="#6366f1" className="glow-blue" />
            <circle cx="105" cy="80" r="3.5" fill="#f43f5e" className="glow-rose" />
            <circle cx="115" cy="55" r="3" fill="#06b6d4" className="glow-cyan" />
          </svg>

          {/* Interactive Cloud Logo text inside the center of the cloud (floating on Z pane) */}
          <div 
            style={{ transform: 'translateZ(30px)' }}
            className="absolute flex flex-col items-center justify-center text-center select-none pointer-events-none"
          >
            <motion.div
              animate={{
                y: [0, -3, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="flex items-center gap-1.5"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 glow-cyan animate-pulse" />
              <span className="text-[10px] tracking-[0.25em] font-mono text-cyan-400 font-semibold uppercase">
                HUB CONNECTED
              </span>
            </motion.div>
            <div className="font-sans font-extrabold text-[15px] md:text-lg tracking-wider text-white mt-1 bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-300">
              TRAFFIC CLOUD
            </div>
          </div>
        </motion.div>

        {/* Dynamic click shockwave element inside */}
        {isClicked && (
          <motion.div
            initial={{ scale: 0.5, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute z-30 w-[200px] h-[200px] rounded-full border-2 border-indigo-400/40 bg-indigo-500/5 glow-blue"
          />
        )}

        {/* Extra floating telemetry on front Z pane */}
        <motion.div
          style={{
            x: childX,
            y: childY,
            translateZ: '90px',
          }}
          className="absolute -bottom-8 pointer-events-none flex items-center gap-2 px-3 py-1 bg-gray-900/80 border border-gray-800 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.5)] whitespace-nowrap text-xs font-mono"
        >
          <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
          <span className="text-gray-300">Прямий потік:</span>
          <span className="text-indigo-400 font-bold tracking-tight">
            {isHovered ? '24,540 clicks/m' : '15,820 clicks/m'}
          </span>
        </motion.div>

        <motion.div
          style={{
            x: childX,
            y: childY,
            translateZ: '80px',
          }}
          className="absolute -top-10 pointer-events-none flex items-center gap-1.5 px-3 py-0.5 bg-gray-900/80 border border-gray-800 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.5)] text-[10px] font-mono text-gray-400"
        >
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>ROI:</span>
          <span className="text-emerald-400 font-bold">145% - 210%</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
