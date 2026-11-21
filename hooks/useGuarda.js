import { useApp } from '../contexts/AppContext';

export function destinoInicial(usuario) {
  if (!usuario) return '/';
  return usuario.perfil === 'escola' ? '/escola' : '/home';
}

export default function useGuarda(perfil) {
  const { pronto, usuarioLogado } = useApp();
  if (!pronto) return { aguardar: true };
  if (!usuarioLogado) return { redirecionar: '/login' };
  if (perfil && usuarioLogado.perfil !== perfil) return { redirecionar: destinoInicial(usuarioLogado) };
  return { usuario: usuarioLogado };
}
