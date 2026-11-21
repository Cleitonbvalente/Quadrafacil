import { Platform } from 'react-native';
import Constants from 'expo-constants';

const PORTA_API = '3000';

function descobrirApi() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const { hostname, port, origin } = window.location;
    if (!port || port === PORTA_API) return origin;
    return process.env.EXPO_PUBLIC_API_URL || `http://${hostname || 'localhost'}:${PORTA_API}`;
  }
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  const hostCompleto = Constants.expoConfig?.hostUri || Constants.expoGoConfig?.debuggerHost;
  const host = hostCompleto ? hostCompleto.split(':')[0] : 'localhost';
  return `http://${host}:${PORTA_API}`;
}

export const API_URL = descobrirApi();

export const INTERVALO_NOTIFICACOES_MS = 30000;

export const CONFIG_PADRAO = {
  ginasio: 'Ginásio Municipal',
  modalidades: ['Futsal', 'Vôlei', 'Basquete', 'Handebol', 'Badminton', 'Outro'],
  diasAntecedencia: 7,
  limites: { ativas: 3, porDia: 1 },
  funcionamento: { diasUteis: '17h às 22h', fimDeSemana: '7h às 22h' },
};
