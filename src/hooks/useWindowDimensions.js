import { useState, useEffect } from "react";

const getWindowDimensions = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
});

export function useWindowDimensions(debounceMs = 150) {
  const [dimensions, setDimensions] = useState(getWindowDimensions);

  useEffect(() => {
    let timeout;
    const handleResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(
        () => setDimensions(getWindowDimensions()),
        debounceMs
      );
    };
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", handleResize);
    };
  }, [debounceMs]);

  return dimensions;
}
