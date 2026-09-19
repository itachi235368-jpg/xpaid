import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

interface FloatingCoinData {
  id: string;
  name: string;
  symbol: string;
  image: string;
  xPct: number; // 0 to 100
  yPct: number; // 0 to 100
  size: number; // px size
  floatDuration: number; // seconds
  floatDelay: number;
  rotationRange: number;
  depth: number; // 0.2 to 1.0 (for parallax speed & blur)
  colorRing: string;
  glowColor: string;
  sparkle?: boolean;
}

const FLOATING_COINS: FloatingCoinData[] = [
  {
    id: 'coin-paid',
    name: 'PAID Protocol',
    symbol: 'PAID',
    image: 'https://gateway.pinata.cloud/ipfs/QmRZzpB9Dawb6QrJBJKW1NqtrYo25eAaEf6nY2Q3aZdRZ4',
    xPct: 12,
    yPct: 22,
    size: 64,
    floatDuration: 6.5,
    floatDelay: 0,
    rotationRange: 15,
    depth: 0.9,
    colorRing: 'border-emerald-500/60 ring-emerald-500/20',
    glowColor: 'rgba(16, 185, 129, 0.35)',
    sparkle: true,
  },
  {
    id: 'coin-pepe',
    name: 'Pepe Solana',
    symbol: 'PEPE4X',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=160&auto=format&fit=crop&q=80',
    xPct: 84,
    yPct: 18,
    size: 58,
    floatDuration: 7.2,
    floatDelay: 1.2,
    rotationRange: 20,
    depth: 0.85,
    colorRing: 'border-green-500/60 ring-green-500/20',
    glowColor: 'rgba(34, 197, 94, 0.3)',
  },
  {
    id: 'coin-sol',
    name: 'Solana',
    symbol: 'SOL',
    image: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
    xPct: 8,
    yPct: 68,
    size: 52,
    floatDuration: 5.8,
    floatDelay: 0.8,
    rotationRange: 12,
    depth: 0.7,
    colorRing: 'border-purple-500/60 ring-purple-500/20',
    glowColor: 'rgba(168, 85, 247, 0.3)',
    sparkle: true,
  },
  {
    id: 'coin-mars',
    name: 'SpaceX Martian',
    symbol: 'MARS',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=160&auto=format&fit=crop&q=80',
    xPct: 88,
    yPct: 62,
    size: 60,
    floatDuration: 8.0,
    floatDelay: 2.1,
    rotationRange: 18,
    depth: 0.8,
    colorRing: 'border-amber-500/60 ring-amber-500/20',
    glowColor: 'rgba(245, 158, 11, 0.3)',
  },
  {
    id: 'coin-doge',
    name: 'Cyber Doge',
    symbol: 'DOGE',
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=160&auto=format&fit=crop&q=80',
    xPct: 22,
    yPct: 84,
    size: 46,
    floatDuration: 6.2,
    floatDelay: 1.5,
    rotationRange: 22,
    depth: 0.6,
    colorRing: 'border-yellow-500/50 ring-yellow-500/20',
    glowColor: 'rgba(234, 179, 8, 0.25)',
  },
  {
    id: 'coin-usdc',
    name: 'USD Coin',
    symbol: 'USD',
    image: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
    xPct: 76,
    yPct: 82,
    size: 48,
    floatDuration: 7.5,
    floatDelay: 0.4,
    rotationRange: 14,
    depth: 0.65,
    colorRing: 'border-blue-500/60 ring-blue-500/20',
    glowColor: 'rgba(59, 130, 246, 0.25)',
    sparkle: true,
  },
  {
    id: 'coin-xmoney',
    name: '𝕏 Money Settlement',
    symbol: '𝕏',
    image: 'https://pbs.twimg.com/profile_images/1838634862464733184/pXj9iWd0_400x400.jpg',
    xPct: 50,
    yPct: 8,
    size: 42,
    floatDuration: 9.0,
    floatDelay: 1.8,
    rotationRange: 10,
    depth: 0.5,
    colorRing: 'border-zinc-500/40 ring-zinc-500/20',
    glowColor: 'rgba(255, 255, 255, 0.2)',
  }
];

interface FloatingCoinsBackgroundProps {
  interactive?: boolean;
}

export const FloatingCoinsBackground: React.FC<FloatingCoinsBackgroundProps> = ({
  interactive = true,
}) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      // Normalized between -1 and 1
      const nx = (e.clientX / innerWidth - 0.5) * 2;
      const ny = (e.clientY / innerHeight - 0.5) * 2;
      setMousePos({ x: nx, y: ny });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [interactive]);

  return (
    <div 
      ref={containerRef}
      className="pointer-events-none fixed inset-0 overflow-hidden z-0 select-none"
      aria-hidden="true"
    >
      {/* Subtle radial ambient light gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-b from-emerald-500/8 via-transparent to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl" />
      <div className="absolute top-20 right-10 w-[450px] h-[450px] bg-blue-500/5 rounded-full blur-3xl" />

      {/* Floating Coins Layer */}
      {FLOATING_COINS.map((coin) => {
        const parallaxX = mousePos.x * 28 * coin.depth;
        const parallaxY = mousePos.y * 28 * coin.depth;

        return (
          <motion.div
            key={coin.id}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{
              opacity: [0.65, 0.95, 0.75, 0.65],
              scale: [1, 1.05, 0.98, 1],
              y: ['-18px', '18px', '-14px', '-18px'],
              x: ['-10px', '12px', '-8px', '-10px'],
              rotate: [-coin.rotationRange, coin.rotationRange, -coin.rotationRange * 0.5, -coin.rotationRange],
            }}
            transition={{
              duration: coin.floatDuration,
              delay: coin.floatDelay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              left: `${coin.xPct}%`,
              top: `${coin.yPct}%`,
              transform: `translate(${parallaxX}px, ${parallaxY}px)`,
              filter: `drop-shadow(0 12px 24px ${coin.glowColor})`,
            }}
            className="absolute hidden sm:flex flex-col items-center group pointer-events-auto cursor-pointer transition-transform duration-300 hover:scale-125"
          >
            {/* 3D Realistic Coin Body */}
            <div 
              style={{ width: `${coin.size}px`, height: `${coin.size}px` }}
              className={`relative rounded-full p-1 bg-gradient-to-b from-white/20 via-zinc-900/90 to-zinc-950 border-2 ${coin.colorRing} ring-4 shadow-2xl backdrop-blur-md flex items-center justify-center overflow-hidden transition-all`}
            >
              {/* Coin Metallic Bevel & Specular Highlight */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/30 via-transparent to-black/40 pointer-events-none" />
              
              {/* Coin Inner Image */}
              <img
                src={coin.image}
                alt={coin.name}
                className="w-full h-full object-cover rounded-full pointer-events-none select-none"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback to placeholder if token logo fails
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80';
                }}
              />

              {/* Sparkle Glint */}
              {coin.sparkle && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-75" />
              )}
            </div>

            {/* Floating Mini Pill Tag */}
            <div className="mt-1.5 px-2 py-0.5 rounded-full bg-zinc-900/90 dark:bg-zinc-950/90 border border-zinc-700/60 dark:border-zinc-800 text-[10px] font-mono font-bold text-zinc-300 dark:text-zinc-200 shadow-md backdrop-blur-xs flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
              <span className="text-emerald-400 font-bold">$</span>
              <span>{coin.symbol}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
