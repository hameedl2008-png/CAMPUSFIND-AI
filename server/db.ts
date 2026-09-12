import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  fullName: string;
  mobile: string;
  studentId: string;
  department: string;
  year: string;
  email?: string;
  passwordHash: string;
  createdAt: string;
}

export type ReportType = 'LOST' | 'FOUND';

export type CaseStatus = 
  | 'ACTIVE' 
  | 'MATCHED' 
  | 'VERIFICATION_PENDING' 
  | 'HANDOVER_PENDING' 
  | 'RETURNED' 
  | 'CLOSED' 
  | 'THEFT_SUSPICIOUS' 
  | 'ADMIN_REVIEW_REQUIRED';

export interface ImageAnalysisResult {
  colour?: string;
  shape?: string;
  brand?: string;
  model?: string;
  caseDetails?: string;
  marks?: string;
  isEstimated?: boolean;
  notes?: string;
}

export interface Report {
  id: string;
  caseId: string; // e.g. CFA-2026-000001
  type: ReportType;
  userId: string;
  userFullName: string;
  userMobile: string;
  userEmail: string;
  category: string;
  itemType: string;
  brand: string;
  model: string;
  colour: string;
  hasCase: boolean | string;
  caseColour: string;
  caseDesign: string;
  physicalMarks: string;
  accessories: string;
  location: string;
  dateLostFound: string;
  approxTime: string;
  lockType: string;
  safeUniqueDetails: string;
  itemAttributes?: Record<string, any>;
  privateVerificationSecret?: string; // Private answer supplied by owner
  imageUrl?: string;
  imageAnalysis?: ImageAnalysisResult;
  status: CaseStatus;
  isTheftSuspicious: boolean;
  theftNotes?: string;
  isEscalated?: boolean;
  escalatedToAdminAt?: string | null;
  adminAlertCreated?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type MatchLevel = 
  | 'STRONG MATCH' 
  | 'HIGH PROBABILITY' 
  | 'POSSIBLE MATCH' 
  | 'POTENTIAL MATCH' 
  | 'LOW PROBABILITY';

export interface Match {
  id: string;
  lostReportId: string;
  foundReportId: string;
  lostCaseId: string;
  foundCaseId: string;
  lostUserId: string;
  foundUserId: string;
  score: number; // 0-100
  level: MatchLevel;
  reasons: string[];
  contactAvailable: boolean; // score >= 50
  status: 'PENDING' | 'VERIFYING' | 'VERIFIED' | 'HANDOVER' | 'RETURNED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
}

export interface VerificationAttempt {
  id: string;
  matchId: string;
  lostCaseId: string;
  foundCaseId: string;
  question: string;
  attemptsCount: number; // Max 3
  maxAttemptsReached: boolean;
  isVerified: boolean;
  adminReviewRequired: boolean;
  history: Array<{
    attemptNumber: number;
    answer: string;
    passed: boolean;
    timestamp: string;
  }>;
  updatedAt: string;
}

export interface Handover {
  id: string;
  matchId: string;
  lostCaseId: string;
  foundCaseId: string;
  ownerUserId: string;
  finderUserId: string;
  safeCampusLocation: string;
  scheduledDateTime: string;
  contactNotes?: string;
  finderAccepted: boolean;
  ownerConfirmedReturn: boolean;
  finderConfirmedReturn: boolean;
  status: 'PENDING_ACCEPTANCE' | 'SCHEDULED' | 'RETURNED';
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Complaint {
  id: string;
  caseId: string;
  userId: string;
  userName: string;
  userEmail: string;
  category: 'Wrong Match' | 'Ownership Dispute' | 'Finder Refusing Return' | 'Suspicious Activity' | 'Incorrect Information' | 'Harassment' | 'Other';
  description: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED';
  adminResolution?: string;
  createdAt: string;
  resolvedAt?: string | null;
}

export interface AdminAlert {
  id: string;
  caseId: string;
  userId: string;
  reportType: ReportType;
  itemCategory: string;
  createdTime: string;
  lastKnownLocation: string;
  currentStatus: string;
  escalationReason: string;
  createdAt: string;
  emailSentTo?: string | null;
  emailSentAt?: string | null;
  isResolved: boolean;
}

export interface TimelineEvent {
  id: string;
  caseId: string;
  type: 'REPORT_CREATED' | 'AI_ANALYSIS' | 'MATCH_FOUND' | 'CONTACT_RELEASED' | 'VERIFICATION' | 'HANDOVER' | 'RETURNED' | 'THEFT_ALERT' | 'ADMIN_REVIEW';
  title: string;
  description: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 
    | 'REPORT_CREATED' 
    | 'POSSIBLE_MATCH' 
    | 'HIGH_PROBABILITY_MATCH' 
    | 'CONTACT_AVAILABLE' 
    | 'VERIFICATION_REQUIRED' 
    | 'VERIFICATION_FAILED' 
    | 'HANDOVER_REQUEST' 
    | 'HANDOVER_ACCEPTED' 
    | 'ITEM_RETURNED' 
    | 'ADMIN_REVIEW' 
    | 'COMPLAINT_UPDATE' 
    | 'THEFT_ALERT';
  linkCaseId?: string;
  read: boolean;
  createdAt: string;
}

interface DatabaseSchema {
  caseCounter: number;
  users: User[];
  reports: Report[];
  matches: Match[];
  verifications: VerificationAttempt[];
  handovers: Handover[];
  complaints: Complaint[];
  alerts: AdminAlert[];
  notifications: Notification[];
  timelines: TimelineEvent[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'campusfind.json');

// Real clean starting state - absolutely NO demo or fake records!
const defaultDb: DatabaseSchema = {
  caseCounter: 0,
  users: [],
  reports: [],
  matches: [],
  verifications: [],
  handovers: [],
  complaints: [],
  alerts: [],
  notifications: [],
  timelines: [],
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error loading database, resetting to clean schema:', err);
    }
    this.save(defaultDb);
    return defaultDb;
  }

  private save(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database:', err);
    }
  }

  public getNextCaseId(): string {
    this.data.caseCounter += 1;
    const year = new Date().getFullYear();
    const formatted = String(this.data.caseCounter).padStart(6, '0');
    this.save(this.data);
    return `CFA-${year}-${formatted}`;
  }

  // User operations
  public findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public findUserByEmailOrMobile(identifier: string): User | undefined {
    if (!identifier) return undefined;
    const clean = identifier.trim().toLowerCase();
    const cleanMobile = identifier.trim();
    return this.data.users.find(u => 
      (u.mobile && u.mobile.trim() === cleanMobile) ||
      (u.studentId && u.studentId.trim().toLowerCase() === clean) ||
      (u.email && u.email.toLowerCase() === clean)
    );
  }

  public createUser(user: User): User {
    this.data.users.push(user);
    this.save(this.data);
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.save(this.data);
    return this.data.users[idx];
  }

  public getAllUsers(): User[] {
    return [...this.data.users];
  }

  // Reports
  public createReport(report: Report): Report {
    this.data.reports.push(report);
    this.save(this.data);
    return report;
  }

  public updateReport(id: string, updates: Partial<Report>): Report | undefined {
    const idx = this.data.reports.findIndex(r => r.id === id || r.caseId === id);
    if (idx === -1) return undefined;
    this.data.reports[idx] = { ...this.data.reports[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save(this.data);
    return this.data.reports[idx];
  }

  public getReportByIdOrCaseId(idOrCaseId: string): Report | undefined {
    return this.data.reports.find(r => r.id === idOrCaseId || r.caseId === idOrCaseId);
  }

  public getReportsByUserId(userId: string): Report[] {
    return this.data.reports.filter(r => r.userId === userId);
  }

  public getAllReports(): Report[] {
    return [...this.data.reports];
  }

  public getActiveReportsByType(type: ReportType): Report[] {
    return this.data.reports.filter(r => 
      r.type === type && 
      r.status !== 'RETURNED' && 
      r.status !== 'CLOSED'
    );
  }

  // Matches
  public getMatchByPair(lostReportId: string, foundReportId: string): Match | undefined {
    return this.data.matches.find(m => 
      m.lostReportId === lostReportId && m.foundReportId === foundReportId
    );
  }

  public getMatchById(id: string): Match | undefined {
    return this.data.matches.find(m => m.id === id);
  }

  public getMatchesForUser(userId: string): Match[] {
    return this.data.matches.filter(m => m.lostUserId === userId || m.foundUserId === userId);
  }

  public getAllMatches(): Match[] {
    return [...this.data.matches];
  }

  public saveMatch(match: Match): Match {
    const existingIndex = this.data.matches.findIndex(m => 
      (m.id === match.id) || 
      (m.lostReportId === match.lostReportId && m.foundReportId === match.foundReportId)
    );
    if (existingIndex !== -1) {
      this.data.matches[existingIndex] = { ...match, updatedAt: new Date().toISOString() };
    } else {
      this.data.matches.push(match);
    }
    this.save(this.data);
    return match;
  }

  public updateMatch(id: string, updates: Partial<Match>): Match | undefined {
    const idx = this.data.matches.findIndex(m => m.id === id);
    if (idx === -1) return undefined;
    this.data.matches[idx] = { ...this.data.matches[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save(this.data);
    return this.data.matches[idx];
  }

  // Verification Attempts
  public getAllVerificationAttempts(): VerificationAttempt[] {
    return [...this.data.verifications];
  }

  public getVerificationByMatch(matchId: string): VerificationAttempt | undefined {
    return this.data.verifications.find(v => v.matchId === matchId);
  }

  public saveVerification(v: VerificationAttempt): VerificationAttempt {
    const idx = this.data.verifications.findIndex(item => item.matchId === v.matchId || item.id === v.id);
    if (idx !== -1) {
      this.data.verifications[idx] = { ...v, updatedAt: new Date().toISOString() };
    } else {
      this.data.verifications.push(v);
    }
    this.save(this.data);
    return v;
  }

  // Handovers
  public getHandoverByMatch(matchId: string): Handover | undefined {
    return this.data.handovers.find(h => h.matchId === matchId);
  }

  public saveHandover(h: Handover): Handover {
    const idx = this.data.handovers.findIndex(item => item.matchId === h.matchId || item.id === h.id);
    if (idx !== -1) {
      this.data.handovers[idx] = { ...h, updatedAt: new Date().toISOString() };
    } else {
      this.data.handovers.push(h);
    }
    this.save(this.data);
    return h;
  }

  // Complaints
  public createComplaint(c: Complaint): Complaint {
    this.data.complaints.push(c);
    this.save(this.data);
    return c;
  }

  public getAllComplaints(): Complaint[] {
    return [...this.data.complaints];
  }

  public getComplaintsByUser(userId: string): Complaint[] {
    return this.data.complaints.filter(c => c.userId === userId);
  }

  public updateComplaint(id: string, updates: Partial<Complaint>): Complaint | undefined {
    const idx = this.data.complaints.findIndex(c => c.id === id);
    if (idx === -1) return undefined;
    this.data.complaints[idx] = { ...this.data.complaints[idx], ...updates };
    this.save(this.data);
    return this.data.complaints[idx];
  }

  // Admin Alerts
  public createAlert(alert: AdminAlert): AdminAlert {
    this.data.alerts.push(alert);
    this.save(this.data);
    return alert;
  }

  public getAllAlerts(): AdminAlert[] {
    return [...this.data.alerts];
  }

  public updateAlert(id: string, updates: Partial<AdminAlert>): AdminAlert | undefined {
    const idx = this.data.alerts.findIndex(a => a.id === id);
    if (idx === -1) return undefined;
    this.data.alerts[idx] = { ...this.data.alerts[idx], ...updates };
    this.save(this.data);
    return this.data.alerts[idx];
  }

  // Notifications
  public addNotification(notification: Notification): Notification {
    this.data.notifications.unshift(notification);
    this.save(this.data);
    return notification;
  }

  public getNotificationsByUser(userId: string): Notification[] {
    return this.data.notifications.filter(n => n.userId === userId);
  }

  public markNotificationRead(id: string, userId: string): void {
    const item = this.data.notifications.find(n => n.id === id && n.userId === userId);
    if (item) {
      item.read = true;
      this.save(this.data);
    }
  }

  // Timelines
  public addTimelineEvent(event: TimelineEvent): TimelineEvent {
    this.data.timelines.push(event);
    this.save(this.data);
    return event;
  }

  public getTimelineForCase(caseId: string): TimelineEvent[] {
    return this.data.timelines.filter(t => t.caseId === caseId).sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }
}

export const db = new Database();
