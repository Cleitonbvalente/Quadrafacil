# API do QuadraFácil

Servidor Node.js + Express que conecta o app a um banco MySQL local. O app em React Native não se conecta direto ao MySQL: ele conversa com esta API por HTTP, e a API conversa com o banco.

## 1. Garanta que o MySQL Server está rodando

O MySQL Workbench é só a interface gráfica; quem guarda os dados é o MySQL Server. Abra o Workbench e conecte na instância local ("Local instance MySQL"). Se conectar, está rodando. Se não, aperte `Win + R`, digite `services.msc`, procure o serviço **MySQL80** e clique em **Iniciar**.

## 2. Crie o banco e o usuário do app

No Workbench, conectado como `root`, abra `backend/schema.sql` (File > Open SQL Script), troque `troque_esta_senha` pela senha que quiser e execute o script inteiro (ícone de raio).

Isso cria o banco `quadrafacil`, um banco `quadrafacil_teste` (usado só pelos testes automáticos) e o usuário `quadrafacil_app` com acesso aos dois.

As tabelas não precisam ser criadas à mão: a API cria tudo sozinha ao iniciar, a partir de `backend/sql/tabelas.sql`. Se você já tinha rodado uma versão anterior, ela atualiza a estrutura automaticamente (as reservas de teste antigas são apagadas, os usuários continuam).

Se você já tinha rodado o `schema.sql` antigo, rode o novo de novo: ele não apaga nada e só adiciona o banco de testes. A senha do usuário continua a mesma de antes.

## 3. Configure o arquivo .env

Se ainda não tiver o `backend/.env`, copie o `backend/.env.example` (no Windows: `copy backend\.env.example backend\.env`) e preencha:

| Variável | O que é |
| --- | --- |
| `DB_PASSWORD` | A senha do usuário `quadrafacil_app` |
| `JWT_SECRET` | Qualquer texto longo e aleatório. Assina os logins |
| `TZ` | Fuso horário usado nas regras de horário. Padrão: `America/Fortaleza` |
| `GINASIO_NOME` | Nome que aparece no app. Padrão: `Ginásio Municipal` |
| `ESCOLA_NOME`, `ESCOLA_EMAIL`, `ESCOLA_SENHA` | Conta da escola criada na primeira vez que a API roda |

Se você já tem um `.env` da versão anterior, ele continua funcionando: as variáveis novas têm valores padrão.

## 4. Instale e rode

Da raiz do projeto:

```
npm run api:instalar
npm run api
```

Deve aparecer `API do QuadraFácil rodando na porta 3000`. Para conferir, abra `http://localhost:3000/api/saude` no navegador: deve mostrar `{"ok":true,"banco":true}`.

## 5. Testes automáticos

```
npm run api:testes
```

São 14 testes que sobem a API de verdade contra o banco `quadrafacil_teste` (que é apagado e recriado a cada execução, sem tocar nos seus dados). Eles conferem o horário de funcionamento, os limites de reserva, a prioridade da escola, o cancelamento com notificação e as permissões de cada perfil.

## 6. Testando pelo celular

O app descobre o endereço da API sozinho. Garanta que o celular e o notebook estão no mesmo Wi-Fi e que o Firewall do Windows permitiu o Node.js em redes privadas. Se não conectar, rode `ipconfig`, pegue o "Endereço IPv4" e crie um `.env` na raiz do projeto com `EXPO_PUBLIC_API_URL=http://SEU_IP:3000`.

## Organização

```
app.js            monta o Express e as rotas
server.js         prepara o banco e liga o servidor
regras.js         horários de funcionamento, limites e validações
estrutura.js      cria e atualiza as tabelas, cria as contas padrão
auth.js           login com token (JWT) e permissões por perfil
rotas/            publicas, reservas, notificacoes, escola
servicos/         montagem da agenda, transações, limite de tentativas de login
sql/tabelas.sql   estrutura do banco
testes/           testes automáticos
```

## Rotas

| Método | Rota | Quem | O que faz |
| --- | --- | --- | --- |
| GET | `/api/saude` | todos | Confere se a API e o banco estão no ar |
| GET | `/api/config` | todos | Nome do ginásio, horários, modalidades e limites |
| GET | `/api/agenda` | todos | Próximos 7 dias com o status de cada horário |
| POST | `/api/cadastro` | todos | Cria uma conta de morador |
| POST | `/api/login` | todos | Devolve os dados do usuário (com o perfil) e um token |
| GET | `/api/reservas/minhas` | logado | Reservas futuras e histórico dos últimos 60 dias |
| POST | `/api/reservas` | morador | Cria uma reserva |
| DELETE | `/api/reservas/:id` | morador | Cancela uma reserva própria (fica no histórico) |
| GET | `/api/notificacoes` | logado | Notificações da pessoa |
| POST | `/api/notificacoes/lidas` | logado | Marca as notificações como lidas |
| GET | `/api/escola/agenda` | escola | Agenda com quem reservou cada horário (até 60 dias) |
| POST | `/api/escola/bloqueios` | escola | Reserva horários para a escola, cancela as reservas afetadas e notifica cada pessoa |
| POST | `/api/escola/bloqueios/liberar` | escola | Devolve horários da escola para o público |

## Garantias do banco

- Um horário só pode ter uma reserva ativa (restrição `UNIQUE` numa coluna gerada a partir da data e do horário das reservas ativas).
- A escola só tem um bloqueio por horário (`UNIQUE` em data e horário).
- Bloquear horários, cancelar as reservas e criar as notificações acontece numa única transação: ou tudo é salvo, ou nada é.
- Senhas são guardadas com bcrypt, e o login é bloqueado por 15 minutos depois de 8 tentativas erradas seguidas.
