import { Pressable, View, Text, StyleSheet } from 'react-native';
import Icone from './Icone';
import { colors } from '../constants/theme';

export default function BotaoCabecalho({ icone, onPress, rotulo, contador = 0 }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={contador > 0 ? `${rotulo}, ${contador} novas` : rotulo}
      style={({ pressed }) => [styles.botao, pressed && styles.pressionado]}
    >
      <Icone nome={icone} tamanho={24} cor={colors.white} />
      {contador > 0 ? (
        <View style={styles.selo}>
          <Text style={styles.seloTexto}>{contador > 9 ? '9+' : contador}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  pressionado: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  selo: {
    position: 'absolute',
    top: 4,
    right: 3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.dark,
  },
  seloTexto: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '800',
  },
});
