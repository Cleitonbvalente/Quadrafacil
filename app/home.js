import { View, Text, StyleSheet, Pressable, RefreshControl } from 'react-native';
import { Redirect, Stack, useRouter } from 'expo-router';
import { useApp } from '../contexts/AppContext';
import useGuarda from '../hooks/useGuarda';
import useAtualizarAoFocar from '../hooks/useAtualizarAoFocar';
import Tela from '../components/Tela';
import Banner from '../components/Banner';
import Icone from '../components/Icone';
import BotaoCabecalho from '../components/BotaoCabecalho';
import InfoFuncionamento from '../components/InfoFuncionamento';
import TelaCarregando from '../components/TelaCarregando';
import { TituloSecao } from '../components/Cartao';
import { formatarDataLonga, saudacao, primeiroNome } from '../data/datas';
import { colors, spacing, radius, sombra, ICONE_MODALIDADE } from '../constants/theme';

export default function Home() {
  const router = useRouter();
  const guarda = useGuarda('cidadao');
  const { proximasReservas, notificacoes, naoLidas, erroConexao, config } = useApp();
  const { atualizando, puxarParaAtualizar } = useAtualizarAoFocar();

  if (guarda.aguardar) return <TelaCarregando />;
  if (guarda.redirecionar) return <Redirect href={guarda.redirecionar} />;

  const proxima = proximasReservas[0];
  const ultimaNaoLida = notificacoes.find((item) => !item.lida);

  const atalhos = [
    { rotulo: 'Nova reserva', icone: 'calendar-plus', destino: '/nova-reserva', destaque: true },
    { rotulo: 'Agenda do ginásio', icone: 'calendar-month-outline', destino: '/agenda' },
    { rotulo: 'Minhas reservas', icone: 'format-list-bulleted', destino: '/minhas-reservas' },
    { rotulo: 'Notificações', icone: 'bell-outline', destino: '/notificacoes', contador: naoLidas },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View style={styles.cabecalhoDireita}>
              <BotaoCabecalho
                icone="bell-outline"
                rotulo="Notificações"
                contador={naoLidas}
                onPress={() => router.push('/notificacoes')}
              />
              <BotaoCabecalho
                icone="account-circle-outline"
                rotulo="Meu perfil"
                onPress={() => router.push('/perfil')}
              />
            </View>
          ),
        }}
      />
      <Tela
        refreshControl={
          <RefreshControl refreshing={atualizando} onRefresh={puxarParaAtualizar} tintColor={colors.teal} />
        }
      >
        <Banner tipo="erro" mensagem={erroConexao} />

        <Text style={styles.saudacao}>
          {saudacao()}, {primeiroNome(guarda.usuario.nome)}
        </Text>
        <Text style={styles.subtitulo}>Que tal garantir seu horário no ginásio?</Text>

        {ultimaNaoLida ? (
          <Pressable
            onPress={() => router.push('/notificacoes')}
            style={({ pressed }) => [styles.alerta, pressed && styles.pressionado]}
            accessibilityRole="button"
          >
            <Icone nome="school-outline" tamanho={22} cor={colors.amber} />
            <View style={styles.alertaTextos}>
              <Text style={styles.alertaTitulo}>{ultimaNaoLida.titulo}</Text>
              <Text style={styles.alertaTexto} numberOfLines={2}>
                {ultimaNaoLida.mensagem}
              </Text>
            </View>
            <Icone nome="chevron-right" tamanho={22} cor={colors.amber} />
          </Pressable>
        ) : null}

        <View style={styles.cartaoProxima}>
          <Text style={styles.cartaoRotulo}>SUA PRÓXIMA RESERVA</Text>
          {proxima ? (
            <Pressable
              onPress={() => router.push('/minhas-reservas')}
              style={styles.proximaLinha}
              accessibilityRole="button"
            >
              <View style={styles.proximaIcone}>
                <Icone
                  nome={ICONE_MODALIDADE[proxima.modalidade] || 'whistle-outline'}
                  tamanho={28}
                  cor={colors.dark}
                />
              </View>
              <View style={styles.proximaTextos}>
                <Text style={styles.proximaTitulo}>{proxima.modalidade}</Text>
                <Text style={styles.proximaData}>{formatarDataLonga(proxima.data)}</Text>
                <Text style={styles.proximaHora}>{proxima.horario}</Text>
              </View>
              <Icone nome="chevron-right" tamanho={24} cor={colors.tint} />
            </Pressable>
          ) : (
            <View>
              <Text style={styles.semReserva}>Você não tem reservas marcadas.</Text>
              <Pressable onPress={() => router.push('/nova-reserva')} accessibilityRole="button">
                <Text style={styles.semReservaLink}>Reservar agora</Text>
              </Pressable>
            </View>
          )}
          <Text style={styles.limite}>
            {proximasReservas.length} de {config.limites.ativas} reservas em uso
          </Text>
        </View>

        <TituloSecao>O que você quer fazer?</TituloSecao>
        <View style={styles.grade}>
          {atalhos.map((atalho) => (
            <Pressable
              key={atalho.destino}
              onPress={() => router.push(atalho.destino)}
              accessibilityRole="button"
              accessibilityLabel={atalho.rotulo}
              style={({ pressed }) => [
                styles.atalho,
                atalho.destaque && styles.atalhoDestaque,
                pressed && styles.pressionado,
              ]}
            >
              <View style={[styles.atalhoIcone, atalho.destaque && styles.atalhoIconeDestaque]}>
                <Icone nome={atalho.icone} tamanho={24} cor={atalho.destaque ? colors.white : colors.teal2} />
                {atalho.contador > 0 ? <View style={styles.atalhoSelo} /> : null}
              </View>
              <Text style={[styles.atalhoTexto, atalho.destaque && styles.atalhoTextoDestaque]}>{atalho.rotulo}</Text>
            </Pressable>
          ))}
        </View>

        <TituloSecao>Funcionamento</TituloSecao>
        <InfoFuncionamento />
      </Tela>
    </>
  );
}

const styles = StyleSheet.create({
  cabecalhoDireita: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  saudacao: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  subtitulo: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 2,
    marginBottom: spacing.lg,
  },
  alerta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
    backgroundColor: colors.amberSoft,
    borderWidth: 1.5,
    borderColor: colors.amberLine,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  alertaTextos: {
    flex: 1,
  },
  alertaTitulo: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.amber,
  },
  alertaTexto: {
    fontSize: 12,
    color: colors.amber,
    marginTop: 2,
    lineHeight: 17,
  },
  pressionado: {
    opacity: 0.85,
  },
  cartaoProxima: {
    backgroundColor: colors.dark,
    borderRadius: radius.lg,
    padding: spacing.md + 2,
    ...sombra.media,
  },
  cartaoRotulo: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.mint,
    letterSpacing: 0.6,
    marginBottom: spacing.sm + 2,
  },
  proximaLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  proximaIcone: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proximaTextos: {
    flex: 1,
  },
  proximaTitulo: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.white,
  },
  proximaData: {
    fontSize: 14,
    color: colors.tint,
    marginTop: 2,
  },
  proximaHora: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '700',
    marginTop: 2,
  },
  semReserva: {
    fontSize: 15,
    color: colors.tint,
  },
  semReservaLink: {
    fontSize: 15,
    color: colors.mint,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
  limite: {
    fontSize: 12,
    color: colors.faint,
    marginTop: spacing.md,
  },
  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm + 4,
  },
  atalho: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm + 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  atalhoDestaque: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  atalhoIcone: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.tint2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  atalhoIconeDestaque: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  atalhoSelo: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.red,
    borderWidth: 2,
    borderColor: colors.tint2,
  },
  atalhoTexto: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  atalhoTextoDestaque: {
    color: colors.white,
  },
});
