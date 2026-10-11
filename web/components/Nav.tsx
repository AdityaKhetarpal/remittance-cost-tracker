"use client"; // needs the current address to highlight the active link

import Link from "next/link";
import { usePathname } from "next/navigation";
import meta from "@/public/data/meta.json";

const LINKS = [
  { href: "/", label: "Overview" },
  { href: "/routes", label: "Routes" },
  { href: "/map", label: "Map", needsFullData: true },
  { href: "/india", label: "India" },
  { href: "/method", label: "Method" },
];

export default function Nav() {
  const path = usePathname(); // e.g. "/routes"
  return (
    <nav className="site-nav" aria-label="Main">
      {LINKS.filter((l) => !l.needsFullData || meta.complete).map((l) => (
        <Link key={l.href} href={l.href} aria-current={path === l.href ? "page" : undefined}>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
