"use client";

import Link from "next/link";
import { useState } from "react";
import { logout } from "@/app/actions";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/products", label: "Products" },
  { href: "/settings", label: "Settings" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="text-xl font-bold tracking-tight text-indigo-700"
          onClick={() => setMenuOpen(false)}
        >
          StockFlow
        </Link>
        <button
          type="button"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 sm:hidden"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "Close menu" : "Menu"}
        </button>
        <nav
          id="primary-navigation"
          className={`${menuOpen ? "flex" : "hidden"} w-full flex-col gap-3 sm:flex sm:w-auto sm:flex-row sm:items-center`}
          aria-label="Primary navigation"
        >
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-indigo-700"
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <form action={logout}>
            <button
              type="submit"
              className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-rose-700 sm:w-auto"
            >
              Log out
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
