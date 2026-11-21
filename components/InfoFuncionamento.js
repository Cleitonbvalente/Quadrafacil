import { View, Text, StyleSheet } from 'react-native';
import Icone from './Icone';
import { useApp } from '../contexts/AppContext';
import { colors, spacing, radius } from '../constants/theme';

export default function InfoFuncionamento({ escuro = false }) {
  const { config } = useApp();
  const corTexto = escuro ? colors.white : colors.text;
  const corSuave = escuro ? colors.tint : colors.muted;

  return (
    <View style={[styles.caixa, escuro ? styles.caixaEscura : styles.caixaClara]}>
      <View style={styles.cabecalho}>
        <Icone nome="stadium-variant" tamanho={20} cor={escuro ? colors.mint : colors.teal2} />
        <Text style={[styles.nome, { color: corTexto }]}>{config.ginasio}</Text>
      </View>

      <View style={styles.linhas}>
        <View style={styles.linha}>
          <Text style={[styles.rotulo, { color: corSuave }]}>Segunda a sexta</Text>
          <Text style={[styles.valor, { color: corTexto }]}>{config.funcionamento.diasUteis}</Text>
        </View>
        <View style={styles.linha}>
          <Text style={[styles.rotulo, { color: corSuave }]}>Sábado e domingo</Text>
          <Text style={[styles.valor, { color: corTexto }]}>{config.funcionamento.fimDeSemana}</Text>
        </View>
      </View>

      <View style={[styles.aviso, escuro && styles.avisoEscuro]}>
        <Icone nome="school-outline" tamanho={16} cor={escuro ? colors.amberLine : colors.amber} />
        <Text style={[styles.avisoTexto, { color: escuro ? colors.amberLine : colors.amber }]}>
          O ginásio é da escola: ela tem prioridade. Se precisar de um horário já reservado, você recebe um aviso com o
          motivo.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: {
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
  },
  caixaClara: {
    backgroundColor: colors.card,
    borderColor: colors.border,
  },
  caixaEscura: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.12)',
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  nome: {
    fontSize: 15,
    fontWeight: '800',
  },
  linhas: {
    gap: 4,
  },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rotulo: {
    fontSize: 13,
  },
  valor: {
    fontSize: 13,
    fontWeight: '700',
  },
  aviso: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm + 4,
    backgroundColor: colors.amberSoft,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  avisoEscuro: {
    backgroundColor: 'rgba(242,196,109,0.12)',
  },
  avisoTexto: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
});
