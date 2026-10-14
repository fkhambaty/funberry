import type { Metadata } from "next";
import { EmbedGame } from "./EmbedGame";

export const metadata: Metadata = {
  title: "FunBerry Kids game",
  robots: { index: false, follow: false },
};

/** Runs one game inside the FunBerry Kids app's WebView. It never sees the parent's session. */
export default async function EmbedGamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EmbedGame gameId={id} />;
}
