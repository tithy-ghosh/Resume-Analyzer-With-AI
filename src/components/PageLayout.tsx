import Sidebar from "./Sidebar"

interface PageLayoutProps {
  active?: "dashboard" | "reports" | "analyze"
  username?: string
  children: React.ReactNode
}

export default function PageLayout({ active, username, children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f5f3ef] flex font-[Geist]">
      <Sidebar active={active} username={username} />
      <main className="flex-1  overflow-auto"
      style={{
        "paddingInline": "2rem",
        "paddingBlock": "1.75rem"
      }}
      >
        {children}
      </main>
    </div>
  )
}