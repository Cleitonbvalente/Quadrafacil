import { View, Text, StyleSheet } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useApp } from '../contexts/AppContext';
import useGuarda from '../hooks/useGuarda';
import Tela from '../components/Tela';
import Botao from '../components/Botao';
import Icone from '../components/Icone';
import Cartao, { TituloSecao } from '../components/Cartao';
import InfoFuncionamento from '../components/InfoFuncionamento';
import TelaCarregando from '../components/TelaCarregando';
import { iniciais } from '../data/datas';
import { colors, spacing, radius } from '../constants/theme';

export default function Perfil() {
  const router = useRouter();
  const guarda = useGuarda();
  const { proximasReservas, historicoReservas, config, logout } = useApp();

  if (guarda.aguardar) return <TelaCarregando />;
  if (guarda.redirecionar) return <Redirect href={guarda.redirecionar} />;

  const usuario = guarda.usuario;
  const ehEscola = usuario.perfil === 'escola';

  const sair = () => {
    logout();
    if (router.canDismiss()) router.dismissAll();
    router.replace('/');
  };

  return (
    <Tela>
      <View style={styles.cabecalho}>
        <View style={[styles.avatar, ehEscola && styles.avatarEscola]}>
          {ehEscola ? (
            <Icone nome="school" tamanho={34} cor={colors.white} />
          ) : (
            <Text style={styles.avatarTexto}>{iniciais(usuario.nome)}</Text>
          )}
        </View>
        <Text style={styles.nome}>{usuario.nome}</Text>
        <Text style={styles.email}>{usuario.email}</Text>
        <View style={[styles.perfil, ehEscola && styles.perfilEscola]}>
          <Icone
            nome={ehEscola ? 'shield-account-outline' : 'account-outline'}
            tamanho={14}
            cor={ehEscola ? colors.amber : colors.teal2}
          />
          <Text style={[styles.perfilTexto, ehEscola && styles.perfilTextoEscola]}>
            {ehEscola ? 'Administração do ginásio' : 'Morador'}
          </Text>
        </View>
      </View>

      {!ehEscola ? (
        <Cartao style={styles.numeros}>
          <View style={styles.numero}>
            <Text style={styles.numeroValor}>{proximasReservas.length}</Text>
            <Text style={styles.numeroRotulo}>
              de {config.limites.ativas} reservas{'\n'}marcadas
            </Text>
          </View>
          <View style={styles.separador} />
          <View style={styles.numero}>
            <Text style={styles.numeroValor}>{historicoReservas.filter((r) => r.situacao === 'concluida').length}</Text>
            <Text style={styles.numeroRotulo}>reservas{'\n'}realizadas</Text>
          </View>
        </Cartao>
      ) : null}

      <TituloSecao>Sobre o ginásio</TituloSecao>
      <InfoFuncionamento />

      <Botao titulo="Sair da conta" icone="logout" variante="perigo" onPress={sair} style={styles.sair} />
    </Tela>
  );
}

const styles = StyleSheet.create({
  cabecalho: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarEscola: {
    backgroundColor: colors.amber,
  },
  avatarTexto: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '800',
  },
  nome: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  email: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 2,
  },
  perfil: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.tint2,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radius.pill,
    marginTop: spacing.sm + 2,
  },
  perfilEscola: {
    backgroundColor: colors.amberSoft,
  },
  perfilTexto: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.teal2,
  },
  perfilTextoEscola: {
    color: colors.amber,
  },
  numeros: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  numero: {
    flex: 1,
    alignItems: 'center',
  },
  numeroValor: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.teal2,
  },
  numeroRotulo: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 2,
  },
  separador: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.border,
  },
  sair: {
    marginTop: spacing.xl,
  },
});
