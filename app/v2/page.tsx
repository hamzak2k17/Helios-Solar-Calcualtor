import type { Metadata } from "next";
import ClientEntry from "./ClientEntry";

export const metadata: Metadata = {
  title: "Helios — 3D Energy Visualization",
  description: "Immersive 3D solar energy experience powered by real calculation data.",
};

export default function V2Page() {
  return <ClientEntry />;
}
