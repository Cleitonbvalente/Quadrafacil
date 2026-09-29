import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, radius } from '../constants/theme';

export default function PlaceholderScreen({ title, description, requirements }) {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>EM CONSTRUÇÃO — PRÓXIMA ETAPA</Text>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      {requirements ? (
        <View style={styles.reqBox}>
          <Text style={styles.reqLabel}>Requisitos cobertos</Text>
          <Text style={styles.reqText}>{requirements}</Text>
        </View>
      ) : null}

      <Pressable style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Voltar</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.bg,
    padding: spacing.lg,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: colors.tint2,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  badgeText: {
    color: colors.teal2,
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.dark2,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: 15,
    color: colors.dark2,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  reqBox: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    width: '100%',
    marginBottom: spacing.xl,
  },
  reqLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.teal2,
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  reqText: {
    fontSize: 13,
    color: colors.muted,
  },
  button: {
    backgroundColor: colors.dark,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
  },
  buttonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
});
