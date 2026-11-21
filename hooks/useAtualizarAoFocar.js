import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useApp } from '../contexts/AppContext';

export default function useAtualizarAoFocar(extra) {
  const { atualizar } = useApp();
  const [atualizando, setAtualizando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      atualizar();
      if (extra) extra();
    }, [atualizar, extra]),
  );

  const puxarParaAtualizar = useCallback(async () => {
    setAtualizando(true);
    await Promise.all([atualizar(), extra ? extra() : null]);
    setAtualizando(false);
  }, [atualizar, extra]);

  return { atualizando, puxarParaAtualizar };
}
