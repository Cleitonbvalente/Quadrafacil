import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Pressable } from 'react-native';
import { Redirect, Stack, useRouter } from 'expo-router';
import { useApp } from '../contexts/AppContext';
import useGuarda from '../hooks/useGuarda';
import useAtualizarAoFocar from '../hooks/useAtualizarAoFocar';
import Tela from '../components/Tela';
import SeletorDatas from '../components/SeletorDatas';
import HorarioItem from '../components/HorarioItem';
import TextField from '../components/TextField';
import Banner from '../components/Banner';
import Botao from '../components/Botao';
import Chip from '../components/Chip';
import Icone from '../components/Icone';
import BotaoCabecalho from '../components/BotaoCabecalho';
import TelaCarregando from '../components/TelaCarregando';
import EstadoVazio from '../components/EstadoVazio';
import { TituloSecao } from '../components/Cartao';
import { formatarDataLonga, formatarHora } from '../data/datas';
import { resumoDoDia, marcadoresDaAgenda, primeiroDiaDisponivel } from '../data/agenda';
import { colors, spacing, radius } from '../constants/theme';

const MOTIVOS_PRONTOS = [
  'Aula de Educação Física',
  'Evento da escola',
  'Jogos escolares',
  'Treino da equipe da escola',
  'Manutenção do ginásio',
];

export default function PainelEscola() {
  const router = useRouter();
  const guarda = useGuarda('escola');
  const { chamar, erroConexao } = useApp();

  const [painel, setPainel] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [data, setData] = useState(null);
  const [selecionados, setSelecionados] = useState([]);
  const [motivo, setMotivo] = useState('');
  const [confirmando, setConfirmando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const [liberarId, setLiberarId] = useState(null);
  const [liberando, setLiberando] = useState(false);

  const carregarPainel = useCallback(async () => {
    try {
      setPainel(await chamar('/api/escola/agenda?dias=30'));
    } catch (erro) {
      if (!erro.semConexao) setMensagem({ tipo: 'erro', texto: erro.message });
    } finally {
      setCarregando(false);
    }
  }, [chamar]);

  const { atualizando, puxarParaAtualizar } = useAtualizarAoFocar(carregarPainel);

  const datas = useMemo(() => painel.map((dia) => dia.data), [painel]);
  const marcadores = useMemo(() => marcadoresDaAgenda(painel), [painel]);

  useEffect(() => {
    if (datas.length > 0 && !datas.includes(data))
      setData(primeiroDiaDisponivel(painel, ['livre', 'reservado', 'escola']));
  }, [datas, data, painel]);

  if (guarda.aguardar) return <TelaCarregando />;
  if (guarda.redirecionar) return <Redirect href={guarda.redirecionar} />;

  const dia = painel.find((item) => item.data === data);
  const resumo = resumoDoDia(dia);
  const selecionaveis = dia ? dia.horarios.filter((h) => h.status === 'livre' || h.status === 'reservado') : [];
  const afetadas = dia
    ? dia.horarios.filter((h) => selecionados.includes(h.horario) && h.reserva).map((h) => h.reserva)
    : [];

  const limparSelecao = () => {
    setSelecionados([]);
    setConfirmando(false);
  };

  const trocarData = (valor) => {
    setData(valor);
    limparSelecao();
    setLiberarId(null);
  };

  const alternar = (horario) => {
    setConfirmando(false);
    setMensagem(null);
    setSelecionados((atuais) =>
      atuais.includes(horario) ? atuais.filter((h) => h !== horario) : [...atuais, horario],
    );
  };

  const selecionarDiaInteiro = () => {
    setConfirmando(false);
    setSelecionados(selecionaveis.map((h) => h.horario));
  };

  const bloquear = async () => {
    if (motivo.trim().length < 3) {
      setMensagem({ tipo: 'erro', texto: 'Informe o motivo. Ele será enviado para quem tinha reserva.' });
      return;
    }
    if (!confirmando) {
      setConfirmando(true);
      return;
    }
    setEnviando(true);
    try {
      const resultado = await chamar('/api/escola/bloqueios', {
        metodo: 'POST',
        corpo: { data, horarios: selecionados, motivo: motivo.trim() },
      });
      const canceladas = resultado.reservasCanceladas.length;
      setMensagem({
        tipo: 'sucesso',
        texto:
          `${selecionados.length} ${selecionados.length === 1 ? 'horário reservado' : 'horários reservados'} para a escola.` +
          (canceladas > 0
            ? ` ${canceladas} ${canceladas === 1 ? 'reserva foi cancelada e a pessoa foi avisada' : 'reservas foram canceladas e as pessoas foram avisadas'}.`
            : ''),
      });
      limparSelecao();
      setMotivo('');
      await carregarPainel();
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: erro.message });
      setConfirmando(false);
    } finally {
      setEnviando(false);
    }
  };

  const liberar = async (id) => {
    setLiberando(true);
    try {
      await chamar('/api/escola/bloqueios/liberar', { metodo: 'POST', corpo: { ids: [id] } });
      setMensagem({ tipo: 'sucesso', texto: 'Horário liberado. Ele já aparece como livre para os moradores.' });
      await carregarPainel();
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: erro.message });
    } finally {
      setLiberando(false);
      setLiberarId(null);
    }
  };

  const acaoDoBloqueio = (item) => {
    if (!item.bloqueio || item.status === 'passado') return null;
    if (liberarId === item.bloqueio.id) {
      return liberando ? (
        <ActivityIndicator color={colors.amber} />
      ) : (
        <View style={styles.liberarConfirma}>
          <Pressable
            onPress={() => setLiberarId(null)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Não liberar"
          >
            <Icone nome="close" tamanho={22} cor={colors.muted} />
          </Pressable>
          <Pressable
            onPress={() => liberar(item.bloqueio.id)}
            style={styles.liberarSim}
            accessibilityRole="button"
            accessibilityLabel="Confirmar liberação"
          >
            <Text style={styles.liberarSimTexto}>Liberar</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <Pressable
        onPress={() => setLiberarId(item.bloqueio.id)}
        style={styles.liberar}
        accessibilityRole="button"
        accessibilityLabel={`Liberar ${item.horario}`}
      >
        <Icone nome="lock-open-variant-outline" tamanho={16} cor={colors.amber} />
        <Text style={styles.liberarTexto}>Liberar</Text>
      </Pressable>
    );
  };

  const rodape =
    selecionados.length > 0 ? (
      <View>
        <View style={styles.rodapeTopo}>
          <Text style={styles.rodapeTitulo}>
            {selecionados.length} {selecionados.length === 1 ? 'horário selecionado' : 'horários selecionados'}
          </Text>
          <Pressable onPress={limparSelecao} hitSlop={8} accessibilityRole="button">
            <Text style={styles.rodapeLimpar}>Limpar</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.motivosProntos}>
          {MOTIVOS_PRONTOS.map((item) => (
            <Chip
              key={item}
              label={item}
              selected={motivo === item}
              onPress={() => {
                setMotivo(item);
                setConfirmando(false);
              }}
            />
          ))}
        </ScrollView>

        <TextField
          icone="text"
          value={motivo}
          onChangeText={(texto) => {
            setMotivo(texto);
            setConfirmando(false);
          }}
          placeholder="Motivo (vai na notificação)"
          autoCapitalize="sentences"
          maxLength={200}
        />

        {afetadas.length > 0 ? (
          <Banner
            tipo="aviso"
            mensagem={`${afetadas.length === 1 ? '1 reserva será cancelada' : `${afetadas.length} reservas serão canceladas`} (${afetadas
              .map((r) => r.nome.split(' ')[0])
              .join(', ')}). Cada pessoa recebe uma notificação com o motivo.`}
            style={styles.avisoAfetadas}
          />
        ) : null}

        <View style={styles.rodapeBotoes}>
          {confirmando ? (
            <Botao
              titulo="Voltar"
              variante="neutro"
              onPress={() => setConfirmando(false)}
              style={styles.botaoVoltar}
              disabled={enviando}
            />
          ) : null}
          <Botao
            titulo={confirmando ? 'Confirmar' : 'Reservar para a escola'}
            icone={confirmando ? 'check' : 'school-outline'}
            variante={confirmando ? 'perigoCheio' : 'aviso'}
            onPress={bloquear}
            carregando={enviando}
            style={styles.flex}
          />
        </View>
      </View>
    ) : null;

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <BotaoCabecalho icone="account-circle-outline" rotulo="Meu perfil" onPress={() => router.push('/perfil')} />
          ),
        }}
      />
      <Tela
        rodape={rodape}
        refreshControl={
          <RefreshControl refreshing={atualizando} onRefresh={puxarParaAtualizar} tintColor={colors.teal} />
        }
      >
        <Text style={styles.titulo}>Gerenciar o ginásio</Text>
        <Text style={styles.subtitulo}>
          Selecione os horários que a escola vai usar. Se houver reserva, ela é cancelada e a pessoa recebe o motivo.
        </Text>

        <Banner tipo="erro" mensagem={!mensagem ? erroConexao : null} />
        <Banner tipo={mensagem?.tipo} mensagem={mensagem?.texto} />

        {carregando && painel.length === 0 ? (
          <ActivityIndicator color={colors.teal} style={styles.carregando} />
        ) : painel.length === 0 ? (
          <EstadoVazio
            icone="cloud-off-outline"
            titulo="Não foi possível carregar a agenda"
            texto="Puxe a tela para tentar de novo."
          />
        ) : (
          <>
            <SeletorDatas datas={datas} selecionada={data} onSelecionar={trocarData} marcadores={marcadores} />

            {dia ? (
              <>
                <Text style={styles.diaTitulo}>{formatarDataLonga(dia.data)}</Text>
                <Text style={styles.diaSub}>
                  Aberto das {formatarHora(dia.abre)} às {formatarHora(dia.fecha)}
                </Text>

                <View style={styles.numeros}>
                  <Numero valor={resumo.livre} rotulo="livres" cor={colors.teal2} />
                  <Numero valor={resumo.reservado} rotulo="reservados" cor={colors.muted} />
                  <Numero valor={resumo.escola} rotulo="da escola" cor={colors.amber} />
                </View>

                <TituloSecao
                  direita={
                    selecionaveis.length > 0 ? (
                      <Pressable
                        onPress={selecionados.length > 0 ? limparSelecao : selecionarDiaInteiro}
                        hitSlop={8}
                        accessibilityRole="button"
                      >
                        <Text style={styles.selecionarTudo}>
                          {selecionados.length > 0 ? 'Limpar seleção' : 'Selecionar o dia todo'}
                        </Text>
                      </Pressable>
                    ) : null
                  }
                >
                  Horários
                </TituloSecao>

                {dia.horarios.map((item) => {
                  const selecionavel = item.status === 'livre' || item.status === 'reservado';
                  return (
                    <HorarioItem
                      key={item.horario}
                      horario={item.horario}
                      status={item.status}
                      motivo={item.motivo}
                      detalhe={item.reserva ? `${item.reserva.nome} • ${item.reserva.modalidade}` : undefined}
                      selecionado={selecionados.includes(item.horario)}
                      onPress={selecionavel ? () => alternar(item.horario) : undefined}
                      acao={acaoDoBloqueio(item)}
                    />
                  );
                })}
              </>
            ) : null}
          </>
        )}
      </Tela>
    </>
  );
}

function Numero({ valor, rotulo, cor }) {
  return (
    <View style={styles.numero}>
      <Text style={[styles.numeroValor, { color: cor }]}>{valor}</Text>
      <Text style={styles.numeroRotulo}>{rotulo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  carregando: {
    marginTop: spacing.xxl,
  },
  titulo: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  subtitulo: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 4,
    marginBottom: spacing.md,
    lineHeight: 19,
  },
  diaTitulo: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.lg,
  },
  diaSub: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  numeros: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  numero: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  numeroValor: {
    fontSize: 22,
    fontWeight: '800',
  },
  numeroRotulo: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '600',
  },
  selecionarTudo: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.teal2,
  },
  liberar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderColor: colors.amberLine,
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm + 2,
  },
  liberarTexto: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.amber,
  },
  liberarConfirma: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  liberarSim: {
    backgroundColor: colors.amber,
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm + 4,
  },
  liberarSimTexto: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.white,
  },
  rodapeTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  rodapeTitulo: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  rodapeLimpar: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.muted,
  },
  motivosProntos: {
    marginBottom: spacing.xs,
    flexGrow: 0,
  },
  avisoAfetadas: {
    marginBottom: spacing.sm + 4,
  },
  rodapeBotoes: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  botaoVoltar: {
    paddingHorizontal: spacing.lg,
  },
});
