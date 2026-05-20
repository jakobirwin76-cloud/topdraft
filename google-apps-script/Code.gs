/**
 * Topdraft Waitlist — Google Apps Script backend.
 *
 * The active Google Sheet is your database.
 * This script handles:
 *   • POST /?action=join       — add email + send confirmation
 *   • GET  /?action=confirm    — confirm email, assign position
 *   • GET  /?action=unsubscribe — opt out
 *   • GET  /?action=count      — return confirmed-user count
 *   • sendBlast()              — manually-triggered broadcast to all confirmed users
 *
 * Setup instructions in SETUP.md.
 */

// ───────────────────────────────────────────────────────────────────
// CONFIG — edit these three lines
// ───────────────────────────────────────────────────────────────────
const SITE_URL  = "https://YOUR-SITE.netlify.app";  // your live Netlify URL
const FROM_NAME = "Topdraft";
const SHEET_NAME = "Waitlist";

const SUBJECT_CONFIRM = "Confirm your Topdraft spot";
const COL = { EMAIL: 1, STATUS: 2, TOKEN: 3, JOINED: 4, CONFIRMED: 5, POSITION: 6, SOURCE: 7 };


// ═══════════════════════════════════════════════════════════════════
// HTTP HANDLERS
// ═══════════════════════════════════════════════════════════════════

function doGet(e) {
  const action = (e.parameter.action || "").toLowerCase();
  if (action === "count")        return jsonResponse(getConfirmedCount());
  if (action === "confirm")      return confirmEmail(e.parameter.token);
  if (action === "unsubscribe")  return unsubscribe(e.parameter.token);
  return jsonResponse({ ok: true, message: "Topdraft API" });
}

function doPost(e) {
  const action = (e.parameter.action || "").toLowerCase();
  if (action === "join") return jsonResponse(joinWaitlist(e.parameter.email, e.parameter.source));
  return jsonResponse({ ok: false, error: "unknown action" });
}


// ═══════════════════════════════════════════════════════════════════
// CORE LOGIC
// ═══════════════════════════════════════════════════════════════════

function joinWaitlist(email, source) {
  email = (email || "").toString().trim().toLowerCase();
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return { ok: false, error: "invalid_email" };
  }

  const sheet = getSheet();
  const existingRow = findRowByEmail(sheet, email);

  if (existingRow > 0) {
    const status = sheet.getRange(existingRow, COL.STATUS).getValue();
    if (status === "confirmed") {
      const position = sheet.getRange(existingRow, COL.POSITION).getValue();
      return { ok: true, alreadyConfirmed: true, position };
    }
    if (status === "unsubscribed") {
      return { ok: false, error: "unsubscribed" };
    }
    // Pending → resend confirmation
    const token = sheet.getRange(existingRow, COL.TOKEN).getValue();
    sendConfirmEmail(email, token);
    return { ok: true, resent: true };
  }

  // New signup
  const token = Utilities.getUuid();
  sheet.appendRow([
    email,
    "pending",
    token,
    new Date(),
    "",
    "",
    source || "",
  ]);
  sendConfirmEmail(email, token);
  return { ok: true };
}

function confirmEmail(token) {
  if (!token) return htmlRedirect("/?error=missing_token");
  const sheet = getSheet();
  const row = findRowByToken(sheet, token);
  if (row < 0) return htmlRedirect("/?error=invalid_token");

  const status = sheet.getRange(row, COL.STATUS).getValue();
  let position;

  if (status === "confirmed") {
    position = sheet.getRange(row, COL.POSITION).getValue();
    return htmlRedirect(`/confirmed.html?position=${position}&already=1`);
  }
  if (status === "unsubscribed") {
    return htmlRedirect("/?error=unsubscribed");
  }

  // Mark confirmed + assign position
  sheet.getRange(row, COL.STATUS).setValue("confirmed");
  sheet.getRange(row, COL.CONFIRMED).setValue(new Date());
  position = getConfirmedCount().count;
  sheet.getRange(row, COL.POSITION).setValue(position);

  return htmlRedirect(`/confirmed.html?position=${position}`);
}

function unsubscribe(token) {
  if (!token) return htmlResponse("Invalid link", 400);
  const sheet = getSheet();
  const row = findRowByToken(sheet, token);
  if (row < 0) return htmlResponse("Link expired or invalid", 404);
  sheet.getRange(row, COL.STATUS).setValue("unsubscribed");
  return htmlResponse(`
    <body style="font-family:-apple-system,sans-serif;background:#0A0A0C;color:#fff;text-align:center;padding:80px 20px;">
      <h1 style="color:#6366F1">Unsubscribed.</h1>
      <p style="color:#A1A1AA">You won't receive any more emails from Topdraft.</p>
    </body>
  `);
}

function getConfirmedCount() {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  let count = 0;
  for (let i = 1; i < data.length; i++) {
    if (data[i][COL.STATUS - 1] === "confirmed") count++;
  }
  return { count };
}


// ═══════════════════════════════════════════════════════════════════
// EMAIL TEMPLATES
// ═══════════════════════════════════════════════════════════════════

function sendConfirmEmail(email, token) {
  const confirmUrl = ScriptApp.getService().getUrl() + "?action=confirm&token=" + token;
  const html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0A0A0C;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0C;padding:48px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" style="max-width:560px;width:100%;">
        <tr><td style="padding:0 8px 32px;">
          <div style="display:inline-flex;align-items:center;gap:10px;">
            <svg width="26" height="26" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="28" height="28" rx="4" fill="#6366F1"/>
              <path d="M7 23 L12 17 L16 19 L20 13 L25 8" stroke="#0A0A0C" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
              <circle cx="25" cy="8" r="1.7" fill="#0A0A0C"/>
            </svg>
            <span style="font-weight:700;font-size:20px;color:#fff;letter-spacing:-0.02em;">Topdraft</span>
          </div>
        </td></tr>
        <tr><td style="background:#131318;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:40px;color:#fff;">
          <h1 style="font-size:32px;line-height:1.1;margin:0 0 24px;letter-spacing:-0.02em;">Confirm your spot.</h1>
          <p style="color:#A1A1AA;font-size:14px;line-height:1.7;margin:0 0 32px;">
            One click locks in your position on the Topdraft waitlist. Skill-based fantasy sports trading. 18+. Free to play.
          </p>
          <a href="${confirmUrl}" style="display:inline-block;background:#6366F1;color:#fff;font-weight:600;font-size:14px;text-decoration:none;padding:14px 32px;border-radius:8px;">Confirm email</a>
          <p style="color:#52525B;font-size:12px;line-height:1.6;margin:40px 0 8px;">
            Or paste this link into your browser:
          </p>
          <p style="word-break:break-all;font-family:ui-monospace,monospace;font-size:11px;color:#818CF8;margin:0;">
            ${confirmUrl}
          </p>
        </td></tr>
        <tr><td style="padding:24px 8px 0;font-family:ui-monospace,monospace;font-size:11px;letter-spacing:0.1em;color:#52525B;text-transform:uppercase;">
          TOPDRAFT · SKILL-BASED FANTASY · 18+ · NOT GAMBLING
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>
  `;
  const text = `Confirm your Topdraft waitlist spot:\n\n${confirmUrl}\n\nTopdraft — skill-based fantasy. 18+.`;
  GmailApp.sendEmail(email, SUBJECT_CONFIRM, text, { htmlBody: html, name: FROM_NAME });
}


// ═══════════════════════════════════════════════════════════════════
// BULK EMAIL — manually run from the Apps Script editor
// ═══════════════════════════════════════════════════════════════════

/**
 * Sends an email to every CONFIRMED user.
 *
 * To run:
 *   1. Edit SUBJECT and HTML_BODY below
 *   2. Save the file
 *   3. Pick `sendBlast` in the function dropdown at the top of the editor
 *   4. Click Run
 *   5. Authorize if prompted
 *   6. Watch the execution log (View → Logs)
 *
 * Gmail daily send limits:
 *   • Free Gmail account:   100 emails/day
 *   • Google Workspace:    1500 emails/day
 *
 * If you have more than 100 confirmed subscribers and use free Gmail,
 * split the blast across days, or switch to a paid service (Resend).
 */
function sendBlast() {
  const SUBJECT = "Topdraft launches Friday";
  const HTML_BODY = `
    <h1 style="font-size:32px;line-height:1.1;margin:0 0 24px;">The doors open Friday.</h1>
    <p style="color:#A1A1AA;font-size:14px;line-height:1.7;margin:0 0 24px;">
      You're locked in for first access. Watch your email Friday at 1pm ET for the link.
    </p>
    <a href="${SITE_URL}" style="display:inline-block;background:#6366F1;color:#fff;font-weight:600;font-size:14px;text-decoration:none;padding:14px 32px;border-radius:8px;">Visit topdraft</a>
  `;

  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  let sent = 0, failed = 0, skipped = 0;

  for (let i = 1; i < data.length; i++) {
    const email = data[i][COL.EMAIL - 1];
    const status = data[i][COL.STATUS - 1];
    const token = data[i][COL.TOKEN - 1];

    if (status !== "confirmed") { skipped++; continue; }

    const unsubUrl = ScriptApp.getService().getUrl() + "?action=unsubscribe&token=" + token;
    const finalHtml = wrapBlastHtml(HTML_BODY, unsubUrl);
    const plainText = htmlToText(HTML_BODY) + `\n\nUnsubscribe: ${unsubUrl}`;

    try {
      GmailApp.sendEmail(email, SUBJECT, plainText, {
        htmlBody: finalHtml,
        name: FROM_NAME,
      });
      sent++;
    } catch (err) {
      failed++;
      Logger.log("Failed: " + email + " — " + err.toString());
    }
    Utilities.sleep(150); // small throttle to be polite to Gmail
  }

  Logger.log(`Blast complete. Sent: ${sent} · Failed: ${failed} · Skipped: ${skipped}`);
  SpreadsheetApp.getActiveSpreadsheet().toast(`Blast: sent ${sent}, failed ${failed}`, "Topdraft", 6);
}

function wrapBlastHtml(innerHtml, unsubUrl) {
  return `
<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#0A0A0C;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0C;padding:48px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" style="max-width:560px;width:100%;">
        <tr><td style="padding:0 8px 32px;">
          <span style="font-weight:700;font-size:20px;color:#6366F1;letter-spacing:-0.02em;">Topdraft</span>
        </td></tr>
        <tr><td style="background:#131318;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:40px;color:#fff;">
          ${innerHtml}
        </td></tr>
        <tr><td style="padding:24px 8px 0;font-family:ui-monospace,monospace;font-size:11px;color:#52525B;">
          <a href="${unsubUrl}" style="color:#52525B;text-decoration:underline;">Unsubscribe</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>
  `;
}

function htmlToText(html) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}


// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["Email", "Status", "Token", "Joined At", "Confirmed At", "Position", "Source"]);
    sheet.getRange("A1:G1").setFontWeight("bold").setBackground("#1B1B22").setFontColor("#A1A1AA");
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 240);
    sheet.setColumnWidth(2, 100);
    sheet.setColumnWidth(3, 280);
  }
  return sheet;
}

function findRowByEmail(sheet, email) {
  const data = sheet.getDataRange().getValues();
  email = email.toLowerCase();
  for (let i = 1; i < data.length; i++) {
    if (data[i][COL.EMAIL - 1].toString().toLowerCase() === email) return i + 1;
  }
  return -1;
}

function findRowByToken(sheet, token) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][COL.TOKEN - 1] === token) return i + 1;
  }
  return -1;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function htmlResponse(body) {
  return HtmlService.createHtmlOutput(body);
}

function htmlRedirect(path) {
  const url = SITE_URL.replace(/\/$/, "") + path;
  return HtmlService.createHtmlOutput(
    `<!doctype html><meta http-equiv="refresh" content="0;url=${url}"><script>location.replace(${JSON.stringify(url)});</script>`
  );
}
