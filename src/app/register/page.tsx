"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.message); setLoading(false); return }

    const result = await signIn("credentials", { email, password, redirect: false })
    if (result?.error) { router.push("/login"); return }
    router.push("/dashboard")
  }

  const fields = [
    { label: "Username", type: "text",     value: username,  set: setUsername,  ph: "@yourname"         },
    { label: "Email",    type: "email",    value: email,     set: setEmail,     ph: "you@example.com"   },
    { label: "Password", type: "password", value: password,  set: setPassword,  ph: "Min. 6 characters" },
  ]

  return (
    <main className="min-h-screen  flex items-center justify-center font-[Geist]"
    style={{"padding": "20px"}}
    >
      <div className="w-full max-w-[500px] bg-[#fafaf9] border border-[#e8e6e1] rounded-2xl relative"
      style={{
        "paddingInline": "40px",
        "paddingBlock" : "44px"
      }}
      >

        {/* Corner marks */}
        <span className="absolute top-[18px] right-[18px] w-6 h-6 border-t-[1.5px] border-r-[1.5px] border-[#d4d0c8] rounded-tr-md" />
        <span className="absolute bottom-[18px] left-[18px] w-6 h-6 border-b-[1.5px] border-l-[1.5px] border-[#d4d0c8] rounded-bl-md" />

        {/* Brand */}
        <div className="flex items-center gap-2"
        style={{"marginBottom": "25px"}}
        >
          <div className="w-2 h-2 rounded-full bg-[#1a1a1a]" />
          <span className="text-xs font-medium text-[#1a1a1a] tracking-[0.04em]">rezume.ai</span>
        </div>

        {/* Step dots + progress */}
        <div className="flex gap-[5px]"
        style={{"marginBottom": "15px"}}
        >
          {[true, false, false].map((on, i) => (
            <div key={i} className={`h-[6px] rounded-full transition-all ${on ? "w-[18px] bg-[#1a1a1a]" : "w-[6px] bg-[#e4e1db]"}`} />
          ))}
        </div>
        <div className="h-[2px] bg-[#e8e6e1] rounded-full mb-7 overflow-hidden"
        style={{"marginBottom": "15px"}}
        >
          <div className="h-full w-[33%] bg-[#1a1a1a] rounded-full" />
        </div>

        {/* Tag */}
        <span className="inline-block text-[10px] text-[#888] bg-[#f0ede8] rounded  tracking-[0.05em] mb-3"
        style={{
            "paddingInline": "8px",
            "paddingBlock" : "6px",
            "marginBottom" : "10px"
         }}
        >
          create account
        </span>

        {/* Heading */}
        <h1 className="font-[Instrument_Serif] text-[36px] leading-[1.05] text-[#1a1a1a] "
        style={{"marginBottom": "4px"}}
        >
          Let's get<br />
          you <em className="italic text-[#999]">started.</em>
        </h1>
        <p className="text-[13px] text-[#999] font-light  tracking-[0.01em]"
        style={{"marginBottom" : "20px"}}
        >
          Takes less than a minute
        </p>

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm text-center"
          style={{
            "marginBottom": "16px",
            "paddingInline": "16px",
            "paddingBlock": "8px"
          }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {fields.map(({ label, type, value, set, ph }) => (
            <div key={label} className="flex flex-col gap-[5px]">
              <label className="text-[11px] text-[#aaa] uppercase tracking-[0.07em]">{label}</label>
              <input
                type={type}
                placeholder={ph}
                value={value}
                onChange={e => set(e.target.value)}
                required
                className="w-full bg-white border border-[#e4e1db] rounded-[10px]  text-sm text-[#1a1a1a] placeholder:text-[#c4c0b8] outline-none focus:border-[#1a1a1a] transition-colors"
                style={{
                "paddingInline": "14px",
                "paddingBlock": "8px"
              }}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-1/2  bg-[#1a1a1a] text-white rounded-[10px]  text-sm font-medium flex items-center justify-center hover:opacity-90 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            style={{
                "paddingInline": "14px",
                "paddingBlock": "8px",
                "marginTop": "4px",
                "marginInline": "auto"
              }}
          >
            <span>{loading ? "Creating account..." : "Create account"}</span>
            
          </button>
        </form>

        <p className="text-center text-xs text-[#bbb]"
        style={{"marginTop": "15px"}}
        >
          Have an account?{" "}
          <Link href="/login" className="text-[#1a1a1a] font-medium hover:underline">
            Sign in 
          </Link>
        </p>
      </div>
    </main>
  )
}