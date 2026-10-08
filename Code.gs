/**
 * Mail merge to PDF from Google Sheets.
 * One row in, one PDF out: fills a Google Docs template with each row's values,
 * exports that copy to PDF and emails it to the address in the row's Email column.
 *
 * Setup: see README.md. Run mergeToPdfAndEmail() from the Apps Script editor.
 */

const TEMPLATE_ID = 'PASTE_TEMPLATE_DOC_ID';
const FOLDER_ID   = 'PASTE_OUTPUT_FOLDER_ID';

function mergeToPdfAndEmail() {
  const sheet  = SpreadsheetApp.getActiveSheet();
  const values = sheet.getDataRange().getValues();
  const header = values.shift();

  const template = DriveApp.getFileById(TEMPLATE_ID);
  const folder   = DriveApp.getFolderById(FOLDER_ID);

  values.forEach((row) => {
    // Build a {ColumnName: value} object for this row.
    const data = {};
    header.forEach((h, i) => { data[h] = row[i]; });
    if (!data.Email) return;

    const title = 'Invoice - ' + data.Name;

    // 1. Copy the template.
    const copy = template.makeCopy(title, folder);
    const doc  = DocumentApp.openById(copy.getId());
    const body = doc.getBody();

    // 2. Substitute every column. replaceText takes a regular expression,
    //    so the braces must be escaped to be matched literally.
    Object.keys(data).forEach((key) => {
      body.replaceText('\\{\\{' + key + '\\}\\}', String(data[key]));
    });

    // 3. Flush the edits before exporting, or the PDF can be the untouched template.
    doc.saveAndClose();

    // 4. Export to PDF and email it to this row's recipient.
    const pdf = copy.getAs(MimeType.PDF).setName(title + '.pdf');

    MailApp.sendEmail({
      to: data.Email,
      subject: 'Invoice for ' + data.Name,
      body: 'Hi ' + data.Name + ',\n\n'
          + 'Your invoice for ' + data.Amount + ' is attached. '
          + 'It is due on ' + data.DueDate + '.\n\nThanks.',
      attachments: [pdf]
    });

    // 5. Remove the intermediate Google Doc.
    copy.setTrashed(true);
  });
}
