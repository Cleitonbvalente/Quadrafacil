import { View, Text, StyleSheet } from 'react-native';
import Icone from './Icone';
import { colors, spacing, radius } from '../constants/theme';

const VARIANTES = {
  erro: { fundo: colors.redSoft, texto: colors.red, icone: 'alert-circle-outline' },
  sucesso: { fundo: '#E3F6EF', texto: colors.teal2, icone: 'check-circle-outline' },
  aviso: { fundo: colors.amberSoft, texto: colors.amber, icone: 'school-outline' },
  info: { fundo: colors.tint2, texto: colors.dark2, icone: 'information-outline' },
};

export default function Banner({ tipo = 'info', mensagem, titulo, style }) {
  if (!mensagem) return null;
  const variante = VARIANTES[tipo] || VARIANTES.info;

  return (
    <View
      style={[styles.caixa, { backgroundColor: variante.fundo }, style]}
      accessibilityRole={tipo === 'erro' ? 'alert' : undefined}
      accessibilityLiveRegion="polite"
    >
      <Icone nome={variante.icone} tamanho={20} cor={variante.texto} />
      <View style={styles.textos}>
        {titulo ? <Text style={[styles.titulo, { color: variante.texto }]}>{titulo}</Text> : null}
        <Text style={[styles.texto, { color: variante.texto }]}>{mensagem}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  textos: {
    flex: 1,
  },
  titulo: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  texto: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
});
