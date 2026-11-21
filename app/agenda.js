import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../contexts/AppContext';
import useAtualizarAoFocar from '../hooks/useAtualizarAoFocar';
import Tela from '../components/Tela';
import SeletorDatas from '../components/SeletorDatas';
import HorarioItem from '../components/HorarioItem';
import Legenda from '../components/Legenda';
import Banner from '../components/Banner';
import Botao from '../components/Botao';
import EstadoVazio from '../components/EstadoVazio';
import Icone from '../components/Icone';
import { TituloSecao } from '../components/Cartao';
import { formatarDataLonga, formatarHora } from '../data/datas';
import { resumoDoDia, marcadoresDaAgenda, textoLivres, primeiroDiaDisponivel } from '../data/agenda';
import { colors, spacing } from '../constants/theme';

export default function Agenda() {
  const router = useRouter();
  const { agenda, carregandoAgenda, erroConexao, usuarioLogado } = useApp();
  const { atualizando, puxarParaAtualizar } = useAtualizarAoFocar();
  const [data, setData] = useState(null);

  const datas = useMemo(() => agenda.map((dia) => dia.data), [agenda]);
  const marcadores = useMemo(() => marcadoresDaAgenda(agenda), [agenda]);

  useEffect(() => {
    if (datas.length > 0 && !datas.includes(data)) setData(primeiroDiaDisponivel(agenda));
  }, [datas, data, agenda]);

  const dia = agenda.find((item) => item.data === data);
  const resumo = resumoDoDia(dia);
  const podeReservar = usuarioLogado?.perfil === 'cidadao';

  const escolher = (horario) => router.push({ pathname: '/nova-reserva', params: { data, horario } });

  const rodape =
    usuarioLogado?.perfil === 'escola' ? null : (
      <Botao
        titulo={podeReservar ? 'Fazer uma reserva' : 'Entrar para reservar'}
        icone={podeReservar ? 'calendar-plus' : 'login'}
        variante="escuro"
        onPress={() => router.push(podeReservar ? '/nova-reserva' : '/login')}
      />
    );

  return (
    <Tela
      rodape={rodape}
      refreshControl={
        <RefreshControl refreshing={atualizando} onRefresh={puxarParaAtualizar} tintColor={colors.teal} />
      }
    >
      <Banner tipo="erro" mensagem={erroConexao} />

      {carregandoAgenda && agenda.length === 0 ? (
        <ActivityIndicator color={colors.teal} style={styles.carregando} />
      ) : agenda.length === 0 ? (
        <EstadoVazio
          icone="cloud-off-outline"
          titulo="Não foi possível carregar a agenda"
          texto="Puxe a tela para baixo para tentar de novo."
        />
      ) : (
        <>
          <SeletorDatas datas={datas} selecionada={data} onSelecionar={setData} marcadores={marcadores} />

          {dia ? (
            <>
              <View style={styles.cabecalhoDia}>
                <Text style={styles.diaTitulo}>{formatarDataLonga(dia.data)}</Text>
                <Text style={styles.diaSub}>
                  Aberto das {formatarHora(dia.abre)} às {formatarHora(dia.fecha)} • {textoLivres(resumo.livre)}
                </Text>
              </View>

              <Legenda
                itens={podeReservar ? ['livre', 'minha', 'reservado', 'escola'] : ['livre', 'reservado', 'escola']}
              />

              {podeReservar && resumo.livre > 0 ? (
                <Text style={styles.dica}>Toque num horário livre para reservar.</Text>
              ) : null}

              <TituloSecao>Horários</TituloSecao>
              {dia.horarios.map((item) => (
                <HorarioItem
                  key={item.horario}
                  horario={item.horario}
                  status={item.status}
                  motivo={item.motivo}
                  onPress={podeReservar && item.status === 'livre' ? () => escolher(item.horario) : undefined}
                  acao={
                    podeReservar && item.status === 'livre' ? (
                      <Icone nome="chevron-right" tamanho={24} cor={colors.teal2} />
                    ) : null
                  }
                />
              ))}
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
  cabecalhoDia: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  diaTitulo: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  diaSub: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  dica: {
    fontSize: 13,
    color: colors.teal2,
    fontWeight: '600',
  },
});
