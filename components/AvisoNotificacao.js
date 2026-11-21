import { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icone from './Icone';
import { useApp } from '../contexts/AppContext';
import { colors, spacing, radius, sombra } from '../constants/theme';

const DURACAO_MS = 9000;
const NATIVO = Platform.OS !== 'web';

export default function AvisoNotificacao() {
  const { aviso, fecharAviso } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const deslocamento = useRef(new Animated.Value(-200)).current;

  useEffect(() => {
    if (!aviso) return undefined;
    Animated.spring(deslocamento, { toValue: 0, useNativeDriver: NATIVO, friction: 8 }).start();
    const temporizador = setTimeout(esconder, DURACAO_MS);
    return () => clearTimeout(temporizador);
  }, [aviso]);

  function esconder() {
    Animated.timing(deslocamento, { toValue: -200, duration: 220, useNativeDriver: NATIVO }).start(() => fecharAviso());
  }

  if (!aviso) return null;

  const abrir = () => {
    esconder();
    router.push('/notificacoes');
  };

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.camada, { paddingTop: insets.top + spacing.sm, transform: [{ translateY: deslocamento }] }]}
    >
      <Pressable style={styles.cartao} onPress={abrir} accessibilityRole="alert" accessibilityLabel={aviso.titulo}>
        <View style={styles.icone}>
          <Icone nome="bell-badge-outline" tamanho={22} cor={colors.white} />
        </View>
        <View style={styles.textos}>
          <Text style={styles.titulo}>
            {aviso.quantidade > 1 ? `${aviso.quantidade} novas notificações` : aviso.titulo}
          </Text>
          <Text style={styles.mensagem} numberOfLines={3}>
            {aviso.mensagem}
          </Text>
          <Text style={styles.link}>Toque para ver</Text>
        </View>
        <Pressable onPress={esconder} hitSlop={12} accessibilityRole="button" accessibilityLabel="Fechar aviso">
          <Icone nome="close" tamanho={20} cor={colors.tint} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  camada: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
    zIndex: 100,
  },
  cartao: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm + 4,
    backgroundColor: colors.dark2,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.amberLine,
    ...sombra.media,
  },
  icone: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textos: {
    flex: 1,
  },
  titulo: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 15,
  },
  mensagem: {
    color: colors.tint,
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  link: {
    color: colors.mint,
    fontSize: 12,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
});
