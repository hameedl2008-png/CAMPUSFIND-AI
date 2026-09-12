import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { ReportingFlow } from './components/ReportingFlow';
import { ControlRoom } from './components/ControlRoom';
import { LoginModal, RegisterModal } from './components/AuthModals';
import { ProfileModal } from './components/ProfileModal';
import { Report } from './types';

function MainApp() {
  const { user, isProfileComplete } = useAuth();

  // Navigation views: 'landing' | 'dashboard' | 'report-lost' | 'report-found' | 'control-room'
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'report-lost' | 'report-found' | 'control-room'>('landing');

  // Modals
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Intent pending auth/profile: 'LOST' | 'FOUND' | null
  const [pendingIntent, setPendingIntent] = useState<'LOST' | 'FOUND' | null>(null);

  // Handle Intent to Report Lost or Found
  const handleInitiateReport = (type: 'LOST' | 'FOUND') => {
    if (!user) {
      setPendingIntent(type);
      setIsLoginOpen(true);
      return;
    }

    if (!isProfileComplete()) {
      setPendingIntent(type);
      setIsProfileOpen(true);
      return;
    }

    // Direct transition to AI Dynamic Questioning flow
    if (type === 'LOST') {
      setCurrentView('report-lost');
    } else {
      setCurrentView('report-found');
    }
  };

  // Called when login or registration completes successfully
  const handleAuthSuccess = () => {
    if (pendingIntent) {
      const intent = pendingIntent;
      setPendingIntent(null);
      if (!isProfileComplete()) {
        setIsProfileOpen(true);
      } else {
        if (intent === 'LOST') setCurrentView('report-lost');
        else setCurrentView('report-found');
      }
    } else {
      setCurrentView('dashboard');
    }
  };

  // Called when user completes profile modal
  const handleProfileSaved = () => {
    setIsProfileOpen(false);
    if (pendingIntent === 'LOST') {
      setPendingIntent(null);
      setCurrentView('report-lost');
    } else if (pendingIntent === 'FOUND') {
      setPendingIntent(null);
      setCurrentView('report-found');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleReportCreated = (newReport: Report) => {
    // Navigate straight to dashboard to view the report and calculated matches
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white flex flex-col">
      {/* Hide public navbar in Control Room view */}
      {currentView !== 'control-room' && (
        <Navbar
          currentView={currentView === 'report-lost' || currentView === 'report-found' ? 'dashboard' : (currentView as any)}
          setCurrentView={(v) => {
            if (v === 'landing') setCurrentView('landing');
            else if (v === 'dashboard') setCurrentView('dashboard');
          }}
          onOpenLogin={() => {
            setPendingIntent(null);
            setIsLoginOpen(true);
          }}
          onOpenRegister={() => {
            setPendingIntent(null);
            setIsRegisterOpen(true);
          }}
        />
      )}

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onLostClick={() => handleInitiateReport('LOST')}
            onFoundClick={() => handleInitiateReport('FOUND')}
            onOpenControlRoom={() => setCurrentView('control-room')}
          />
        )}

        {currentView === 'dashboard' && (
          <Dashboard
            onReportLostClick={() => handleInitiateReport('LOST')}
            onReportFoundClick={() => handleInitiateReport('FOUND')}
          />
        )}

        {currentView === 'report-lost' && (
          <ReportingFlow
            type="LOST"
            onCancel={() => setCurrentView('dashboard')}
            onSuccess={handleReportCreated}
          />
        )}

        {currentView === 'report-found' && (
          <ReportingFlow
            type="FOUND"
            onCancel={() => setCurrentView('dashboard')}
            onSuccess={handleReportCreated}
          />
        )}

        {currentView === 'control-room' && (
          <ControlRoom
            onBackToApp={() => setCurrentView('landing')}
          />
        )}
      </main>

      {/* Authentication Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={() => setIsRegisterOpen(true)}
        onSuccess={handleAuthSuccess}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={() => setIsLoginOpen(true)}
        onSuccess={handleAuthSuccess}
      />

      {/* Profile Modal - Appears ONLY when initiated & incomplete */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onSavedAndContinue={handleProfileSaved}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
