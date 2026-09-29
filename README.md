# QuadraFácil — App Mobile (React Native / Expo Router)

Aplicativo mobile de reserva de quadras esportivas públicas municipais.
Este repositório contém a implementação em **React Native (Expo)** — a etapa
"Tela Inicial" da disciplina, com a base de navegação já pronta para as
próximas telas.

Projeto irmão desta mesma disciplina: Justificativa de Negócio, Protótipo de
Baixa Fidelidade e Engenharia de Requisitos (documento e slides separados).

## Estrutura

```
app/                    ← cada arquivo é uma tela (Expo Router)
  _layout.js            ← navegação (Stack) entre as telas
  index.js              ← Tela 1: Início (Visitante) — IMPLEMENTADA
  quadras.js             ← Visitante: Quadras Disponíveis (placeholder)
  login.js               ← Tela 2: Login / Cadastro (placeholder)
  home.js                 ← Tela 3: Início (Logado) (placeholder)
  nova-reserva.js         ← Tela 4: Nova Reserva (placeholder)
  confirmacao.js          ← Tela 5: Confirmação (placeholder)
  minhas-reservas.js      ← Tela 6: Minhas Reservas (placeholder)
  perfil.js               ← Tela 7: Meu Perfil (placeholder)
components/
  PlaceholderScreen.js   ← tela reutilizável "em construção" para as próximas etapas
constants/
  theme.js               ← paleta de cores e espaçamentos do QuadraFácil
```

As telas placeholder já estão registradas na navegação e mostram quais
requisitos (RF01–RF15, ver documento de Engenharia de Requisitos) cada uma vai
implementar — é só substituir o conteúdo de cada arquivo nas próximas entregas.

## Como rodar (primeira vez)

Este projeto foi montado remotamente, então o `node_modules` não foi
instalado por aqui. Abra um terminal **na sua máquina** (PowerShell ou o
terminal do VS Code), navegue até esta pasta e rode, nesta ordem:

```bash
# 1. (uma vez) apague a pasta de tentativa anterior, se ela ainda existir:
#    _node_modules_DELETE_ME

# 2. instale as dependências base
npm install

# 3. instale o Expo Router e suas dependências nativas
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants

# 4. rode o app
npx expo start
```

Depois do `npx expo start`, abra o app **Expo Go** no seu celular (Android ou
iOS) e escaneie o QR Code que aparecer no terminal — ou pressione `w` para
abrir no navegador.

## Por que instalar localmente?

A instalação de `node_modules` foi tentada por aqui, mas a pasta do projeto
está dentro do OneDrive, e o OneDrive deixa operações em massa (milhares de
arquivos pequenos do `node_modules`) muito lentas por essa ponte remota.
Rodando direto na sua máquina, sem esse intermediário, o `npm install` deve
levar menos de um minuto.

Dica: se quiser evitar que o OneDrive fique sincronizando o `node_modules`
toda vez (deixa tudo mais lento), você pode clicar com o botão direito na
pasta `node_modules` depois de criada e escolher "Sempre manter neste
dispositivo" → "Liberar espaço" não se aplica aqui, mas o ideal mesmo é, no
futuro, desenvolver fora de uma pasta sincronizada e só subir o código
(sem `node_modules`, que já está no `.gitignore`) para o GitHub.
