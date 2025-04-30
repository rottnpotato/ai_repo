import TokensPageClient from "./tokens-client"

// Removed static params generation for dynamic rendering
// export function generateStaticParams() {...}

export default function TokensPage({ params }: { params: { userId: string } }) {
  return <TokensPageClient params={params} />
} 