import type { ReactNode } from 'react';
import { observer } from 'mobx-react-lite';

import { useGlobalStore } from '@/core/hooks/hooks';

interface IsAuthProps {
  children: ReactNode | (() => ReactNode);
  showIf: boolean;
}

/**
 * Conditionally renders its children based on the user's authentication status.
 *
 * This component observes the global `userStore` and renders its `children` only if
 * `userStore.logged` matches the `showIf` prop. Useful for conditionally showing
 * authenticated or unauthenticated UI elements.
 *
 * @component
 *
 * @param {IsAuthProps} props - The props for the component.
 * @param {boolean} props.showIf - If `true`, renders children only when the user is logged in.
 *                                 If `false`, renders children only when the user is not logged in.
 * @param {ReactNode | () => ReactNode} props.children - The content to render. You can pass either
 * a React node (always evaluated) or a function returning a React node (lazy evaluation).
 *
 * @example
 * // Show only for authenticated users
 * <IsAuth showIf={true}>
 *   <PrivateComponent />
 * </IsAuth>
 *
 * @example
 * // Show only for unauthenticated users
 * <IsAuth showIf={false}>
 *   <LoginButton />
 * </IsAuth>
 *
 * @example
 * // Lazy render a heavy component
 * <IsAuth showIf={true}>
 *   {() => <HeavyComponent />}
 * </IsAuth>
 */
export const IsAuth: React.FC<IsAuthProps> = observer(({ children, showIf }) => {
  const { userStore } = useGlobalStore();
  const shouldRender = userStore.isAuth === showIf;

  if (!shouldRender) return null;

  return <>{typeof children === 'function' ? children() : children}</>;
});
