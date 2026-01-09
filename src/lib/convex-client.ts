import { ConvexReactClient } from 'convex/react'

// Get Convex URL from environment variable
const convexUrl = import.meta.env.VITE_CONVEX_URL

if (!convexUrl) {
  throw new Error(
    'Missing VITE_CONVEX_URL environment variable. Please set it in your .env file.',
  )
}

export const convex = new ConvexReactClient(convexUrl)
