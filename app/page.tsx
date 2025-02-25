import { Button } from "@/components/ui/button"
import { Utensils } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center">
      <Utensils className="h-16 w-16 mb-6" />
      <h1 className="text-4xl font-bold tracking-tighter mb-4">My Foody Manager</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-[600px]">
        Keep track of your favorite restaurants and food spots. Add notes, ratings, and organize them your way.
      </p>
      <div className="flex gap-4">
        <Button asChild size="lg">
          <Link href="/list">Get Started</Link>
        </Button>
      </div>
    </div>
  )
}

