import { useWindowDimensions } from 'react-native';

export const BREAKPOINTS = {
  tablet: 600,
  desktop: 1024,
} as const;

export const SIDEBAR_WIDTH = 220;
export const MAX_CONTENT_WIDTH = 720;

export type Breakpoint = 'phone' | 'tablet' | 'desktop';

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const breakpoint: Breakpoint =
    width >= BREAKPOINTS.desktop ? 'desktop' :
    width >= BREAKPOINTS.tablet ? 'tablet' : 'phone';

  const isPhone = breakpoint === 'phone';
  const isTablet = breakpoint === 'tablet';
  const isDesktop = breakpoint === 'desktop';
  const isWide = !isPhone;

  function select<T>(values: { phone: T; tablet?: T; desktop?: T }): T {
    if (isDesktop && values.desktop !== undefined) return values.desktop;
    if (isWide && values.tablet !== undefined) return values.tablet;
    return values.phone;
  }

  return { width, height, breakpoint, isPhone, isTablet, isDesktop, isWide, select };
}
