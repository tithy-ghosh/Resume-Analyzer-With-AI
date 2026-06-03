export default function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-medium text-[#aaa] uppercase tracking-[0.06em]"
    style={{"marginBottom": "1.5rem"}}
    >
      {children}
    </div>
  )
}