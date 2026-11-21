import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Tela from '../components/Tela';
import Botao from '../components/Botao';
import Icone from '../components/Icone';
import Cartao from '../components/Cartao';
import { formatarDataLonga } from '../data/datas';
import { colors, spacing, ICONE_MODALIDADE } from '../constants/theme';

export default function Confirmacao() {
  const router = useRouter();
  const { modalidade, data, horario } = useLocalSearchParams();

  return (
    <Tela style={styles.centro}>
      <View style={styles.icone}>
        <Icone nome="check-bold" tamanho={40} cor={colors.white} />
      </View>

      <Text style={styles.titulo}>Reserva realizada com sucesso!</Text>
      <Text style={styles.subtitulo}>O ginásio está reservado para você.</Text>

      <Cartao style={styles.cartao}>
        <Linha icone={ICONE_MODALIDADE[modalidade] || 'whistle-outline'} rotulo="Modalidade" valor={modalidade} />
        <Linha icone="calendar-month-outline" rotulo="Dia" valor={formatarDataLonga(data)} />
        <Linha icone="clock-outline" rotulo="Horário" valor={horario} ultima />
      </Cartao>

      <View style={styles.nota}>
        <Icone nome="bell-outline" tamanho={18} cor={colors.amber} />
        <Text style={styles.notaTexto}>
          Se a escola precisar do ginásio nesse horário, você será avisado aqui pelo app com o motivo.
        </Text>
      </View>

      <View style={styles.botoes}>
        <Botao
          titulo="Ver minhas reservas"
          icone="format-list-bulleted"
          variante="contorno"
          onPress={() => router.replace('/minhas-reservas')}
        />
        <Botao
          titulo="Voltar ao início"
          icone="home-outline"
          variante="escuro"
          onPress={() => router.replace('/home')}
        />
      </View>
    </Tela>
  );
}

function Linha({ icone, rotulo, valor, ultima }) {
  return (
    <View style={[styles.linha, !ultima && styles.linhaBorda]}>
      <Icone nome={icone} tamanho={22} cor={colors.teal2} />
      <View style={styles.linhaTextos}>
        <Text style={styles.linhaRotulo}>{rotulo}</Text>
        <Text style={styles.linhaValor}>{valor}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centro: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  icone: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    boxShadow: '0px 8px 24px rgba(0, 168, 150, 0.35)',
  },
  titulo: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 14,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  cartao: {
    width: '100%',
    marginTop: spacing.lg,
    paddingVertical: spacing.xs,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  linhaBorda: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  linhaTextos: {
    flex: 1,
  },
  linhaRotulo: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  linhaValor: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '700',
    marginTop: 2,
  },
  nota: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    width: '100%',
  },
  notaTexto: {
    flex: 1,
    fontSize: 12,
    color: colors.muted,
    lineHeight: 17,
  },
  botoes: {
    width: '100%',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
});
