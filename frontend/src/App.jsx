import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify" element={<Verify />} />

        {/* Dashboard & App Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />
        
        {/* Dynamic App Routes */}
        <Route path="/analysis/:id?" element={<DocumentAnalysis />} />
        <Route path="/analysis" element={<DocumentAnalysis />} />
        
        <Route path="/chat/:id?" element={<Chat />} />
        <Route path="/active-chat/:id?" element={<Chat />} />
        <Route path="/active-chat" element={<Chat />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/history" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
