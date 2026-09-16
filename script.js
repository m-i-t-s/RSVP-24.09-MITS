const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwgbP-6IFp_5mZm0BFSTLXAjxXSBjur7sMss4EszzFVARvr1kD_oh8sP9oJMeRGD-xa/exec";

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
    await sendRSVP(payload);
    showMessage(selectedResponse, nome);
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
  } else {
    messageTitle.textContent = "RESPOSTA REGISTRADA";
    messageText.textContent = `Obrigada por avisar, ${primeiroNome}.`;
  }

  message.hidden = false;
}

function sendRSVP(payload) {
  return new Promise((resolve, reject) => {
    const url = new URL(APPS_SCRIPT_URL);

    Object.entries(payload).forEach(([key, value]) => {
      url.searchParams.set(key, value ?? "");
    });
    url.searchParams.set("_t", Date.now().toString());

    const iframe = document.createElement("iframe");
    iframe.hidden = true;
    iframe.setAttribute("aria-hidden", "true");

    let finished = false;
    const cleanup = () => {
      if (iframe.isConnected) iframe.remove();
    };

    const timer = setTimeout(() => {
      if (finished) return;
      finished = true;
      cleanup();
      reject(new Error("Tempo esgotado ao registrar RSVP"));
    }, 8000);

    iframe.addEventListener("load", () => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      setTimeout(cleanup, 250);
      resolve(true);
    });

    iframe.src = url.toString();
    document.body.appendChild(iframe);
  });
}
