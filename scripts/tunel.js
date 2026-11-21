const { spawn } = require('child_process');
const qrcode = require('qrcode-terminal');

const PORTA = process.env.PORT || 3000;
const ENDERECO_LOCAL = `http://localhost:${PORTA}`;

function linha() {
  console.log('='.repeat(60));
}

async function apiNoAr() {
  try {
    const resposta = await fetch(`${ENDERECO_LOCAL}/api/saude`);
    return resposta.ok;
  } catch (erro) {
    return false;
  }
}

async function webNoAr() {
  try {
    const resposta = await fetch(ENDERECO_LOCAL);
    const texto = await resposta.text();
    return texto.includes('<div id="root"');
  } catch (erro) {
    return false;
  }
}

function mostrarLink(link) {
  console.log('');
  linha();
  console.log(' QuadraFácil está online!');
  console.log('');
  console.log(` Link: ${link}`);
  console.log('');
  console.log(' Aponte a câmera do celular para o QR Code abaixo:');
  linha();
  qrcode.generate(link, { small: true });
  console.log(' O link funciona enquanto este terminal e o da API estiverem abertos.');
  console.log(' Para encerrar, aperte Ctrl + C.');
  linha();
}

function explicarInstalacao() {
  console.log('');
  linha();
  console.log(' Não foi possível iniciar o cloudflared.');
  console.log('');
  console.log(' 1. Baixe o instalador .msi para Windows (64 bits) em:');
  console.log('    https://developers.cloudflare.com/tunnel/downloads/');
  console.log(' 2. Instale e feche este terminal.');
  console.log(' 3. Abra um terminal novo na pasta do projeto e rode de novo: npm run tunel');
  linha();
}

async function iniciar() {
  if (!(await apiNoAr())) {
    console.log('A API não está respondendo em ' + ENDERECO_LOCAL + '.');
    console.log('Em outro terminal, rode primeiro: npm run apresentacao');
    process.exit(1);
  }
  if (!(await webNoAr())) {
    console.log('A API está no ar, mas sem a versão web do app.');
    console.log('Pare a API (Ctrl + C) e rode: npm run apresentacao');
    process.exit(1);
  }

  console.log('Criando o link público (leva alguns segundos)...');

  const processo = spawn('cloudflared', ['tunnel', '--url', ENDERECO_LOCAL], {
    shell: process.platform === 'win32',
  });

  let mostrado = false;
  const ler = (dados) => {
    const achado = dados.toString().match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
    if (achado && !mostrado) {
      mostrado = true;
      mostrarLink(achado[0]);
    }
  };

  processo.stdout.on('data', ler);
  processo.stderr.on('data', ler);

  processo.on('error', () => {
    explicarInstalacao();
    process.exit(1);
  });

  processo.on('exit', (codigo) => {
    if (!mostrado) explicarInstalacao();
    process.exit(codigo ?? 0);
  });

  process.on('SIGINT', () => {
    processo.kill();
    process.exit(0);
  });
}

iniciar();
