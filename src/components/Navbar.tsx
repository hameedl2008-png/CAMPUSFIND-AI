import React from 'react';
import { Sparkles, Shield, User as UserIcon, LogOut, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentView: 'landing' | 'dashboard' | 'admin';
  setCurrentView: (view: 'landing' | 'dashboard' | 'admin') => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  dashboardSubView?: string;
  setDashboardSubView?: (sub: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  onOpenLogin,
  onOpenRegister,
  dashboardSubView,
  setDashboardSubView,
}) => {
  const { user, logout } = useAuth();

  const scrollToSection = (id: string) => {
    if (currentView !== 'landing') {
      setCurrentView('landing');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div 
          id="nav-brand-logo"
          onClick={() => setCurrentView('landing')}
          className="flex cursor-pointer items-center gap-2.5 transition-transform hover:scale-[1.01]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-500 shadow-md shadow-indigo-500/20 text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="font-['Space_Grotesk'] text-xl font-bold tracking-tight text-slate-900">
              CAMPUSFIND <span className="text-indigo-600">AI</span>
            </span>
            <span className="hidden text-[10px] font-medium tracking-wider text-slate-500 sm:block uppercase">
              College Lost & Found
            </span>
          </div>
        </div>

        {/* Public Navigation - Strictly NO Admin links shown */}
        <nav className="hidden items-center gap-7 md:flex">
          <button
            id="nav-link-home"
            onClick={() => {
              setCurrentView('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`text-sm font-medium transition-colors ${
              currentView === 'landing' ? 'text-indigo-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Home
          </button>
          <button
            id="nav-link-how-it-works"
            onClick={() => scrollToSection('how-it-works')}
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            How It Works
          </button>
          <button
            id="nav-link-features"
            onClick={() => scrollToSection('features')}
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            Features
          </button>
          <button
            id="nav-link-about"
            onClick={() => scrollToSection('about')}
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            About
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <button
                id="nav-btn-dashboard"
                onClick={() => setCurrentView('dashboard')}
                className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all ${
                  currentView === 'dashboard'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                <span>Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 sm:flex">
                <UserIcon className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                <span className="font-semibold text-slate-900 truncate max-w-[130px]">{user.fullName}</span>
                {user.department && (
                  <span className="rounded bg-indigo-100/70 border border-indigo-200/50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-800">
                    {user.department}
                  </span>
                )}
              </div>

              <button
                id="nav-btn-logout"
                onClick={logout}
                title="Log Out"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                id="nav-btn-login"
                onClick={onOpenLogin}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Login
              </button>
              <button
                id="nav-btn-register"
                onClick={onOpenRegister}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
