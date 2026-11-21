import { View, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { colors, spacing } from '../constants/theme';

export const LARGURA_MAXIMA = 560;

export default function Tela({ children, refreshControl, rodape, style, fundo = colors.bg }) {
  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: fundo }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.rolagem}
        refreshControl={refreshControl}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.conteudo, style]}>{children}</View>
      </ScrollView>
      {rodape ? (
        <View style={styles.rodape}>
          <View style={styles.rodapeConteudo}>{rodape}</View>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  rolagem: {
    flexGrow: 1,
  },
  conteudo: {
    width: '100%',
    maxWidth: LARGURA_MAXIMA,
    alignSelf: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  rodape: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  rodapeConteudo: {
    width: '100%',
    maxWidth: LARGURA_MAXIMA,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
});
