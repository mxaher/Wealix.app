export const START_PAGE_VALUES = ['dashboard', 'portfolio', 'advisor'] as const;

export type StartPage = (typeof START_PAGE_VALUES)[number];

export const DEFAULT_START_PAGE: StartPage = 'dashboard';

export function isStartPage(value: unknown): value is StartPage {
  return typeof value === 'string' && START_PAGE_VALUES.includes(value as StartPage);
}

export function getStartPageHref(startPage: StartPage) {
  switch (startPage) {
    case 'portfolio':
      return '/portfolio';
    case 'advisor':
      return '/advisor';
    case 'dashboard':
    default:
      return '/dashboard';
  }
}
