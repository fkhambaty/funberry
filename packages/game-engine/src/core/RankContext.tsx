"use client";

import React, { createContext, useContext } from "react";

interface RankInfo {
  rank: number;
  total: number;
}

interface RankContextType {
  rankInfo: RankInfo | null;
}

const RankContext = createContext<RankContextType>({ rankInfo: null });

export function RankProvider({
  children,
  rankInfo,
}: {
  children: React.ReactNode;
  rankInfo: RankInfo | null;
}) {
  return (
    <RankContext.Provider value={{ rankInfo }}>
      {children}
    </RankContext.Provider>
  );
}

export function useRankInfo(): RankInfo | null {
  return useContext(RankContext).rankInfo;
}
