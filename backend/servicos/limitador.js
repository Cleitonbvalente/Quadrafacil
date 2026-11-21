const JANELA_MS = 15 * 60 * 1000;
const MAXIMO_TENTATIVAS = 8;

const tentativas = new Map();

function chaveDe(req, email) {
  return `${req.ip}|${email}`;
}

function bloqueado(req, email) {
  const registro = tentativas.get(chaveDe(req, email));
  if (!registro) return false;
  if (Date.now() - registro.inicio > JANELA_MS) {
    tentativas.delete(chaveDe(req, email));
    return false;
  }
  return registro.quantidade >= MAXIMO_TENTATIVAS;
}

function registrarFalha(req, email) {
  const chave = chaveDe(req, email);
  const registro = tentativas.get(chave);
  if (!registro || Date.now() - registro.inicio > JANELA_MS) {
    tentativas.set(chave, { quantidade: 1, inicio: Date.now() });
  } else {
    registro.quantidade += 1;
  }
}

function limpar(req, email) {
  tentativas.delete(chaveDe(req, email));
}

module.exports = { bloqueado, registrarFalha, limpar };
