import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useApp } from '../contexts/AppContext';
import useGuarda from '../hooks/useGuarda';
import useAtualizarAoFocar from '../hooks/useAtualizarAoFocar';
import Tela from '../components/Tela';
import SeletorDatas from '../components/SeletorDatas';
import HorarioItem from '../components/HorarioItem';
import Chip from '../components/Chip';
import Banner from '../components/Banner';
import Botao from '../components/Botao';
import Icone from '../components/Icone';
import TelaCarregando from '../components/TelaCarregando';
import { TituloSecao } from '../components/Cartao';
import { formatarDataLonga, formatarData, formatarHora } from '../data/datas';
import { marcadoresDaAgenda, primeiroDiaDisponivel } from '../data/agenda';
import { colors, spacing, radius, ICONE_MODALIDADE } from '../constants/theme';

export default function NovaReserva() {
  const router = useRouter();
  const parametros = useLocalSearchParams();
  const guarda = useGuarda('cidadao');
  const { agenda, carregandoAgenda, config, criarReserva, proximasReservas, erroConexao } = useApp();
  useAtualizarAoFocar();

  const [data, setData] = useState(typeof parametros.data === 'string' ? parametros.data : null);
  const [horario, setHorario] = useState(typeof parametros.horario === 'string' ? parametros.horario : null);
  const [modalidade, setModalidade] = useState(null);
  const [mensagem, setMensagem] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const datas = useMemo(() => agenda.map((dia) => dia.data), [agenda]);
  const marcadores = useMemo(() => marcadoresDaAgenda(agenda), [agenda]);

  useEffect(() => {
    if (datas.length === 0) return;
    if (!data || !datas.includes(data)) setData(primeiroDiaDisponivel(agenda));
  }, [datas]);

  if (guarda.aguardar) return <TelaCarregando />;
  if (guarda.redirecionar) return <Redirect href={guarda.redirecionar} />;

  const dia = agenda.find((item) => item.data === data);
  const livres = dia ? dia.horarios.filter((h) => h.status === 'livre').map((h) => h.horario) : [];
  const horarioValido = horario && livres.includes(horario) ? horario : null;
  const jaTemNoDia = proximasReservas.find((r) => r.data === data);
  const noLimite = proximasReservas.length >= config.limites.ativas;
  const completo = data && horarioValido && modalidade;

  const escolherData = (valor) => {
    setData(valor);
    setHorario(null);
    setMensagem(null);
  };

  const confirmar = async () => {
    if (enviando) return;
    if (!completo) {
      setMensagem({ tipo: 'erro', texto: 'Escolha o dia, o horário e a modalidade' });
      return;
    }
    setEnviando(true);
    setMensagem(null);
    const resultado = await criarReserva({ modalidade, data, horario: horarioValido });
    setEnviando(false);
    if (!resultado.ok) {
      setMensagem({ tipo: 'erro', texto: resultado.mensagem });
      if (resultado.status === 409) setHorario(null);
      return;
    }
    router.replace({
      pathname: '/confirmacao',
      params: { modalidade, data, horario: horarioValido },
    });
  };

  const rodape = (
    <View>
      {completo ? (
        <View style={styles.resumo}>
          <Icone nome={ICONE_MODALIDADE[modalidade]} tamanho={22} cor={colors.teal2} />
          <Text style={styles.resumoTexto} numberOfLines={1}>
            {modalidade} • {formatarData(data)} • {horarioValido}
          </Text>
        </View>
      ) : null}
      <Botao
        titulo={completo ? 'Confirmar reserva' : 'Escolha dia, horário e modalidade'}
        icone={completo ? 'check-circle-outline' : undefined}
        onPress={confirmar}
        carregando={enviando}
        disabled={!completo || noLimite}
      />
    </View>
  );

  return (
    <Tela rodape={rodape}>
      <Banner tipo="erro" mensagem={!mensagem ? erroConexao : null} />
      <Banner tipo={mensagem?.tipo} mensagem={mensagem?.texto} />

      {noLimite ? (
        <Banner
          tipo="info"
          titulo="Você atingiu o limite"
          mensagem={`Cada pessoa pode ter até ${config.limites.ativas} reservas marcadas. Cancele uma em Minhas reservas para fazer outra.`}
        />
      ) : null}

      {carregandoAgenda && agenda.length === 0 ? (
        <ActivityIndicator color={colors.teal} style={styles.carregando} />
      ) : (
        <>
          <TituloSecao style={styles.primeiraSecao}>1. Escolha o dia</TituloSecao>
          <SeletorDatas datas={datas} selecionada={data} onSelecionar={escolherData} marcadores={marcadores} />

          {dia ? (
            <>
              <TituloSecao>2. Escolha o horário</TituloSecao>
              <Text style={styles.diaTexto}>
                {formatarDataLonga(dia.data)} • aberto das {formatarHora(dia.abre)} às {formatarHora(dia.fecha)}
              </Text>

              {jaTemNoDia ? (
                <Banner
                  tipo="info"
                  mensagem={`Você já tem ${jaTemNoDia.modalidade} nesse dia (${jaTemNoDia.horario}). É permitida ${config.limites.porDia} reserva por dia para todos conseguirem usar o ginásio.`}
                />
              ) : null}

              {livres.length === 0 ? (
                <View style={styles.semVaga}>
                  <Icone nome="calendar-remove" tamanho={22} cor={colors.muted} />
                  <Text style={styles.semVagaTexto}>Nenhum horário livre nesse dia. Escolha outro dia acima.</Text>
                </View>
              ) : null}

              {dia.horarios.map((item) => (
                <HorarioItem
                  key={item.horario}
                  horario={item.horario}
                  status={item.status}
                  motivo={item.motivo}
                  selecionado={horarioValido === item.horario}
                  onPress={item.status === 'livre' && !jaTemNoDia ? () => setHorario(item.horario) : undefined}
                />
              ))}

              <TituloSecao>3. O que você vai jogar?</TituloSecao>
              <View style={styles.chips}>
                {config.modalidades.map((item) => (
                  <Chip
                    key={item}
                    label={item}
                    icone={ICONE_MODALIDADE[item]}
                    selected={modalidade === item}
                    onPress={() => setModalidade(item)}
                  />
                ))}
              </View>

              <View style={styles.nota}>
                <Icone nome="information-outline" tamanho={18} cor={colors.muted} />
                <Text style={styles.notaTexto}>
                  A escola tem prioridade no ginásio. Se ela precisar do seu horário, sua reserva é cancelada e você
                  recebe uma notificação explicando o motivo.
                </Text>
              </View>
            </>
          ) : null}
        </>
      )}
    </Tela>
  );
}

const styles = StyleSheet.create({
  carregando: {
    marginTop: spacing.xxl,
  },
  primeiraSecao: {
    marginTop: 0,
  },
  diaTexto: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: spacing.md,
  },
  semVaga: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.tint2,
    marginBottom: spacing.md,
  },
  semVagaTexto: {
    flex: 1,
    fontSize: 13,
    color: colors.muted,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  nota: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  notaTexto: {
    flex: 1,
    fontSize: 12,
    color: colors.muted,
    lineHeight: 17,
  },
  resumo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm + 4,
  },
  resumoTexto: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
});
