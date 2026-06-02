import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

/**
 * SSOCallback — Required by Clerk's OAuth flow.
 * Clerk redirects back here after Google/GitHub auth completes.
 * This component finishes the handshake and sends the user to /dashboard.
 */
export default function SSOCallback() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: '#07020d' }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(124,58,237,0.18) 0%, transparent 70%)',
        }}
      />

      {/* Spinner card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          background: 'linear-gradient(160deg, rgba(22,10,38,0.85), rgba(11,5,26,0.95))',
          border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: 20,
          padding: '40px 48px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 0 60px rgba(124,58,237,0.2), 0 32px 80px rgba(0,0,0,0.5)',
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            display: 'grid', placeItems: 'center',
            background: 'rgba(124,58,237,0.12)',
            border: '1px solid rgba(124,58,237,0.35)',
          }}>
            <Sparkles size={18} color="#c4b5fd" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>
            LiveLegal <span style={{ color: '#9333ea' }}>AI</span>
          </span>
        </div>

        {/* Animated ring spinner */}
        <motion.div
          style={{
            width: 52, height: 52,
            borderRadius: '50%',
            border: '3px solid rgba(124,58,237,0.2)',
            borderTop: '3px solid #9333ea',
            borderRight: '3px solid #3A86FF',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />

        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#c4b5fd', fontWeight: 600, fontSize: 15, margin: 0 }}>
            Completing sign-in…
          </p>
          <p style={{ color: '#6b4fa0', fontSize: 12, marginTop: 4 }}>
            Verifying your account with Google
          </p>
        </div>
      </motion.div>

      {/*
        This is the critical Clerk component.
        It reads the OAuth tokens from the URL, finishes the auth handshake,
        and redirects to /dashboard on success.
      */}
      <AuthenticateWithRedirectCallback
        afterSignInUrl="/dashboard"
        afterSignUpUrl="/dashboard"
      />
    </div>
  );
}
