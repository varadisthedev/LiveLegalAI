import React, { useEffect, useRef } from 'react';
import { motion, useAnimation, animate } from 'framer-motion';

/* ─── Micro-particle data ─────────────────────────────────────── */
const PARTICLES = [
  { id: 0,  label: 'AI',    x: '-14%', y: '12%',  size: 36, delay: 0,    dur: 6   },
  { id: 1,  label: '⚖',    x: '108%', y: '8%',   size: 32, delay: 0.8,  dur: 7   },
  { id: 2,  label: '§',     x: '-8%',  y: '78%',  size: 28, delay: 1.4,  dur: 5.5 },
  { id: 3,  label: '✦',    x: '112%', y: '72%',  size: 22, delay: 0.4,  dur: 8   },
  { id: 4,  label: '◈',    x: '50%',  y: '-10%', size: 18, delay: 2,    dur: 6.5 },
  { id: 5,  label: '⬡',    x: '20%',  y: '108%', size: 16, delay: 1,    dur: 7.5 },
  { id: 6,  label: '·',    x: '90%',  y: '40%',  size: 14, delay: 1.6,  dur: 5   },
  { id: 7,  label: '·',    x: '-4%',  y: '45%',  size: 12, delay: 2.2,  dur: 6   },
];

/* ─── Document text-line rows ─────────────────────────────────── */
const DOC_LINES = [
  { w: '82%', opacity: 0.9 },
  { w: '95%', opacity: 0.7 },
  { w: '68%', opacity: 0.85},
  { w: '90%', opacity: 0.7 },
  { w: '74%', opacity: 0.9 },
  { w: '88%', opacity: 0.65},
  { w: '60%', opacity: 0.8 },
  { w: '93%', opacity: 0.7 },
  { w: '72%', opacity: 0.85},
];

/* ─── Stat chip data ──────────────────────────────────────────── */
const STATS = [
  { label: 'CLAUSE ANALYSIS', value: '98.5%', color: '#10B981', dot: '#34d399' },
  { label: 'RISK FACTORS',    value: 'Minimal', color: '#3A86FF', dot: '#60a5fa' },
  { label: 'AI SUGGESTION',   value: 'Ready',   color: '#9333ea', dot: '#c084fc' },
];

/* ──────────────────────────────────────────────────────────────── */
export default function HeroLegalScanner3D() {
  return (
    <div className="w-full h-[500px] sm:h-[580px] relative select-none" style={{ perspective: '900px' }}>

      {/* ── Ambient glow behind everything ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 55% 50%, rgba(124,58,237,0.18) 0%, transparent 70%)',
        }}
      />

      {/* ── Floating micro-particles ── */}
      {PARTICLES.map(p => (
        <motion.div
          key={p.id}
          className="absolute z-20 font-mono font-bold pointer-events-none"
          style={{
            left: p.x,
            top:  p.y,
            fontSize: p.size,
            color: p.id % 2 === 0 ? 'rgba(147,51,234,0.75)' : 'rgba(58,134,255,0.65)',
            textShadow: p.id % 2 === 0
              ? '0 0 12px rgba(147,51,234,0.8)'
              : '0 0 12px rgba(58,134,255,0.8)',
            filter: 'blur(0px)',
          }}
          animate={{
            y: [0, -14, 6, -8, 0],
            opacity: [0.6, 1, 0.5, 0.9, 0.6],
            rotate: [0, 8, -4, 6, 0],
          }}
          transition={{
            duration: p.dur,
            delay:    p.delay,
            repeat:   Infinity,
            ease:     'easeInOut',
          }}
        >
          {p.label}
        </motion.div>
      ))}

      {/* ── Main 3-D document stack wrapper ── */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div
          className="relative"
          style={{
            width: 'min(340px, 82vw)',
            height: 'min(430px, 80vw)',
            transform: 'rotateX(10deg) rotateY(-12deg)',
            transformStyle: 'preserve-3d',
          }}
        >

          {/* ── Layer 3 — deepest shadow sheet ── */}
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              transform: 'translateZ(-36px) translateX(18px) translateY(18px)',
              background: 'linear-gradient(145deg, rgba(58,134,255,0.08), rgba(147,51,234,0.06))',
              border: '1px solid rgba(58,134,255,0.12)',
              backdropFilter: 'blur(6px)',
              boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
              borderRadius: '16px',
            }}
          />

          {/* ── Layer 2 — mid glass sheet ── */}
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              transform: 'translateZ(-18px) translateX(9px) translateY(9px)',
              background: 'linear-gradient(145deg, rgba(124,58,237,0.12), rgba(58,134,255,0.08))',
              border: '1px solid rgba(147,51,234,0.20)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(147,51,234,0.08)',
              borderRadius: '16px',
            }}
          />

          {/* ── Layer 1 — primary glass document ── */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden"
            style={{
              transform: 'translateZ(0px)',
              background: 'linear-gradient(160deg, rgba(18,8,40,0.92) 0%, rgba(11,5,26,0.96) 100%)',
              border: '1px solid rgba(147,51,234,0.35)',
              backdropFilter: 'blur(20px)',
              boxShadow: `
                0 0 0 1px rgba(58,134,255,0.15),
                0 0 40px rgba(147,51,234,0.25),
                0 24px 80px rgba(0,0,0,0.7),
                inset 0 1px 0 rgba(255,255,255,0.06)
              `,
            }}
          >
            {/* ── Corner accent ── */}
            <div
              className="absolute top-0 right-0 w-10 h-10"
              style={{
                background: 'linear-gradient(225deg, rgba(58,134,255,0.4) 0%, transparent 60%)',
                borderBottomLeftRadius: '12px',
              }}
            />

            {/* ── Spine glow strip ── */}
            <div
              className="absolute left-0 top-0 bottom-0 w-[3px]"
              style={{
                background: 'linear-gradient(180deg, rgba(58,134,255,0.0), rgba(58,134,255,0.8) 30%, rgba(147,51,234,0.9) 70%, rgba(58,134,255,0.0))',
                boxShadow: '0 0 12px rgba(58,134,255,0.6)',
              }}
            />

            {/* ── Header bar ── */}
            <div
              className="flex items-center gap-2 px-5 py-3"
              style={{
                borderBottom: '1px solid rgba(147,51,234,0.2)',
                background: 'linear-gradient(90deg, rgba(124,58,237,0.12), transparent)',
              }}
            >
              <div className="w-2 h-2 rounded-full bg-[#9333ea] shadow-[0_0_6px_rgba(147,51,234,0.9)]" />
              <span
                className="text-[10px] font-bold tracking-[0.18em] uppercase"
                style={{ color: '#60a5fa', letterSpacing: '0.18em' }}
              >
                Legal Doc Analysis
              </span>
              <div className="ml-auto flex gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#3A86FF]/40" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#9333ea]/40" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]/40" />
              </div>
            </div>

            {/* ── Circuit trace lines (decorative) ── */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ opacity: 0.07 }}
            >
              <line x1="0" y1="60%" x2="100%" y2="60%" stroke="#3A86FF" strokeWidth="0.5" strokeDasharray="4 8"/>
              <line x1="30%" y1="0" x2="30%" y2="100%" stroke="#9333ea" strokeWidth="0.5" strokeDasharray="3 10"/>
              <line x1="70%" y1="0" x2="70%" y2="50%" stroke="#3A86FF" strokeWidth="0.5" strokeDasharray="2 12"/>
            </svg>

            {/* ── Document text lines ── */}
            <div className="px-6 pt-4 pb-4 space-y-2.5 relative">
              {DOC_LINES.map((line, i) => (
                <motion.div
                  key={i}
                  className="rounded-full"
                  style={{
                    width: line.w,
                    height: '7px',
                    background: i % 3 === 0
                      ? 'linear-gradient(90deg, rgba(58,134,255,0.5), rgba(147,51,234,0.2))'
                      : i % 3 === 1
                        ? 'rgba(196,181,253,0.18)'
                        : 'rgba(147,51,234,0.2)',
                    opacity: line.opacity,
                  }}
                  animate={{ opacity: [line.opacity, line.opacity * 0.5, line.opacity] }}
                  transition={{
                    duration: 3 + i * 0.4,
                    delay: i * 0.15,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              ))}

              {/* ── Stamp block ── */}
              <div className="flex items-center gap-2 pt-2">
                <div
                  className="px-3 py-1 rounded text-[9px] font-bold tracking-widest"
                  style={{
                    background: 'rgba(147,51,234,0.2)',
                    border: '1px solid rgba(147,51,234,0.4)',
                    color: '#c084fc',
                  }}
                >
                  VERIFIED
                </div>
                <div
                  className="px-3 py-1 rounded text-[9px] font-bold tracking-widest"
                  style={{
                    background: 'rgba(58,134,255,0.15)',
                    border: '1px solid rgba(58,134,255,0.35)',
                    color: '#60a5fa',
                  }}
                >
                  ENCRYPTED
                </div>
              </div>
            </div>

            {/* ── Scanning beam ── */}
            <ScanBeam />

            {/* ── Bottom edge glow ── */}
            <div
              className="absolute bottom-0 inset-x-0 h-[2px]"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(58,134,255,0.6) 40%, rgba(147,51,234,0.8) 60%, transparent)',
                boxShadow: '0 0 10px rgba(147,51,234,0.5)',
              }}
            />
          </div>

          {/* ── Floating stat chips (outside glass, positioned absolutely) ── */}
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="absolute"
              style={{
                right: '-48%',
                top:   `${16 + i * 30}%`,
                transform: 'translateZ(24px)',
                zIndex: 30,
              }}
              animate={{ y: [0, -5, 0] }}
              transition={{
                duration: 4 + i * 0.7,
                delay:    i * 0.5,
                repeat:   Infinity,
                ease:     'easeInOut',
              }}
            >
              <StatChip {...stat} />
            </motion.div>
          ))}

        </div>
      </motion.div>

    </div>
  );
}

/* ── Scanning beam sub-component ───────────────────────────────── */
function ScanBeam() {
  return (
    <motion.div
      className="absolute inset-x-0 pointer-events-none"
      style={{ height: '2px', top: '20%', zIndex: 10 }}
      animate={{ top: ['20%', '90%', '20%'] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Core bright line */}
      <div
        className="absolute inset-x-4"
        style={{
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #9333ea 20%, #ffffff 50%, #3A86FF 80%, transparent)',
          boxShadow: '0 0 12px 2px rgba(147,51,234,0.8), 0 0 4px rgba(255,255,255,0.9)',
        }}
      />
      {/* Soft reading zone glow below beam */}
      <div
        className="absolute inset-x-0"
        style={{
          top: '-6px',
          height: '18px',
          background: 'linear-gradient(180deg, rgba(58,134,255,0.08) 0%, transparent 100%)',
        }}
      />
    </motion.div>
  );
}

/* ── Stat chip sub-component ────────────────────────────────────── */
function StatChip({ label, value, color, dot }) {
  return (
    <div
      style={{
        minWidth: '130px',
        background: 'linear-gradient(135deg, rgba(11,5,26,0.92), rgba(18,8,40,0.88))',
        border: `1px solid ${color}40`,
        borderRadius: '10px',
        padding: '8px 12px',
        backdropFilter: 'blur(16px)',
        boxShadow: `0 0 16px ${color}25, 0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)`,
      }}
    >
      <div className="flex items-center gap-1.5 mb-0.5">
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: dot, boxShadow: `0 0 6px ${dot}` }}
        />
        <span
          className="text-[9px] font-bold tracking-widest uppercase"
          style={{ color: 'rgba(196,181,253,0.6)' }}
        >
          {label}
        </span>
      </div>
      <div
        className="text-base font-extrabold leading-tight"
        style={{ color: '#ffffff', textShadow: `0 0 10px ${color}80` }}
      >
        {value}
      </div>
    </div>
  );
}
