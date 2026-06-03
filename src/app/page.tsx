import Link from "next/link"
import { auth } from "../../auth"
import { redirect } from "next/navigation"

export default async function LandingPage() {
  const session = await auth()
  if (session) redirect("/dashboard") // already logged in → skip landing

  return (
    <div className="min-h-screen bg-[#f5f3ef] font-[Geist]">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-10 py-5 bg-[#fafaf9] border-b border-[#e8e6e1]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#1a1a1a]" />
          <span className="text-xs font-medium text-[#1a1a1a] tracking-[0.04em]">rezume.ai</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="text-[11px] text-[#999] px-3 py-2 hover:text-[#1a1a1a] transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="text-[11px] text-white bg-[#1a1a1a] px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            Get started →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-20 pb-16 max-w-3xl mx-auto">

        <div className="inline-block text-[10px] text-[#888] bg-[#f0ede8] rounded px-3 py-[3px] tracking-[0.06em] mb-6">
          AI-POWERED INTERVIEW PREP
        </div>

        <h1 className="font-[Instrument_Serif] text-[56px] leading-[1.0] text-[#1a1a1a] mb-5">
          Land your dream<br />
          <em className="italic text-[#999]">job faster.</em>
        </h1>

        <p className="text-[15px] text-[#888] font-light leading-relaxed mb-8 max-w-lg">
          Upload your resume, paste a job description. Get a match score,
          interview questions, skill gaps, and an ATS-optimized resume — in seconds.
        </p>

        <div className="flex items-center gap-3">
          <Link
            href="/register"
            className="flex items-center gap-2 bg-[#1a1a1a] text-white text-sm font-medium px-6 py-3 rounded-xl hover:opacity-90 active:scale-[0.99] transition-all"
          >
            Analyze my resume
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
              <path d="M2 6h8M7 3l3 3-3 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm text-[#999] border border-[#e4e1db] px-6 py-3 rounded-xl hover:border-[#1a1a1a] hover:text-[#1a1a1a] transition-colors"
          >
            See how it works
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-10 pb-16">
        <div className="grid grid-cols-3 gap-3 max-w-4xl mx-auto">
          <FeatureCard
            icon={<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#888" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2" strokeLinecap="round"/></svg>}
            title="Match score"
            desc="See exactly how well your profile matches the job — scored by AI against the job description."
          />
          <FeatureCard
            icon={<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#888" strokeWidth="1.5"><path d="M3 4h10M3 8h7M3 12h5" strokeLinecap="round"/></svg>}
            title="Interview questions"
            desc="Get real technical and behavioral questions tailored to the exact role, with how to answer them."
          />
          <FeatureCard
            icon={<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#888" strokeWidth="1.5"><path d="M4 2h6l4 4v8a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" strokeLinecap="round"/><path d="M10 2v4h4"/><path d="M5 9h6M5 12h4" strokeLinecap="round"/></svg>}
            title="ATS resume"
            desc="AI rewrites your resume with the right keywords to pass ATS filters. Download as PDF instantly."
          />
          <FeatureCard
            icon={<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#888" strokeWidth="1.5"><path d="M8 3v10M3 8h10" strokeLinecap="round"/></svg>}
            title="Skill gap analysis"
            desc="Know exactly which skills to build before the interview — ranked by severity and importance."
          />
          <FeatureCard
            icon={<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#888" strokeWidth="1.5"><rect x="2" y="3" width="12" height="10" rx="2"/><path d="M2 7h12" strokeLinecap="round"/></svg>}
            title="7-day prep plan"
            desc="A day-by-day preparation roadmap with specific tasks to get interview-ready fast."
          />
          <FeatureCard
            icon={<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#888" strokeWidth="1.5"><path d="M3 4h10M3 8h7M3 12h9" strokeLinecap="round"/></svg>}
            title="All your reports"
            desc="Every analysis saved to your account. Track your progress across multiple job applications."
          />
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-10 pb-16 max-w-4xl mx-auto">
        <h2 className="font-[Instrument_Serif] text-[28px] text-[#1a1a1a] text-center mb-8">
          How it <em className="italic text-[#999]">works.</em>
        </h2>
        <div className="grid grid-cols-4 gap-3">
          {[
            { n: "01", t: "Upload resume", s: "Drop your PDF resume" },
            { n: "02", t: "Paste job description", s: "Any job from any site" },
            { n: "03", t: "Get your report", s: "Score, questions, gaps" },
            { n: "04", t: "Download ATS resume", s: "Optimized PDF ready" },
          ].map((step) => (
            <div key={step.n} className="bg-[#fafaf9] border border-[#e8e6e1] rounded-xl p-5">
              <div className="text-[10px] text-[#bbb] tracking-[0.06em] mb-3">{step.n}</div>
              <div className="text-sm font-medium text-[#1a1a1a] mb-1">{step.t}</div>
              <div className="text-[11px] text-[#aaa]">{step.s}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-10 pb-16 max-w-4xl mx-auto">
        <div className="bg-[#1a1a1a] rounded-2xl px-10 py-10 flex items-center justify-between">
          <div>
            <h2 className="font-[Instrument_Serif] text-[28px] text-white leading-tight">
              Ready to ace your<br />
              <em className="italic text-[#888]">next interview?</em>
            </h2>
            <p className="text-[12px] text-[#666] mt-2">Free to use · No credit card required</p>
          </div>
          <Link
            href="/register"
            className="flex items-center gap-2 bg-white text-[#1a1a1a] text-sm font-medium px-6 py-3 rounded-xl hover:opacity-90 transition-opacity flex-shrink-0"
          >
            Get started free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e8e6e1] px-10 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#1a1a1a]" />
          <span className="text-xs font-medium text-[#1a1a1a] tracking-[0.04em]">rezume.ai</span>
        </div>
        <p className="text-[11px] text-[#ccc]">Built with Next.js & Gemini AI · © 2025</p>
      </footer>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500&display=swap');`}</style>
    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-[#fafaf9] border border-[#e8e6e1] rounded-xl p-5">
      <div className="w-8 h-8 rounded-lg bg-[#f0ede8] flex items-center justify-center mb-3">
        {icon}
      </div>
      <div className="text-sm font-medium text-[#1a1a1a] mb-1">{title}</div>
      <div className="text-[11px] text-[#aaa] leading-relaxed">{desc}</div>
    </div>
  )
}