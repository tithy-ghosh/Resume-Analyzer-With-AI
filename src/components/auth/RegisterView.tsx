import Link from "next/link"
import styles from "./AuthView.module.css"

type RegisterViewProps = {
  username: string
  email: string
  password: string
  error: string
  loading: boolean
  onUsernameChange: (value: string) => void
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

export default function RegisterView({
  username,
  email,
  password,
  error,
  loading,
  onUsernameChange,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: RegisterViewProps) {
  return (
    <main className={styles.shell}>
      <div className={styles.card}>
        <span className={styles.cornerTop} />
        <span className={styles.cornerBottom} />

        <div className={styles.brand}>
          <div className={styles.brandDot} />
          <span>rezume.ai</span>
        </div>

        <div className={styles.progressDots}>
          <div className={styles.progressDotActive} />
          <div className={styles.progressDot} />
          <div className={styles.progressDot} />
        </div>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} />
        </div>

        <span className={styles.tag}>create account</span>
        <h1 className={styles.heading}>
          Let us get<br />
          you <em>started.</em>
        </h1>
        <p className={styles.intro}>Takes less than a minute</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={onSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="@yourname"
              value={username}
              onChange={(event) => onUsernameChange(event.target.value)}
              required
            />
          </div>

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
              placeholder="Min. 6 characters"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading} className={styles.submit}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className={styles.footerText}>
          Have an account?{" "}
          <Link href="/login">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
