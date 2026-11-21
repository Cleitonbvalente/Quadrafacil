const crypto = require('crypto');
const jwt = require('jsonwebtoken');

let segredo = process.env.JWT_SECRET;
if (!segredo || segredo === 'troque_por_um_texto_longo_e_aleatorio') {
  segredo = crypto.randomBytes(32).toString('hex');
  console.warn(
    'JWT_SECRET não definido no .env. Usando um segredo temporário: os logins expiram quando a API reiniciar.',
  );
}

function gerarToken(usuario) {
  return jwt.sign({ id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil }, segredo, {
    expiresIn: '7d',
  });
}

function lerToken(req) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) return null;
  try {
    return jwt.verify(token, segredo);
  } catch (erro) {
    return undefined;
  }
}

function exigirLogin(req, res, next) {
  const usuario = lerToken(req);
  if (usuario === null) {
    return res.status(401).json({ mensagem: 'Faça login para continuar' });
  }
  if (usuario === undefined) {
    return res.status(401).json({ mensagem: 'Sua sessão expirou. Faça login novamente' });
  }
  req.usuario = usuario;
  next();
}

function loginOpcional(req, res, next) {
  req.usuario = lerToken(req) || null;
  next();
}

function exigirEscola(req, res, next) {
  exigirLogin(req, res, () => {
    if (req.usuario.perfil !== 'escola') {
      return res.status(403).json({ mensagem: 'Apenas a escola pode acessar esta área' });
    }
    next();
  });
}

function exigirCidadao(req, res, next) {
  exigirLogin(req, res, () => {
    if (req.usuario.perfil === 'escola') {
      return res.status(403).json({ mensagem: 'A escola reserva o ginásio pelo painel de bloqueios' });
    }
    next();
  });
}

module.exports = { gerarToken, exigirLogin, loginOpcional, exigirEscola, exigirCidadao };
