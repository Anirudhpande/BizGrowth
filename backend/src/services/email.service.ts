/**
 * Email Dispatcher Service
 * Simulated dispatcher that outputs styled terminal mail banners for sandboxed local environments.
 */
class EmailService {
  /**
   * Logs a beautifully formatted email package to console.
   */
  private logEmail(to: string, subject: string, htmlContent: string): void {
    console.log(`
  ┌────────────────────────────────────────────────────────┐
  │ 📧 [SMTP SIMULATOR] Email Dispatched                   │
  ├────────────────────────────────────────────────────────┤
  │ To:      ${to.padEnd(46)}│
  │ Subject: ${subject.padEnd(46)}│
  ├────────────────────────────────────────────────────────┤
  │ HTML BODY CONTENT Preview:                             │
  │                                                        │
  ${htmlContent
    .split('\n')
    .map(line => `  │ ${line.substring(0, 52).padEnd(52)} │`)
    .slice(0, 10)
    .join('\n')}
  │ ... (truncated)                                        │
  └────────────────────────────────────────────────────────┘
    `);
  }

  /**
   * Sends booking confirmation emails to both client and consultant.
   */
  async sendBookingConfirmation(
    clientEmail: string,
    clientName: string,
    consultantEmail: string,
    consultantName: string,
    scheduledAt: string,
    durationMinutes: number
  ): Promise<boolean> {
    const formattedDate = new Date(scheduledAt).toLocaleString();

    // 1. Email to Client
    const clientSubject = 'Consultation Booking Scheduled — BizGrowth';
    const clientHtml = `
      <h1>Hello ${clientName},</h1>
      <p>Your business growth consultation with <strong>${consultantName}</strong> has been successfully scheduled.</p>
      <ul>
        <li><strong>Date & Time:</strong> ${formattedDate}</li>
        <li><strong>Duration:</strong> ${durationMinutes} minutes</li>
      </ul>
      <p>Thank you for choosing BizGrowth for strategic advisory services.</p>
    `;
    this.logEmail(clientEmail, clientSubject, clientHtml.trim());

    // 2. Email to Consultant
    const consultantSubject = 'New Booking Alert — BizGrowth';
    const consultantHtml = `
      <h1>Hello ${consultantName},</h1>
      <p>A new consultation has been booked with client <strong>${clientName}</strong>.</p>
      <ul>
        <li><strong>Scheduled Date:</strong> ${formattedDate}</li>
        <li><strong>Duration:</strong> ${durationMinutes} minutes</li>
      </ul>
      <p>Please log in to your portal to review notes and prepare for the session.</p>
    `;
    this.logEmail(consultantEmail, consultantSubject, consultantHtml.trim());

    return true;
  }

  /**
   * Sends payment receipt notification email.
   */
  async sendPaymentReceipt(
    userEmail: string,
    userName: string,
    amount: number,
    itemDescription: string
  ): Promise<boolean> {
    const subject = 'Payment Receipt — BizGrowth';
    const html = `
      <h1>Hello ${userName},</h1>
      <p>Thank you for your payment of <strong>INR ${amount}</strong> for: <em>${itemDescription}</em>.</p>
      <p>Your transaction has been processed successfully.</p>
    `;
    this.logEmail(userEmail, subject, html.trim());
    return true;
  }
}

export default new EmailService();
