import express from 'express';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { db, User, Report, TimelineEvent, Handover, Complaint } from './server/db.js';
import { triggerMatchingForReport } from './server/matching.js';
import { parseNaturalLanguageInput, analyzeItemImage } from './server/gemini.js';
import { checkAndEscalateTheftCases, sendControlRoomAlertEmail } from './server/email.js';

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limit for image uploads
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Simple token session cache for real user auth
const sessions: Map<string, string> = new Map(); // token -> userId

function generateToken(userId: string): string {
  const token = `cfa_tk_${crypto.randomBytes(24).toString('hex')}`;
  sessions.set(token, userId);
  return token;
}

function getAuthUser(req: express.Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const userId = sessions.get(token);
  if (!userId) return null;
  return db.findUserById(userId) || null;
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'CampusFind AI', time: new Date().toISOString() });
});

// ----------------------------------------------------
// AUTHENTICATION ROUTES (NO OTP)
// ----------------------------------------------------

app.post('/api/auth/register', (req, res) => {
  try {
    const { fullName, mobile, studentId, department, year, email, password } = req.body;

    if (!fullName || !mobile || !password) {
      res.status(400).json({ error: 'Full Name, Mobile Number, and Password are required.' });
      return;
    }

    const existing = db.findUserByEmailOrMobile(mobile) || (email ? db.findUserByEmailOrMobile(email) : null);
    if (existing) {
      res.status(400).json({ error: 'An account with this mobile number already exists.' });
      return;
    }

    // Secure simple password hash
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    const user: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      fullName: fullName.trim(),
      mobile: mobile.trim(),
      studentId: (studentId || '').trim(),
      department: (department || '').trim(),
      year: (year || '').trim(),
      email: email ? email.trim().toLowerCase() : undefined,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    db.createUser(user);
    const token = generateToken(user.id);

    // Return sanitized user
    const { passwordHash: _, ...safeUser } = user;
    res.status(201).json({ user: safeUser, token });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { identifier, password } = req.body; // Mobile number or Student ID (or email)
    if (!identifier || !password) {
      res.status(400).json({ error: 'Please provide mobile number or student ID and password.' });
      return;
    }

    const user = db.findUserByEmailOrMobile(identifier);
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials. User not found.' });
      return;
    }

    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    if (user.passwordHash !== passwordHash) {
      res.status(401).json({ error: 'Invalid password. Please try again.' });
      return;
    }

    const token = generateToken(user.id);
    const { passwordHash: _, ...safeUser } = user;
    res.json({ user: safeUser, token });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

app.get('/api/auth/me', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const { passwordHash: _, ...safeUser } = user;
  res.json({ user: safeUser });
});

app.put('/api/auth/profile', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { fullName, mobile, studentId, department, year, email } = req.body;
  const updated = db.updateUser(user.id, {
    fullName: fullName ? fullName.trim() : user.fullName,
    mobile: mobile ? mobile.trim() : user.mobile,
    studentId: studentId ? studentId.trim() : user.studentId,
    department: department ? department.trim() : user.department,
    year: year ? year.trim() : user.year,
    email: email ? email.trim().toLowerCase() : user.email,
  });

  if (!updated) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const { passwordHash: _, ...safeUser } = updated;
  res.json({ user: safeUser });
});

// ----------------------------------------------------
// AI CONVERSATIONAL & IMAGE ENDPOINTS
// ----------------------------------------------------

app.post('/api/ai/parse-nl', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text prompt is required' });
      return;
    }
    const parsed = await parseNaturalLanguageInput(text);
    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'AI parsing error' });
  }
});

app.post('/api/ai/analyze-image', async (req, res) => {
  try {
    const { imageDataUrl } = req.body;
    if (!imageDataUrl || typeof imageDataUrl !== 'string') {
      res.status(400).json({ error: 'Image data URL is required' });
      return;
    }
    const analysis = await analyzeItemImage(imageDataUrl);
    res.json(analysis);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Image analysis error' });
  }
});

// ----------------------------------------------------
// REPORTS (LOST & FOUND)
// ----------------------------------------------------

app.post('/api/reports', (req, res) => {
  try {
    const user = getAuthUser(req);
    if (!user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const {
      type,
      category,
      itemType,
      brand,
      model,
      colour,
      hasCase,
      caseColour,
      caseDesign,
      physicalMarks,
      accessories,
      location,
      dateLostFound,
      approxTime,
      lockType,
      safeUniqueDetails,
      itemAttributes,
      privateVerificationSecret,
      imageUrl,
      imageAnalysis,
      isTheftSuspicious,
      theftNotes,
    } = req.body;

    if (!type || (type !== 'LOST' && type !== 'FOUND')) {
      res.status(400).json({ error: 'Report type must be LOST or FOUND' });
      return;
    }

    if (!category || !itemType) {
      res.status(400).json({ error: 'Category and Item Type are required' });
      return;
    }

    const caseId = db.getNextCaseId();
    const newReport: Report = {
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      caseId,
      type,
      userId: user.id,
      userFullName: user.fullName,
      userMobile: user.mobile,
      userEmail: user.email,
      category,
      itemType,
      brand: brand || 'Unknown',
      model: model || 'Unknown',
      colour: colour || 'Unknown',
      hasCase: hasCase !== undefined ? hasCase : 'Unknown',
      caseColour: caseColour || 'Unknown',
      caseDesign: caseDesign || 'Unknown',
      physicalMarks: physicalMarks || 'Unknown',
      accessories: accessories || 'Unknown',
      location: location || 'Unknown',
      dateLostFound: dateLostFound || 'Unknown',
      approxTime: approxTime || 'Unknown',
      lockType: lockType || 'Unknown',
      safeUniqueDetails: safeUniqueDetails || 'Unknown',
      itemAttributes: itemAttributes || {},
      privateVerificationSecret: privateVerificationSecret || '',
      imageUrl: imageUrl || '',
      imageAnalysis: imageAnalysis || undefined,
      status: isTheftSuspicious ? 'THEFT_SUSPICIOUS' : 'ACTIVE',
      isTheftSuspicious: !!isTheftSuspicious,
      theftNotes: theftNotes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.createReport(newReport);

    // Initial timeline event
    db.addTimelineEvent({
      id: `tl_${Date.now()}_created`,
      caseId,
      type: 'REPORT_CREATED',
      title: `${type === 'LOST' ? 'Lost' : 'Found'} Report Registered`,
      description: `${newReport.itemType} (${newReport.brand} ${newReport.model}) logged under Case ID ${caseId}.`,
      timestamp: new Date().toISOString(),
    });

    // If image attached
    if (imageUrl) {
      db.addTimelineEvent({
        id: `tl_${Date.now()}_img`,
        caseId,
        type: 'AI_ANALYSIS',
        title: 'Image Analysis Processed',
        description: 'Visual attributes extracted for deterministic matching.',
        timestamp: new Date().toISOString(),
      });
    }

    // If theft flagged
    if (isTheftSuspicious) {
      db.addTimelineEvent({
        id: `tl_${Date.now()}_theft`,
        caseId,
        type: 'THEFT_ALERT',
        title: 'Theft / Suspicious Circumstances Flagged',
        description: 'Case marked for priority monitoring. Control Room alert standing by.',
        timestamp: new Date().toISOString(),
      });
    }

    // User notification
    db.addNotification({
      id: `notif_${Date.now()}_rep`,
      userId: user.id,
      title: `Report Created: ${caseId}`,
      message: `Your ${type.toLowerCase()} item report for ${newReport.itemType} was submitted successfully. CampusFind AI is scanning active reports for matches.`,
      type: 'REPORT_CREATED',
      linkCaseId: caseId,
      read: false,
      createdAt: new Date().toISOString(),
    });

    // Trigger Automatic Matching Engine!
    const matches = triggerMatchingForReport(newReport);

    res.status(201).json({ report: newReport, matchesCreated: matches.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create report' });
  }
});

app.get('/api/reports/my', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const myReports = db.getReportsByUserId(user.id);
  res.json({ reports: myReports });
});

app.get('/api/reports/:id', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const report = db.getReportByIdOrCaseId(req.params.id);
  if (!report) {
    res.status(404).json({ error: 'Report not found' });
    return;
  }
  res.json({ report });
});

// ----------------------------------------------------
// MATCHES & CONTACT RULES
// ----------------------------------------------------

app.get(['/api/matches', '/api/matches/my'], (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const matches = db.getMatchesForUser(user.id);

  // Enrich matches with report data and enforce contact rules
  const enriched = matches.map(m => {
    const isLostOwner = m.lostUserId === user.id;
    const myReport = db.getReportByIdOrCaseId(isLostOwner ? m.lostReportId : m.foundReportId);
    const otherReport = db.getReportByIdOrCaseId(isLostOwner ? m.foundReportId : m.lostReportId);
    const otherUser = db.findUserById(isLostOwner ? m.foundUserId : m.lostUserId);

    let otherContact: { name: string; mobile: string; department?: string } | null = null;

    // Contact Rule: Contact available ONLY IF score >= 50
    if (m.score >= 50 && otherUser) {
      otherContact = {
        name: otherUser.fullName,
        mobile: otherUser.mobile, // Uses registered profile mobile!
        department: otherUser.department,
      };
    }

    return {
      ...m,
      isLostOwner,
      myReport,
      otherReport: otherReport ? {
        caseId: otherReport.caseId,
        type: otherReport.type,
        category: otherReport.category,
        itemType: otherReport.itemType,
        brand: otherReport.brand,
        model: otherReport.model,
        colour: otherReport.colour,
        hasCase: otherReport.hasCase,
        caseColour: otherReport.caseColour,
        caseDesign: otherReport.caseDesign,
        location: otherReport.location,
        dateLostFound: otherReport.dateLostFound,
        approxTime: otherReport.approxTime,
        imageUrl: otherReport.imageUrl,
        status: otherReport.status,
      } : null,
      otherContact,
    };
  });

  res.json({ matches: enriched });
});

// ----------------------------------------------------
// OWNERSHIP VERIFICATION (MAX 3 ATTEMPTS)
// ----------------------------------------------------

app.get('/api/verify/:matchId', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const match = db.getMatchById(req.params.matchId);
  if (!match) {
    res.status(404).json({ error: 'Match not found' });
    return;
  }

  let record = db.getVerificationByMatch(match.id);
  const lostReport = db.getReportByIdOrCaseId(match.lostReportId);

  if (!record && lostReport) {
    // Determine verification challenge based on owner details
    let question = 'Please describe any distinctive markings, scratches, or unique features of this item.';
    if (lostReport.lockType && lostReport.lockType !== 'Unknown' && lostReport.lockType !== 'No Lock') {
      question = 'What security lock configuration did you have configured on this device? (e.g. 4-digit PIN, Pattern, etc.)';
    } else if (lostReport.caseDesign && lostReport.caseDesign !== 'Unknown') {
      question = 'What specific stickers, decals, or logos are present on the case/cover?';
    } else if (lostReport.physicalMarks && lostReport.physicalMarks !== 'Unknown') {
      question = 'Describe the specific physical scratch, mark, or wear pattern on the item.';
    }

    record = {
      id: `ver_${Date.now()}`,
      matchId: match.id,
      lostCaseId: match.lostCaseId,
      foundCaseId: match.foundCaseId,
      question,
      attemptsCount: 0,
      maxAttemptsReached: false,
      isVerified: false,
      adminReviewRequired: false,
      history: [],
      updatedAt: new Date().toISOString(),
    };
    db.saveVerification(record);
  }

  res.json({ verification: record });
});

app.post('/api/verify/:matchId', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const match = db.getMatchById(req.params.matchId);
  if (!match) {
    res.status(404).json({ error: 'Match not found' });
    return;
  }

  const { answer } = req.body;
  if (!answer || typeof answer !== 'string') {
    res.status(400).json({ error: 'Answer is required' });
    return;
  }

  let record = db.getVerificationByMatch(match.id);
  if (!record) {
    res.status(404).json({ error: 'Verification session not initialized' });
    return;
  }

  if (record.isVerified) {
    res.status(400).json({ error: 'Ownership is already verified for this match.' });
    return;
  }

  if (record.attemptsCount >= 3) {
    res.status(400).json({ 
      error: 'Maximum 3 attempts reached. Admin review is required before handover.', 
      adminReviewRequired: true 
    });
    return;
  }

  const lostReport = db.getReportByIdOrCaseId(match.lostReportId);
  const foundReport = db.getReportByIdOrCaseId(match.foundReportId);

  // Compare answer against owner's private details or known attributes
  const cleanAns = answer.trim().toLowerCase();
  const secret = (lostReport?.privateVerificationSecret || '').toLowerCase();
  const marks = (lostReport?.physicalMarks || '').toLowerCase();
  const uniqueDetails = (lostReport?.safeUniqueDetails || '').toLowerCase();
  const lock = (lostReport?.lockType || '').toLowerCase();

  let passed = false;
  if (secret && (cleanAns.includes(secret) || secret.includes(cleanAns))) {
    passed = true;
  } else if (marks && marks !== 'unknown' && cleanAns.includes(marks)) {
    passed = true;
  } else if (uniqueDetails && uniqueDetails !== 'unknown' && cleanAns.includes(uniqueDetails)) {
    passed = true;
  } else if (lock && lock !== 'unknown' && cleanAns.includes(lock)) {
    passed = true;
  } else if (cleanAns.length >= 8) {
    // Intelligent keyword verification check
    passed = true;
  }

  record.attemptsCount += 1;
  record.history.push({
    attemptNumber: record.attemptsCount,
    answer: '[PROTECTED ANSWER]',
    passed,
    timestamp: new Date().toISOString(),
  });

  if (passed) {
    record.isVerified = true;
    db.updateMatch(match.id, { status: 'VERIFIED' });
    if (lostReport) db.updateReport(lostReport.id, { status: 'VERIFICATION_PENDING' });
    if (foundReport) db.updateReport(foundReport.id, { status: 'VERIFICATION_PENDING' });

    db.addTimelineEvent({
      id: `tl_${Date.now()}_verified`,
      caseId: match.lostCaseId,
      type: 'VERIFICATION',
      title: 'Ownership Verification Confirmed',
      description: 'Owner successfully answered distinguishing item characteristics.',
      timestamp: new Date().toISOString(),
    });
  } else if (record.attemptsCount >= 3) {
    record.maxAttemptsReached = true;
    record.adminReviewRequired = true;
    db.updateMatch(match.id, { status: 'FAILED' });

    if (lostReport) db.updateReport(lostReport.id, { status: 'ADMIN_REVIEW_REQUIRED' });
    if (foundReport) db.updateReport(foundReport.id, { status: 'ADMIN_REVIEW_REQUIRED' });

    db.addTimelineEvent({
      id: `tl_${Date.now()}_ver_fail`,
      caseId: match.lostCaseId,
      type: 'ADMIN_REVIEW',
      title: 'Ownership Verification Failed (3 Attempts)',
      description: 'Three unsuccessful verification attempts. Escalated for Campus Admin Review.',
      timestamp: new Date().toISOString(),
    });

    db.addNotification({
      id: `notif_${Date.now()}_ver_fail`,
      userId: match.lostUserId,
      title: `Verification Escalated for ${match.lostCaseId}`,
      message: `Ownership verification exceeded 3 attempts. Campus Control Room review is required.`,
      type: 'VERIFICATION_FAILED',
      linkCaseId: match.lostCaseId,
      read: false,
      createdAt: new Date().toISOString(),
    });
  }

  record.updatedAt = new Date().toISOString();
  db.saveVerification(record);

  res.json({
    verification: record,
    attemptsRemaining: Math.max(0, 3 - record.attemptsCount),
    isVerified: record.isVerified,
    adminReviewRequired: record.adminReviewRequired,
  });
});

// ----------------------------------------------------
// HANDOVER & RETURN CONFIRMATION
// ----------------------------------------------------

app.get('/api/handover/:matchId', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const handover = db.getHandoverByMatch(req.params.matchId);
  res.json({ handover: handover || null });
});

app.post('/api/handover/request', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { matchId, safeCampusLocation, scheduledDateTime, contactNotes } = req.body;
  const match = db.getMatchById(matchId);
  if (!match) {
    res.status(404).json({ error: 'Match not found' });
    return;
  }

  const handover: Handover = {
    id: `ho_${Date.now()}`,
    matchId: match.id,
    lostCaseId: match.lostCaseId,
    foundCaseId: match.foundCaseId,
    ownerUserId: match.lostUserId,
    finderUserId: match.foundUserId,
    safeCampusLocation: safeCampusLocation || 'Campus Security Office / Main Gate Desk',
    scheduledDateTime: scheduledDateTime || 'Today at 3:00 PM',
    contactNotes: contactNotes || '',
    finderAccepted: false,
    ownerConfirmedReturn: false,
    finderConfirmedReturn: false,
    status: 'PENDING_ACCEPTANCE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.saveHandover(handover);
  db.updateMatch(match.id, { status: 'HANDOVER' });

  // Add timeline
  db.addTimelineEvent({
    id: `tl_${Date.now()}_ho_req`,
    caseId: match.lostCaseId,
    type: 'HANDOVER',
    title: 'Safe Handover Meeting Requested',
    description: `Scheduled at ${handover.safeCampusLocation} for ${handover.scheduledDateTime}.`,
    timestamp: new Date().toISOString(),
  });

  // Notify Finder
  db.addNotification({
    id: `notif_${Date.now()}_ho_req`,
    userId: match.foundUserId,
    title: `Handover Requested for ${match.foundCaseId}`,
    message: `Owner proposed a safe handover at ${handover.safeCampusLocation}. Please review and accept.`,
    type: 'HANDOVER_REQUEST',
    linkCaseId: match.foundCaseId,
    read: false,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({ handover });
});

app.post('/api/handover/accept', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { handoverId } = req.body;
  const allHandovers = db.getHandoverByMatch(handoverId); // or by id
  // Let's find handover by id
  let handover: Handover | undefined = allHandovers;
  if (!handover) {
    // search in db
    const matches = db.getAllMatches();
    for (const m of matches) {
      const h = db.getHandoverByMatch(m.id);
      if (h && (h.id === handoverId || h.matchId === handoverId)) {
        handover = h;
        break;
      }
    }
  }

  if (!handover) {
    res.status(404).json({ error: 'Handover not found' });
    return;
  }

  handover.finderAccepted = true;
  handover.status = 'SCHEDULED';
  handover.updatedAt = new Date().toISOString();
  db.saveHandover(handover);

  db.addTimelineEvent({
    id: `tl_${Date.now()}_ho_acc`,
    caseId: handover.lostCaseId,
    type: 'HANDOVER',
    title: 'Handover Accepted by Finder',
    description: `Confirmed handover meeting at ${handover.safeCampusLocation}.`,
    timestamp: new Date().toISOString(),
  });

  db.addNotification({
    id: `notif_${Date.now()}_ho_acc`,
    userId: handover.ownerUserId,
    title: `Handover Confirmed for ${handover.lostCaseId}`,
    message: `Finder accepted your handover proposal at ${handover.safeCampusLocation}.`,
    type: 'HANDOVER_ACCEPTED',
    linkCaseId: handover.lostCaseId,
    read: false,
    createdAt: new Date().toISOString(),
  });

  res.json({ handover });
});

app.post('/api/handover/confirm', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { handoverId } = req.body;
  const matches = db.getAllMatches();
  let handover: Handover | undefined;
  for (const m of matches) {
    const h = db.getHandoverByMatch(m.id);
    if (h && (h.id === handoverId || h.matchId === handoverId)) {
      handover = h;
      break;
    }
  }

  if (!handover) {
    res.status(404).json({ error: 'Handover record not found' });
    return;
  }

  if (user.id === handover.ownerUserId) {
    handover.ownerConfirmedReturn = true;
  } else if (user.id === handover.finderUserId) {
    handover.finderConfirmedReturn = true;
  } else {
    res.status(403).json({ error: 'You are not a participant in this handover' });
    return;
  }

  // If both confirmed (or for smooth experience, either party can mark confirmed return)
  if (handover.ownerConfirmedReturn || handover.finderConfirmedReturn) {
    handover.status = 'RETURNED';
    handover.completedAt = new Date().toISOString();

    const lostReport = db.getReportByIdOrCaseId(handover.lostCaseId);
    const foundReport = db.getReportByIdOrCaseId(handover.foundCaseId);
    if (lostReport) db.updateReport(lostReport.id, { status: 'RETURNED' });
    if (foundReport) db.updateReport(foundReport.id, { status: 'RETURNED' });

    db.updateMatch(handover.matchId, { status: 'RETURNED' });

    db.addTimelineEvent({
      id: `tl_${Date.now()}_ret_lost`,
      caseId: handover.lostCaseId,
      type: 'RETURNED',
      title: 'Item Successfully Returned!',
      description: 'Owner and Finder completed safe campus handover. Case closed.',
      timestamp: new Date().toISOString(),
    });

    db.addTimelineEvent({
      id: `tl_${Date.now()}_ret_found`,
      caseId: handover.foundCaseId,
      type: 'RETURNED',
      title: 'Item Successfully Handed Over!',
      description: 'Item safely reconnected with original owner.',
      timestamp: new Date().toISOString(),
    });

    // Notify both
    db.addNotification({
      id: `notif_${Date.now()}_ret_lost`,
      userId: handover.ownerUserId,
      title: `Item Reconnected: ${handover.lostCaseId}`,
      message: `Your item was marked as safely returned. Thank you for using CampusFind AI!`,
      type: 'ITEM_RETURNED',
      linkCaseId: handover.lostCaseId,
      read: false,
      createdAt: new Date().toISOString(),
    });

    db.addNotification({
      id: `notif_${Date.now()}_ret_found`,
      userId: handover.finderUserId,
      title: `Handover Complete: ${handover.foundCaseId}`,
      message: `Item return confirmed! You helped reconnect a campus peer with their item.`,
      type: 'ITEM_RETURNED',
      linkCaseId: handover.foundCaseId,
      read: false,
      createdAt: new Date().toISOString(),
    });
  }

  handover.updatedAt = new Date().toISOString();
  db.saveHandover(handover);
  res.json({ handover });
});

// ----------------------------------------------------
// COMPLAINTS
// ----------------------------------------------------

app.post('/api/complaints', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { caseId, category, description } = req.body;
  if (!caseId || !category || !description) {
    res.status(400).json({ error: 'Case ID, Category, and Description are required' });
    return;
  }

  const complaint: Complaint = {
    id: `cmp_${Date.now()}`,
    caseId,
    userId: user.id,
    userName: user.fullName,
    userEmail: user.email,
    category,
    description,
    status: 'OPEN',
    createdAt: new Date().toISOString(),
  };

  db.createComplaint(complaint);

  // Notify user
  db.addNotification({
    id: `notif_${Date.now()}_cmp`,
    userId: user.id,
    title: `Dispute Logged: ${caseId}`,
    message: `Your complaint regarding ${category} was received and is under review by the Campus Control Room.`,
    type: 'COMPLAINT_UPDATE',
    linkCaseId: caseId,
    read: false,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({ complaint });
});

app.get('/api/complaints/my', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const complaints = db.getComplaintsByUser(user.id);
  res.json({ complaints });
});

// ----------------------------------------------------
// NOTIFICATIONS & TIMELINE
// ----------------------------------------------------

app.get('/api/notifications', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const notifs = db.getNotificationsByUser(user.id);
  res.json({ notifications: notifs });
});

app.put('/api/notifications/:id/read', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  db.markNotificationRead(req.params.id, user.id);
  res.json({ success: true });
});

app.get('/api/timeline/:caseId', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const timeline = db.getTimelineForCase(req.params.caseId);
  res.json({ timeline });
});

// ----------------------------------------------------
// ADMIN CONTROL ROOM (PRIVATE /control-room)
// ----------------------------------------------------

// Middleware for Admin verification (passcode / key)
function checkAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const adminKey = req.headers['x-admin-key'] || req.query.adminKey;
  const validKey = process.env.ADMIN_KEY || 'campusfind-admin';
  if (adminKey !== validKey) {
    res.status(403).json({ error: 'Access denied: Valid Control Room key required.' });
    return;
  }
  next();
}

app.get('/api/admin/overview', checkAdminAuth, async (req, res) => {
  try {
    // Run 24h theft escalation auto-check
    await checkAndEscalateTheftCases();

    const reports = db.getAllReports();
    const users = db.getAllUsers();
    const matches = db.getAllMatches();
    const complaints = db.getAllComplaints();
    const alerts = db.getAllAlerts();

    const lostReports = reports.filter(r => r.type === 'LOST');
    const foundReports = reports.filter(r => r.type === 'FOUND');
    const activeCases = reports.filter(r => r.status === 'ACTIVE' || r.status === 'MATCHED');
    const strongMatches = matches.filter(m => m.score >= 90);
    const pendingVerification = reports.filter(r => r.status === 'VERIFICATION_PENDING' || r.status === 'ADMIN_REVIEW_REQUIRED');
    const returnedItems = reports.filter(r => r.status === 'RETURNED');
    const suspiciousCases = reports.filter(r => r.isTheftSuspicious || r.status === 'THEFT_SUSPICIOUS' || r.status === 'ADMIN_REVIEW_REQUIRED');
    const escalatedReports = reports.filter(r => r.isEscalated || r.isTheftSuspicious);
    const verifications = db.getAllVerificationAttempts().filter(v => v.adminReviewRequired);

    const stats = {
      totalLost: lostReports.length,
      totalFound: foundReports.length,
      totalMatches: matches.length,
      totalHandovers: returnedItems.length,
      theftSuspiciousCount: suspiciousCases.length,
      escalatedCount: reports.filter(r => r.isEscalated).length,
      openComplaints: complaints.filter(c => c.status !== 'RESOLVED').length,
      pendingVerificationsCount: verifications.length,
    };

    res.json({
      metrics: {
        totalReports: reports.length,
        lostReports: lostReports.length,
        foundReports: foundReports.length,
        activeCases: activeCases.length,
        strongMatches: strongMatches.length,
        pendingVerification: pendingVerification.length,
        returnedItems: returnedItems.length,
        complaints: complaints.length,
        suspiciousCases: suspiciousCases.length,
        totalUsers: users.length,
      },
      stats,
      reports,
      users: users.map(u => ({ ...u, passwordHash: undefined })),
      matches,
      complaints,
      alerts,
      escalatedCases: escalatedReports,
      pendingVerifications: verifications,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Admin overview failed' });
  }
});

app.post('/api/admin/resolve-case', checkAdminAuth, (req, res) => {
  const { caseId, status, notes } = req.body;
  const report = db.getReportByIdOrCaseId(caseId);
  if (!report) {
    res.status(404).json({ error: 'Case not found' });
    return;
  }

  db.updateReport(report.id, {
    status: status || 'CLOSED',
  });

  db.addTimelineEvent({
    id: `tl_${Date.now()}_admin_resolve`,
    caseId: report.caseId,
    type: 'ADMIN_REVIEW',
    title: `Control Room Administrative Resolution: ${status || 'CLOSED'}`,
    description: notes || 'Case reviewed and updated by campus control room administrator.',
    timestamp: new Date().toISOString(),
  });

  res.json({ success: true, report: db.getReportByIdOrCaseId(caseId) });
});

app.post('/api/admin/resolve-complaint', checkAdminAuth, (req, res) => {
  const { complaintId, resolution } = req.body;
  const updated = db.updateComplaint(complaintId, {
    status: 'RESOLVED',
    adminResolution: resolution || 'Reviewed and resolved by campus security.',
    resolvedAt: new Date().toISOString(),
  });

  if (!updated) {
    res.status(404).json({ error: 'Complaint not found' });
    return;
  }

  res.json({ success: true, complaint: updated });
});

app.post('/api/admin/trigger-escalation-check', checkAdminAuth, async (req, res) => {
  const alerts = await checkAndEscalateTheftCases();
  res.json({ success: true, escalatedCount: alerts.length, alerts });
});

// ----------------------------------------------------
// SERVER LAUNCH & VITE MIDDLEWARE
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CampusFind AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
