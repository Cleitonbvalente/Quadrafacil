import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../constants/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.dark },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="quadras" options={{ title: 'Quadras Disponíveis' }} />
        <Stack.Screen name="login" options={{ title: 'Entrar / Cadastrar' }} />
        <Stack.Screen name="home" options={{ title: 'Início' }} />
        <Stack.Screen name="nova-reserva" options={{ title: 'Nova Reserva' }} />
        <Stack.Screen name="confirmacao" options={{ title: 'Confirmação', headerBackVisible: false }} />
        <Stack.Screen name="minhas-reservas" options={{ title: 'Minhas Reservas' }} />
        <Stack.Screen name="perfil" options={{ title: 'Meu Perfil' }} />
      </Stack>
    </>
  );
}
