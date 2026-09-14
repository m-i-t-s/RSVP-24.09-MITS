# RSVP — Coordenadas Improváveis

Esta versão usa **o SVG original em `assets/layout.svg` como a arte da página**. A arte não foi redesenhada em HTML/CSS.

## GitHub Pages

Os arquivos `index.html`, `style.css`, `script.js` e a pasta `assets` devem ficar na raiz do repositório.

Depois:

1. Settings → Pages
2. Source → Deploy from a branch
3. Branch → `main`
4. Folder → `/(root)`
5. Save

## Formulário

- Nome: obrigatório
- Telefone: opcional
- Email: opcional
- Os botões de SIM e NÃO são áreas clicáveis posicionadas exatamente sobre os botões desenhados no SVG.

## Google Sheets

Enquanto `script.js` estiver com:

```js
const APPS_SCRIPT_URL = "COLE_AQUI_A_URL_DO_APPS_SCRIPT";
```

o site fica em modo de teste e não salva respostas.

Para salvar:

1. Crie uma planilha Google Sheets.
2. Abra Extensões → Apps Script.
3. Cole o conteúdo de `apps-script.gs`.
4. No arquivo, cole o ID da planilha em `SHEET_ID`.
5. Faça `Implantar → Nova implantação → Aplicativo da Web`.
6. Execute como você e dê acesso a qualquer pessoa.
7. Copie a URL `/exec`.
8. Cole essa URL em `APPS_SCRIPT_URL` dentro de `script.js`.
9. Faça commit da alteração no GitHub.

A aba `RSVP` será criada automaticamente com as colunas Data e hora, Nome, Telefone, Email, Resposta e Origem.

## Celular

No desktop o SVG aparece inteiro exatamente como foi criado. No celular, o mesmo SVG é usado duas vezes sem redesenhar a arte: primeiro a metade do RSVP em tamanho legível e, abaixo, a metade do convite.
