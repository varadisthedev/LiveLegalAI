import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Verify from './pages/Verify';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import DocumentAnalysis from './pages/DocumentAnalysis';
import Chat from './pages/Chat';
import History from './pages/History';
import Settings from './pages/Settings';
import VoiceSettings from './pages/VoiceSettings';

const ProtectedRoute = ({ children }) => {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify" element={<Verify />} />

        {/* Dashboard & App Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/voice-settings" element={<ProtectedRoute><VoiceSettings /></ProtectedRoute>} />
        
        {/* Dynamic App Routes */}
        <Route path="/analysis/:id?" element={<ProtectedRoute><DocumentAnalysis /></ProtectedRoute>} />
        <Route path="/analysis" element={<ProtectedRoute><DocumentAnalysis /></ProtectedRoute>} />
        
        <Route path="/chat/:id?" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/active-chat/:id?" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/active-chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/history" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
