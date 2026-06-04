"use client"

import { useState } from "react"
import Link from "next/link"
import LogoutButton from "./LogoutButton"
import styles from "./Sidebar.module.css"

interface SidebarProps {
  active?: "dashboard" | "reports" | "analyze"
  username?: string
}

export default function Sidebar({ active, username }: SidebarProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    {
      key: "dashboard",
      href: "/dashboard",
      label: "Dashboard",
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="2" width="5" height="5" rx="1"/>
          <rect x="9" y="2" width="5" height="5" rx="1"/>
          <rect x="2" y="9" width="5" height="5" rx="1"/>
          <rect x="9" y="9" width="5" height="5" rx="1"/>
        </svg>
      ),
    },
    {
      key: "reports",
      href: "/reports",
      label: "My Reports",
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 4h10M3 8h7M3 12h5"/>
        </svg>
      ),
    },
    {
      key: "analyze",
      href: "/analyze",
      label: "New Analysis",
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 3v10M3 8h10" strokeLinecap="round"/>
        </svg>
      ),
    },
  ]

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.brandDot} />
        <span className={styles.brandText}>
          rezume.ai
        </span>
      </div>

      <button
        type="button"
        className={styles.menuButton}
        aria-expanded={menuOpen}
        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
      </button>

      <nav className={`${styles.nav} ${menuOpen ? styles.openNav : ""}`}>
        {links.map((link) => (
          <Link
            key={link.key}
            href={link.href}
            onClick={() => setMenuOpen(false)}
            className={`${styles.navLink} ${active === link.key ? styles.activeLink : ""}`}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
      </nav>

      {username && (
        <div className={styles.footer}>
          <div className={styles.user}>
            <div className={styles.avatar}>
              {username[0]?.toUpperCase()}
            </div>
            <span className={styles.username}>{username}</span>
          </div>
          <LogoutButton />
        </div>
      )}
    </aside>
  )
}
