import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administration | Samba Fitness Ndioum",
  robots: { index: false, follow: false },
};

export const instant = false;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
