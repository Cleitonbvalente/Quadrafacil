import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { useApp } from '../contexts/AppContext';
import { destinoInicial } from '../hooks/useGuarda';
import Icone from '../components/Icone';
import InfoFuncionamento from '../components/InfoFuncionamento';
import TelaCarregando from '../components/TelaCarregando';
import { LARGURA_MAXIMA } from '../components/Tela';
import { colors, spacing, radius } from '../constants/theme';

export default function TelaInicial() {
  const router = useRouter();
  const { pronto, usuarioLogado } = useApp();

  if (!pronto) return <TelaCarregando />;
  if (usuarioLogado) return <Redirect href={destinoInicial(usuarioLogado)} />;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.rolagem}>
        <View style={styles.conteudo}>
          <View style={styles.topo}>
            <MarcaQuadra />
            <Text style={styles.marca}>QuadraFácil</Text>
            <Text style={styles.subtitulo}>
              Veja os horários livres do ginásio e reserve pelo celular, sem precisar ir até lá.
            </Text>
          </View>

          <InfoFuncionamento escuro />

          <View style={styles.acoes}>
            <Pressable
              style={({ pressed }) => [styles.botaoClaro, pressed && styles.pressionado]}
              onPress={() => router.push('/agenda')}
              accessibilityRole="button"
            >
              <Icone nome="calendar-month-outline" tamanho={20} cor={colors.mint} />
              <Text style={styles.botaoClaroTexto}>Ver agenda do ginásio</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.botaoPrincipal, pressed && styles.pressionado]}
              onPress={() => router.push('/login')}
              accessibilityRole="button"
            >
              <Icone nome="login" tamanho={20} cor={colors.white} />
              <Text style={styles.botaoPrincipalTexto}>Entrar ou criar conta</Text>
            </Pressable>

            <Text style={styles.ajuda}>Qualquer pessoa pode ver a agenda. Para reservar, é preciso entrar.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MarcaQuadra() {
  return (
    <View style={styles.quadraFora}>
      <View style={styles.quadraLinhaMeio} />
      <View style={styles.quadraCirculo} />
      <View style={[styles.quadraArea, styles.quadraAreaEsquerda]} />
      <View style={[styles.quadraArea, styles.quadraAreaDireita]} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.dark },
  rolagem: {
    flexGrow: 1,
  },
  conteudo: {
    flex: 1,
    width: '100%',
    maxWidth: LARGURA_MAXIMA,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  topo: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  marca: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.white,
    marginTop: spacing.lg,
    letterSpacing: -0.5,
  },
  subtitulo: {
    fontSize: 15,
    color: colors.tint,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    lineHeight: 22,
  },
  acoes: {
    gap: spacing.md,
  },
  botaoPrincipal: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.teal,
    minHeight: 54,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoPrincipalTexto: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  botaoClaro: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: 'rgba(2,195,154,0.6)',
    minHeight: 54,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoClaroTexto: {
    color: colors.mint,
    fontWeight: '700',
    fontSize: 16,
  },
  pressionado: {
    opacity: 0.85,
  },
  ajuda: {
    color: colors.tint,
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.85,
  },
  quadraFora: {
    width: 120,
    height: 76,
    borderRadius: radius.sm,
    borderWidth: 2.5,
    borderColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(2,195,154,0.08)',
  },
  quadraLinhaMeio: {
    position: 'absolute',
    width: 2,
    height: '100%',
    backgroundColor: colors.mint,
  },
  quadraCirculo: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.mint,
  },
  quadraArea: {
    position: 'absolute',
    width: 18,
    height: 34,
    borderWidth: 2,
    borderColor: colors.mint,
    top: 18,
  },
  quadraAreaEsquerda: {
    left: -2,
    borderTopRightRadius: 17,
    borderBottomRightRadius: 17,
  },
  quadraAreaDireita: {
    right: -2,
    borderTopLeftRadius: 17,
    borderBottomLeftRadius: 17,
  },
});
