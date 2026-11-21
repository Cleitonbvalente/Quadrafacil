import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useApp } from '../contexts/AppContext';
import useGuarda from '../hooks/useGuarda';
import useAtualizarAoFocar from '../hooks/useAtualizarAoFocar';
import Tela from '../components/Tela';
import Banner from '../components/Banner';
import Botao from '../components/Botao';
import Icone from '../components/Icone';
import EstadoVazio from '../components/EstadoVazio';
import TelaCarregando from '../components/TelaCarregando';
import { formatarDataLonga } from '../data/datas';
import { colors, spacing, radius, sombra, ICONE_MODALIDADE } from '../constants/theme';

const SITUACOES = {
  ativa: { rotulo: 'Confirmada', cor: colors.teal2, fundo: '#E3F6EF', icone: 'check-circle-outline' },
  concluida: { rotulo: 'Realizada', cor: colors.muted, fundo: colors.tint2, icone: 'check-all' },
  cancelada_usuario: {
    rotulo: 'Cancelada por você',
    cor: colors.muted,
    fundo: '#EEF2F2',
    icone: 'close-circle-outline',
  },
  cancelada_escola: {
    rotulo: 'Cancelada pela escola',
    cor: colors.amber,
    fundo: colors.amberSoft,
    icone: 'school-outline',
  },
};

export default function MinhasReservas() {
  const router = useRouter();
  const guarda = useGuarda('cidadao');
  const { proximasReservas, historicoReservas, cancelarReserva, erroConexao } = useApp();
  const { atualizando, puxarParaAtualizar } = useAtualizarAoFocar();
  const [aba, setAba] = useState('proximas');
  const [idParaCancelar, setIdParaCancelar] = useState(null);
  const [cancelando, setCancelando] = useState(null);
  const [mensagem, setMensagem] = useState(null);

  if (guarda.aguardar) return <TelaCarregando />;
  if (guarda.redirecionar) return <Redirect href={guarda.redirecionar} />;

  const lista = aba === 'proximas' ? proximasReservas : historicoReservas;

  const confirmarCancelamento = async (id) => {
    if (cancelando) return;
    setCancelando(id);
    const resultado = await cancelarReserva(id);
    setCancelando(null);
    setIdParaCancelar(null);
    setMensagem(
      resultado.ok
        ? { tipo: 'sucesso', texto: 'Reserva cancelada com sucesso. O horário ficou livre para outra pessoa.' }
        : { tipo: 'erro', texto: resultado.mensagem },
    );
  };

  return (
    <Tela
      rodape={
        <Botao
          titulo="Nova reserva"
          icone="calendar-plus"
          variante="escuro"
          onPress={() => router.push('/nova-reserva')}
        />
      }
      refreshControl={
        <RefreshControl refreshing={atualizando} onRefresh={puxarParaAtualizar} tintColor={colors.teal} />
      }
    >
      <View style={styles.abas} accessibilityRole="tablist">
        {[
          { chave: 'proximas', rotulo: `Próximas (${proximasReservas.length})` },
          { chave: 'historico', rotulo: 'Histórico' },
        ].map((item) => (
          <Pressable
            key={item.chave}
            onPress={() => {
              setAba(item.chave);
              setMensagem(null);
              setIdParaCancelar(null);
            }}
            style={[styles.aba, aba === item.chave && styles.abaAtiva]}
            accessibilityRole="tab"
            accessibilityState={{ selected: aba === item.chave }}
          >
            <Text style={[styles.abaTexto, aba === item.chave && styles.abaTextoAtivo]}>{item.rotulo}</Text>
          </Pressable>
        ))}
      </View>

      <Banner tipo="erro" mensagem={!mensagem ? erroConexao : null} />
      <Banner tipo={mensagem?.tipo} mensagem={mensagem?.texto} />

      {lista.length === 0 ? (
        aba === 'proximas' ? (
          <EstadoVazio
            icone="calendar-blank-outline"
            titulo="Nenhuma reserva marcada"
            texto="Veja os horários livres e garanta o seu."
            botao="Ver horários livres"
            onPress={() => router.push('/agenda')}
          />
        ) : (
          <EstadoVazio
            icone="history"
            titulo="Nada por aqui ainda"
            texto="Suas reservas passadas e canceladas aparecem aqui."
          />
        )
      ) : (
        lista.map((item) => {
          const situacao = SITUACOES[item.situacao] || SITUACOES.ativa;
          const apagada = item.situacao !== 'ativa';
          return (
            <View key={item.id} style={[styles.cartao, apagada && styles.cartaoApagado]}>
              <View style={styles.topo}>
                <View style={[styles.iconeModalidade, apagada && styles.iconeApagado]}>
                  <Icone
                    nome={ICONE_MODALIDADE[item.modalidade] || 'whistle-outline'}
                    tamanho={24}
                    cor={apagada ? colors.muted : colors.teal2}
                  />
                </View>
                <View style={styles.textos}>
                  <Text style={styles.modalidade}>{item.modalidade}</Text>
                  <Text style={styles.data}>{formatarDataLonga(item.data)}</Text>
                  <Text style={styles.horario}>{item.horario}</Text>
                </View>
              </View>

              <View style={[styles.selo, { backgroundColor: situacao.fundo }]}>
                <Icone nome={situacao.icone} tamanho={14} cor={situacao.cor} />
                <Text style={[styles.seloTexto, { color: situacao.cor }]}>{situacao.rotulo}</Text>
              </View>

              {item.situacao === 'cancelada_escola' && item.motivo ? (
                <View style={styles.motivo}>
                  <Text style={styles.motivoRotulo}>Motivo informado pela escola</Text>
                  <Text style={styles.motivoTexto}>{item.motivo}</Text>
                </View>
              ) : null}

              {item.situacao === 'ativa' ? (
                idParaCancelar === item.id ? (
                  <View style={styles.confirmacao}>
                    <Text style={styles.confirmacaoTexto}>Deseja realmente cancelar esta reserva?</Text>
                    {cancelando === item.id ? (
                      <ActivityIndicator color={colors.red} style={styles.carregando} />
                    ) : (
                      <View style={styles.confirmacaoBotoes}>
                        <Botao
                          titulo="Não"
                          variante="neutro"
                          compacto
                          onPress={() => setIdParaCancelar(null)}
                          style={styles.flex}
                        />
                        <Botao
                          titulo="Sim, cancelar"
                          variante="perigoCheio"
                          compacto
                          onPress={() => confirmarCancelamento(item.id)}
                          style={styles.flex}
                        />
                      </View>
                    )}
                  </View>
                ) : (
                  <Pressable
                    style={styles.botaoCancelar}
                    onPress={() => {
                      setIdParaCancelar(item.id);
                      setMensagem(null);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Cancelar reserva de ${item.modalidade}`}
                  >
                    <Icone nome="close" tamanho={16} cor={colors.red} />
                    <Text style={styles.botaoCancelarTexto}>Cancelar reserva</Text>
                  </Pressable>
                )
              ) : null}
            </View>
          );
        })
      )}
    </Tela>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  abas: {
    flexDirection: 'row',
    backgroundColor: colors.tint2,
    borderRadius: radius.pill,
    padding: 4,
    marginBottom: spacing.md,
  },
  aba: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    borderRadius: radius.pill,
  },
  abaAtiva: {
    backgroundColor: colors.dark,
  },
  abaTexto: {
    color: colors.muted,
    fontWeight: '700',
  },
  abaTextoAtivo: {
    color: colors.white,
  },
  cartao: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...sombra.leve,
  },
  cartaoApagado: {
    backgroundColor: '#FAFCFC',
  },
  topo: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  iconeModalidade: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.tint2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconeApagado: {
    backgroundColor: '#EEF2F2',
  },
  textos: {
    flex: 1,
  },
  modalidade: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  data: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  horario: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '700',
    marginTop: 1,
  },
  selo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm + 2,
    marginTop: spacing.sm + 4,
  },
  seloTexto: {
    fontSize: 12,
    fontWeight: '700',
  },
  motivo: {
    marginTop: spacing.sm + 2,
    backgroundColor: colors.amberSoft,
    borderLeftWidth: 3,
    borderLeftColor: colors.amberLine,
    borderRadius: radius.sm,
    padding: spacing.sm + 2,
  },
  motivoRotulo: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.amber,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  motivoTexto: {
    fontSize: 13,
    color: colors.amber,
    marginTop: 2,
  },
  botaoCancelar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: spacing.sm + 4,
    paddingVertical: spacing.xs + 2,
  },
  botaoCancelarTexto: {
    color: colors.red,
    fontWeight: '700',
    fontSize: 13,
  },
  confirmacao: {
    marginTop: spacing.sm + 4,
    backgroundColor: colors.redSoft,
    borderRadius: radius.md,
    padding: spacing.sm + 4,
  },
  confirmacaoTexto: {
    fontSize: 13,
    color: colors.red,
    fontWeight: '700',
    marginBottom: spacing.sm + 2,
  },
  confirmacaoBotoes: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  carregando: {
    alignSelf: 'flex-start',
  },
});
