// 1) Depois de publicar o Google Apps Script como Web App,
// cole a URL abaixo. Exemplo:
// const APPS_SCRIPT_URL = "https://script.google.com/macros/s/SEU_ID/exec";
const APPS_SCRIPT_URL = "COLE_AQUI_A_URL_DO_APPS_SCRIPT";

const params = new URLSearchParams(window.location.search);
const nameFromUrl = (params.get("nome") || "").trim();
const idFromUrl = (params.get("id") || "").trim();

const hello = document.getElementById("hello");
const fallbackName = document.getElementById("fallbackName");
const nameInput = document.getElementById("nameInput");
const questionBlock = document.getElementById("questionBlock");
const successBlock = document.getElementById("successBlock");
const successTitle = document.getElementById("successTitle");
const successText = document.getElementById("successText");
const changeAnswer = document.getElementById("changeAnswer");
const buttons = [...document.querySelectorAll("[data-response]")];

if (nameFromUrl) {
  hello.textContent = `${nameFromUrl},`;
} else {
  hello.textContent = "Olá!";
  fallbackName.hidden = false;
}

buttons.forEach((button) => {
  button.addEventListener("click", async () => {
    const response = button.dataset.response;
    const name = nameFromUrl || nameInput.value.trim();

    if (!name) {
      nameInput.focus();
      nameInput.setAttribute("aria-invalid", "true");
      return;
    }

    nameInput.removeAttribute("aria-invalid");
    buttons.forEach((btn) => (btn.disabled = true));

    try {
      await sendRSVP({
        nome: name,
        id: idFromUrl,
        resposta: response,
        origem: window.location.href,
      });

      showConfirmation(response, name);
      localStorage.setItem("mits-rsvp-response", response);
      localStorage.setItem("mits-rsvp-name", name);
    } catch (error) {
      console.error(error);
      alert("Não conseguimos registrar agora. Tente de novo em alguns segundos.");
      buttons.forEach((btn) => (btn.disabled = false));
    }
  });
});

changeAnswer.addEventListener("click", () => {
  successBlock.hidden = true;
  questionBlock.hidden = false;
  buttons.forEach((btn) => (btn.disabled = false));
});

function showConfirmation(response, name) {
  questionBlock.hidden = true;
  successBlock.hidden = false;

  if (response === "SIM") {
    successTitle.textContent = "PRESENÇA CONFIRMADA";
    successText.textContent = `Obrigada, ${firstName(name)}. Nos vemos dia 24.09, às 18h.`;
  } else {
    successTitle.textContent = "RESPOSTA REGISTRADA";
    successText.textContent = `Obrigada por avisar, ${firstName(name)}.`;
  }
}

function firstName(name) {
  return name.split(/\s+/)[0];
}

async function sendRSVP(payload) {
  // Para testar o layout antes de configurar a planilha, deixe a URL padrão.
  if (!APPS_SCRIPT_URL.startsWith("https://script.google.com/")) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    console.table(payload);
    return;
  }

  // no-cors permite envio simples do GitHub Pages para Apps Script.
  // A confirmação visual acontece após o navegador disparar a requisição.
  await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: new URLSearchParams(payload),
  });
}
