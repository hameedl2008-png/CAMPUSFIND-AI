import { 
  User, 
  Report, 
  EnrichedMatch, 
  VerificationAttempt, 
  Handover, 
  Complaint, 
  NotificationItem, 
  TimelineEvent,
  AdminAlert
} from './types';

const TOKEN_KEY = 'cfa_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  async register(payload: {
    fullName: string;
    mobile: string;
    studentId: string;
    department: string;
    year: string;
    email?: string;
    password: string;
  }): Promise<{ user: User; token: string }> {
    const res = await request<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setStoredToken(res.token);
    return res;
  },

  async login(identifier: string, password: string): Promise<{ user: User; token: string }> {
    const res = await request<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    setStoredToken(res.token);
    return res;
  },

  async getMe(): Promise<{ user: User }> {
    return request<{ user: User }>('/api/auth/me');
  },

  async updateProfile(payload: {
    fullName?: string;
    mobile?: string;
    studentId?: string;
    department?: string;
    year?: string;
    email?: string;
  }): Promise<{ user: User }> {
    return request<{ user: User }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  // Reports
  async createReport(payload: Partial<Report>): Promise<{ report: Report; matchesCreated: number }> {
    return request<{ report: Report; matchesCreated: number }>('/api/reports', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getMyReports(): Promise<{ reports: Report[] }> {
    return request<{ reports: Report[] }>('/api/reports/my');
  },

  async getReport(id: string): Promise<{ report: Report }> {
    return request<{ report: Report }>(`/api/reports/${id}`);
  },

  // Matches
  async getMyMatches(): Promise<{ matches: EnrichedMatch[] }> {
    return request<{ matches: EnrichedMatch[] }>('/api/matches/my');
  },

  // Verification
  async getVerification(matchId: string): Promise<{ verification: VerificationAttempt }> {
    return request<{ verification: VerificationAttempt }>(`/api/verify/${matchId}`);
  },

  async submitVerification(matchId: string, answer: string): Promise<{
    verification: VerificationAttempt;
    attemptsRemaining: number;
    isVerified: boolean;
    adminReviewRequired: boolean;
  }> {
    return request(`/api/verify/${matchId}`, {
      method: 'POST',
      body: JSON.stringify({ answer }),
    });
  },

  // Handover
  async getHandover(matchId: string): Promise<{ handover: Handover | null }> {
    return request<{ handover: Handover | null }>(`/api/handover/${matchId}`);
  },

  async requestHandover(payload: {
    matchId: string;
    safeCampusLocation: string;
    scheduledDateTime: string;
    contactNotes?: string;
  }): Promise<{ handover: Handover }> {
    return request<{ handover: Handover }>('/api/handover/request', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async acceptHandover(handoverId: string): Promise<{ handover: Handover }> {
    return request<{ handover: Handover }>('/api/handover/accept', {
      method: 'POST',
      body: JSON.stringify({ handoverId }),
    });
  },

  async confirmHandoverReturn(handoverId: string): Promise<{ handover: Handover }> {
    return request<{ handover: Handover }>('/api/handover/confirm', {
      method: 'POST',
      body: JSON.stringify({ handoverId }),
    });
  },

  // Complaints
  async submitComplaint(payload: {
    caseId: string;
    category: string;
    description: string;
  }): Promise<{ complaint: Complaint }> {
    return request<{ complaint: Complaint }>('/api/complaints', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getMyComplaints(): Promise<{ complaints: Complaint[] }> {
    return request<{ complaints: Complaint[] }>('/api/complaints/my');
  },

  // Notifications
  async getNotifications(): Promise<{ notifications: NotificationItem[] }> {
    return request<{ notifications: NotificationItem[] }>('/api/notifications');
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  // Timeline
  async getTimeline(caseId: string): Promise<{ timeline: TimelineEvent[] }> {
    return request<{ timeline: TimelineEvent[] }>(`/api/timeline/${caseId}`);
  },

  // AI Helpers
  async parseNaturalLanguage(text: string): Promise<any> {
    return request('/api/ai/parse-nl', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  async analyzeImage(imageDataUrl: string): Promise<any> {
    return request('/api/ai/analyze-image', {
      method: 'POST',
      body: JSON.stringify({ imageDataUrl }),
    });
  },

  // Admin Control Room (Private)
  async getAdminOverview(adminKey: string): Promise<{
    metrics: {
      totalReports: number;
      lostReports: number;
      foundReports: number;
      activeCases: number;
      strongMatches: number;
      pendingVerification: number;
      returnedItems: number;
      complaints: number;
      suspiciousCases: number;
      totalUsers: number;
    };
    reports: Report[];
    users: User[];
    matches: any[];
    complaints: Complaint[];
    alerts: AdminAlert[];
  }> {
    const res = await fetch('/api/admin/overview', {
      headers: {
        'x-admin-key': adminKey,
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Admin overview failed');
    return data;
  },

  async adminResolveCase(adminKey: string, caseId: string, status: string, notes?: string) {
    const res = await fetch('/api/admin/resolve-case', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey,
      },
      body: JSON.stringify({ caseId, status, notes }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Admin case resolution failed');
    return data;
  },

  async adminResolveComplaint(adminKey: string, complaintId: string, resolution: string) {
    const res = await fetch('/api/admin/resolve-complaint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey,
      },
      body: JSON.stringify({ complaintId, resolution }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Complaint resolution failed');
    return data;
  },

  async adminTriggerEscalationCheck(adminKey: string) {
    const res = await fetch('/api/admin/trigger-escalation-check', {
      method: 'POST',
      headers: {
        'x-admin-key': adminKey,
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Escalation trigger failed');
    return data;
  },
};
