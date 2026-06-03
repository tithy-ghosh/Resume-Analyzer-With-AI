import Link from "next/link"
import LogoutButton from "./LogoutButton"

interface SidebarProps {
  active?: "dashboard" | "reports" | "analyze"
  username?: string
}

export default function Sidebar({ active, username }: SidebarProps) {
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
    <aside className="w-[200px] bg-[#fafaf9] border-r border-[#e8e6e1] flex flex-col gap-1 flex-shrink-0"
    style={{ 
        "paddingInline":"1rem",
        "paddingBlock": "1.5rem",
      }}
    >

      {/* Brand */}
      <div className="flex items-center gap-2"
      style={{ 
        "paddingInline":"1rem",
        "marginBottom": "1rem",
      }}
      >
        <div className="w-2 h-2 rounded-full bg-[#1a1a1a]" />
        <span className="text-xs font-medium text-[#1a1a1a] tracking-[0.04em]">
          rezume.ai
        </span>
      </div>

      {/* Nav links */}
      {links.map((link) => (
        <Link
          key={link.key}
          href={link.href}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
            active === link.key
              ? "bg-[#1a1a1a] text-white"
              : "text-[#999] hover:bg-[#f0ede8] hover:text-[#1a1a1a]"
          }`}

          style={{ 
           "paddingInline":"0.75rem",
          "paddingBlock": "0.5rem",
        }}
        >
          {link.icon}
          {link.label}
        </Link>
      ))}

      {/* Footer */}
      {username && (
        <div className=" border-t border-[#e8e6e1] flex flex-col gap-1"
        style={{ 
        "paddingTop":"1rem",
        "marginTop": "auto",
        }}
        >
          <div className="flex items-center gap-2"
          style={{ 
           "paddingInline":"0.5rem",
           "paddingBlock": "0.5rem",
          }}
          >
            <div className="w-7 h-7 rounded-full bg-[#e8e6e1] flex items-center justify-center text-[10px] font-medium text-[#666]">
              {username[0]?.toUpperCase()}
            </div>
            <span className="text-xs text-[#999] truncate">{username}</span>
          </div>
          <LogoutButton />
        </div>
      )}
    </aside>
  )
}