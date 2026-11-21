import { useRouter } from 'expo-router';
import Tela from '../components/Tela';
import EstadoVazio from '../components/EstadoVazio';

export default function NaoEncontrada() {
  const router = useRouter();
  return (
    <Tela>
      <EstadoVazio
        icone="map-marker-question-outline"
        titulo="Página não encontrada"
        texto="O endereço que você abriu não existe no QuadraFácil."
        botao="Ir para o início"
        onPress={() => router.replace('/')}
      />
    </Tela>
  );
}
