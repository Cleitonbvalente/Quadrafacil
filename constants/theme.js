export const colors = {
  dark: '#023436',
  dark2: '#16292B',
  teal: '#00A896',
  teal2: '#028090',
  mint: '#02C39A',
  bg: '#F3F8F7',
  card: '#FFFFFF',
  tint: '#D7E7E5',
  tint2: '#EAF4F2',
  border: '#DCE9E7',
  text: '#16292B',
  muted: '#5C7377',
  faint: '#93A5A8',
  red: '#C1121F',
  redSoft: '#FDECEC',
  amber: '#9A5B00',
  amberSoft: '#FFF3DC',
  amberLine: '#F2C46D',
  white: '#FFFFFF',
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };

export const radius = { sm: 8, md: 14, lg: 20, pill: 999 };

export const fonte = {
  titulo: 26,
  subtitulo: 18,
  corpo: 15,
  pequeno: 13,
  mini: 11,
};

export const sombra = {
  leve: { boxShadow: '0px 1px 3px rgba(2, 52, 54, 0.06), 0px 4px 14px rgba(2, 52, 54, 0.06)' },
  media: { boxShadow: '0px 6px 24px rgba(2, 52, 54, 0.14)' },
};

export const STATUS_HORARIO = {
  livre: { rotulo: 'Livre', icone: 'check-circle-outline', fundo: '#E5F7F1', borda: '#A6E3D2', texto: colors.teal2 },
  minha: {
    rotulo: 'Sua reserva',
    icone: 'account-check-outline',
    fundo: colors.teal,
    borda: colors.teal,
    texto: colors.white,
  },
  reservado: {
    rotulo: 'Reservado',
    icone: 'lock-outline',
    fundo: '#EEF2F2',
    borda: colors.border,
    texto: colors.muted,
  },
  escola: {
    rotulo: 'Uso da escola',
    icone: 'school-outline',
    fundo: colors.amberSoft,
    borda: colors.amberLine,
    texto: colors.amber,
  },
  passado: { rotulo: 'Encerrado', icone: 'clock-outline', fundo: '#F5F7F7', borda: '#EBF0F0', texto: colors.faint },
};

export const ICONE_MODALIDADE = {
  Futsal: 'soccer',
  Vôlei: 'volleyball',
  Basquete: 'basketball',
  Handebol: 'handball',
  Badminton: 'badminton',
  Outro: 'whistle-outline',
};
