import { redirect } from "next/navigation"
import { auth } from "../../auth"
import HomePageView from "@/components/home/HomePageView"

export default async function LandingPage() {
  const session = await auth()
  if (session) redirect("/dashboard")

  return <HomePageView />
}
