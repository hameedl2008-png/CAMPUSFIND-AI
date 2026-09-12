export interface User {
  id: string;
  fullName: string;
  mobile: string;
  studentId: string;
  department: string;
  year: string;
  email?: string;
  createdAt: string;
}

export const COLLEGE_DEPARTMENTS = [
  'AI&DS',
  'CSE',
  'AI&ML',
  'ECE',
  'MECHATRONICS',
  'BIO TECH',
  'AGRI',
] as const;

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
  caseId: string;
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
  privateVerificationSecret?: string;
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

export interface EnrichedMatch {
  id: string;
  lostReportId: string;
  foundReportId: string;
  lostCaseId: string;
  foundCaseId: string;
  lostUserId: string;
  foundUserId: string;
  score: number;
  level: MatchLevel;
  reasons: string[];
  contactAvailable: boolean;
  status: 'PENDING' | 'VERIFYING' | 'VERIFIED' | 'HANDOVER' | 'RETURNED' | 'FAILED';
  isLostOwner: boolean;
  myReport?: Report;
  otherReport?: Partial<Report> | null;
  otherContact?: {
    name: string;
    mobile: string;
    department?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationAttempt {
  id: string;
  matchId: string;
  lostCaseId: string;
  foundCaseId: string;
  question: string;
  attemptsCount: number;
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

export interface NotificationItem {
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
