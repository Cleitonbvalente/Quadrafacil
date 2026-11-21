import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useApp } from '../contexts/AppContext';
import { destinoInicial } from '../hooks/useGuarda';
import Tela from '../components/Tela';
import TextField from '../components/TextField';
import Banner from '../components/Banner';
import Botao from '../components/Botao';
import Icone from '../components/Icone';
import TelaCarregando from '../components/TelaCarregando';
import { emailValido } from '../data/datas';
import { colors, spacing, radius } from '../constants/theme';

export default function Login() {
  const router = useRouter();
  const { pronto, usuarioLogado, login, cadastrar, erroConexao } = useApp();
  const [aba, setAba] = useState('login');
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [emailCadastro, setEmailCadastro] = useState('');
  const [senhaCadastro, setSenhaCadastro] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  if (!pronto) return <TelaCarregando />;
  if (usuarioLogado && !enviando) return <Redirect href={destinoInicial(usuarioLogado)} />;

  const mudarAba = (nova) => {
    setAba(nova);
    setMensagem(null);
  };

  const entrar = async (emailUsado = email, senhaUsada = senha) => {
    if (enviando) return;
    const emailLimpo = emailUsado.trim().toLowerCase();
    if (!emailLimpo || !senhaUsada) {
      setMensagem({ tipo: 'erro', texto: 'Preencha todos os campos obrigatórios' });
      return;
    }
    if (!emailValido(emailLimpo)) {
      setMensagem({ tipo: 'erro', texto: 'Digite um e-mail válido' });
      return;
    }
    setEnviando(true);
    setMensagem(null);
    const resultado = await login({ email: emailLimpo, senha: senhaUsada });
    if (!resultado.ok) {
      setEnviando(false);
      setMensagem({ tipo: 'erro', texto: resultado.mensagem });
      return;
    }
    if (router.canDismiss()) router.dismissAll();
    router.replace(destinoInicial(resultado.usuario));
  };

  const criarConta = async () => {
    if (enviando) return;
    const emailLimpo = emailCadastro.trim().toLowerCase();
    if (!nome.trim() || !emailLimpo || !senhaCadastro || !confirmarSenha) {
      setMensagem({ tipo: 'erro', texto: 'Preencha todos os campos obrigatórios' });
      return;
    }
    if (nome.trim().length < 3) {
      setMensagem({ tipo: 'erro', texto: 'Digite seu nome completo' });
      return;
    }
    if (!emailValido(emailLimpo)) {
      setMensagem({ tipo: 'erro', texto: 'Digite um e-mail válido' });
      return;
    }
    if (senhaCadastro.length < 6) {
      setMensagem({ tipo: 'erro', texto: 'A senha precisa ter pelo menos 6 caracteres' });
      return;
    }
    if (senhaCadastro !== confirmarSenha) {
      setMensagem({ tipo: 'erro', texto: 'As senhas não coincidem' });
      return;
    }
    setEnviando(true);
    const resultado = await cadastrar({ nome: nome.trim(), email: emailLimpo, senha: senhaCadastro });
    setEnviando(false);
    if (!resultado.ok) {
      setMensagem({ tipo: 'erro', texto: resultado.mensagem });
      return;
    }
    setEmail(emailLimpo);
    setSenha('');
    setNome('');
    setEmailCadastro('');
    setSenhaCadastro('');
    setConfirmarSenha('');
    setAba('login');
    setMensagem({ tipo: 'sucesso', texto: resultado.mensagem });
  };

  return (
    <Tela>
      <View style={styles.cabecalho}>
        <View style={styles.iconeTopo}>
          <Icone
            nome={aba === 'login' ? 'account-circle-outline' : 'account-plus-outline'}
            tamanho={34}
            cor={colors.teal2}
          />
        </View>
        <Text style={styles.titulo}>{aba === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}</Text>
        <Text style={styles.subtitulo}>
          {aba === 'login' ? 'Entre para reservar o ginásio.' : 'É rápido e grátis. Só precisa de um e-mail.'}
        </Text>
      </View>

      <View style={styles.abas} accessibilityRole="tablist">
        {[
          { chave: 'login', rotulo: 'Entrar' },
          { chave: 'cadastro', rotulo: 'Criar conta' },
        ].map((item) => (
          <Pressable
            key={item.chave}
            style={[styles.aba, aba === item.chave && styles.abaAtiva]}
            onPress={() => mudarAba(item.chave)}
            accessibilityRole="tab"
            accessibilityState={{ selected: aba === item.chave }}
          >
            <Text style={[styles.abaTexto, aba === item.chave && styles.abaTextoAtivo]}>{item.rotulo}</Text>
          </Pressable>
        ))}
      </View>

      <Banner tipo="erro" mensagem={!mensagem ? erroConexao : null} />
      <Banner tipo={mensagem?.tipo} mensagem={mensagem?.texto} />

      {aba === 'login' ? (
        <View>
          <TextField
            label="E-MAIL"
            icone="email-outline"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            placeholder="seu@email.com"
          />
          <TextField
            label="SENHA"
            icone="lock-outline"
            value={senha}
            onChangeText={setSenha}
            senha
            autoComplete="password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={() => entrar()}
            placeholder="Sua senha"
          />
          <Botao titulo="Entrar" icone="login" onPress={() => entrar()} carregando={enviando} style={styles.espaco} />

          <View style={styles.demo}>
            <Text style={styles.demoTitulo}>Contas de demonstração</Text>
            <Pressable
              style={styles.demoLinha}
              onPress={() => entrar('demo@quadrafacil.com', '123456')}
              accessibilityRole="button"
            >
              <Icone nome="account-outline" tamanho={18} cor={colors.teal2} />
              <Text style={styles.demoTexto}>
                Morador: <Text style={styles.demoForte}>demo@quadrafacil.com</Text> / 123456
              </Text>
            </Pressable>
            <Pressable
              style={styles.demoLinha}
              onPress={() => entrar('escola@quadrafacil.com', 'escola123')}
              accessibilityRole="button"
            >
              <Icone nome="school-outline" tamanho={18} cor={colors.amber} />
              <Text style={styles.demoTexto}>
                Escola: <Text style={styles.demoForte}>escola@quadrafacil.com</Text> / escola123
              </Text>
            </Pressable>
            <Text style={styles.demoAjuda}>Toque numa delas para entrar direto.</Text>
          </View>
        </View>
      ) : (
        <View>
          <TextField
            label="NOME COMPLETO"
            icone="account-outline"
            value={nome}
            onChangeText={setNome}
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
            placeholder="Como você se chama"
            maxLength={120}
          />
          <TextField
            label="E-MAIL"
            icone="email-outline"
            value={emailCadastro}
            onChangeText={setEmailCadastro}
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            placeholder="seu@email.com"
            maxLength={150}
          />
          <TextField
            label="SENHA"
            icone="lock-outline"
            value={senhaCadastro}
            onChangeText={setSenhaCadastro}
            senha
            autoComplete="new-password"
            textContentType="newPassword"
            placeholder="Mínimo de 6 caracteres"
          />
          <TextField
            label="CONFIRMAR SENHA"
            icone="lock-check-outline"
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            senha
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="go"
            onSubmitEditing={criarConta}
            placeholder="Repita a senha"
          />
          <Botao
            titulo="Criar conta"
            icone="account-plus-outline"
            onPress={criarConta}
            carregando={enviando}
            style={styles.espaco}
          />
        </View>
      )}
    </Tela>
  );
}

const styles = StyleSheet.create({
  cabecalho: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconeTopo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.tint2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm + 4,
  },
  titulo: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  subtitulo: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 4,
    textAlign: 'center',
  },
  abas: {
    flexDirection: 'row',
    backgroundColor: colors.tint2,
    borderRadius: radius.pill,
    padding: 4,
    marginBottom: spacing.lg,
  },
  aba: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    borderRadius: radius.pill,
  },
  abaAtiva: {
    backgroundColor: colors.dark,
  },
  abaTexto: {
    color: colors.muted,
    fontWeight: '700',
  },
  abaTextoAtivo: {
    color: colors.white,
  },
  espaco: {
    marginTop: spacing.sm,
  },
  demo: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.tint,
    gap: spacing.sm,
  },
  demoTitulo: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.muted,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  demoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  demoTexto: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
  },
  demoForte: {
    fontWeight: '700',
  },
  demoAjuda: {
    fontSize: 12,
    color: colors.faint,
  },
});
