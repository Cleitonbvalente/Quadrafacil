import { useCallback } from 'react';
import { View, Text, StyleSheet, RefreshControl } from 'react-native';
import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import { useApp } from '../contexts/AppContext';
import useGuarda from '../hooks/useGuarda';
import useAtualizarAoFocar from '../hooks/useAtualizarAoFocar';
import Tela from '../components/Tela';
import Banner from '../components/Banner';
import Botao from '../components/Botao';
import Icone from '../components/Icone';
import EstadoVazio from '../components/EstadoVazio';
import TelaCarregando from '../components/TelaCarregando';
import { tempoRelativo } from '../data/datas';
import { colors, spacing, radius, sombra } from '../constants/theme';

export default function Notificacoes() {
  const router = useRouter();
  const guarda = useGuarda('cidadao');
  const { notificacoes, naoLidas, marcarNotificacoesLidas, erroConexao, fecharAviso } = useApp();
  const { atualizando, puxarParaAtualizar } = useAtualizarAoFocar();

  useFocusEffect(
    useCallback(() => {
      fecharAviso();
      return () => {
        marcarNotificacoesLidas();
      };
    }, [fecharAviso, marcarNotificacoesLidas]),
  );

  if (guarda.aguardar) return <TelaCarregando />;
  if (guarda.redirecionar) return <Redirect href={guarda.redirecionar} />;

  return (
    <Tela
      refreshControl={
        <RefreshControl refreshing={atualizando} onRefresh={puxarParaAtualizar} tintColor={colors.teal} />
      }
    >
      <Banner tipo="erro" mensagem={erroConexao} />

      {notificacoes.length === 0 ? (
        <EstadoVazio
          icone="bell-check-outline"
          titulo="Nenhuma notificação"
          texto="Se a escola precisar do ginásio num horário que você reservou, o aviso aparece aqui."
        />
      ) : (
        <>
          <View style={styles.topo}>
            <Text style={styles.contagem}>
              {naoLidas > 0 ? `${naoLidas} ${naoLidas === 1 ? 'nova' : 'novas'}` : 'Todas lidas'}
            </Text>
            {naoLidas > 0 ? (
              <Text style={styles.acao} onPress={marcarNotificacoesLidas} accessibilityRole="button">
                Marcar todas como lidas
              </Text>
            ) : null}
          </View>

          {notificacoes.map((item) => (
            <View key={item.id} style={[styles.cartao, !item.lida && styles.cartaoNovo]}>
              <View style={[styles.icone, !item.lida && styles.iconeNovo]}>
                <Icone nome="school-outline" tamanho={22} cor={item.lida ? colors.muted : colors.white} />
              </View>
              <View style={styles.textos}>
                <View style={styles.tituloLinha}>
                  <Text style={styles.titulo}>{item.titulo}</Text>
                  {!item.lida ? <View style={styles.ponto} /> : null}
                </View>
                <Text style={styles.mensagem}>{item.mensagem}</Text>
                <Text style={styles.quando}>{tempoRelativo(item.criadaEm)}</Text>
              </View>
            </View>
          ))}

          <Botao
            titulo="Escolher outro horário"
            icone="calendar-month-outline"
            variante="contorno"
            onPress={() => router.push('/agenda')}
            style={styles.botao}
          />
        </>
      )}
    </Tela>
  );
}

const styles = StyleSheet.create({
  topo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  contagem: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.muted,
  },
  acao: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.teal2,
  },
  cartao: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
    ...sombra.leve,
  },
  cartaoNovo: {
    borderColor: colors.amberLine,
    backgroundColor: '#FFFCF5',
  },
  icone: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.tint2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconeNovo: {
    backgroundColor: colors.amber,
  },
  textos: {
    flex: 1,
  },
  tituloLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  titulo: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    flexShrink: 1,
  },
  ponto: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.red,
  },
  mensagem: {
    fontSize: 13,
    color: colors.text,
    marginTop: 4,
    lineHeight: 19,
  },
  quando: {
    fontSize: 12,
    color: colors.faint,
    marginTop: spacing.sm,
  },
  botao: {
    marginTop: spacing.sm,
  },
});
