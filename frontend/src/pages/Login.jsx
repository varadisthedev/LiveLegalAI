import { useSignIn } from '@clerk/clerk-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, ArrowRight, Chrome } from 'lucide-react';
import { useState } from 'react';

const INPUT_STYLE = {
  width: '100%',
  background: 'rgba(22,10,38,0.9)',
  border: '1px solid rgba(124,58,237,0.3)',
  borderRadius: 10,
  color: '#fff',
  fontSize: 14,
  padding: '11px 14px',
  outline: 'none',
  fontFamily: 'Inter, sans-serif',
  boxSizing: 'border-box',
};

const LABEL_STYLE = {
  color: '#a78bfa',
  fontSize: 12,
  fontWeight: 600,
  marginBottom: 6,
  display: 'block',
};

export default function Login() {
  const { signIn, isLoaded } = useSignIn();
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep]         = useState('start'); // 'start' | 'password'
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  /* ── Google OAuth ── */
  const handleGoogle = async () => {
    if (!isLoaded) return;
    setError('');
    try {
      await signIn.authenticateWithRedirect({
        strategy:            'oauth_google',
        redirectUrl:         `${window.location.origin}/sso-callback`,
        redirectUrlComplete: '/dashboard',
      });
    } catch (e) {
      setError(e.errors?.[0]?.message || 'Google sign-in failed. Please try again.');
    }
  };

  /* ── GitHub OAuth ── */
  const handleGitHub = async () => {
    if (!isLoaded) return;
    setError('');
    try {
      await signIn.authenticateWithRedirect({
        strategy:            'oauth_github',
        redirectUrl:         `${window.location.origin}/sso-callback`,
        redirectUrlComplete: '/dashboard',
      });
    } catch (e) {
      setError(e.errors?.[0]?.message || 'GitHub sign-in failed. Please try again.');
    }
  };

  /* ── Email: step 1 — check email ── */
  const handleEmailContinue = async (e) => {
    e.preventDefault();
    if (!isLoaded || !email) return;
    setError('');
    setLoading(true);
    try {
      await signIn.create({ identifier: email });
      setStep('password');
    } catch (err) {
      setError(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'No account found for this email.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Email: step 2 — submit password ── */
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded || !password) return;
    setError('');
    setLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'password',
        password,
      });
      if (result.status === 'complete') {
        navigate('/dashboard');
      } else {
        setError('Additional verification required. Please check your email.');
      }
    } catch (err) {
      setError(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Incorrect password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: '#07020d', fontFamily: 'Inter, sans-serif', padding: '24px 16px' }}
    >
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div style={{ position:'absolute', top:'12%', left:'18%', width:500, height:500,
          background:'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)', filter:'blur(70px)' }} />
        <div style={{ position:'absolute', bottom:'10%', right:'14%', width:380, height:380,
          background:'radial-gradient(circle, rgba(58,134,255,0.12) 0%, transparent 70%)', filter:'blur(60px)' }} />
        {[['8%','20%'],['88%','15%'],['5%','75%'],['92%','70%']].map(([l,t],i) => (
          <motion.div key={i} style={{ position:'absolute', left:l, top:t, width:4, height:4, borderRadius:'50%',
            background: i%2===0?'#7c3aed':'#3A86FF', boxShadow:`0 0 8px ${i%2===0?'#7c3aed':'#3A86FF'}` }}
            animate={{ y:[0,-14,0], opacity:[0.3,0.9,0.3] }}
            transition={{ duration:3.5+i*0.6, repeat:Infinity, ease:'easeInOut', delay:i*0.4 }} />
        ))}
      </div>

      {/* Brand */}
      <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
        className="mb-8 flex flex-col items-center gap-2">
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:42, height:42, borderRadius:'50%', display:'grid', placeItems:'center',
            background:'rgba(124,58,237,0.12)', border:'1px solid rgba(124,58,237,0.35)',
            boxShadow:'0 0 20px rgba(124,58,237,0.25)' }}>
            <Sparkles size={20} color="#c4b5fd" />
          </div>
          <span style={{ fontSize:22, fontWeight:800, color:'#fff', letterSpacing:'-0.02em' }}>
            LiveLegal <span style={{ color:'#9333ea' }}>AI</span>
          </span>
        </Link>
        <p style={{ color:'#6b4fa0', fontSize:13 }}>Welcome back — sign in to continue</p>
      </motion.div>

      {/* Card */}
      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.1 }}
        style={{ width:'100%', maxWidth:420,
          background:'linear-gradient(160deg, rgba(22,10,38,0.88) 0%, rgba(11,5,26,0.96) 100%)',
          border:'1px solid rgba(124,58,237,0.3)', borderRadius:20,
          boxShadow:'0 0 0 1px rgba(58,134,255,0.08), 0 0 60px rgba(124,58,237,0.18), 0 32px 80px rgba(0,0,0,0.6)',
          backdropFilter:'blur(20px)', padding:'32px 28px' }}>

        {/* OAuth buttons */}
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
          <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
            onClick={handleGoogle} disabled={!isLoaded}
            style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10,
              background:'rgba(22,10,38,0.8)', border:'1px solid rgba(124,58,237,0.35)',
              borderRadius:10, color:'#c4b5fd', fontWeight:600, fontSize:14,
              padding:'11px 16px', cursor:'pointer', width:'100%', fontFamily:'Inter,sans-serif',
              transition:'all 0.2s' }}>
            {/* Google icon */}
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2a10.34 10.34 0 00-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 009 18z"/>
              <path fill="#FBBC05" d="M3.97 10.71A5.41 5.41 0 013.68 9c0-.59.1-1.17.29-1.71V4.96H.96A9 9 0 000 9c0 1.45.35 2.82.96 4.04l3.01-2.33z"/>
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 00.96 4.96L3.97 7.29C4.68 5.16 6.66 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </motion.button>

          <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
            onClick={handleGitHub} disabled={!isLoaded}
            style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10,
              background:'rgba(22,10,38,0.8)', border:'1px solid rgba(124,58,237,0.35)',
              borderRadius:10, color:'#c4b5fd', fontWeight:600, fontSize:14,
              padding:'11px 16px', cursor:'pointer', width:'100%', fontFamily:'Inter,sans-serif' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
            Continue with GitHub
          </motion.button>
        </div>

        {/* Divider */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
          <div style={{ flex:1, height:1, background:'rgba(124,58,237,0.2)' }} />
          <span style={{ color:'#4b3a6b', fontSize:12 }}>or sign in with email</span>
          <div style={{ flex:1, height:1, background:'rgba(124,58,237,0.2)' }} />
        </div>

        {/* Email / Password form */}
        {step === 'start' ? (
          <form onSubmit={handleEmailContinue}>
            <label style={LABEL_STYLE}>Email address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" required style={INPUT_STYLE} />
            {error && <p style={{ color:'#f87171', fontSize:12, marginTop:8 }}>{error}</p>}
            <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }} type="submit"
              disabled={loading || !isLoaded}
              style={{ width:'100%', marginTop:16, padding:'12px 16px', borderRadius:10,
                background:'linear-gradient(135deg, #7c3aed, #9333ea)', border:'none',
                color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer',
                boxShadow:'0 0 24px rgba(124,58,237,0.4)', fontFamily:'Inter,sans-serif',
                display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Checking…' : <><span>Continue</span><ArrowRight size={16}/></>}
            </motion.button>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit}>
            <div style={{ marginBottom:16 }}>
              <label style={LABEL_STYLE}>Email</label>
              <div style={{ ...INPUT_STYLE, color:'#a78bfa', cursor:'default', display:'flex', alignItems:'center', gap:8 }}>
                <Mail size={14} color="#7c3aed" />{email}
              </div>
            </div>
            <label style={LABEL_STYLE}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Your password" required style={INPUT_STYLE} autoFocus />
            {error && <p style={{ color:'#f87171', fontSize:12, marginTop:8 }}>{error}</p>}
            <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }} type="submit"
              disabled={loading}
              style={{ width:'100%', marginTop:16, padding:'12px 16px', borderRadius:10,
                background:'linear-gradient(135deg, #7c3aed, #9333ea)', border:'none',
                color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer',
                boxShadow:'0 0 24px rgba(124,58,237,0.4)', fontFamily:'Inter,sans-serif',
                display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing in…' : <><span>Sign In</span><ArrowRight size={16}/></>}
            </motion.button>
            <button type="button" onClick={() => { setStep('start'); setError(''); setPassword(''); }}
              style={{ background:'none', border:'none', color:'#6b4fa0', fontSize:12,
                marginTop:12, cursor:'pointer', width:'100%', fontFamily:'Inter,sans-serif' }}>
              ← Use a different email
            </button>
          </form>
        )}

        {/* Footer */}
        <p style={{ color:'#4b3a6b', fontSize:13, textAlign:'center', marginTop:24 }}>
          No account?{' '}
          <Link to="/signup" style={{ color:'#a78bfa', fontWeight:600, textDecoration:'none' }}>
            Sign up free
          </Link>
        </p>
      </motion.div>

      <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.7 }}
        style={{ color:'#4b3a6b', fontSize:11, marginTop:24, textAlign:'center' }}>
        Private &amp; encrypted · No lawyers needed
      </motion.p>
    </div>
  );
}
