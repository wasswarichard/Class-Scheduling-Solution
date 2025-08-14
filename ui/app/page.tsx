// import Link from "next/link"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Calendar, Zap, CheckCircle, ArrowRight, Play, Settings } from "lucide-react"

// export default function HomePage() {
//   return (
//     <div className="container mx-auto px-4 py-8">
//       {/* Hero Section */}
//       <div className="text-center space-y-6 mb-12">
//         <div className="flex justify-center mb-6">
//           <div className="p-4 bg-primary/10 rounded-full">
//             <Calendar className="h-12 w-12 text-primary" />
//           </div>
//         </div>

//         <h1 className="text-4xl md:text-6xl font-bold text-foreground">Schedule Generator</h1>

//         <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
//           Generate and validate lecture schedules using a GA + Prolog backend. Optimize room assignments, time slots,
//           and course scheduling with AI-powered algorithms.
//         </p>

       

      
//       </div>

    
//     </div>
//   )
// }


// "use client"
import Link from "next/link"
import React from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter();
  React.useEffect(() => {
    router.push("/builder");
  }, [router]);
  return null;
}
