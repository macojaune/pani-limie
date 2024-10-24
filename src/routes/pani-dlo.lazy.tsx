import { createLazyFileRoute } from "@tanstack/react-router";
import { HomePage } from "./index.lazy";

export const Route = createLazyFileRoute("/pani-dlo")({
  component: () => HomePage({ isWater: true }),
});
