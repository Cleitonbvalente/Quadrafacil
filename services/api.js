import { API_URL } from '../constants/config';

export const MENSAGEM_SEM_CONEXAO = 'Não foi possível conectar ao servidor. Verifique se a API está rodando';

export async function requisitar(caminho, { metodo = 'GET', corpo, token } = {}) {
  const cabecalhos = { 'Content-Type': 'application/json' };
  if (token) {
    cabecalhos.Authorization = `Bearer ${token}`;
  }

  const controle = new AbortController();
  const limite = setTimeout(() => controle.abort(), 10000);

  let resposta;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      method: metodo,
      headers: cabecalhos,
      body: corpo ? JSON.stringify(corpo) : undefined,
      signal: controle.signal,
    });
  } catch (erro) {
    const falha = new Error(MENSAGEM_SEM_CONEXAO);
    falha.semConexao = true;
    throw falha;
  } finally {
    clearTimeout(limite);
  }

  if (resposta.status === 204) {
    return null;
  }

  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    const falha = new Error(dados.mensagem || 'Ocorreu um erro inesperado');
    falha.status = resposta.status;
    throw falha;
  }
  return dados;
}
