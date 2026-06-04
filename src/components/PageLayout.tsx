import Sidebar from "./Sidebar"
import styles from "./PageLayout.module.css"

interface PageLayoutProps {
  active?: "dashboard" | "reports" | "analyze"
  username?: string
  children: React.ReactNode
}

export default function PageLayout({ active, username, children }: PageLayoutProps) {
  return (
    <div className={styles.layout}>
      <Sidebar active={active} username={username} />
      <main className={styles.main}>
        {children}
      </main>
    </div>
  )
}
