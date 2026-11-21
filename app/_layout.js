import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '../contexts/AppContext';
import AvisoNotificacao from '../components/AvisoNotificacao';
import { colors } from '../constants/theme';

export default function RootLayout() {
  return (
    <AppProvider>
      <View style={styles.raiz}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.dark },
            headerTintColor: colors.white,
            headerTitleStyle: { fontWeight: '700' },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.bg },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="agenda" options={{ title: 'Agenda do Ginásio' }} />
          <Stack.Screen name="login" options={{ title: 'Entrar' }} />
          <Stack.Screen
            name="home"
            options={{ title: 'QuadraFácil', headerBackVisible: false, headerLeft: () => null }}
          />
          <Stack.Screen name="nova-reserva" options={{ title: 'Nova Reserva' }} />
          <Stack.Screen
            name="confirmacao"
            options={{
              title: 'Reserva confirmada',
              headerBackVisible: false,
              headerLeft: () => null,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen name="minhas-reservas" options={{ title: 'Minhas Reservas' }} />
          <Stack.Screen name="notificacoes" options={{ title: 'Notificações' }} />
          <Stack.Screen name="perfil" options={{ title: 'Meu Perfil' }} />
          <Stack.Screen
            name="escola"
            options={{ title: 'Painel da Escola', headerBackVisible: false, headerLeft: () => null }}
          />
          <Stack.Screen name="+not-found" options={{ title: 'Página não encontrada' }} />
        </Stack>
        <AvisoNotificacao />
      </View>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  raiz: {
    flex: 1,
    backgroundColor: colors.dark,
  },
});
