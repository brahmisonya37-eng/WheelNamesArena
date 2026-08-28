import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import WheelTool from "../components/wheel/WheelTool";
import { decodeWheel } from "../lib/share";
import { usePageMeta } from "../lib/usePageMeta";

export default function WheelPage() {
  const [params] = useSearchParams();
  const shared = useMemo(() => {
    const w = params.get("w");
    return w ? decodeWheel(w) : null;
  }, [params]);

  usePageMeta({
    title: "Wheel Spinner — Free Random Wheel Online | WheelNamesArena",
    description:
      "Create a free spinning wheel with your own names and choices. Spin to pick a random winner, with sound, confetti, full-screen mode and shareable links. No sign-up.",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "WheelNamesArena Wheel Spinner",
      applicationCategory: "UtilityApplication",
      operatingSystem: "Web",
      description: "A free random wheel spinner for decisions, classrooms, giveaways and games.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
  });

  // Clean the share param from the URL once consumed
  useEffect(() => {
    if (shared) {
      window.history.replaceState(null, "", "/wheel-spinner");
    }
  }, [shared]);

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <header className="text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Wheel Spinner</h1>
          <p className="mx-auto mt-2 max-w-2xl text-ink-500">
            Add your entries, spin the wheel, celebrate the winner. {shared ? "You're viewing a shared wheel — make it yours." : "Free, fast, no sign-up."}
          </p>
        </header>
      </div>
      <WheelTool key={shared ? "shared" : "own"} initialEntries={shared} initialName={shared ? "Shared wheel" : undefined} />
    </>
  );
}
