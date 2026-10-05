import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Resets window scroll to the top on every route change.
 * Skips the reset when navigating within the same path (e.g. hash changes)
 * to avoid fighting with in-page anchor jumps.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
