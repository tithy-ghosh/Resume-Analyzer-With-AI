"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { useHomePage } from "@/hooks/useHomePage"
import type { HomeFeatureIcon } from "@/services/homePageService"
import styles from "./HomePageView.module.css"

const featureIcons: Record<HomeFeatureIcon, ReactNode> = {
  score: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#888" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 5v3l2 2" strokeLinecap="round" />
    </svg>
  ),
  questions: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#888" strokeWidth="1.5">
      <path d="M3 4h10M3 8h7M3 12h5" strokeLinecap="round" />
    </svg>
  ),
  resume: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#888" strokeWidth="1.5">
      <path d="M4 2h6l4 4v8a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" strokeLinecap="round" />
      <path d="M10 2v4h4M5 9h6M5 12h4" strokeLinecap="round" />
    </svg>
  ),
}

function Brand({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className={styles.brand}>
      <span />
      {label}
    </Link>
  )
}

function FeatureCard({ icon, title, description }: { icon: HomeFeatureIcon; title: string; description: string }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardIcon}>{featureIcons[icon]}</div>
      <div className={styles.cardTitle}>{title}</div>
      <div className={styles.cardCopy}>{description}</div>
    </div>
  )
}

export default function HomePageView() {
  const { content, routes } = useHomePage()

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Brand href={routes.home} label={content.brand} />
        <div className={styles.navActions}>
          <Link href={routes.login} className={styles.link}>
            Sign in
          </Link>
          <Link href={routes.register} className={`${styles.primary} ${styles.navPrimary}`}>
            Get started
          </Link>
        </div>
      </nav>

      <main>
        <section className={styles.hero}>
          <div className={styles.eyebrow}>{content.hero.eyebrow}</div>
          <h1 className={styles.title}>
            {content.hero.title}<br />
            <em>{content.hero.emphasis}</em>
          </h1>
          <p className={styles.subtitle}>{content.hero.description}</p>
          <div className={styles.heroActions}>
            <Link href={routes.register} className={styles.primary}>
              Analyze my resume
            </Link>
            <Link href={routes.howItWorks} className={styles.secondary}>
              See how it works
            </Link>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.featureGrid}>
            {content.features.map((feature) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </section>

        <section id="how-it-works" className={styles.section}>
          <h2 className={styles.sectionTitle}>
            How it <em>works.</em>
          </h2>
          <div className={styles.stepsGrid}>
            {content.steps.map((step) => (
              <div key={step.number} className={styles.stepCard}>
                <div className={styles.stepNumber}>{step.number}</div>
                <div className={styles.stepTitle}>{step.title}</div>
                <div className={styles.stepCopy}>{step.description}</div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.cta}>
            <div>
              <h2>
                {content.cta.title}<br />
                <em>{content.cta.emphasis}</em>
              </h2>
              <p>{content.cta.description}</p>
            </div>
            <Link href={routes.register} className={styles.ctaButton}>
              Get started free
            </Link>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <Brand href={routes.home} label={content.brand} />
        <p>{content.footer}</p>
      </footer>
    </div>
  )
}
