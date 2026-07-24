"use client";

import { useEffect } from "react";

const BASE = "Kotoba 言葉";

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${BASE}` : BASE;
  }, [title]);
}
