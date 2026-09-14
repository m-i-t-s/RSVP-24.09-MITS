// Cole aqui a URL /exec do Google Apps Script quando a planilha estiver configurada.
const APPS_SCRIPT_URL = "COLE_AQUI_A_URL_DO_APPS_SCRIPT";

const params = new URLSearchParams(window.location.search);
const idFromUrl = (params.get("id") || "").trim();

const form = document.getElementById("rsvpForm");
const nameInput = document.getElementById("nameInput");
const phoneInput = document.getElementById("phoneInput");
const emailInput = document.getElementById("emailInput");
const inputs = [nameInput, phoneInput, emailInput];
const buttons = [...document.querySelectorAll("[data-response]")];
const confirmation = document.getElementById("confirmation");
const confirmationHeading = document.getElementById("confirmationHeading");
const confirmationText = document.getElementById("confirmationText");
const changeAnswer = document.getElementById("changeAnswer");

// Pré-preenchimento opcional por URL.
nameInput.value = params.get("nome") || "";
phoneInput.value = params.get("telefone") || "";
emailInput.value = params.get("email") || "";
inputs.forEach(syncInputState);

inputs.forEach((input) => {
  input.addEventListener("focus", () => input.classList.add("editing"));
  input.addEventListener("blur", () => {
    input.classList.remove("editing");
    syncInputState(input);
  });
  input.addEventListener("input", () => {
    input.removeAttribute("aria-invalid");
    syncInputState(input);
  });
});

buttons.forEach((button) => {
  button.addEventListener("click", async () => {
    const resposta = button.dataset.response;
    const nome = nameInput.value.trim();
    const telefone = phoneInput.value.trim();
    const email = emailInput.value.trim();

    if (!nome) {
      nameInput.setAttribute("aria-invalid", "true");
      nameInput.focus();
      return;
    }

    if (email && !emailInput.validity.valid) {
      emailInput.setAttribute("aria-invalid", "true");
      emailInput.focus();
      return;
    }

    buttons.forEach((btn) => (btn.disabled = true));

    try {
      await sendRSVP({
        id: idFromUrl,
        nome,
        telefone,
        email,
        resposta,
        origem: window.location.href,
      });
      showConfirmation(resposta, nome);
    } catch (error) {
      console.error(error);
      alert("Não foi possível registrar sua resposta agora. Tente novamente.");
      buttons.forEach((btn) => (btn.disabled = false));
    }
  });
});

changeAnswer.addEventListener("click", () => {
  confirmation.hidden = true;
  form.hidden = false;
  buttons.forEach((btn) => (btn.disabled = false));
});

function syncInputState(input) {
  input.classList.toggle("has-value", Boolean(input.value));
}

function showConfirmation(resposta, nome) {
  form.hidden = true;
  confirmation.hidden = false;

  if (resposta === "SIM") {
    confirmationHeading.innerHTML = "PRESENÇA<br>CONFIRMADA.";
    confirmationText.textContent = `Obrigada, ${firstName(nome)}. Nos vemos dia 24.09, às 18h.`;
  } else {
    confirmationHeading.innerHTML = "RESPOSTA<br>REGISTRADA.";
    confirmationText.textContent = `Obrigada por avisar, ${firstName(nome)}.`;
  }
}

function firstName(nome) {
  return nome.split(/\s+/)[0];
}

async function sendRSVP(payload) {
  // Enquanto a integração com a planilha não estiver ativa, mantém o site testável.
  if (!APPS_SCRIPT_URL.startsWith("https://script.google.com/")) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    console.table(payload);
    return;
  }

  await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: new URLSearchParams(payload),
  });
}
