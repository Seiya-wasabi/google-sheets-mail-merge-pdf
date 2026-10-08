# Mail merge to PDF from Google Sheets (Apps Script)

A small, complete Apps Script that turns each row of a Google Sheet into its own PDF —
built from a Google Docs template — and emails that PDF to the address in the row.
Invoices, certificates, statements, offer letters.

No add-on, no server. Copy one file into your spreadsheet's script editor.

## How it works

1. You write a Google Doc once, with `{{Column Name}}` placeholders.
2. For every row, the script copies the template, replaces the placeholders with that row's values,
   exports the copy to PDF, and sends it with `MailApp.sendEmail`.
3. The intermediate Doc is moved to the trash.

## Setup

**1. Template.** Create a Google Doc and mark the changing parts with double braces. The names must
match your header row exactly:

```
INVOICE

Bill to: {{Name}}
Amount due: {{Amount}}
Due date: {{DueDate}}
```

**2. Sheet.** One row per document, with an `Email` column:

| Name | Email | Amount | DueDate |
|---|---|---|---|
| Dana Okonkwo | dana@example.com | $420.00 | 2026-10-15 |

**3. Script.** In the spreadsheet, open *Extensions → Apps Script*, paste [`Code.gs`](Code.gs), and set:

- `TEMPLATE_ID` — the template's file ID (the part between `/d/` and `/edit` in its URL)
- `FOLDER_ID` — a Drive folder for the working copies

Run `mergeToPdfAndEmail`. **Point every Email at yourself for the first run.**

## Three things that break most versions of this script

- **`replaceText` takes a regular expression.** `{` and `}` are regex syntax, so the script escapes them
  (`'\\{\\{' + key + '\\}\\}'`). A replacement value containing `$` can also be read as a group
  reference — check currency amounts in the first PDF.
- **`doc.saveAndClose()` before `getAs()`.** Without it the export can run before the edits are written,
  and you get a PDF of the untouched template while the script reports success.
- **Six minutes per execution.** PDF export is slow; a long list hits Apps Script's execution limit
  part-way. Add a status column and skip rows already sent before running on a real list.

## Limits (from Google's Apps Script quotas)

- 100 recipients per day on a consumer Google account, 1,500 on Google Workspace
- 25 MB of attachments per message

## Permissions this script needs

`DriveApp` uses the full Drive scope, so authorising this script lets it read every file in your Drive.
That is fine for code you can read line by line. If you would rather not grant it, the narrower
`drive.file` scope (only files you pick or the app creates) needs Google's file picker instead of a
hard-coded ID.

## Longer guide

A step-by-step write-up of the same script, with the reasoning behind each line:
[How to mail merge to PDF from Google Sheets](https://bulkmerge.sumitsubo.com/how-to/mail-merge-to-pdf-from-google-sheets).

## If you would rather not maintain a script

Disclosure: I make **Bulk Email & PDF Mail Merge**, a Google Sheets add-on that does this same job with
a preview that sends nothing, a status column so re-runs never email anyone twice, pausing at the daily
quota, and only `drive.file` plus send-only mail permissions. Free for 20 recipients a day:
[Google Workspace Marketplace listing](https://workspace.google.com/marketplace/app/bulk_email_pdf_mail_merge_for_google_she/850815834962).

The script in this repository is complete and yours to use either way.

## License

MIT — see [LICENSE](LICENSE).

---

Google Sheets™, Google Docs™, Google Drive™ and Google Workspace™ are trademarks of Google LLC.
This project is not affiliated with or endorsed by Google.
