const app = require('./app');
const { garantirEstrutura } = require('./estrutura');

async function iniciar() {
  try {
    await garantirEstrutura();
  } catch (erro) {
    console.error('Não foi possível conectar ao MySQL:', erro.message);
    console.error('Confira se o MySQL Server está rodando e se os dados do arquivo backend/.env estão corretos.');
    process.exit(1);
  }

  const porta = Number(process.env.PORT) || 3000;
  app.listen(porta, '0.0.0.0', () => {
    console.log(`API do QuadraFácil rodando na porta ${porta}`);
    console.log(`Fuso horário: ${process.env.TZ}`);
    if (app.locals.servindoWeb) {
      console.log(`Versão web do app disponível em http://localhost:${porta}`);
      console.log('Para colocar online, abra outro terminal e rode: npm run tunel');
    }
  });
}

iniciar();
