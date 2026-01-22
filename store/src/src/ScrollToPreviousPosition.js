// ScrollToPreviousPosition.tsx
import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export default function ScrollToPreviousPosition() {
  const { pathname, key } = useLocation();
  const navType = useNavigationType();

  // Only restore/save when we’re on the homepage
  useEffect(() => {
    if (pathname !== "/") return;

    if (navType === "POP") {
      const pos = sessionStorage.getItem(key);
      if (pos) window.scrollTo(0, +pos);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, key, navType]);

  useEffect(() => {
    if (pathname !== "/") return;
    return () => {
      sessionStorage.setItem(key, window.scrollY.toString());
    };
  }, [pathname, key]);

  return null;
}
