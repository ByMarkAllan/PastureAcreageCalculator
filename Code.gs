/**
 * RanchAssist™ Pasture Acreage Calculator
 * Google Apps Script server code
 *
 * Script Property required:
 *   MAPBOX_PUBLIC_TOKEN = your public Mapbox access token
 *
 * User-entered project data is not persisted server-side.
 */

const RA_TOOL = Object.freeze({
  id: 'pasture-acreage-calculator',
  name: 'Pasture Acreage Calculator',
  version: '1.0.0',
  raFormatVersion: '1.0'
});

function doGet() {
  const template = HtmlService.createTemplateFromFile('Index');
  template.clientConfig = JSON.stringify(getClientConfig_());

  return template
    .evaluate()
    .setTitle('Pasture Acreage Calculator | RanchAssist')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getClientConfig_() {
  const props = PropertiesService.getScriptProperties();
  return {
    mapboxToken: props.getProperty('MAPBOX_PUBLIC_TOKEN') || '',
    tool: RA_TOOL
  };
}

/**
 * Sends a polished RanchAssist acreage summary.
 * No project data is stored after execution.
 */
function sendPastureAcreageEmail(payload) {
  payload = payload || {};
  const to = String(payload.to || '').trim();
  const subjectProject = safeText_(payload.projectName || 'Pasture Acreage Project', 120);
  const summary = safeText_(payload.summary || '', 12000);

  if (!to || !isEmail_(to)) {
    throw new Error('Enter a valid email address.');
  }
  if (!summary) {
    throw new Error('There is no acreage summary to send yet.');
  }

  const subject = `RanchAssist Pasture Acreage — ${subjectProject}`;
  const escapedSummary = escapeHtml_(summary).replace(/\n/g, '<br>');

  const htmlBody = `
    <div style="margin:0;background:#f7f7f4;padding:28px;font-family:Arial,sans-serif;color:#171715">
      <div style="max-width:720px;margin:0 auto;background:#fff;border:1px solid #deded8;border-radius:12px;overflow:hidden">
        <div style="padding:22px 24px;border-bottom:1px solid #deded8">
          <div style="font-size:12px;letter-spacing:.12em;font-weight:700;color:#666660">RANCHASSIST™</div>
          <h1 style="font-size:24px;margin:8px 0 0">Pasture Acreage Calculator</h1>
        </div>
        <div style="padding:24px;line-height:1.55;font-size:14px">${escapedSummary}</div>
        <div style="padding:18px 24px;border-top:1px solid #deded8;background:#f7f7f4;font-size:12px;color:#666660">
          Mapped boundaries are operational planning measurements and are not a legal survey or substitute for a licensed surveyor.
        </div>
      </div>
    </div>`;

  MailApp.sendEmail({
    to,
    subject,
    body: summary,
    htmlBody,
    name: 'RanchAssist'
  });

  return { ok: true, message: 'Email sent.' };
}

function isEmail_(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function safeText_(value, maxLength) {
  return String(value == null ? '' : value).slice(0, maxLength || 5000);
}

function escapeHtml_(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
