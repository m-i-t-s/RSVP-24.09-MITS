/**
 * GOOGLE APPS SCRIPT — backend do RSVP
 *
 * 1. Crie uma planilha Google.
 * 2. Extensões > Apps Script.
 * 3. Cole este arquivo.
 * 4. Troque SHEET_ID pelo ID da planilha.
 * 5. Implantar > Nova implantação > Aplicativo da Web.
 *    Executar como: você
 *    Quem tem acesso: qualquer pessoa
 * 6. Copie a URL /exec e cole em script.js.
 */

const SHEET_ID = 'COLE_AQUI_O_ID_DA_PLANILHA';
const SHEET_NAME = 'RSVP';

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const sheet = getSheet_();
    const data = e.parameter || {};

    const nome = sanitize_(data.nome);
    const id = sanitize_(data.id);
    const resposta = sanitize_(data.resposta);
    const origem = sanitize_(data.origem);
    const agora = new Date();

    if (!nome || !resposta) {
      return json_({ ok: false, error: 'Dados incompletos' });
    }

    // Se houver ID, atualiza a resposta existente em vez de criar duplicata.
    if (id) {
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === id) {
          sheet.getRange(i + 1, 2, 1, 5).setValues([[
            nome,
            resposta,
            agora,
            origem,
            'atualizado'
          ]]);
          return json_({ ok: true, updated: true });
        }
      }
    }

    sheet.appendRow([id, nome, resposta, agora, origem, 'novo']);
    return json_({ ok: true, updated: false });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json_({ ok: true, service: 'MITS RSVP' });
}

function getSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['ID', 'Nome', 'Resposta', 'Data', 'Origem', 'Status']);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sanitize_(value) {
  return String(value || '').trim().slice(0, 500);
}

function json_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
