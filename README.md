# QuadraFácil — App Mobile (React Native / Expo Router)

Aplicativo para reservar o ginásio municipal da cidade. O ginásio funciona de
**segunda a sexta das 17h às 22h** e **sábado e domingo das 7h às 22h**. Ele é
da escola, então **a escola sempre tem prioridade**: se ela precisar de um
horário que alguém já reservou, a reserva é cancelada e a pessoa recebe uma
notificação no app explicando o motivo.

Projeto irmão desta mesma disciplina: Justificativa de Negócio, Protótipo de
Baixa Fidelidade e Engenharia de Requisitos (documento e slides separados).

## Perfis

| Perfil | O que faz |
| --- | --- |
| Visitante | Vê a agenda do ginásio sem precisar de conta |
| Morador | Reserva horários livres, cancela as próprias reservas, recebe notificações |
| Escola | Reserva horários para a escola (com motivo), cancelando reservas que estiverem no caminho, e libera horários depois |

Contas de demonstração (a API cria sozinha na primeira vez que roda):

- Morador: `demo@quadrafacil.com` / `123456`
- Escola: `escola@quadrafacil.com` / `escola123`

## Regras de uso

- Reservas de 1 hora, de hoje até 7 dias à frente.
- Cada pessoa pode ter até 3 reservas marcadas e 1 por dia, para todo mundo conseguir usar o ginásio.
- Horários que já começaram não podem ser reservados nem cancelados.
- A escola pode reservar com até 60 dias de antecedência e sempre informa o motivo.

Os limites ficam em `backend/regras.js` e podem ser ajustados lá.

## Estrutura

```
app/                          telas (cada arquivo é uma rota do Expo Router)
  index.js                    início para visitantes
  agenda.js                   agenda do ginásio (aberta a todos)
  login.js                    entrar / criar conta
  home.js                     início do morador
  nova-reserva.js             escolher dia, horário e modalidade
  confirmacao.js              reserva confirmada
  minhas-reservas.js          próximas reservas e histórico
  notificacoes.js             avisos de cancelamento pela escola
  perfil.js                   dados da conta e sair
  escola.js                   painel da escola
components/                   peças visuais reutilizadas (botões, seletor de datas, horários...)
constants/                    tema visual e endereço da API
contexts/AppContext.js        sessão, agenda, reservas e notificações
hooks/                        atualização ao abrir a tela e proteção das telas por perfil
services/api.js               chamadas HTTP para a API
data/                         funções de datas e da agenda
backend/                      API em Node.js + Express + MySQL
```

## Como rodar

O passo a passo completo do banco está em [`backend/README.md`](backend/README.md).
Com o banco pronto, são dois terminais na raiz do projeto:

```bash
# terminal 1: a API (na primeira vez, rode antes: npm run api:instalar)
npm run api

# terminal 2: o app (na primeira vez, rode antes: npm install)
npx expo start
```

Depois do `npx expo start`, pressione `w` para abrir no navegador ou escaneie o
QR Code com o Expo Go no celular (mesmo Wi-Fi do notebook).

Para rodar os testes automáticos da API: `npm run api:testes`.

## Colocar online para uma apresentação

O notebook vira o servidor e o Cloudflare cria um link público temporário,
gratuito e sem precisar de conta. Quem tiver o link abre o app no navegador do
celular, sem instalar nada.

Uma vez só, antes do dia:

1. Baixe e instale o `cloudflared` para Windows (instalador `.msi` de 64 bits) em
   https://developers.cloudflare.com/tunnel/downloads/
2. Feche e abra o terminal de novo, e rode `npm install` na pasta do projeto.

No dia, com o MySQL ligado, abra dois terminais na pasta do projeto:

```bash
# terminal 1: gera a versão web do app e liga a API servindo o app
npm run apresentacao

# terminal 2: cria o link público e mostra um QR Code
npm run tunel
```

O terminal 2 mostra o link `https://....trycloudflare.com` e um QR Code para
colocar no slide ou apontar a câmera. O link muda toda vez que você roda
`npm run tunel` e para de funcionar quando você fecha um dos dois terminais.

Cuidados:

- O notebook precisa ficar ligado e na internet durante a apresentação.
- Gere o link pouco antes de apresentar e teste no seu celular usando os dados móveis, fora do Wi-Fi.
- O Cloudflare não garante que o link fique no ar e aceita até 200 acessos ao mesmo tempo. Leve prints das telas como plano B.
- As contas de demonstração aparecem na tela de login, então qualquer pessoa com o link consegue entrar como escola.

## Sobre as notificações

Quando a escola cancela uma reserva, a pessoa recebe:

- um aviso que aparece no topo da tela enquanto o app está aberto (o app confere a cada 30 segundos e sempre que volta a ser aberto);
- um selo vermelho no sino do início;
- a notificação completa, com o motivo, na tela Notificações;
- a reserva marcada como "Cancelada pela escola" no histórico, também com o motivo.

Notificações push com o app fechado exigem um build próprio do app (EAS Build)
e um servidor de push. O Expo Go não permite isso no Android, por isso esta
versão usa notificações dentro do app.

## Por que não instalar `node_modules` pela ponte remota?

A pasta do projeto está no OneDrive, e operações com milhares de arquivos
pequenos (como o `node_modules`) ficam muito lentas pela ponte remota. Por
isso `npm install`, `npx expo start` e a configuração do MySQL são feitos
direto no seu terminal.
