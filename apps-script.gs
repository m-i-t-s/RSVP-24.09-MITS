/*
  BACKEND DO RSVP
  1. Crie uma planilha no Google Sheets.
  2. Copie o ID da URL da planilha e cole em SHEET_ID.
  3. No Google Apps Script, cole este arquivo.
  4. Implantar > Nova implantação > Aplicativo da Web.
     Executar como: você
     Quem tem acesso: qualquer pessoa
  5. Copie a URL terminada em /exec e cole em script.js.
*/

const SHEET_ID = "COLE_AQUI_O_ID_DA_PLANILHA";
const SHEET_NAME = "RSVP";

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
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

    const p = e.parameter || {};
    const nome = String(p.nome || "").trim();
    const telefone = String(p.telefone || "").trim();
    const email = String(p.email || "").trim();
    const resposta = String(p.resposta || "").trim().toUpperCase();
    const origem = String(p.origem || "").trim();

    if (!nome || !["SIM", "NÃO"].includes(resposta)) {
      return output({ ok: false, error: "Dados inválidos" });
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

function doGet() {
  return output({ ok: true, service: "MITS RSVP" });
}

function output(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
