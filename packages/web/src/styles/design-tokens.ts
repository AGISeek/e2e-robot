/**
 * Design Token System - 设计令牌系统
 * 提供统一的设计变量和主题支持
 */

// 颜色系统
export const colors = {
  // 品牌色
  brand: {
    primary: {
      50: 'hsl(213, 100%, 97%)',
      100: 'hsl(214, 95%, 93%)',
      200: 'hsl(213, 97%, 87%)',
      300: 'hsl(212, 96%, 78%)',
      400: 'hsl(213, 94%, 68%)',
      500: 'hsl(217, 91%, 60%)', // 主色
      600: 'hsl(221, 83%, 53%)',
      700: 'hsl(224, 76%, 48%)',
      800: 'hsl(226, 71%, 40%)',
      900: 'hsl(224, 64%, 33%)',
    },
    secondary: {
      50: 'hsl(270, 100%, 98%)',
      100: 'hsl(269, 100%, 95%)',
      200: 'hsl(269, 100%, 92%)',
      300: 'hsl(269, 97%, 85%)',
      400: 'hsl(270, 95%, 75%)',
      500: 'hsl(270, 91%, 65%)', // 次色
      600: 'hsl(271, 81%, 56%)',
      700: 'hsl(272, 72%, 47%)',
      800: 'hsl(272, 67%, 39%)',
      900: 'hsl(273, 66%, 32%)',
    },
  },

  // 中性色
  neutral: {
    50: 'hsl(210, 40%, 98%)',
    100: 'hsl(210, 40%, 96%)',
    200: 'hsl(214, 32%, 91%)',
    300: 'hsl(213, 27%, 84%)',
    400: 'hsl(215, 20%, 65%)',
    500: 'hsl(215, 16%, 47%)',
    600: 'hsl(215, 19%, 35%)',
    700: 'hsl(215, 25%, 27%)',
    800: 'hsl(217, 33%, 17%)',
    900: 'hsl(222, 84%, 5%)',
  },

  // 语义色
  semantic: {
    success: {
      50: 'hsl(138, 76%, 97%)',
      500: 'hsl(142, 71%, 45%)',
      600: 'hsl(142, 76%, 36%)',
    },
    warning: {
      50: 'hsl(48, 96%, 89%)',
      500: 'hsl(38, 92%, 50%)',
      600: 'hsl(32, 95%, 44%)',
    },
    error: {
      50: 'hsl(0, 86%, 97%)',
      500: 'hsl(0, 72%, 51%)',
      600: 'hsl(0, 74%, 42%)',
    },
    info: {
      50: 'hsl(204, 100%, 97%)',
      500: 'hsl(204, 94%, 54%)',
      600: 'hsl(204, 98%, 46%)',
    },
  },
} as const;

// 间距系统 (基于 4px 基准)
export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px',
} as const;

// 字体系统
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Consolas', 'monospace'],
  },
  fontSize: {
    xs: ['12px', { lineHeight: '16px' }],
    sm: ['14px', { lineHeight: '20px' }],
    base: ['16px', { lineHeight: '24px' }],
    lg: ['18px', { lineHeight: '28px' }],
    xl: ['20px', { lineHeight: '28px' }],
    '2xl': ['24px', { lineHeight: '32px' }],
    '3xl': ['30px', { lineHeight: '36px' }],
    '4xl': ['36px', { lineHeight: '40px' }],
    '5xl': ['48px', { lineHeight: '48px' }],
    '6xl': ['60px', { lineHeight: '60px' }],
  },
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
} as const;

// 圆角系统
export const borderRadius = {
  none: '0px',
  sm: '2px',
  base: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  '3xl': '24px',
  full: '9999px',
} as const;

// 阴影系统
export const boxShadow = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const;

// 断点系统
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// 动画系统
export const animation = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  easing: {
    linear: 'linear',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// Z-index 层级
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// 主题配置
export const themes = {
  light: {
    background: {
      primary: colors.neutral[50],
      secondary: colors.neutral[100],
      tertiary: colors.neutral[200],
    },
    text: {
      primary: colors.neutral[900],
      secondary: colors.neutral[700],
      tertiary: colors.neutral[500],
      inverse: colors.neutral[50],
    },
    border: {
      primary: colors.neutral[200],
      secondary: colors.neutral[300],
    },
  },
  dark: {
    background: {
      primary: colors.neutral[900],
      secondary: colors.neutral[800],
      tertiary: colors.neutral[700],
    },
    text: {
      primary: colors.neutral[50],
      secondary: colors.neutral[300],
      tertiary: colors.neutral[400],
      inverse: colors.neutral[900],
    },
    border: {
      primary: colors.neutral[700],
      secondary: colors.neutral[600],
    },
  },
} as const;

// 导出类型
export type ColorPalette = typeof colors;
export type ThemeConfig = typeof themes;
export type SpacingScale = typeof spacing;
export type TypographyConfig = typeof typography;