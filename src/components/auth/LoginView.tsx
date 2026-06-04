import Link from "next/link"
import styles from "./AuthView.module.css"

type LoginViewProps = {
  email: string
  password: string
  error: string
  loading: boolean
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

export default function LoginView({
  email,
  password,
  error,
  loading,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: LoginViewProps) {
  return (
    <main className={styles.shell}>
      <div className={styles.card}>
        <span className={styles.cornerTop} />
        <span className={styles.cornerBottom} />

        <div className={styles.brand}>
          <div className={styles.brandDot} />
          <span>rezume.ai</span>
        </div>

        <div className={styles.stepNumbers}>
          <span>01</span>
          <div className={styles.stepLine} />
          <span>02</span>
          <div className={styles.stepLine} />
          <span>03</span>
        </div>

        <span className={styles.tag}>sign in</span>
        <h1 className={styles.heading}>
          Good to<br />
          see you <em>again.</em>
        </h1>
        <p className={styles.intro}>Continue where you left off</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={onSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading} className={styles.submit}>
            {loading ? "Signing in..." : "Continue"}
          </button>
        </form>

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <p className={styles.footerText}>
          Do not have an account?{" "}
          <Link href="/register">
            Create one
          </Link>
        </p>
      </div>
    </main>
  )
}
