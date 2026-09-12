import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Phone, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Lock, 
  Send, 
  AlertTriangle, 
  Calendar,
  MessageSquare,
  HelpCircle,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { EnrichedMatch, VerificationAttempt, Handover, TimelineEvent } from '../types';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

interface MatchDetailModalProps {
  match: EnrichedMatch;
  isOpen: boolean;
  onClose: () => void;
  onRefreshMatches: () => void;
}

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({
  match,
  isOpen,
  onClose,
  onRefreshMatches,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'MATCH' | 'VERIFY' | 'HANDOVER' | 'TIMELINE' | 'COMPLAINT'>('MATCH');

  // Verification State
  const [verification, setVerification] = useState<VerificationAttempt | null>(null);
  const [verifyAnswer, setVerifyAnswer] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // Handover State
  const [handover, setHandover] = useState<Handover | null>(null);
  const [safeLocation, setSafeLocation] = useState('Campus Security Office (Main Gate Desk)');
  const [scheduledDateTime, setScheduledDateTime] = useState('Today at 4:30 PM');
  const [contactNotes, setContactNotes] = useState('');
  const [isRequestingHandover, setIsRequestingHandover] = useState(false);
  const [isConfirmingReturn, setIsConfirmingReturn] = useState(false);

  // Timeline State
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);

  // Complaint State
  const [complaintCategory, setComplaintCategory] = useState('Ownership Dispute');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);
  const [complaintSuccess, setComplaintSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Load verification
    api.getVerification(match.id).then(res => setVerification(res.verification)).catch(() => {});
    // Load handover
    api.getHandover(match.id).then(res => setHandover(res.handover)).catch(() => {});
    // Load timeline
    setIsLoadingTimeline(true);
    api.getTimeline(match.lostCaseId).then(res => {
      setTimeline(res.timeline);
      setIsLoadingTimeline(false);
    }).catch(() => setIsLoadingTimeline(false));
  }, [match.id, isOpen]);

  if (!isOpen) return null;

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyAnswer.trim()) return;
    setIsVerifying(true);
    setVerifyError(null);

    try {
      const res = await api.submitVerification(match.id, verifyAnswer);
      setVerification(res.verification);
      setVerifyAnswer('');
      if (res.isVerified) {
        onRefreshMatches();
        setActiveTab('HANDOVER');
      }
    } catch (err: any) {
      setVerifyError(err.message || 'Verification attempt failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRequestHandover = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRequestingHandover(true);
    try {
      const res = await api.requestHandover({
        matchId: match.id,
        safeCampusLocation: safeLocation,
        scheduledDateTime,
        contactNotes,
      });
      setHandover(res.handover);
      onRefreshMatches();
    } catch (err: any) {
      alert(err.message || 'Failed to request handover');
    } finally {
      setIsRequestingHandover(false);
    }
  };

  const handleAcceptHandover = async () => {
    if (!handover) return;
    try {
      const res = await api.acceptHandover(handover.id);
      setHandover(res.handover);
      onRefreshMatches();
    } catch (err: any) {
      alert(err.message || 'Failed to accept handover');
    }
  };

  const handleConfirmReturn = async () => {
    if (!handover) return;
    setIsConfirmingReturn(true);
    try {
      const res = await api.confirmHandoverReturn(handover.id);
      setHandover(res.handover);
      onRefreshMatches();
    } catch (err: any) {
      alert(err.message || 'Failed to confirm return');
    } finally {
      setIsConfirmingReturn(false);
    }
  };

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintDesc.trim()) return;
    setIsSubmittingComplaint(true);
    try {
      await api.submitComplaint({
        caseId: match.isLostOwner ? match.lostCaseId : match.foundCaseId,
        category: complaintCategory,
        description: complaintDesc,
      });
      setComplaintSuccess(true);
      setComplaintDesc('');
    } catch (err: any) {
      alert(err.message || 'Failed to file complaint');
    } finally {
      setIsSubmittingComplaint(false);
    }
  };

  // Match Level Pill Colors
  const getBadgeColor = (lvl: string) => {
    switch (lvl) {
      case 'STRONG MATCH':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'HIGH PROBABILITY':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'POSSIBLE MATCH':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'POTENTIAL MATCH':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative my-6 w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
              {match.score}%
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${getBadgeColor(match.level)}`}>
                  {match.level}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {match.lostCaseId} ↔ {match.foundCaseId}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Correlation between {match.myReport?.itemType} and {match.otherReport?.itemType}
              </p>
            </div>
          </div>

          <button
            id="modal-close-btn"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-6 text-xs font-semibold text-slate-600">
          <button
            id="tab-match-btn"
            onClick={() => setActiveTab('MATCH')}
            className={`py-3 px-3 border-b-2 transition ${
              activeTab === 'MATCH'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Match Details &amp; Contact
          </button>
          <button
            id="tab-verify-btn"
            onClick={() => setActiveTab('VERIFY')}
            className={`py-3 px-3 border-b-2 transition ${
              activeTab === 'VERIFY'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Ownership Verification
          </button>
          <button
            id="tab-handover-btn"
            onClick={() => setActiveTab('HANDOVER')}
            className={`py-3 px-3 border-b-2 transition ${
              activeTab === 'HANDOVER'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Safe Handover
          </button>
          <button
            id="tab-timeline-btn"
            onClick={() => setActiveTab('TIMELINE')}
            className={`py-3 px-3 border-b-2 transition ${
              activeTab === 'TIMELINE'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Timeline
          </button>
          <button
            id="tab-complaint-btn"
            onClick={() => setActiveTab('COMPLAINT')}
            className={`py-3 px-3 border-b-2 transition ${
              activeTab === 'COMPLAINT'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Dispute / Complaint
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {/* TAB 1: MATCH DETAILS & CONTACT RULES */}
          {activeTab === 'MATCH' && (
            <div className="space-y-5">
              {/* 50-70% Warning if applicable (Rule 48) */}
              {match.score >= 50 && match.score <= 70 && (
                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-800">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Possible Match — Verify Before Handover</strong>
                    <span>Contact information is unlocked, but contact does NOT equal ownership confirmation. Complete verification before meeting.</span>
                  </div>
                </div>
              )}

              {/* Match Factors / Reasons (Rule 46) */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                  Scoring Factors &amp; Reasons ({match.reasons.length} matches)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {match.reasons.map((r, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-800 bg-white p-2 rounded-lg border border-slate-200/80">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Side-by-Side Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="rounded-xl border border-slate-200 p-3 bg-white space-y-1.5">
                  <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">
                    My Report ({match.myReport?.caseId})
                  </span>
                  <div><strong>Item:</strong> {match.myReport?.itemType} ({match.myReport?.brand} {match.myReport?.model})</div>
                  <div><strong>Colour:</strong> {match.myReport?.colour}</div>
                  <div><strong>Location:</strong> {match.myReport?.location}</div>
                  <div><strong>Time:</strong> {match.myReport?.approxTime}</div>
                  {match.myReport?.imageUrl && (
                    <img src={match.myReport.imageUrl} alt="My item" className="h-24 w-full object-cover rounded-md border border-slate-200 mt-2" />
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 p-3 bg-white space-y-1.5">
                  <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">
                    Matched Report ({match.otherReport?.caseId})
                  </span>
                  <div><strong>Item:</strong> {match.otherReport?.itemType} ({match.otherReport?.brand} {match.otherReport?.model})</div>
                  <div><strong>Colour:</strong> {match.otherReport?.colour}</div>
                  <div><strong>Location:</strong> {match.otherReport?.location}</div>
                  <div><strong>Time:</strong> {match.otherReport?.approxTime}</div>
                  {match.otherReport?.imageUrl && (
                    <img src={match.otherReport.imageUrl} alt="Other item" className="h-24 w-full object-cover rounded-md border border-slate-200 mt-2" />
                  )}
                </div>
              </div>

              {/* Contact Rules Section (Rule 47) */}
              <div className="rounded-xl border border-slate-200 p-5 bg-white">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-indigo-600" />
                  <span>Peer Contact Details</span>
                </h4>

                {match.score < 50 ? (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
                    <Lock className="h-6 w-6 text-slate-400 mx-auto mb-1.5" />
                    <p className="text-xs font-semibold text-slate-700">Possible match found. Contact details are hidden.</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Platform safety rules keep student contact private until the correlation score reaches at least 50%.
                    </p>
                  </div>
                ) : match.otherContact ? (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-4 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-emerald-950">Verified Campus Contact</span>
                      <span className="rounded bg-emerald-200/80 px-2 py-0.5 text-[10px] font-bold text-emerald-900">
                        Score ≥ 50% Qualified
                      </span>
                    </div>
                    <div className="text-slate-800 space-y-1 pt-1">
                      <div><strong>Student Name:</strong> {match.otherContact.name}</div>
                      <div><strong>Registered Mobile:</strong> <span className="font-mono font-bold text-indigo-700">{match.otherContact.mobile}</span></div>
                      {match.otherContact.department && (
                        <div><strong>Department:</strong> {match.otherContact.department}</div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Contact information processing...</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: OWNERSHIP VERIFICATION (MAX 3 ATTEMPTS - RULE 49) */}
          {activeTab === 'VERIFY' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="h-5 w-5 text-indigo-600" />
                  <h4 className="text-sm font-bold text-slate-900">Ownership Challenge</h4>
                </div>
                <p className="text-xs text-slate-600">
                  {verification?.question || 'Please describe any distinctive markings, scratches, or unique features of this item.'}
                </p>
              </div>

              {verification?.isVerified ? (
                <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                  <h5 className="font-bold text-emerald-900 text-sm">Ownership Confirmed!</h5>
                  <p className="text-xs text-emerald-700 mt-1">
                    The claimant successfully answered the distinguishing challenge question. Proceed to Safe Handover.
                  </p>
                  <button
                    onClick={() => setActiveTab('HANDOVER')}
                    className="mt-3 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                  >
                    CONTINUE TO HANDOVER →
                  </button>
                </div>
              ) : verification?.maxAttemptsReached || verification?.adminReviewRequired ? (
                <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-center">
                  <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <h5 className="font-bold text-red-900 text-sm">3 Unsuccessful Attempts — Admin Review Required</h5>
                  <p className="text-xs text-red-700 mt-1">
                    The maximum of 3 ownership verification attempts has been reached. This case has been locked and escalated to the Campus Control Room for security staff review.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleVerifySubmit} className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Enter Identifying Answer</span>
                      <span className="text-indigo-600">
                        Attempts remaining: {3 - (verification?.attemptsCount || 0)} / 3
                      </span>
                    </div>
                    <textarea
                      id="verify-answer-input"
                      rows={3}
                      value={verifyAnswer}
                      onChange={(e) => setVerifyAnswer(e.target.value)}
                      placeholder="Be specific (e.g. description of lock pattern, specific wallpaper, scratch location)..."
                      required
                      className="w-full rounded-xl border border-slate-300 p-3 text-xs sm:text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden"
                    />
                  </div>

                  {verifyError && (
                    <div className="text-xs text-red-600 flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{verifyError}</span>
                    </div>
                  )}

                  <button
                    id="verify-submit-btn"
                    type="submit"
                    disabled={isVerifying || !verifyAnswer.trim()}
                    className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50 transition"
                  >
                    {isVerifying ? 'Checking Answer...' : 'SUBMIT VERIFICATION ANSWER'}
                  </button>
                </form>
              )}

              {/* Attempt History */}
              {verification && verification.history.length > 0 && (
                <div className="pt-2">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Verification History
                  </h5>
                  <div className="space-y-1.5">
                    {verification.history.map((h, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
                        <span className="text-slate-600">Attempt #{h.attemptNumber}</span>
                        <span className={`font-semibold ${h.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {h.passed ? 'PASSED ✓' : 'FAILED ✗'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SAFE HANDOVER (RULE 54) */}
          {activeTab === 'HANDOVER' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 text-xs text-slate-700">
                <strong className="block font-bold text-indigo-900 mb-1">Campus Safe Handover Protocol</strong>
                Always conduct exchanges at monitored campus security desks or central receptions. Contact sharing does not equal return.
              </div>

              {handover?.status === 'RETURNED' ? (
                <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-6 text-center">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto mb-2" />
                  <h4 className="text-base font-bold text-emerald-950">Handover Complete — Item Reconnected!</h4>
                  <p className="text-xs text-emerald-800 mt-1">
                    Both parties confirmed receipt of the item. Case closed successfully.
                  </p>
                </div>
              ) : handover ? (
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-900">Meeting Details</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      handover.status === 'SCHEDULED' ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {handover.status}
                    </span>
                  </div>

                  <div><strong>Location:</strong> {handover.safeCampusLocation}</div>
                  <div><strong>Scheduled Time:</strong> {handover.scheduledDateTime}</div>
                  {handover.contactNotes && <div><strong>Notes:</strong> {handover.contactNotes}</div>}

                  {/* Finder Accept Button */}
                  {!handover.finderAccepted && user?.id === handover.finderUserId && (
                    <button
                      onClick={handleAcceptHandover}
                      className="w-full mt-2 rounded-lg bg-indigo-600 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition"
                    >
                      ACCEPT HANDOVER PROPOSAL
                    </button>
                  )}

                  {/* Return Confirmation Button */}
                  {handover.finderAccepted && (
                    <div className="pt-3 border-t border-slate-100">
                      <p className="text-[11px] text-slate-600 mb-2">
                        Did you meet and hand over the item? Click below to confirm item return.
                      </p>
                      <button
                        onClick={handleConfirmReturn}
                        disabled={isConfirmingReturn}
                        className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                      >
                        {isConfirmingReturn ? 'Confirming...' : 'CONFIRM ITEM RETURNED / CLOSED'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleRequestHandover} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      Campus Safe Checkpoint
                    </label>
                    <select
                      value={safeLocation}
                      onChange={(e) => setSafeLocation(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-indigo-500 outline-hidden"
                    >
                      <option value="Campus Security Office (Main Gate Desk)">Campus Security Office (Main Gate Desk)</option>
                      <option value="Central Library Reception Desk">Central Library Reception Desk</option>
                      <option value="College Dean / Student Affairs Office">College Dean / Student Affairs Office</option>
                      <option value="Department Office Reception">Department Office Reception</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      Proposed Date &amp; Time
                    </label>
                    <input
                      type="text"
                      value={scheduledDateTime}
                      onChange={(e) => setScheduledDateTime(e.target.value)}
                      placeholder="e.g. Today at 4:30 PM"
                      required
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-indigo-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      Notes for Peer (Optional)
                    </label>
                    <input
                      type="text"
                      value={contactNotes}
                      onChange={(e) => setContactNotes(e.target.value)}
                      placeholder="e.g. Wearing a blue hoodie, will wait by the security sign-in register"
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-indigo-500 outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isRequestingHandover}
                    className="w-full rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition"
                  >
                    {isRequestingHandover ? 'Proposing...' : 'PROPOSE SAFE HANDOVER MEETING'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 4: REAL TIMELINE (RULE 56) */}
          {activeTab === 'TIMELINE' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Official Case Audit Trail
              </h4>

              {isLoadingTimeline ? (
                <div className="flex items-center justify-center p-8 text-xs text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span>Loading timeline events...</span>
                </div>
              ) : timeline.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No timeline events recorded yet.</p>
              ) : (
                <div className="relative border-l-2 border-indigo-200 ml-3 space-y-4">
                  {timeline.map((event) => (
                    <div key={event.id} className="relative pl-6">
                      <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-indigo-600 bg-white" />
                      <span className="text-[10px] font-mono text-slate-400 block">
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                      <strong className="text-xs font-bold text-slate-900 block">{event.title}</strong>
                      <p className="text-xs text-slate-600 mt-0.5">{event.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: COMPLAINTS (RULE 55) */}
          {activeTab === 'COMPLAINT' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900">
                <strong className="block font-bold mb-0.5">Control Room Dispute Lodging</strong>
                If you suspect a fraudulent claim, harassment, or finder refusal, file an official dispute for campus admin intervention.
              </div>

              {complaintSuccess ? (
                <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-center text-xs">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto mb-1.5" />
                  <strong className="block font-bold text-emerald-950">Dispute Submitted to Control Room</strong>
                  <p className="text-emerald-800 mt-0.5">
                    Campus security officers will review this case and take appropriate administrative action.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitComplaint} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      Dispute Category
                    </label>
                    <select
                      value={complaintCategory}
                      onChange={(e) => setComplaintCategory(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-indigo-500 outline-hidden"
                    >
                      <option value="Wrong Match">Wrong Match</option>
                      <option value="Ownership Dispute">Ownership Dispute</option>
                      <option value="Finder Refusing Return">Finder Refusing Return</option>
                      <option value="Suspicious Activity">Suspicious Activity</option>
                      <option value="Incorrect Information">Incorrect Information</option>
                      <option value="Harassment">Harassment</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      Detailed Description of Incident
                    </label>
                    <textarea
                      rows={3}
                      value={complaintDesc}
                      onChange={(e) => setComplaintDesc(e.target.value)}
                      placeholder="Provide specific details about what occurred..."
                      required
                      className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 focus:border-indigo-500 outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingComplaint || !complaintDesc.trim()}
                    className="w-full rounded-xl bg-amber-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition"
                  >
                    {isSubmittingComplaint ? 'Submitting Dispute...' : 'SUBMIT OFFICIAL COMPLAINT'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
