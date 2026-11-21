import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, STATUS_HORARIO } from '../constants/theme';

export default function Legenda({ itens = ['livre', 'reservado', 'escola'] }) {
  return (
    <View style={styles.linha}>
      {itens.map((chave) => {
        const meta = STATUS_HORARIO[chave];
        return (
          <View key={chave} style={styles.item}>
            <View style={[styles.cor, { backgroundColor: meta.fundo, borderColor: meta.borda }]} />
            <Text style={styles.texto}>{meta.rotulo}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cor: {
    width: 14,
    height: 14,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  texto: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '600',
  },
});
