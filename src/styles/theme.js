// Styles globaux réutilisables pour maintenir la cohérence

export const spacing = {
  section: 'mb-8',
  card: 'mb-6',
  element: 'mb-4',
  small: 'mb-2',
};

export const text = {
  h1: 'text-3xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight',
  h2: 'text-2xl sm:text-3xl lg:text-4xl font-bold font-display tracking-tight',
  h3: 'text-xl sm:text-2xl lg:text-3xl font-semibold font-display',
  h4: 'text-lg sm:text-xl lg:text-2xl font-semibold font-display',
  h5: 'text-base sm:text-lg lg:text-xl font-semibold font-display',
  body: 'text-base text-gray-700 dark:text-gray-300 leading-relaxed',
  small: 'text-sm text-gray-600 dark:text-gray-400',
  tiny: 'text-xs text-gray-500 dark:text-gray-500',
};

export const container = {
  page: 'container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 max-w-7xl',
  section: 'container mx-auto px-4 sm:px-6 max-w-7xl',
};

export const button = {
  primary: 'btn btn-primary',
  secondary: 'btn btn-secondary',
  accent: 'btn btn-accent',
  ghost: 'btn btn-ghost',
  sm: 'btn btn-sm',
  lg: 'btn btn-lg',
};

export const card = {
  base: 'card',
  hover: 'card card-hover',
  padding: {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  },
};

export const badge = {
  primary: 'badge badge-primary',
  success: 'badge badge-success',
  warning: 'badge badge-warning',
  error: 'badge badge-error',
};

export const input = {
  base: 'input',
  error: 'input border-red-500 focus:border-red-500 focus:ring-red-100',
};

export const grid = {
  courses: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6',
  stats: 'grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6',
  responsive: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6',
};

export const animation = {
  fadeIn: 'animate-fade-in',
  slideIn: 'animate-slide-in',
  slideUp: 'animate-slide-up',
  float: 'animate-float',
  shimmer: 'animate-shimmer',
};

export const shadow = {
  soft: 'shadow-soft',
  softLg: 'shadow-soft-lg',
  glow: 'shadow-glow',
  glowLg: 'shadow-glow-lg',
};

export const rounded = {
  sm: 'rounded-xl',
  md: 'rounded-2xl',
  lg: 'rounded-3xl',
  full: 'rounded-full',
};

export const transition = {
  base: 'transition-all duration-300 ease-in-out',
  fast: 'transition-all duration-200 ease-in-out',
  slow: 'transition-all duration-500 ease-in-out',
};

export const gradient = {
  primary: 'bg-gradient-to-r from-primary-600 to-primary-500',
  primaryDark: 'bg-gradient-to-r from-primary-700 to-primary-600',
  accent: 'bg-gradient-to-r from-accent-600 to-accent-500',
  success: 'bg-gradient-to-r from-green-600 to-green-500',
  card: 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900',
};
