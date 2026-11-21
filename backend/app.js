require('dotenv').config({ quiet: true });
process.env.TZ = process.env.TZ || 'America/Fortaleza';

const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');

const PASTA_WEB = path.join(__dirname, '..', 'dist');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 'loopback');
app.use(cors());
app.use(express.json({ limit: '50kb' }));

app.use('/api', require('./rotas/publicas'));
app.use('/api/reservas', require('./rotas/reservas'));
app.use('/api/notificacoes', require('./rotas/notificacoes'));
app.use('/api/escola', require('./rotas/escola'));

app.locals.servindoWeb = fs.existsSync(path.join(PASTA_WEB, 'index.html'));

if (app.locals.servindoWeb) {
  app.use(express.static(PASTA_WEB));
  app.get(/^\/(?!api(\/|$)).*/, (req, res) => {
    res.sendFile(path.join(PASTA_WEB, 'index.html'));
  });
}

app.use((req, res) => {
  res.status(404).json({ mensagem: 'Rota não encontrada' });
});

app.use((erro, req, res, next) => {
  if (erro.type === 'entity.parse.failed') {
    return res.status(400).json({ mensagem: 'Dados enviados em formato inválido' });
  }
  console.error(erro);
  res.status(500).json({ mensagem: 'Erro inesperado no servidor. Tente novamente' });
});

module.exports = app;
