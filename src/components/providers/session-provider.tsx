"use client";

import { createContext, useContext, type ReactNode } from "react";

import { useProfile } from "@/lib/api/hooks/use-account";
import type { Profile } from "@/lib/api/types";

type SessionValue = {
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

const SessionContext = createContext<SessionValue>({
  profile: null,
  isLoading: false,
  isAuthenticated: false,
});

/**
 * `hasSessionCookie` comes from the server layout, which can actually see the
 * httpOnly cookie. Without it every anonymous visitor would fire a doomed
 * /profile request on first paint.
 */
export function SessionProvider({
  children,
  hasSessionCookie,
}: {
  children: ReactNode;
  hasSessionCookie: boolean;
}) {
  const { data, isLoading } = useProfile(hasSessionCookie);

  return (
    <SessionContext.Provider
      value={{
        profile: data ?? null,
        isLoading: hasSessionCookie && isLoading,
        isAuthenticated: Boolean(data),
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
