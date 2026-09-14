# RSVP — Coordenadas → Improváveis

Site estático para GitHub Pages com RSVP de 1 clique e registro em Google Sheets via Apps Script.

## Arquivos

- `index.html` — página principal
- `style.css` — identidade visual inspirada no convite
- `script.js` — lógica do RSVP
- `assets/convite.png` — convite original
- `apps-script.gs` — backend para Google Sheets
- `gerar-links.html` — ferramenta opcional para criar links personalizados

## 1. Publicar no GitHub Pages

1. Crie um repositório no GitHub, por exemplo `rsvp-coordenadas`.
2. Envie todos os arquivos e a pasta `assets`.
3. Abra `Settings > Pages`.
4. Em `Build and deployment`, escolha `Deploy from a branch`.
5. Branch: `main` / pasta: `/root`.
6. Salve.

Seu endereço ficará parecido com:

`https://SEU-USUARIO.github.io/rsvp-coordenadas/`

## 2. Criar a planilha de respostas

1. Crie uma planilha vazia no Google Sheets.
2. O ID da planilha é o trecho entre `/d/` e `/edit` na URL.
3. Vá em `Extensões > Apps Script`.
4. Apague o código padrão e cole o conteúdo de `apps-script.gs`.
5. Troque `COLE_AQUI_O_ID_DA_PLANILHA` pelo ID real.
6. Clique em `Implantar > Nova implantação`.
7. Tipo: `Aplicativo da Web`.
8. Executar como: `Eu`.
9. Quem tem acesso: `Qualquer pessoa`.
10. Autorize e copie a URL terminada em `/exec`.

## 3. Conectar o site

Abra `script.js` e troque:

`const APPS_SCRIPT_URL = "COLE_AQUI_A_URL_DO_APPS_SCRIPT";`

pela URL do seu aplicativo da Web.

Depois faça commit/push novamente.

## 4. Enviar links personalizados

Formato:

`https://SEU-USUARIO.github.io/rsvp-coordenadas/?id=001&nome=Isadora%20Nogueira`

O convidado abre a página e vê o próprio nome. Basta clicar em SIM ou NÃO.

Se alguém abrir a página sem `?nome=...`, aparece um único campo para digitar o nome.

Use `gerar-links.html` localmente ou publicado para gerar vários links de uma vez.

## Planilha final

Ela registra:

`ID | Nome | Resposta | Data | Origem | Status`

Quando o mesmo `id` responde novamente, a linha é atualizada em vez de duplicada.
