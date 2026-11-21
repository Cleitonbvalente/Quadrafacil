import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requisitar } from '../services/api';
import { CONFIG_PADRAO, INTERVALO_NOTIFICACOES_MS } from '../constants/config';

const AppContext = createContext(null);

const CHAVE_SESSAO = 'quadrafacil:sessao';
const chaveAvisada = (usuarioId) => `quadrafacil:ultima-notificacao:${usuarioId}`;

async function lerUltimaAvisada(usuarioId) {
  try {
    return Number(await AsyncStorage.getItem(chaveAvisada(usuarioId))) || 0;
  } catch (erro) {
    return 0;
  }
}

function resultadoDeErro(erro) {
  return { ok: false, mensagem: erro.message, status: erro.status };
}

export function AppProvider({ children }) {
  const [pronto, setPronto] = useState(false);
  const [sessao, setSessao] = useState(null);
  const [config, setConfig] = useState(CONFIG_PADRAO);
  const [agenda, setAgenda] = useState([]);
  const [carregandoAgenda, setCarregandoAgenda] = useState(true);
  const [reservas, setReservas] = useState([]);
  const [notificacoes, setNotificacoes] = useState([]);
  const [aviso, setAviso] = useState(null);
  const [erroConexao, setErroConexao] = useState(null);

  const sessaoRef = useRef(null);
  const ultimaAvisada = useRef(0);
  const notificacoesRef = useRef([]);
  notificacoesRef.current = notificacoes;

  const usuarioLogado = sessao?.usuario ?? null;
  const ehCidadao = usuarioLogado?.perfil === 'cidadao';

  const definirSessao = useCallback(async (nova) => {
    sessaoRef.current = nova;
    setSessao(nova);
    if (!nova) {
      setReservas([]);
      setNotificacoes([]);
      setAviso(null);
      ultimaAvisada.current = 0;
    }
    try {
      if (nova) {
        await AsyncStorage.setItem(CHAVE_SESSAO, JSON.stringify(nova));
      } else {
        await AsyncStorage.removeItem(CHAVE_SESSAO);
      }
    } catch (erro) {
      return;
    }
  }, []);

  const chamar = useCallback(
    async (caminho, opcoes = {}) => {
      try {
        const dados = await requisitar(caminho, { ...opcoes, token: sessaoRef.current?.token });
        setErroConexao(null);
        return dados;
      } catch (erro) {
        if (erro.status === 401 && sessaoRef.current) {
          definirSessao(null);
        }
        if (erro.semConexao) {
          setErroConexao(erro.message);
        }
        throw erro;
      }
    },
    [definirSessao],
  );

  const carregarAgenda = useCallback(async () => {
    try {
      setAgenda(await chamar('/api/agenda'));
    } catch (erro) {
      return;
    } finally {
      setCarregandoAgenda(false);
    }
  }, [chamar]);

  const carregarReservas = useCallback(async () => {
    if (sessaoRef.current?.usuario?.perfil !== 'cidadao') return;
    try {
      setReservas(await chamar('/api/reservas/minhas'));
    } catch (erro) {
      return;
    }
  }, [chamar]);

  const carregarNotificacoes = useCallback(async () => {
    if (sessaoRef.current?.usuario?.perfil !== 'cidadao') return;
    try {
      const { itens } = await chamar('/api/notificacoes');
      setNotificacoes(itens);
      const novas = itens.filter((item) => !item.lida && item.id > ultimaAvisada.current);
      if (novas.length > 0) {
        setAviso({ ...novas[0], quantidade: novas.length });
        ultimaAvisada.current = Math.max(...novas.map((item) => item.id));
        AsyncStorage.setItem(chaveAvisada(sessaoRef.current.usuario.id), String(ultimaAvisada.current)).catch(() => {});
        carregarReservas();
        carregarAgenda();
      }
    } catch (erro) {
      return;
    }
  }, [chamar, carregarReservas, carregarAgenda]);

  const atualizar = useCallback(async () => {
    await Promise.all([carregarAgenda(), carregarReservas(), carregarNotificacoes()]);
  }, [carregarAgenda, carregarReservas, carregarNotificacoes]);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const salva = await AsyncStorage.getItem(CHAVE_SESSAO);
        if (salva && ativo) {
          const dados = JSON.parse(salva);
          ultimaAvisada.current = await lerUltimaAvisada(dados.usuario.id);
          sessaoRef.current = dados;
          setSessao(dados);
        }
      } catch (erro) {
        sessaoRef.current = null;
      }
      if (ativo) setPronto(true);
      requisitar('/api/config')
        .then((dados) => ativo && setConfig({ ...CONFIG_PADRAO, ...dados }))
        .catch(() => {});
      atualizar();
    })();
    return () => {
      ativo = false;
    };
  }, [atualizar]);

  useEffect(() => {
    if (!ehCidadao) return undefined;
    const intervalo = setInterval(carregarNotificacoes, INTERVALO_NOTIFICACOES_MS);
    const assinatura = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') atualizar();
    });
    return () => {
      clearInterval(intervalo);
      assinatura.remove();
    };
  }, [ehCidadao, carregarNotificacoes, atualizar]);

  const cadastrar = useCallback(async ({ nome, email, senha }) => {
    try {
      const dados = await requisitar('/api/cadastro', { metodo: 'POST', corpo: { nome, email, senha } });
      setErroConexao(null);
      return { ok: true, mensagem: dados.mensagem };
    } catch (erro) {
      if (erro.semConexao) setErroConexao(erro.message);
      return resultadoDeErro(erro);
    }
  }, []);

  const login = useCallback(
    async ({ email, senha }) => {
      try {
        const dados = await requisitar('/api/login', { metodo: 'POST', corpo: { email, senha } });
        setErroConexao(null);
        await definirSessao({ usuario: dados.usuario, token: dados.token });
        ultimaAvisada.current = await lerUltimaAvisada(dados.usuario.id);
        await atualizar();
        return { ok: true, usuario: dados.usuario };
      } catch (erro) {
        if (erro.semConexao) setErroConexao(erro.message);
        return resultadoDeErro(erro);
      }
    },
    [definirSessao, atualizar],
  );

  const logout = useCallback(() => {
    definirSessao(null);
    carregarAgenda();
  }, [definirSessao, carregarAgenda]);

  const criarReserva = useCallback(
    async ({ modalidade, data, horario }) => {
      try {
        const nova = await chamar('/api/reservas', { metodo: 'POST', corpo: { modalidade, data, horario } });
        await Promise.all([carregarAgenda(), carregarReservas()]);
        return { ok: true, reserva: nova };
      } catch (erro) {
        if (erro.status === 409) await carregarAgenda();
        return resultadoDeErro(erro);
      }
    },
    [chamar, carregarAgenda, carregarReservas],
  );

  const cancelarReserva = useCallback(
    async (id) => {
      try {
        await chamar(`/api/reservas/${id}`, { metodo: 'DELETE' });
        await Promise.all([carregarAgenda(), carregarReservas()]);
        return { ok: true };
      } catch (erro) {
        await carregarReservas();
        return resultadoDeErro(erro);
      }
    },
    [chamar, carregarAgenda, carregarReservas],
  );

  const marcarNotificacoesLidas = useCallback(async () => {
    if (!notificacoesRef.current.some((item) => !item.lida)) return;
    try {
      await chamar('/api/notificacoes/lidas', { metodo: 'POST', corpo: {} });
      setNotificacoes((atuais) => atuais.map((item) => ({ ...item, lida: true })));
    } catch (erro) {
      return;
    }
  }, [chamar]);

  const fecharAviso = useCallback(() => setAviso(null), []);

  const proximasReservas = useMemo(
    () =>
      reservas
        .filter((r) => r.situacao === 'ativa')
        .sort((a, b) => `${a.data}${a.horario}`.localeCompare(`${b.data}${b.horario}`)),
    [reservas],
  );

  const historicoReservas = useMemo(
    () =>
      reservas
        .filter((r) => r.situacao !== 'ativa')
        .sort((a, b) => `${b.data}${b.horario}`.localeCompare(`${a.data}${a.horario}`)),
    [reservas],
  );

  const naoLidas = useMemo(() => notificacoes.filter((item) => !item.lida).length, [notificacoes]);

  const value = useMemo(
    () => ({
      pronto,
      usuarioLogado,
      config,
      agenda,
      carregandoAgenda,
      erroConexao,
      proximasReservas,
      historicoReservas,
      notificacoes,
      naoLidas,
      aviso,
      chamar,
      atualizar,
      cadastrar,
      login,
      logout,
      criarReserva,
      cancelarReserva,
      marcarNotificacoesLidas,
      fecharAviso,
    }),
    [
      pronto,
      usuarioLogado,
      config,
      agenda,
      carregandoAgenda,
      erroConexao,
      proximasReservas,
      historicoReservas,
      notificacoes,
      naoLidas,
      aviso,
      chamar,
      atualizar,
      cadastrar,
      login,
      logout,
      criarReserva,
      cancelarReserva,
      marcarNotificacoesLidas,
      fecharAviso,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const contexto = useContext(AppContext);
  if (!contexto) {
    throw new Error('useApp precisa ser usado dentro de um AppProvider');
  }
  return contexto;
}
