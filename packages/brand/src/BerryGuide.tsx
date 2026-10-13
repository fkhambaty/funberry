"use client";

import React, { useId } from "react";
import { BerryHeroMark } from "./BerryMark";
import { voiceLine, type BerryMoment } from "./identity";

export function BerryGuide({
  moment,
  line,
  compact = false,
}: {
  moment: BerryMoment;
  line?: string;
  compact?: boolean;
}) {
  const text = line ?? voiceLine(moment);
  const idp = useId().replace(/:/g, "");
  return (
    <div className={`fb-berry-guide fb-berry-guide-${moment}`} data-berry-moment={moment}>
      <div className="fb-berry-mark" aria-hidden={compact ? undefined : true}>
        <svg viewBox="0 0 220 240" width="72" height="78" role={compact ? "img" : "presentation"} aria-label={compact ? text : undefined}>
          <BerryHeroMark idp={idp} />
        </svg>
      </div>
      {compact ? null : <p className="fb-berry-line">{text}</p>}
    </div>
  );
}
