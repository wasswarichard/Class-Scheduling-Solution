"use client"

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
