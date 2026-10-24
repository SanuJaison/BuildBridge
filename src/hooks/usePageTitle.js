import { useEffect } from "react";

export default function usePageTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} · BuildBridge` : "BuildBridge — Where ambitious ideas meet proven digital talent";
    return () => {
      document.title = previous;
    };
  }, [title]);
}
