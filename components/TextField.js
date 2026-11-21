import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import Icone from './Icone';
import { colors, spacing, radius } from '../constants/theme';

export default function TextField({
  label,
  value,
  onChangeText,
  icone,
  senha = false,
  keyboardType,
  autoCapitalize = 'none',
  placeholder,
  autoComplete,
  textContentType,
  returnKeyType,
  onSubmitEditing,
  multiline = false,
  maxLength,
  ajuda,
}) {
  const [focado, setFocado] = useState(false);
  const [mostrar, setMostrar] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.caixa, focado && styles.caixaFocada, multiline && styles.caixaMultilinha]}>
        {icone ? <Icone nome={icone} tamanho={20} cor={focado ? colors.teal2 : colors.faint} /> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={senha && !mostrar}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          autoComplete={autoComplete}
          textContentType={textContentType}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => setFocado(true)}
          onBlur={() => setFocado(false)}
          placeholder={placeholder}
          placeholderTextColor={colors.faint}
          accessibilityLabel={label || placeholder}
          multiline={multiline}
          maxLength={maxLength}
          style={[styles.input, multiline && styles.inputMultilinha]}
        />
        {senha ? (
          <Pressable
            onPress={() => setMostrar((atual) => !atual)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={mostrar ? 'Esconder senha' : 'Mostrar senha'}
          >
            <Icone nome={mostrar ? 'eye-off-outline' : 'eye-outline'} tamanho={20} cor={colors.muted} />
          </Pressable>
        ) : null}
      </View>
      {ajuda ? <Text style={styles.ajuda}>{ajuda}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.teal2,
    marginBottom: spacing.xs + 2,
    letterSpacing: 0.4,
  },
  caixa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 52,
  },
  caixaFocada: {
    borderColor: colors.teal,
  },
  caixaMultilinha: {
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    paddingVertical: spacing.sm + 2,
    outlineStyle: 'none',
  },
  inputMultilinha: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  ajuda: {
    fontSize: 12,
    color: colors.muted,
    marginTop: spacing.xs,
  },
});
