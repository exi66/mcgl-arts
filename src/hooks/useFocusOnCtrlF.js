import { useEffect } from "react";

/** Перехватывает Ctrl+F / Cmd+F и ставит фокус на переданный элемент. */
export function useFocusOnCtrlF(ref) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.code === "KeyF") {
        event.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [ref]);
}
