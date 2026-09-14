
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwgbP-6IFp_5mZmOBFSTLXAjxXSBjur7sMss4EszzFVARvrlkD_oh8sP9oJMeRGD-xa/exec";

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

  setBusy(true);

  const payload = {
    nome,
    telefone,
    email,
    resposta: selectedResponse,
    origem: window.location.href,
  };

  try {
    const configured = await sendRSVP(payload);

    if (configured) {
      showMessage(selectedResponse, nome);
    } else {
      showMessage("TESTE", nome);
    }
  } catch (error) {
    console.error(error);
    alert("Não foi possível registrar sua resposta agora. Tente novamente.");
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
  } else if (response === "NÃO") {
    messageTitle.textContent = "RESPOSTA REGISTRADA";
    messageText.textContent = `Obrigada por avisar, ${primeiroNome}.`;
  } else {
    messageTitle.textContent = "MODO DE TESTE";
    messageText.textContent = "O visual está funcionando, mas a planilha ainda não foi conectada.";
  }

  message.hidden = false;
}

async function sendRSVP(payload) {
  const configured = APPS_SCRIPT_URL.startsWith("https://script.google.com/macros/s/") && APPS_SCRIPT_URL.endsWith("/exec");

  if (!configured) {
    console.table(payload);
    await new Promise((resolve) => setTimeout(resolve, 250));
    return false;
  }

  await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: new URLSearchParams(payload),
  });

  return true;
}
