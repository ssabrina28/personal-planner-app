export const THEMES = {
  sapitos: {
    label: 'Sapitos',
    emoji: '🐸',
    light: {
      primary: '#9CCB7A',
      secondary: '#E9B949',
      danger: '#DC6F82',
      text: '#2E3A2A',
      textLight: '#747B69',
      bg: '#EDF2E4',
      bgLight: '#F4F7EC',
      border: '#DCE3CD',
      white: '#FFFEF8',
    },
    dark: {
      primary: '#8FC06D',
      secondary: '#EBC25E',
      danger: '#EC8C9C',
      text: '#EAF0E0',
      textLight: '#A9B39E',
      bg: '#131811',
      bgLight: '#242D21',
      border: '#34402F',
      white: '#1C231A',
    }
  },
  unicornios: {
    label: 'Unicornios',
    emoji: '🦄',
    light: {
      primary: '#C3A6D6',
      secondary: '#F5B7D7',
      danger: '#F7A8B8',
      text: '#3B2F4D',
      textLight: '#7B6A8A',
      bg: '#FFF7FB',
      bgLight: '#F5EEFF',
      border: '#E9D8F5',
      white: '#FFFDFE',
    },
    dark: {
      primary: '#C59AE6',
      secondary: '#F2A9CF',
      danger: '#F39BB2',
      text: '#F7EAFB',
      textLight: '#D7C6E8',
      bg: '#1A1220',
      bgLight: '#2A1D2F',
      border: '#473959',
      white: '#261B2F',
    }
  },
  bosque: {
    label: 'Bosque',
    emoji: '🐻',
    light: {
      primary: '#7AA06C',
      secondary: '#D98A6A',
      danger: '#B85E4D',
      text: '#243226',
      textLight: '#677866',
      bg: '#F4F0E7',
      bgLight: '#EAF3E6',
      border: '#D7D2C3',
      white: '#FFFCF7',
    },
    dark: {
      primary: '#89B77E',
      secondary: '#E29F6E',
      danger: '#D07A63',
      text: '#F2F5F0',
      textLight: '#B7C0B2',
      bg: '#181F1A',
      bgLight: '#222D25',
      border: '#394638',
      white: '#1D251E',
    }
  },
  tiburones: {
    label: 'Tiburones',
    emoji: '🦈',
    light: {
      primary: '#8FC1CF',
      secondary: '#6FB0C8',
      danger: '#E7A887',
      text: '#183A46',
      textLight: '#5C7C8E',
      bg: '#EDF8FF',
      bgLight: '#E3F5FC',
      border: '#CFE7F3',
      white: '#F8FDFF',
    },
    dark: {
      primary: '#88C5D8',
      secondary: '#72B3CB',
      danger: '#E9BA99',
      text: '#EAF7FF',
      textLight: '#A7C5D7',
      bg: '#0F1F2B',
      bgLight: '#182B37',
      border: '#29485D',
      white: '#152A35',
    }
  },
  gatos: {
    label: 'Gatos',
    emoji: '🐱',
    light: {
      primary: '#F2B28E',
      secondary: '#D9B88F',
      danger: '#D67C7C',
      text: '#2D2621',
      textLight: '#7A655E',
      bg: '#FFF8F1',
      bgLight: '#F7EFE8',
      border: '#F1E0D2',
      white: '#FFFDFB',
    },
    dark: {
      primary: '#F0B381',
      secondary: '#DAB88F',
      danger: '#E07E7E',
      text: '#F9F2EE',
      textLight: '#D0B8AD',
      bg: '#1B1715',
      bgLight: '#2A221F',
      border: '#4C3B36',
      white: '#241E1B',
    }
  }
};

export const THEME_LIST = Object.entries(THEMES).map(([value, config]) => ({
  value,
  label: config.label,
  emoji: config.emoji,
}));

export function applyTheme(themeName = 'sapitos', darkMode = false) {
  const theme = THEMES[themeName] || THEMES.sapitos;
  const palette = theme[darkMode ? 'dark' : 'light'];
  const root = document.documentElement;

  Object.entries({
    '--primary': palette.primary,
    '--secondary': palette.secondary,
    '--danger': palette.danger,
    '--text': palette.text,
    '--text-light': palette.textLight,
    '--bg': palette.bg,
    '--bg-light': palette.bgLight,
    '--border': palette.border,
    '--white': palette.white,
  }).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  document.body.setAttribute('data-theme', themeName);
  document.body.classList.toggle('dark-mode', darkMode);
  localStorage.setItem('themePreset', themeName);
}
