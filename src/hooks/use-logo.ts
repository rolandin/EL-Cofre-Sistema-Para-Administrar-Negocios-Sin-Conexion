import { useTheme } from 'next-themes';
import logoLight from '@/assets/el-cofre-logo-light.png';
import logoDark from '@/assets/el-cofre-logo-dark.png';

export function useLogo() {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === 'dark' ? logoDark : logoLight;
}
