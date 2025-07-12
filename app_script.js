const sheetName = 'form data';
const scriptProp = PropertiesService.getScriptProperties();

function intialSetup() {
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  scriptProp.setProperty('key', activeSpreadsheet.getId());
}

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

  // Récupération des champs du formulaire
  const filledBy = e.parameter['filled-by'];
  const cardType = e.parameter['card-type'];
  const civility = e.parameter['civility'];
  const firstname = e.parameter['firstname'];
  const role = e.parameter['role'];
  const quartier = e.parameter['quartier'];
  const phone = e.parameter['phone'];
  const birthdate = e.parameter['birthdate'];
  const date = e.parameter['date'];
  const size = e.parameter['size'];
  const imageBase64 = e.parameter['image'];

  // Traitement de l'image
  let imageUrl = '';
  if (imageBase64) {
    const blob = Utilities.newBlob(Utilities.base64Decode(imageBase64), MimeType.JPEG, "photo.jpg");
    const folder = DriveApp.getFolderById('178Hk8LHG6UI3AnaqD8i-QqLlkCkL5Bsv'); // 📂 Remplacez par votre dossier Drive
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    imageUrl = file.getUrl();
  }

  // Ajout dans la feuille Google Sheets
  const onlyDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");

  sheet.appendRow([
    onlyDate,       // Date uniquement (sans heure)
    filledBy,
    cardType,
    civility,
    firstname,
    role,
    quartier,
    phone,
    birthdate,
    date,
    size,
    imageUrl
  ]);


  return ContentService
    .createTextOutput("Success")
    .setMimeType(ContentService.MimeType.TEXT);
}
