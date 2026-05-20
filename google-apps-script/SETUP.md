# Topdraft Waitlist — Google Sheets Setup

Total setup time: **~7 minutes**. You'll end with:
- A Google Sheet that auto-saves every signup
- Confirmation emails sent automatically (via your Gmail)
- A URL you can paste into your Netlify-hosted `topdraft.html`
- A button to blast emails to your entire confirmed list

---

## Step 1 — Create the Google Sheet (1 min)

1. Go to **[sheets.google.com](https://sheets.google.com)** → click the big "+" to create a new sheet
2. Rename the file (top-left, where it says "Untitled spreadsheet") to **Topdraft Waitlist**
3. Leave the default tab empty — the script creates a tab called "Waitlist" automatically on first run

---

## Step 2 — Paste the Apps Script (2 min)

1. In your new Sheet: **Extensions → Apps Script**
2. A new editor tab opens. The default file says `Code.gs` with `function myFunction() {}` inside.
3. **Delete everything** in that editor
4. Open `google-apps-script/Code.gs` in this project → **copy the entire file**
5. Paste it into the Apps Script editor
6. At the top of the pasted code, edit these three lines:
   ```js
   const SITE_URL  = "https://YOUR-SITE.netlify.app";  // ← your live Netlify URL
   const FROM_NAME = "Topdraft";
   const SHEET_NAME = "Waitlist";
   ```
   Replace `YOUR-SITE.netlify.app` with the URL Netlify gave you. Leave the other two.
7. **Save** — ⌘+S or the floppy-disk icon. Name the project `Topdraft API` when prompted.

---

## Step 3 — Deploy as a Web App (2 min)

1. In the Apps Script editor: **Deploy** (top-right) → **New deployment**
2. Click the gear icon next to "Select type" → **Web app**
3. Fill in:
   - **Description:** `Topdraft Waitlist v1`
   - **Execute as:** `Me (your-email@gmail.com)`
   - **Who has access:** **Anyone** ← this is critical, must be "Anyone" not "Anyone with Google account"
4. Click **Deploy**
5. Google will prompt to authorize the script — click **Authorize access**
6. Pick your Google account
7. You'll see a scary "Google hasn't verified this app" screen. This is normal for personal Apps Scripts. Click **Advanced** → **Go to Topdraft API (unsafe)** → **Allow**
8. After deploy, you'll see a **Web app URL** like:
   ```
   https://script.google.com/macros/s/AKfycb...long-string.../exec
   ```
9. **Copy that URL.** This is your `APPS_SCRIPT_URL`.

---

## Step 4 — Paste the URL into your HTML (1 min)

1. Open `topdraft.html` (in the project root)
2. Find this line near the top of the `<script>` tag:
   ```js
   const APPS_SCRIPT_URL = "PASTE_YOUR_APPS_SCRIPT_URL_HERE";
   ```
3. Replace `PASTE_YOUR_APPS_SCRIPT_URL_HERE` with the URL you copied
4. Save the file
5. Copy the updated `topdraft.html` to `netlify-deploy/index.html`
6. Redeploy to Netlify (drag the folder onto the Deploys tab)

---

## Step 5 — Test it (1 min)

1. Open your live Netlify URL
2. Submit your own email in the waitlist form
3. You should see: **"Check your email — we sent a confirmation link"**
4. Check your inbox (might be in Spam the first time) — open the email, click **Confirm email**
5. You'll land on `/confirmed.html` showing **#1 — YOU'RE IN**
6. Open your Google Sheet — you'll see your email in the row with status `confirmed`

Done. Every future signup will:
- Add a row to the sheet
- Send them a confirmation email
- Show them their position after they confirm
- Increment the live counter on the landing page

---

## Sending a blast email to everyone on your list

When you're ready to announce launch (or anything else):

1. Open your Google Sheet
2. **Extensions → Apps Script** (opens the script editor)
3. In `Code.gs`, scroll to the `sendBlast()` function near the bottom
4. Edit `SUBJECT` and `HTML_BODY` to whatever you want to send
5. Save (⌘+S)
6. At the top of the editor, find the function-name dropdown (says something like "doGet") → change to **`sendBlast`**
7. Click **Run** ▶️
8. Watch the execution log (**View → Logs**) for `Blast complete. Sent: X · Failed: 0`

Gmail will literally send those emails from your Gmail account, one by one, to every confirmed subscriber. They'll include an unsubscribe link automatically.

**Gmail daily limits:**
- Free Gmail: **100 emails/day**
- Google Workspace: **1,500 emails/day**

If you have 500 confirmed subs and use free Gmail, split the blast across 5 days, or switch the sending logic to use Resend (15-min job — ask for it when you cross 100 subs).

---

## Updating the script later

Anytime you change `Code.gs`:
1. Save in the Apps Script editor
2. **Deploy → Manage deployments**
3. Click the pencil icon next to your existing deployment
4. **Version: New version** → **Deploy**
5. The URL stays the same. No need to update HTML.

---

## Common gotchas

| Error | Fix |
|---|---|
| Form submits but no email arrives | Check `Apps Script → Executions` for errors. Most common: you didn't authorize Gmail access during step 3. Re-run deploy with auth. |
| User clicks confirm link → 404 page | Your `SITE_URL` in `Code.gs` is wrong. Update + redeploy. |
| Form returns CORS error | Make sure deployment "Who has access" is set to **Anyone** (not "Anyone with Google account") |
| Count is always 0 | The `count` endpoint only counts users with status `confirmed`. Pending users don't count until they click the email link. |
| Confirmation email goes to spam | First few sends from a personal Gmail often hit spam. Mark "Not spam" on yours, and it'll improve. For deliverability at scale, switch to Resend or Mailchimp. |
| `Logger.log` shows blast errors | Check the Gmail daily limit — if you hit it, retry tomorrow or sub-batch. |

---

## Privacy + compliance notes

- Emails are stored in **your Google Sheet** only — under your control, not a third-party SaaS
- Confirmation emails count as **double opt-in**, which is GDPR/CASL compliant by default
- Every blast email auto-includes an **Unsubscribe link** that updates the sheet
- You can export the sheet as CSV anytime (File → Download → CSV)

When you eventually swap to a real ESP (Resend, MailerLite, Mailchimp), export the sheet and import the list. No data lock-in.
