import { Pressable, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import Icone from './Icone';
import { colors, spacing, radius } from '../constants/theme';

const VARIANTES = {
  primario: { fundo: colors.teal, borda: colors.teal, texto: colors.white },
  escuro: { fundo: colors.dark, borda: colors.dark, texto: colors.white },
  contorno: { fundo: colors.card, borda: colors.teal, texto: colors.teal2 },
  neutro: { fundo: 'transparent', borda: colors.border, texto: colors.muted },
  perigo: { fundo: 'transparent', borda: colors.red, texto: colors.red },
  perigoCheio: { fundo: colors.red, borda: colors.red, texto: colors.white },
  aviso: { fundo: colors.amber, borda: colors.amber, texto: colors.white },
};

export default function Botao({
  titulo,
  onPress,
  variante = 'primario',
  icone,
  carregando = false,
  disabled = false,
  compacto = false,
  style,
}) {
  const cores = VARIANTES[variante] || VARIANTES.primario;
  const bloqueado = disabled || carregando;

  return (
    <Pressable
      onPress={onPress}
      disabled={bloqueado}
      accessibilityRole="button"
      accessibilityLabel={titulo}
      accessibilityState={{ disabled: bloqueado, busy: carregando }}
      style={({ pressed }) => [
        styles.botao,
        compacto && styles.compacto,
        { backgroundColor: cores.fundo, borderColor: cores.borda },
        pressed && !bloqueado && styles.pressionado,
        bloqueado && styles.bloqueado,
        style,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={cores.texto} />
      ) : (
        <View style={styles.conteudo}>
          {icone ? <Icone nome={icone} tamanho={compacto ? 18 : 20} cor={cores.texto} /> : null}
          <Text style={[styles.texto, compacto && styles.textoCompacto, { color: cores.texto }]}>{titulo}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    borderWidth: 1.5,
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  compacto: {
    minHeight: 40,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm + 2,
  },
  conteudo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pressionado: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  bloqueado: {
    opacity: 0.55,
  },
  texto: {
    fontWeight: '700',
    fontSize: 16,
  },
  textoCompacto: {
    fontSize: 14,
  },
});
