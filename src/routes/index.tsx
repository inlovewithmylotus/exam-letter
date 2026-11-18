import { createFileRoute } from "@tanstack/react-router";
import { LoveLetter } from "@/components/love-letter";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <LoveLetter />;
}
