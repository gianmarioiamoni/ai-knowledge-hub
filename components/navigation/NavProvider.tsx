"use client";

import { createContext, useContext, type JSX, type ReactNode } from "react";

type NavItem = {
  label: string;
  href: string;
};

type NavContextType = {
  items: NavItem[];
};

const NavContext = createContext<NavContextType>({ items: [] });

export function useNavItems(): NavItem[] {
  const context = useContext(NavContext);
  return context.items;
}

type NavProviderProps = {
  items: NavItem[];
  children: ReactNode;
};

export function NavProvider({ items, children }: NavProviderProps): JSX.Element {
  return <NavContext.Provider value={{ items }}>{children}</NavContext.Provider>;
}


