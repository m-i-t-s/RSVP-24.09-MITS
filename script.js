const form = document.getElementById("rsvpForm");
const fields = {
  nome: document.getElementById("nome"),
  telefone: document.getElementById("telefone"),
  email: document.getElementById("email"),
};
const submitButton = form.querySelector('button[type="submit"]');
const message = document.getElementById("message");
const messageText = document.getElementById("messageText");
const changeAnswer = document.getElementById("changeAnswer");
const origem = document.getElementById("origem");

origem.value = window.location.href;

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const nome = fields.nome.value.trim();
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

  // Capture os dados ANTES de desabilitar os campos.
  // Campos disabled não entram em FormData, o que fazia nome/telefone/email chegarem vazios na Netlify.
  origem.value = window.location.href;
  const formData = new FormData(form);
  const body = new URLSearchParams();

  for (const [key, value] of formData.entries()) {
    body.append(key, value);
  }

  setBusy(true);

  try {

    const response = await fetch("/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const primeiroNome = nome.split(/\s+/)[0];
    messageText.textContent = `Obrigada, ${primeiroNome}.`;
    message.hidden = false;
  } catch (error) {
    console.error("[RSVP] Erro ao enviar para a Netlify:", error);
    alert("Não foi possível registrar sua presença agora. Tente novamente.");
  } finally {
    setBusy(false);
  }
});

changeAnswer.addEventListener("click", () => {
  message.hidden = true;
  fields.nome.focus();
});

function setBusy(busy) {
  submitButton.disabled = busy;
  Object.values(fields).forEach((field) => {
    field.disabled = busy;
  });
}
