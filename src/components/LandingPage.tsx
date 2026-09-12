import React from 'react';
import { 
  Sparkles, 
  Search, 
  HelpCircle, 
  ShieldCheck, 
  Cpu, 
  Camera, 
  CheckCircle2, 
  ArrowRight, 
  MessageSquare, 
  Lock, 
  Bell, 
  PhoneCall,
  Flame,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  onLostClick: () => void;
  onFoundClick: () => void;
  onOpenControlRoom: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLostClick,
  onFoundClick,
  onOpenControlRoom,
}) => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-200/60 bg-gradient-to-b from-white via-indigo-50/30 to-slate-50">
        {/* Subtle decorative glow */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[450px] w-[800px] rounded-full bg-gradient-to-tr from-indigo-200/40 via-blue-100/30 to-purple-200/30 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-4 py-1.5 shadow-xs text-xs font-semibold uppercase tracking-wider text-indigo-700 mb-6">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
            <span>Smart College Lost &amp; Found Platform</span>
          </div>

          {/* Main Title */}
          <h1 className="font-['Space_Grotesk'] text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            Lost Something? <br />
            <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-800 bg-clip-text text-transparent">
              Let AI Find It.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            CampusFind AI helps college students report lost and found items, analyze important details, discover possible matches, and safely reconnect items with their owners.
          </p>

          {/* Dual Hero Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <button
              id="hero-lost-btn"
              onClick={onLostClick}
              className="group w-full sm:w-1/2 flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 text-base font-bold text-white shadow-lg shadow-indigo-600/25 hover:from-indigo-700 hover:to-indigo-800 active:scale-[0.98] transition-all"
            >
              <span>I LOST SOMETHING</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              id="hero-found-btn"
              onClick={onFoundClick}
              className="group w-full sm:w-1/2 flex items-center justify-center gap-2.5 rounded-xl border border-slate-300 bg-white px-6 py-4 text-base font-bold text-slate-800 shadow-sm hover:border-slate-400 hover:bg-slate-50 active:scale-[0.98] transition-all"
            >
              <span>I FOUND SOMETHING</span>
              <Search className="h-4 w-4 text-indigo-600 transition-transform group-hover:scale-110" />
            </button>
          </div>

          {/* User state subtext */}
          <div className="mt-4 text-xs text-slate-500 font-medium">
            {user ? (
              <span>Signed in as <strong className="text-slate-800">{user.fullName}</strong>. Real reports sync automatically with your college peers.</span>
            ) : (
              <span>Quick student login / register required to safeguard private item details.</span>
            )}
          </div>
        </div>
      </section>

      {/* Interactive How It Works */}
      <section id="how-it-works" className="py-20 bg-white border-b border-slate-200/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">The 7-Step Workflow</span>
            <h2 className="mt-2 font-['Space_Grotesk'] text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              How CampusFind AI Works
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              From conversational intake to verified safe handovers, every step is built for deterministic accuracy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 01 Report */}
            <div className="relative rounded-2xl border border-slate-200 bg-slate-50/60 p-6 transition-all hover:shadow-md hover:border-indigo-300 hover:bg-white group">
              <div className="flex items-center justify-between mb-4">
                <span className="font-['Space_Grotesk'] text-3xl font-black text-indigo-300 group-hover:text-indigo-600 transition-colors">01</span>
                <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">
                  <MessageSquare className="h-5 w-5" />
                </div>
              </div>
              <h3 className="font-bold text-slate-900 text-lg">REPORT</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Tell CampusFind AI what you lost or found in free-text English, Tamil, or Tanglish.
              </p>
            </div>

            {/* 02 AI Questions */}
            <div className="relative rounded-2xl border border-slate-200 bg-slate-50/60 p-6 transition-all hover:shadow-md hover:border-indigo-300 hover:bg-white group">
              <div className="flex items-center justify-between mb-4">
                <span className="font-['Space_Grotesk'] text-3xl font-black text-indigo-300 group-hover:text-indigo-600 transition-colors">02</span>
                <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">
                  <Cpu className="h-5 w-5" />
                </div>
              </div>
              <h3 className="font-bold text-slate-900 text-lg">AI QUESTIONS</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                CampusFind AI dynamically asks only relevant questions (Brand → Model, Case, Marks, Lock Type).
              </p>
            </div>

            {/* 03 Image Analysis */}
            <div className="relative rounded-2xl border border-slate-200 bg-slate-50/60 p-6 transition-all hover:shadow-md hover:border-indigo-300 hover:bg-white group">
              <div className="flex items-center justify-between mb-4">
                <span className="font-['Space_Grotesk'] text-3xl font-black text-indigo-300 group-hover:text-indigo-600 transition-colors">03</span>
                <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">
                  <Camera className="h-5 w-5" />
                </div>
              </div>
              <h3 className="font-bold text-slate-900 text-lg">IMAGE ANALYSIS</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Upload a photo and analyze visible characteristics like colour, shape, logos, case, and scratches.
              </p>
            </div>

            {/* 04 Smart Match */}
            <div className="relative rounded-2xl border border-slate-200 bg-slate-50/60 p-6 transition-all hover:shadow-md hover:border-indigo-300 hover:bg-white group">
              <div className="flex items-center justify-between mb-4">
                <span className="font-['Space_Grotesk'] text-3xl font-black text-indigo-300 group-hover:text-indigo-600 transition-colors">04</span>
                <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>
              <h3 className="font-bold text-slate-900 text-lg">SMART MATCH</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                The deterministic engine compares real Lost and Found reports with exact weighted scoring (0–100%).
              </p>
            </div>

            {/* 05 Contact */}
            <div className="relative rounded-2xl border border-slate-200 bg-slate-50/60 p-6 transition-all hover:shadow-md hover:border-indigo-300 hover:bg-white group">
              <div className="flex items-center justify-between mb-4">
                <span className="font-['Space_Grotesk'] text-3xl font-black text-indigo-300 group-hover:text-indigo-600 transition-colors">05</span>
                <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">
                  <PhoneCall className="h-5 w-5" />
                </div>
              </div>
              <h3 className="font-bold text-slate-900 text-lg">CONTACT</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Contact becomes available only when the match score reaches ≥50%. Hidden if below 50%.
              </p>
            </div>

            {/* 06 Verify */}
            <div className="relative rounded-2xl border border-slate-200 bg-slate-50/60 p-6 transition-all hover:shadow-md hover:border-indigo-300 hover:bg-white group">
              <div className="flex items-center justify-between mb-4">
                <span className="font-['Space_Grotesk'] text-3xl font-black text-indigo-300 group-hover:text-indigo-600 transition-colors">06</span>
                <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">
                  <Lock className="h-5 w-5" />
                </div>
              </div>
              <h3 className="font-bold text-slate-900 text-lg">VERIFY</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Ownership verification is separate. Distinctive questions protect against false claims (max 3 attempts).
              </p>
            </div>

            {/* 07 Return */}
            <div className="relative rounded-2xl border border-slate-200 bg-slate-50/60 p-6 transition-all hover:shadow-md hover:border-indigo-300 hover:bg-white group lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <span className="font-['Space_Grotesk'] text-3xl font-black text-indigo-300 group-hover:text-indigo-600 transition-colors">07</span>
                <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
              <h3 className="font-bold text-slate-900 text-lg">RETURN &amp; SAFE HANDOVER</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Meet at approved safe campus checkpoints (Security Office, Library Reception). Both students confirm the return to close the case.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50 border-b border-slate-200/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Enterprise Capabilities</span>
            <h2 className="mt-2 font-['Space_Grotesk'] text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Built Specifically For Colleges
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Real student privacy, strict deterministic scoring, and emergency theft escalation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Dynamic AI Questioning</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Select category and the form adapts: Apple phones reveal iPhone 11-17; laptops inquire about bag and charger; bags never ask for pin codes.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">English / Tamil / Tanglish</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Understands natural language inputs like <em>"Enoda black iPhone 13 blue case oda canteen la miss aachu"</em> with AI entity extraction.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Camera className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Image Analysis</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Upload photos to detect visible characteristics without human bias. Explicitly flagged as AI estimates to maintain transparency.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <FileCheck className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Deterministic Match Score</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Never uses random scores. Exact mathematical weights across 10 factors: category (15%), physical marks (15%), location (12%), brand/model (20%).
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Contact &amp; Ownership Gate</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Peer contact details are completely locked below 50% score. Ownership challenges have a strict 3-attempt limit before admin review.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Flame className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">24-Hour Theft Escalation</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Suspicious or theft-flagged items unresolved after 24 hours trigger automated Control Room escalation for prioritized security monitoring.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Student Safety &amp; Integrity</span>
          <h2 className="mt-2 font-['Space_Grotesk'] text-3xl font-bold text-slate-900">
            About CampusFind AI
          </h2>
          <p className="mt-4 text-slate-600 leading-relaxed text-base sm:text-lg">
            Every semester, hundreds of student laptops, smartphones, ID cards, lab notes, and personal items are misplaced across campus cafeterias, auditoriums, and buses. Traditional notice boards and messy chat groups leave items unclaimed or vulnerable to false claims.
          </p>
          <p className="mt-4 text-slate-600 leading-relaxed text-base">
            CampusFind AI delivers a secure, automated, deterministic bridge between Finders and Owners. With private verification, safe handover checkpoints, and a dedicated Campus Security Control Room, campus communities can reconnect what was lost with complete confidence.
          </p>
        </div>
      </section>

      {/* Discreet Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-slate-900 text-slate-400 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span className="text-sm font-semibold text-white">CAMPUSFIND AI</span>
            <span className="text-xs text-slate-500">— Smart College Lost &amp; Found Platform</span>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <span>© {new Date().getFullYear()} CampusFind AI. Real Data Only.</span>
            {/* Private Control Room Link (Discreetly placed, not in public top navigation) */}
            <button
              id="footer-control-room-btn"
              onClick={onOpenControlRoom}
              className="text-slate-400 hover:text-indigo-400 transition-colors font-medium flex items-center gap-1.5"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Campus Control Room</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
