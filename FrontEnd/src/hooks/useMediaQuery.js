import { useEffect, useState } from "react";

// true while the media query matches, e.g. useMediaQuery("(max-width: 519px)")
export default function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    // Called by the browser each time the screen crosses the breakpoint
    const onChange = (e) => setMatches(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
