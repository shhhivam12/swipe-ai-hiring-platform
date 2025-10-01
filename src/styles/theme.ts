export const theme = {
  colors: {
    primary: '#2754ff', // Bold blue - company accent
    primaryLight: '#5577ff',
    primaryDark: '#1a3acc',
    secondary: '#8B5CF6', // Purple accent
    accent: '#2754ff', // Bold blue accent
    white: '#FFFFFF',
    black: '#000000', // Bold black
    background: '#FAFBFC',
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    glass: {
      white: 'rgba(255, 255, 255, 0.8)',
      whiteMedium: 'rgba(255, 255, 255, 0.6)',
      whiteLight: 'rgba(255, 255, 255, 0.4)',
      dark: 'rgba(15, 23, 42, 0.6)',
      darkLight: 'rgba(15, 23, 42, 0.4)',
      indigo: 'rgba(79, 70, 229, 0.1)',
      purple: 'rgba(139, 92, 246, 0.1)',
    },
  },
  gradients: {
    primary: 'linear-gradient(135deg, #2754ff 0%, #5577ff 100%)',
    secondary: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
    hero: 'linear-gradient(180deg, #FFFFFF 0%, #F8F9FF 100%)',
    mesh: 'radial-gradient(at 0% 0%, rgba(39, 84, 255, 0.08) 0px, transparent 50%), radial-gradient(at 50% 0%, rgba(39, 84, 255, 0.05) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(39, 84, 255, 0.03) 0px, transparent 50%)',
    card: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
    overlay: 'linear-gradient(180deg, rgba(250, 251, 252, 0) 0%, rgba(250, 251, 252, 1) 100%)',
    glass: 'rgba(255, 255, 255, 0.6)',
  },
  fonts: {
    primary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    secondary: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  breakpoints: {
    xs: '480px',
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
    xxl: '1600px',
  },
  spacing: {
    xs: '6px',
    sm: '12px',
    md: '20px',
    lg: '32px',
    xl: '48px',
    xxl: '64px',
  },
  borderRadius: {
    sm: '12px',
    md: '16px',
    lg: '20px',
    xl: '28px',
    xxl: '32px',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    glass: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    glow: '0 0 20px rgba(58, 124, 255, 0.3), 0 0 40px rgba(58, 124, 255, 0.2)',
  },
  animations: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
};

export default theme;
