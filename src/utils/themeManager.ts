
export interface CustomTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  gradients: {
    primary: string;
    secondary: string;
  };
}

export const predefinedThemes: CustomTheme[] = [
  {
    id: 'ocean',
    name: 'Ocean Depths',
    colors: {
      primary: '#0EA5E9',
      secondary: '#0284C7',
      accent: '#06B6D4',
      background: '#0F172A',
      surface: '#1E293B',
      text: '#F1F5F9',
      textSecondary: '#CBD5E1'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
      secondary: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)'
    }
  },
  {
    id: 'sunset',
    name: 'Sunset Vibes',
    colors: {
      primary: '#F59E0B',
      secondary: '#EF4444',
      accent: '#EC4899',
      background: '#1C1917',
      surface: '#292524',
      text: '#FEF7CD',
      textSecondary: '#FDE68A'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 50%, #EC4899 100%)',
      secondary: 'linear-gradient(135deg, #292524 0%, #44403C 100%)'
    }
  },
  {
    id: 'forest',
    name: 'Forest Canopy',
    colors: {
      primary: '#10B981',
      secondary: '#059669',
      accent: '#34D399',
      background: '#0F2419',
      surface: '#1F2937',
      text: '#ECFDF5',
      textSecondary: '#A7F3D0'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      secondary: 'linear-gradient(135deg, #0F2419 0%, #1F2937 100%)'
    }
  },
  {
    id: 'cosmic',
    name: 'Cosmic Purple',
    colors: {
      primary: '#8B5CF6',
      secondary: '#7C3AED',
      accent: '#A855F7',
      background: '#1E1B4B',
      surface: '#312E81',
      text: '#F3F4F6',
      textSecondary: '#C7D2FE'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
      secondary: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)'
    }
  }
];

export const applyTheme = (theme: CustomTheme) => {
  const root = document.documentElement;
  
  // Apply CSS custom properties
  root.style.setProperty('--theme-primary', theme.colors.primary);
  root.style.setProperty('--theme-secondary', theme.colors.secondary);
  root.style.setProperty('--theme-accent', theme.colors.accent);
  root.style.setProperty('--theme-background', theme.colors.background);
  root.style.setProperty('--theme-surface', theme.colors.surface);
  root.style.setProperty('--theme-text', theme.colors.text);
  root.style.setProperty('--theme-text-secondary', theme.colors.textSecondary);
  root.style.setProperty('--theme-gradient-primary', theme.gradients.primary);
  root.style.setProperty('--theme-gradient-secondary', theme.gradients.secondary);
  
  // Store in localStorage
  localStorage.setItem('selectedTheme', theme.id);
};

export const getStoredTheme = (): CustomTheme => {
  const storedId = localStorage.getItem('selectedTheme');
  return predefinedThemes.find(t => t.id === storedId) || predefinedThemes[0];
};

export const createCustomTheme = (name: string, colors: CustomTheme['colors']): CustomTheme => {
  return {
    id: `custom-${Date.now()}`,
    name,
    colors,
    gradients: {
      primary: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
      secondary: `linear-gradient(135deg, ${colors.background} 0%, ${colors.surface} 100%)`
    }
  };
};
