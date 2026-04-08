let transporterPromise;

const hasMailConfig = () =>
  Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.MAIL_FROM
  );

const loadNodemailer = async () => {
  const module = await import('nodemailer');
  return module.default || module;
};

const getTransporter = async () => {
  if (!hasMailConfig()) {
    return null;
  }

  if (!transporterPromise) {
    transporterPromise = loadNodemailer().then((nodemailer) =>
      nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
    );
  }

  return transporterPromise;
};

const sendEmail = async ({ to, subject, text, html }) => {
  if (!to) {
    return { skipped: true, reason: 'missing-recipient' };
  }

  if (!hasMailConfig()) {
    console.warn('[Email] SMTP is not configured. Skipping email send.');
    return { skipped: true, reason: 'smtp-not-configured' };
  }

  try {
    const transporter = await getTransporter();

    if (!transporter) {
      return { skipped: true, reason: 'transporter-unavailable' };
    }

    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject,
      text,
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Email] Failed to send email:', error.message);
    return { success: false, error: error.message };
  }
};

export const sendComplaintRegisteredEmail = async ({ citizen, complaint }) => {
  const subject = `Complaint registered successfully - ${complaint.trackingId}`;
  const text = [
    `Hello ${citizen.name || 'Citizen'},`,
    '',
    'Your complaint has been registered successfully in CivicCare.',
    `Tracking ID: ${complaint.trackingId}`,
    `Title: ${complaint.title}`,
    `Category: ${complaint.category}`,
    `Locality: ${complaint.locality}`,
    `Current Status: ${complaint.status}`,
    '',
    'Our team will review and update your complaint soon.',
    '',
    'Regards,',
    'CivicCare Team',
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
      <h2 style="color: #166534;">Complaint Registered Successfully</h2>
      <p>Hello ${citizen.name || 'Citizen'},</p>
      <p>Your complaint has been registered successfully in CivicCare.</p>
      <p><strong>Tracking ID:</strong> ${complaint.trackingId}</p>
      <p><strong>Title:</strong> ${complaint.title}</p>
      <p><strong>Category:</strong> ${complaint.category}</p>
      <p><strong>Locality:</strong> ${complaint.locality}</p>
      <p><strong>Current Status:</strong> ${complaint.status}</p>
      <p>Our team will review and update your complaint soon.</p>
      <p>Regards,<br />CivicCare Team</p>
    </div>
  `;

  return sendEmail({
    to: citizen.email,
    subject,
    text,
    html,
  });
};

export const sendComplaintCompletionEmail = async ({ citizen, complaint, teamName, message }) => {
  const subject = `Complaint completed - ${complaint.trackingId}`;
  const completionMessage =
    message ||
    `Your complaint "${complaint.title}" has been marked as completed by ${teamName || 'the assigned team'}.`;

  const text = [
    `Hello ${citizen.name || 'Citizen'},`,
    '',
    completionMessage,
    '',
    `Tracking ID: ${complaint.trackingId}`,
    `Status: ${complaint.status}`,
    `Team: ${teamName || 'Assigned team'}`,
    '',
    'Thank you for using CivicCare.',
    '',
    'Regards,',
    'CivicCare Team',
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
      <h2 style="color: #166534;">Complaint Completion Update</h2>
      <p>Hello ${citizen.name || 'Citizen'},</p>
      <p>${completionMessage}</p>
      <p><strong>Tracking ID:</strong> ${complaint.trackingId}</p>
      <p><strong>Status:</strong> ${complaint.status}</p>
      <p><strong>Team:</strong> ${teamName || 'Assigned team'}</p>
      <p>Thank you for using CivicCare.</p>
      <p>Regards,<br />CivicCare Team</p>
    </div>
  `;

  return sendEmail({
    to: citizen.email,
    subject,
    text,
    html,
  });
};
