const SHEET_ID = "1Js1XzyZVBrAwmOV9h2gIO-sCD_MTz8l499_PfE9A5Is";
const SHEET_NAME = "RSVP";

function doGet(e) {
  const p = (e && e.parameter) ? e.parameter : {};

  // Sem dados de RSVP, funciona como teste de saúde do endpoint.
  if (!p.resposta) {
    return output({ ok: true, service: "MITS RSVP" });
  }

  return registrarRSVP_(p);
}

function doPost(e) {
  const p = (e && e.parameter) ? e.parameter : {};
  return registrarRSVP_(p);
}

function registrarRSVP_(p) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const nome = String(p.nome || "").trim();
    const telefone = String(p.telefone || "").trim();
    const email = String(p.email || "").trim();
    const resposta = String(p.resposta || "").trim().toUpperCase();
    const origem = String(p.origem || "").trim();

    if (!nome || !["SIM", "NÃO"].includes(resposta)) {
      return output({ ok: false, error: "Dados inválidos" });
    }

    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
    }

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Data e hora",
        "Nome",
        "Telefone",
        "Email",
        "Resposta",
        "Origem"
      ]);
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      new Date(),
      nome,
      telefone,
      email,
      resposta,
      origem
    ]);

    return output({ ok: true });
  } catch (error) {
    return output({ ok: false, error: String(error) });
  } finally {
    lock.releaseLock();
  }
}

function output(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
