const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwv3VsA-zSYymE_O2QPyNIks3qIo9cmBgYNSK7Xj2T5B29jfrzil1_PlhSi0u1uBnUa/exec";

// Tempo máximo de espera pela resposta do Apps Script (cold start pode levar alguns segundos).
const REQUEST_TIMEOUT_MS = 20000;

const form = document.getElementById("rsvpForm");
const fields = {
  nome: document.getElementById("nome"),
  telefone: document.getElementById("telefone"),
  email: document.getElementById("email"),
};
const buttons = [...document.querySelectorAll("[data-response]")];
const message = document.getElementById("message");
const messageTitle = document.getElementById("messageTitle");
const messageText = document.getElementById("messageText");
const changeAnswer = document.getElementById("changeAnswer");

let selectedResponse = "";

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedResponse = button.dataset.response;
  });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const nome = fields.nome.value.trim();
  const telefone = fields.telefone.value.trim();
  const email = fields.email.value.trim();

  fields.nome.removeAttribute("aria-invalid");
  fields.email.removeAttribute("aria-invalid");

  if (!nome) {
    fields.nome.setAttribute("aria-invalid", "true");
    fields.nome.focus();
    return;
  }

  if (email && !fields.email.validity.valid) {
    fields.email.setAttribute("aria-invalid", "true");
    fields.email.focus();
    return;
  }

  if (!selectedResponse) return;

  if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(APPS_SCRIPT_URL)) {
    alert("O site ainda não está configurado com a URL /exec do Apps Script.");
    return;
  }

  setBusy(true);

  const payload = {
    nome,
    telefone,
    email,
    resposta: selectedResponse,
    origem: window.location.href,
  };

  try {
    // sendRSVP só resolve se o Apps Script respondeu {"ok":true}.
    // Qualquer outra situação (rede, timeout, login do Google, erro na planilha) cai no catch.
    await sendRSVP(payload);
    showMessage(selectedResponse, nome);
  } catch (error) {
    console.error("[RSVP] falha ao registrar:", error);
    alert(
      "Não foi possível registrar sua resposta agora. Tente novamente.\n\n" +
        "(Detalhe técnico: " + (error && error.message ? error.message : error) + ")"
    );
  } finally {
    setBusy(false);
  }
});

changeAnswer.addEventListener("click", () => {
  message.hidden = true;
});

function setBusy(busy) {
  buttons.forEach((button) => (button.disabled = busy));
  Object.values(fields).forEach((field) => (field.disabled = busy));
}

function showMessage(response, nome) {
  const primeiroNome = nome.split(/\s+/)[0];

  if (response === "SIM") {
    messageTitle.textContent = "PRESENÇA CONFIRMADA";
    messageText.textContent = `Obrigada, ${primeiroNome}.`;
  } else {
    messageTitle.textContent = "RESPOSTA REGISTRADA";
    messageText.textContent = `Obrigada por avisar, ${primeiroNome}.`;
  }

  message.hidden = false;
}

/**
 * Envia o RSVP por POST e LÊ a resposta do Apps Script.
 *
 * Por que funciona sem CORS quebrar:
 * - body = URLSearchParams  → Content-Type application/x-www-form-urlencoded (automático).
 *   Isso é uma "simple request": o navegador NÃO faz preflight OPTIONS
 *   (o Apps Script não responde OPTIONS, por isso JSON/headers customizados falham).
 * - mode "cors" (padrão) + redirect "follow": o /exec responde 302 para
 *   script.googleusercontent.com, que devolve o JSON com Access-Control-Allow-Origin: *.
 * - Isso só acontece quando o Web App está publicado como
 *   "Executar como: Eu" + "Quem tem acesso: Qualquer pessoa".
 *   Se estiver "Qualquer pessoa com Conta do Google", o Google devolve
 *   a página de login (HTML) e a leitura abaixo falha → o site NÃO mostra sucesso.
 */
async function sendRSVP(payload) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      body: new URLSearchParams(payload),
      redirect: "follow",
      credentials: "omit",
      signal: controller.signal,
    });
  } catch (error) {
    if (error && error.name === "AbortError") {
      throw new Error("tempo esgotado aguardando o Apps Script");
    }
    throw new Error("erro de rede ou CORS: " + (error && error.message ? error.message : error));
  } finally {
    clearTimeout(timer);
  }

  const text = await response.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch (_) {
    // Resposta não é JSON: normalmente é a página de login do Google
    // (deployment sem acesso "Qualquer pessoa") ou uma página de erro do Apps Script.
    throw new Error(
      "resposta inesperada do Apps Script (HTTP " + response.status + "). " +
        "Verifique se o Web App está publicado para 'Qualquer pessoa'."
    );
  }

  if (!data || data.ok !== true) {
    throw new Error((data && data.error) || "o Apps Script recusou o registro");
  }

  return data;
}
