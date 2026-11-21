import { View, Text, StyleSheet } from 'react-native';
import Icone from './Icone';
import Botao from './Botao';
import { colors, spacing } from '../constants/theme';

export default function EstadoVazio({ icone = 'calendar-blank-outline', titulo, texto, botao, onPress }) {
  return (
    <View style={styles.caixa}>
      <View style={styles.circulo}>
        <Icone nome={icone} tamanho={34} cor={colors.teal2} />
      </View>
      <Text style={styles.titulo}>{titulo}</Text>
      {texto ? <Text style={styles.texto}>{texto}</Text> : null}
      {botao ? <Botao titulo={botao} onPress={onPress} compacto style={styles.botao} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  circulo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.tint2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  titulo: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  texto: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: 19,
  },
  botao: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
});
