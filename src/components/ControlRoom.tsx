import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  AlertTriangle, 
  Clock, 
  Flame, 
  CheckCircle2, 
  RefreshCw, 
  FileText, 
  User, 
  X,
  ArrowLeft,
  Mail,
  Search,
  Check,
  ChevronRight
} from 'lucide-react';
import { Report, Complaint, VerificationAttempt } from '../types';

interface ControlRoomProps {
  onBackToApp: () => void;
}

export const ControlRoom: React.FC<ControlRoomProps> = ({ onBackToApp }) => {
  const [adminKey, setAdminKey] = useState('campusfind-admin');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Data
  const [stats, setStats] = useState<any>(null);
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [escalatedCases, setEscalatedCases] = useState<Report[]>([]);
  const [pendingVerifications, setPendingVerifications] = useState<VerificationAttempt[]>([]);
  const [activeTab, setActiveTab] = useState<'CASES' | 'THEFT' | 'VERIFICATIONS' | 'DISPUTES'>('CASES');

  // Case Filter
  const [caseFilter, setCaseFilter] = useState<'ALL' | 'LOST' | 'FOUND' | 'THEFT' | 'RETURNED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/admin/overview', {
        headers: { 'x-admin-key': adminKey }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid Admin Passkey');

      setStats(data.stats);
      setAllReports(data.reports);
      setComplaints(data.complaints);
      setEscalatedCases(data.escalatedCases);
      setPendingVerifications(data.pendingVerifications);
      setIsAuthenticated(true);
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    handleLogin();
  };

  const handleResolveComplaint = async (complaintId: string) => {
    try {
      const res = await fetch(`/api/admin/complaints/${complaintId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({ actionNotes: 'Resolved by Campus Security Administrator' }),
      });
      if (res.ok) handleRefresh();
    } catch (err) {
      console.warn(err);
    }
  };

  const handleOverrideVerification = async (attemptId: string) => {
    try {
      const res = await fetch(`/api/admin/verifications/${attemptId}/override`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({ overrideApproved: true, adminNotes: 'Verified manually in Security Office via Student ID and original receipt' }),
      });
      if (res.ok) handleRefresh();
    } catch (err) {
      console.warn(err);
    }
  };

  const handleTriggerEscalationCheck = async () => {
    try {
      const res = await fetch('/api/admin/trigger-escalation-check', {
        method: 'POST',
        headers: { 'x-admin-key': adminKey }
      });
      const data = await res.json();
      alert(`Manual escalation scan finished. ${data.escalated} cases escalated.`);
      handleRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to trigger escalation check');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 text-slate-100">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-8 shadow-2xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white font-['Space_Grotesk']">
              CAMPUS CONTROL ROOM
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Authorized Campus Security &amp; Administration Access Only
            </p>
          </div>

          {authError && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Security Admin Passkey
              </label>
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Enter admin passkey..."
                required
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Default key: <span className="font-mono text-slate-400">campusfind-admin</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-50 transition"
            >
              {loading ? 'Authenticating...' : 'ENTER CONTROL ROOM'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-900 text-center">
            <button
              onClick={onBackToApp}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Return to Student Application</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filtered reports
  const filteredReports = allReports.filter(r => {
    if (caseFilter === 'LOST' && r.type !== 'LOST') return false;
    if (caseFilter === 'FOUND' && r.type !== 'FOUND') return false;
    if (caseFilter === 'THEFT' && !r.isTheftSuspicious) return false;
    if (caseFilter === 'RETURNED' && r.status !== 'RETURNED') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.caseId.toLowerCase().includes(q) ||
        r.itemType.toLowerCase().includes(q) ||
        r.brand.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Control Room Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-xs sticky top-0 z-20">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Space_Grotesk'] text-xs font-bold uppercase tracking-widest text-indigo-400">
                  CAMPUSFIND AI — CONTROL ROOM
                </span>
                <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-400 uppercase tracking-wider border border-rose-500/30">
                  Live Operations
                </span>
              </div>
              <h1 className="text-lg font-bold text-white">Campus Security &amp; Administration Center</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTriggerEscalationCheck}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition"
              title="Run 24h theft escalation engine scan now"
            >
              <Flame className="h-3.5 w-3.5" />
              <span>Scan 24h Theft Escalations</span>
            </button>

            <button
              onClick={handleRefresh}
              className="rounded-xl border border-slate-800 bg-slate-800/80 p-2 text-slate-300 hover:text-white transition"
              title="Refresh Control Room Data"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            <button
              onClick={onBackToApp}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Exit to App</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex border-t border-slate-800 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('CASES')}
            className={`py-3 px-4 border-b-2 transition shrink-0 ${
              activeTab === 'CASES' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            All Registered Cases ({allReports.length})
          </button>
          <button
            onClick={() => setActiveTab('THEFT')}
            className={`py-3 px-4 border-b-2 transition shrink-0 flex items-center gap-1.5 ${
              activeTab === 'THEFT' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="h-3.5 w-3.5" />
            <span>Theft &amp; 24h Escalations ({escalatedCases.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('VERIFICATIONS')}
            className={`py-3 px-4 border-b-2 transition shrink-0 flex items-center gap-1.5 ${
              activeTab === 'VERIFICATIONS' ? 'border-rose-500 text-rose-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Locked Verifications ({pendingVerifications.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('DISPUTES')}
            className={`py-3 px-4 border-b-2 transition shrink-0 flex items-center gap-1.5 ${
              activeTab === 'DISPUTES' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Student Disputes &amp; Complaints ({complaints.length})</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Metrics Grid */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Lost Cases</span>
              <span className="text-xl font-bold font-['Space_Grotesk'] text-white mt-0.5 block">{stats.totalLost}</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Found Cases</span>
              <span className="text-xl font-bold font-['Space_Grotesk'] text-white mt-0.5 block">{stats.totalFound}</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Matches</span>
              <span className="text-xl font-bold font-['Space_Grotesk'] text-indigo-400 mt-0.5 block">{stats.totalMatches}</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Handovers</span>
              <span className="text-xl font-bold font-['Space_Grotesk'] text-emerald-400 mt-0.5 block">{stats.totalHandovers}</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Suspicious</span>
              <span className="text-xl font-bold font-['Space_Grotesk'] text-amber-400 mt-0.5 block">{stats.theftSuspiciousCount}</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Escalated</span>
              <span className="text-xl font-bold font-['Space_Grotesk'] text-rose-400 mt-0.5 block">{stats.escalatedCount}</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Disputes</span>
              <span className="text-xl font-bold font-['Space_Grotesk'] text-blue-400 mt-0.5 block">{stats.openComplaints}</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Locked</span>
              <span className="text-xl font-bold font-['Space_Grotesk'] text-red-400 mt-0.5 block">{stats.pendingVerificationsCount}</span>
            </div>
          </div>
        )}

        {/* TAB 1: ALL CASES WITH REAL SEARCH & FILTER */}
        {activeTab === 'CASES' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {(['ALL', 'LOST', 'FOUND', 'THEFT', 'RETURNED'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setCaseFilter(filter)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      caseFilter === filter
                        ? 'bg-indigo-600 text-white'
                        : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search case ID, brand..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-hidden"
                />
              </div>
            </div>

            {filteredReports.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-500 text-xs">
                No matching case records found.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="border-b border-slate-800 bg-slate-900 text-slate-400 font-bold uppercase">
                    <tr>
                      <th className="p-3">Case ID</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Item Details</th>
                      <th className="p-3">Location &amp; Time</th>
                      <th className="p-3">Flags</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredReports.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-mono font-bold text-white">{r.caseId}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            r.type === 'LOST' ? 'bg-rose-500/20 text-rose-300' : 'bg-indigo-500/20 text-indigo-300'
                          }`}>
                            {r.type}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-white">{r.itemType}</div>
                          <div className="text-slate-400">{r.brand} {r.model} • {r.colour}</div>
                        </td>
                        <td className="p-3">
                          <div>{r.location}</div>
                          <div className="text-slate-500">{r.dateLostFound} ({r.approxTime})</div>
                        </td>
                        <td className="p-3">
                          {r.isTheftSuspicious && (
                            <span className="inline-flex items-center gap-1 rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                              <Flame className="h-3 w-3" /> Suspicious
                            </span>
                          )}
                          {r.isEscalated && (
                            <span className="ml-1 inline-flex items-center gap-1 rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/30">
                              Escalated
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="font-mono text-[11px] text-slate-300">{r.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: THEFT & 24H ESCALATIONS */}
        {activeTab === 'THEFT' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-300">
              <strong className="block font-bold mb-1">Campus Security 24-Hour Theft Protocol</strong>
              Any lost item reported under suspicious circumstances that remains unresolved for 24 hours is automatically escalated here for prioritized campus security investigation.
            </div>

            {escalatedCases.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-500 text-xs">
                No active 24-hour theft escalations at this time.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {escalatedCases.map((c) => (
                  <div key={c.id} className="rounded-2xl border border-rose-500/30 bg-slate-900/80 p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <span className="font-mono font-bold text-rose-400">{c.caseId}</span>
                      <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300 uppercase tracking-wider">
                        24H ESCALATED
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-base">{c.itemType}</h4>
                    <p className="text-xs text-slate-300">{c.brand} {c.model} — {c.colour}</p>
                    <p className="text-xs text-slate-400">Location: {c.location}</p>

                    <div className="rounded-lg bg-slate-950 p-3 text-xs text-amber-300">
                      <strong className="block font-bold text-amber-200 mb-0.5">Suspicious Context:</strong>
                      <span>{c.theftNotes || 'Unresolved after 24 hours from initial filing.'}</span>
                    </div>

                    <div className="text-[10px] text-slate-500">
                      Reported on: {new Date(c.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LOCKED VERIFICATIONS (MAX 3 ATTEMPTS FAILED) */}
        {activeTab === 'VERIFICATIONS' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
              <strong className="block font-bold mb-1">Failed Verification Audits</strong>
              Claimants who failed 3 consecutive challenge attempts are locked out from claiming the item. Campus security officers can review student identification in person and manually authorize the override.
            </div>

            {pendingVerifications.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-500 text-xs">
                No locked verification cases pending review.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingVerifications.map((v) => (
                  <div key={v.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-mono text-xs font-bold text-white">Match #{v.matchId}</span>
                      <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300 uppercase">
                        Admin Review Required
                      </span>
                    </div>

                    <p className="text-xs text-slate-300">
                      <strong>Verification Question:</strong> {v.question}
                    </p>

                    <div className="rounded-lg bg-slate-950 p-3 text-xs text-slate-400">
                      <strong className="block text-slate-300 mb-1">Attempt History (3 Failed Attempts):</strong>
                      {v.history.map((h, i) => (
                        <div key={i} className="text-rose-400">
                          Attempt #{h.attemptNumber}: "{h.answer}" (FAILED)
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => handleOverrideVerification(v.id)}
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition"
                      >
                        MANUAL IN-PERSON OVERRIDE &amp; APPROVE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: DISPUTES & COMPLAINTS */}
        {activeTab === 'DISPUTES' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 text-xs text-blue-300">
              <strong className="block font-bold mb-1">Official Student Disputes</strong>
              Complaints lodged by students regarding ownership disputes, finder refusal, or suspicious peer activity.
            </div>

            {complaints.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-500 text-xs">
                No active complaints filed.
              </div>
            ) : (
              <div className="space-y-3">
                {complaints.map((comp) => (
                  <div key={comp.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-400">{comp.caseId}</span>
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                          {comp.category}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        comp.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {comp.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {comp.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-500">
                      <span>Filed by Student #{comp.userId} on {new Date(comp.createdAt).toLocaleString()}</span>
                      {comp.status !== 'RESOLVED' && (
                        <button
                          onClick={() => handleResolveComplaint(comp.id)}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
                        >
                          MARK RESOLVED
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
