import { createContext, useContext } from "react";

interface toggleMenuMobileProps {
  toggleMenu: boolean;
  setToggleMenu: (val: boolean) => void;
}

export const toggleMenuMobile = createContext<
  toggleMenuMobileProps | undefined
>(undefined);

export function useToggleMenu() {
  const instance = useContext(toggleMenuMobile);

  if (instance === undefined) {
    throw new Error("ToggleMenu must be used with .Provider");
  }

  return instance.toggleMenu;
}

export function useSetToggleMenu() {
  const instance = useContext(toggleMenuMobile);

  if (instance === undefined) {
    throw new Error("SetToggleMenu must be used with .Provider");
  }

  return instance.setToggleMenu;
}
