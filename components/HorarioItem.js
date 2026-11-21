import { Pressable, View, Text, StyleSheet } from 'react-native';
import Icone from './Icone';
import { inicioDoHorario, fimDoHorario } from '../data/datas';
import { colors, spacing, radius, STATUS_HORARIO } from '../constants/theme';

export default function HorarioItem({ horario, status, motivo, detalhe, selecionado, onPress, disabled, acao }) {
  const meta = STATUS_HORARIO[status] || STATUS_HORARIO.livre;
  const clicavel = !!onPress && !disabled;
  const destaque = status === 'minha';

  return (
    <Pressable
      onPress={clicavel ? onPress : undefined}
      disabled={!clicavel}
      accessibilityRole={clicavel ? 'button' : undefined}
      accessibilityLabel={`${horario}, ${meta.rotulo}${motivo ? `, ${motivo}` : ''}`}
      accessibilityState={{ selected: !!selecionado, disabled: !clicavel }}
      style={({ pressed }) => [
        styles.linha,
        { backgroundColor: meta.fundo, borderColor: meta.borda },
        selecionado && styles.selecionado,
        pressed && clicavel && styles.pressionado,
      ]}
    >
      <View style={styles.hora}>
        <Text
          style={[
            styles.inicio,
            { color: destaque ? colors.white : status === 'passado' ? colors.faint : colors.text },
          ]}
        >
          {inicioDoHorario(horario)}
        </Text>
        <Text style={[styles.fim, { color: destaque ? colors.tint : colors.muted }]}>até {fimDoHorario(horario)}</Text>
      </View>

      <View style={[styles.divisor, { backgroundColor: destaque ? 'rgba(255,255,255,0.35)' : meta.borda }]} />

      <View style={styles.info}>
        <View style={styles.statusLinha}>
          <Icone nome={meta.icone} tamanho={16} cor={meta.texto} />
          <Text style={[styles.status, { color: meta.texto }]}>{meta.rotulo}</Text>
        </View>
        {motivo ? (
          <Text style={[styles.detalhe, { color: meta.texto }]} numberOfLines={2}>
            {motivo}
          </Text>
        ) : null}
        {detalhe ? (
          <Text style={[styles.detalhe, { color: destaque ? colors.tint : colors.muted }]} numberOfLines={2}>
            {detalhe}
          </Text>
        ) : null}
      </View>

      {acao ? (
        acao
      ) : selecionado ? (
        <Icone nome="check-circle" tamanho={26} cor={colors.teal} />
      ) : clicavel ? (
        <Icone nome="checkbox-blank-circle-outline" tamanho={24} cor={meta.borda} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  selecionado: {
    borderColor: colors.teal,
    borderWidth: 2,
    backgroundColor: '#D8F3EB',
  },
  pressionado: {
    opacity: 0.85,
  },
  hora: {
    width: 56,
  },
  inicio: {
    fontSize: 18,
    fontWeight: '800',
  },
  fim: {
    fontSize: 11,
    fontWeight: '600',
  },
  divisor: {
    width: 1.5,
    alignSelf: 'stretch',
    borderRadius: 1,
  },
  info: {
    flex: 1,
  },
  statusLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  status: {
    fontSize: 14,
    fontWeight: '700',
  },
  detalhe: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },
});
