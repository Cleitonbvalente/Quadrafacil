import { View, Text, StyleSheet, Pressable, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, radius } from '../constants/theme';

export default function TelaInicial() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.top}>
          <CourtMark />
          <Text style={styles.brand}>QuadraFácil</Text>
          <Text style={styles.subtitle}>
            Reserve quadras públicas do seu município direto pelo celular
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => router.push('/quadras')}
          >
            <Text style={styles.secondaryButtonText}>Visualizar Quadras Disponíveis</Text>
          </Pressable>

          <Pressable
            style={styles.primaryButton}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.primaryButtonText}>Entrar / Cadastrar</Text>
          </Pressable>

          <Text style={styles.helper}>
            Faça login para criar e gerenciar suas reservas
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function CourtMark() {
  return (
    <View style={styles.courtOuter}>
      <View style={styles.courtInner} />
      <View style={styles.courtLine} />
      <View style={styles.courtCircle} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.dark },
  container: {
    flex: 1,
    backgroundColor: colors.dark,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
    paddingBottom: spacing.xl,
  },
  top: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.white,
    marginTop: spacing.lg,
  },
  subtitle: {
    fontSize: 15,
    color: colors.tint,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    lineHeight: 21,
  },
  actions: {
    width: '100%',
  },
  primaryButton: {
    backgroundColor: colors.teal,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: colors.teal,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  secondaryButtonText: {
    color: colors.teal,
    fontWeight: '700',
    fontSize: 16,
  },
  helper: {
    color: colors.muted,
    fontSize: 12,
    textAlign: 'center',
  },
  courtOuter: {
    width: 96,
    height: 96,
    borderRadius: radius.lg,
    borderWidth: 2.5,
    borderColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courtInner: {
    position: 'absolute',
    width: '100%',
    height: 1.5,
    backgroundColor: colors.teal,
    top: '50%',
  },
  courtLine: {
    position: 'absolute',
    width: 1.5,
    height: '60%',
    backgroundColor: colors.teal,
  },
  courtCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: colors.teal,
  },
});
