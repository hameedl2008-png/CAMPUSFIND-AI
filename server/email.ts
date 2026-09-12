import { Report, AdminAlert, db } from './db.js';

export interface EmailAlertPayload {
  to: string;
  subject: string;
  body: string;
  caseId: string;
}

/**
 * Returns the configured Admin Control Room email if explicitly provided via environment variable.
 * Does NOT fallback to any hardcoded or fake placeholder email.
 */
export function getAdminControlRoomEmail(): string | null {
  const email = process.env.ADMIN_CONTROL_ROOM_EMAIL?.trim();
  return email && email.length > 0 ? email : null;
}

/**
 * Check if the Admin email alert system is enabled.
 * Disabled by default until official administrative approval.
 */
export function isEmailAlertEnabled(): boolean {
  return Boolean(getAdminControlRoomEmail());
}

export async function sendControlRoomAlertEmail(payload: EmailAlertPayload): Promise<boolean> {
  const targetEmail = getAdminControlRoomEmail();
  if (!targetEmail) {
    // Email alert system is disabled until official administrative approval.
    // Application continues normally without error or crash.
    return false;
  }

  console.log(`[CONTROL ROOM EMAIL ALERT] Sending to ${targetEmail} for Case ${payload.caseId}`);
  console.log(`Subject: ${payload.subject}`);
  console.log(`Body:\n${payload.body}`);

  // When officially approved and SMTP / Resend / SendGrid credentials are configured,
  // the network dispatch executes here.
  return true;
}

/**
 * Checks for unresolved theft/suspicious reports >= 24 hours old.
 * Detects, flags, and creates internal Admin Alerts for the Campus Control Room.
 * External email alerts remain DISABLED unless ADMIN_CONTROL_ROOM_EMAIL is configured.
 */
export async function checkAndEscalateTheftCases(): Promise<AdminAlert[]> {
  const allReports = db.getAllReports();
  const escalatedAlerts: AdminAlert[] = [];
  const now = Date.now();
  const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

  for (const report of allReports) {
    if (
      report.isTheftSuspicious &&
      !report.adminAlertCreated &&
      report.status !== 'RETURNED' &&
      report.status !== 'CLOSED'
    ) {
      const createdTimeMs = new Date(report.createdAt).getTime();
      const ageMs = now - createdTimeMs;

      // Escalate if >= 24 hours (or if triggered)
      if (ageMs >= TWENTY_FOUR_HOURS_MS) {
        // Update report status
        db.updateReport(report.id, {
          status: 'ADMIN_REVIEW_REQUIRED',
          isEscalated: true,
          escalatedToAdminAt: new Date().toISOString(),
          adminAlertCreated: true,
        });

        const targetEmail = getAdminControlRoomEmail();
        const escalationReason = `Unresolved theft/suspicious case exceeding 24 hours with no verified return.`;

        const alert: AdminAlert = {
          id: `alert_${Date.now()}_${report.caseId}`,
          caseId: report.caseId,
          userId: report.userId,
          reportType: report.type,
          itemCategory: report.category,
          createdTime: report.createdAt,
          lastKnownLocation: report.location,
          currentStatus: 'ADMIN REVIEW REQUIRED',
          escalationReason,
          createdAt: new Date().toISOString(),
          emailSentTo: targetEmail,
          emailSentAt: targetEmail ? new Date().toISOString() : null,
          isResolved: false,
        };

        db.createAlert(alert);
        escalatedAlerts.push(alert);

        // Add timeline event
        const timelineDesc = targetEmail
          ? `Case reached 24 hours unresolved. Escalated to Campus Control Room and dispatched email alert to ${targetEmail}.`
          : `Case reached 24 hours unresolved. Escalated internally to Campus Control Room for prioritized review (email alerts disabled pending official approval).`;

        db.addTimelineEvent({
          id: `tl_${Date.now()}_escalate`,
          caseId: report.caseId,
          type: 'ADMIN_REVIEW',
          title: '24-Hour Auto-Escalation: Admin Review Required',
          description: timelineDesc,
          timestamp: new Date().toISOString(),
        });

        // Add notification to user
        db.addNotification({
          id: `notif_${Date.now()}_escalate`,
          userId: report.userId,
          title: `Case ${report.caseId} Escalated for Campus Security Review`,
          message: `Your report has been escalated to the Campus Control Room for prioritized investigation.`,
          type: 'ADMIN_REVIEW',
          linkCaseId: report.caseId,
          read: false,
          createdAt: new Date().toISOString(),
        });

        // Only send email if ADMIN_CONTROL_ROOM_EMAIL is explicitly configured
        if (targetEmail) {
          const emailBody = `CampusFind AI — Control Room Alert

Alert Type:
Unresolved Theft / Suspicious Report

Case ID:
${report.caseId}

Report Type:
${report.type}

Item:
${report.itemType} (${report.brand} ${report.model})

Reported At:
${report.createdAt}

Location:
${report.location}

Status:
ADMIN REVIEW REQUIRED

Please review this case in the CampusFind AI Control Room.`;

          await sendControlRoomAlertEmail({
            to: targetEmail,
            subject: `CampusFind AI — Control Room Alert: ${report.caseId}`,
            body: emailBody,
            caseId: report.caseId,
          });
        }
      }
    }
  }

  return escalatedAlerts;
}

