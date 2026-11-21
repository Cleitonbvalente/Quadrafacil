import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors } from '../constants/theme';

export default function Icone({ nome, tamanho = 20, cor = colors.text, style }) {
  return <MaterialCommunityIcons name={nome} size={tamanho} color={cor} style={style} />;
}
