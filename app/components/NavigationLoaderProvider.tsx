"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type NavigationLoaderContextType = {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
};

const NavigationLoaderContext =
  createContext<NavigationLoaderContextType | null>(null);

export function NavigationLoaderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const startLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const value = useMemo(
    () => ({ isLoading, startLoading, stopLoading }),
    [isLoading, startLoading, stopLoading]
  );

  return (
    <NavigationLoaderContext.Provider value={value}>
      {children}

      {isLoading ? (
        <div className="pointer-events-none fixed inset-0 z-[9999]">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.22)_0%,rgba(15,23,42,0.28)_45%,rgba(37,99,235,0.18)_100%)]" />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="loader-wrap">
              <div className="loader" />
            </div>
          </div>
        </div>
      ) : null}
    </NavigationLoaderContext.Provider>
  );
}

export function useNavigationLoader() {
  const context = useContext(NavigationLoaderContext);

  if (!context) {
    throw new Error(
      "useNavigationLoader must be used inside NavigationLoaderProvider"
    );
  }

  return context;
}