# RSVP — Coordenadas Improváveis (Netlify Forms)

Esta versão usa Netlify Forms. Não usa Google Apps Script nem Google Sheets.

## Arquivos para o GitHub

Suba todos estes arquivos na raiz do repositório:

- `index.html`
- `style.css`
- `script.js`
- `obrigada.html`
- `netlify.toml`
- `assets/layout.svg`

Pode remover `apps-script.gs` do repositório: ele não é mais usado.

## Publicar na Netlify

1. Na Netlify, escolha **Import a Git repository → GitHub**.
2. Selecione o repositório do RSVP.
3. Branch: `main`.
4. Não há build command.
5. Publish directory: `.` (o `netlify.toml` já define isso).
6. Faça o deploy.
7. No painel do projeto, entre em **Forms** e confirme que **Form detection** está ativado.
8. Se você ativar Form detection depois do primeiro deploy, faça um novo deploy.

A Netlify deve detectar um formulário chamado `rsvp`.

## Teste

Abra o endereço `.netlify.app`, preencha o formulário e clique em “SIM! ESTAREI LÁ”.
Depois confira **Forms → rsvp → Submissions**.

Os campos enviados são:

- nome
- telefone
- email
- resposta (`SIM`)
- origem

Há também um honeypot anti-spam (`bot-field`).

## Importante

As submissões só são registradas quando o site está hospedado na Netlify. O GitHub continua sendo o repositório do código, mas o link enviado aos convidados deve ser o domínio da Netlify (ou um domínio próprio apontado para ela), não o GitHub Pages.
