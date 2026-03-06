import type { ConsentRequest } from '@/shared/types/consent';
import type { RefereeDetails } from '@/shared/types/referee';
import { CONSENT_EMAIL_FOOTER, REFERENCE_CHECK_DISCLAIMER } from './legalTemplates';

export function generateConsentEmail(
  consent: ConsentRequest,
  consentUrl: string
): string {
  const checksHtml = consent.requestedChecks
    .map(check => `<li><strong>${check.description}</strong> via ${check.provider} - $${check.cost}</li>`)
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0ea5e9; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; padding: 12px 30px; background: #0ea5e9; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .checks-list { background: white; padding: 20px; border-left: 4px solid #0ea5e9; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Background Check Consent Request</h1>
    </div>
    <div class="content">
      <p>Dear ${consent.candidateName},</p>
      
      <p>As part of your application process, we need your consent to conduct the following background checks:</p>
      
      <div class="checks-list">
        <h3>Requested Checks:</h3>
        <ul>
          ${checksHtml}
        </ul>
        <p><strong>Total Cost: $${consent.requestedChecks.reduce((sum, c) => sum + c.cost, 0)}</strong></p>
      </div>
      
      <div class="warning">
        <strong>⏰ Important:</strong> This consent request will expire on ${new Date(consent.expiryDate).toLocaleDateString()} (7 days).
      </div>
      
      <p>To review and provide your consent, please click the button below:</p>
      
      <div style="text-align: center;">
        <a href="${consentUrl}" class="button">Review & Provide Consent</a>
      </div>
      
      <p>The consent form will explain your rights under the Fair Credit Reporting Act (FCRA) and allow you to review the full legal disclosure before signing.</p>
      
      <p>If you have any questions or concerns, please don't hesitate to contact us.</p>
      
      <p>Best regards,<br>The HRM8 Team</p>
    </div>
    <div class="footer">
      ${CONSENT_EMAIL_FOOTER}
    </div>
  </div>
</body>
</html>
  `;
}

export function generateRefereeInvitationEmail(
  referee: RefereeDetails,
  candidateName: string,
  questionnaireUrl: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #8b5cf6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; padding: 12px 30px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .info-box { background: white; padding: 20px; border-left: 4px solid #8b5cf6; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Reference Request</h1>
    </div>
    <div class="content">
      <p>Dear ${referee.name},</p>
      
      <p><strong>${candidateName}</strong> has listed you as a professional reference and we would greatly appreciate your feedback.</p>
      
      <div class="info-box">
        <h3>What we're asking:</h3>
        <ul>
          <li>📊 Rate their performance in key areas</li>
          <li>💬 Share your thoughts on their strengths</li>
          <li>⏱️ Estimated time: 5-7 minutes</li>
        </ul>
      </div>
      
      <p>Your honest feedback will help us make informed hiring decisions. All responses are confidential.</p>
      
      <div style="text-align: center;">
        <a href="${questionnaireUrl}" class="button">Complete Questionnaire</a>
      </div>
      
      <p><em>${REFERENCE_CHECK_DISCLAIMER}</em></p>
      
      <p>Thank you for your time and assistance.</p>
      
      <p>Best regards,<br>The HRM8 Team</p>
    </div>
    <div class="footer">
      <p>This is an automated email from HRM8. Please do not reply directly to this email.</p>
      <p>If you believe you received this email in error, please contact support@hrm8.com</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function generateReminderEmail(
  referee: RefereeDetails,
  candidateName: string,
  questionnaireUrl: string,
  reminderNumber: number
): string {
  const subject = reminderNumber === 1 ? 'Gentle Reminder' : 'Final Reminder';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; padding: 12px 30px; background: #f59e0b; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${subject}: Reference Request</h1>
    </div>
    <div class="content">
      <p>Dear ${referee.name},</p>
      
      <p>This is a ${reminderNumber === 1 ? 'friendly' : 'final'} reminder about the reference request for <strong>${candidateName}</strong>.</p>
      
      <p>We haven't yet received your feedback and would greatly appreciate your input. It will only take 5-7 minutes to complete.</p>
      
      <div style="text-align: center;">
        <a href="${questionnaireUrl}" class="button">Complete Questionnaire Now</a>
      </div>
      
      <p>Your insights are valuable and will help us make the best hiring decision.</p>
      
      <p>Thank you for your time.</p>
      
      <p>Best regards,<br>The HRM8 Team</p>
    </div>
    <div class="footer">
      <p>This is an automated reminder from HRM8.</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function generateCompletionNotificationEmail(
  candidateName: string,
  recruiterName: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Reference Check Completed</h1>
    </div>
    <div class="content">
      <p>Hi ${recruiterName},</p>
      
      <p>Great news! A reference check for <strong>${candidateName}</strong> has been completed.</p>
      
      <p>You can now view the results in the candidate's background checks tab.</p>
      
      <div style="text-align: center;">
        <a href="${window.location.origin}/background-checks" class="button">View Results</a>
      </div>
      
      <p>Best regards,<br>The HRM8 Team</p>
    </div>
    <div class="footer">
      <p>This is an automated notification from HRM8.</p>
    </div>
  </div>
</body>
</html>
  `;
}
