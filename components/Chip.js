import { Pressable, Text, StyleSheet } from 'react-native';
import Icone from './Icone';
import { colors, spacing, radius } from '../constants/theme';

export default function Chip({ label, selected, onPress, disabled, icone }) {
  const corTexto = selected ? colors.white : disabled ? colors.faint : colors.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!selected, disabled: !!disabled }}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelecionado,
        disabled && styles.chipDesabilitado,
        pressed && !disabled && styles.pressionado,
      ]}
    >
      {icone ? <Icone nome={icone} tamanho={18} cor={selected ? colors.white : colors.teal2} /> : null}
      <Text style={[styles.label, { color: corTexto }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md - 2,
    borderRadius: radius.pill,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  chipSelecionado: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  chipDesabilitado: {
    backgroundColor: colors.tint2,
    borderColor: colors.tint2,
  },
  pressionado: {
    opacity: 0.85,
  },
  label: {
    fontWeight: '600',
    fontSize: 14,
  },
});
