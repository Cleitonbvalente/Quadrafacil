import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius, sombra } from '../constants/theme';

export default function Cartao({ children, style }) {
  return <View style={[styles.cartao, style]}>{children}</View>;
}

export function TituloSecao({ children, direita, style }) {
  return (
    <View style={[styles.secao, style]}>
      <Text style={styles.secaoTexto}>{children}</Text>
      {direita}
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...sombra.leve,
  },
  secao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    marginBottom: spacing.sm + 2,
  },
  secaoTexto: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.teal2,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
