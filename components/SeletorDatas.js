import { ScrollView, Pressable, Text, View, StyleSheet } from 'react-native';
import { partesDaData, ehFimDeSemana, formatarDataLonga } from '../data/datas';
import { colors, spacing, radius, sombra } from '../constants/theme';

const COR_MARCADOR = {
  escola: colors.amberLine,
  minha: colors.teal,
  reservado: colors.faint,
};

export default function SeletorDatas({ datas, selecionada, onSelecionar, marcadores = {} }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.lista}
      style={styles.rolagem}
    >
      {datas.map((data) => {
        const ativo = data === selecionada;
        const { semana, dia, mes } = partesDaData(data);
        const fds = ehFimDeSemana(data);
        const pontos = marcadores[data] || [];
        return (
          <Pressable
            key={data}
            onPress={() => onSelecionar(data)}
            accessibilityRole="button"
            accessibilityLabel={formatarDataLonga(data)}
            accessibilityState={{ selected: ativo }}
            style={({ pressed }) => [styles.item, ativo && styles.itemAtivo, pressed && !ativo && styles.pressionado]}
          >
            <Text style={[styles.semana, fds && styles.semanaFds, ativo && styles.textoAtivo]}>{semana}</Text>
            <Text style={[styles.dia, ativo && styles.textoAtivo]}>{dia}</Text>
            <Text style={[styles.mes, ativo && styles.textoAtivoSuave]}>{mes}</Text>
            <View style={styles.pontos}>
              {pontos.slice(0, 3).map((tipo) => (
                <View
                  key={tipo}
                  style={[styles.ponto, { backgroundColor: ativo ? colors.white : COR_MARCADOR[tipo] || colors.faint }]}
                />
              ))}
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  rolagem: {
    marginHorizontal: -spacing.lg,
    flexGrow: 0,
  },
  lista: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  item: {
    width: 62,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  itemAtivo: {
    backgroundColor: colors.dark,
    borderColor: colors.dark,
    ...sombra.leve,
  },
  pressionado: {
    opacity: 0.8,
  },
  semana: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.muted,
  },
  semanaFds: {
    color: colors.teal2,
  },
  dia: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
  },
  mes: {
    fontSize: 11,
    color: colors.muted,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  textoAtivo: {
    color: colors.white,
  },
  textoAtivoSuave: {
    color: colors.tint,
  },
  pontos: {
    flexDirection: 'row',
    gap: 3,
    height: 6,
    marginTop: 5,
  },
  ponto: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
