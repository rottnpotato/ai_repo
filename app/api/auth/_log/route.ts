// Removed static exports configuration
// export const dynamic = 'force-static';
// export function generateStaticParams() {
//   return [];
// }

// NextAuth logging endpoint
export async function POST() {
  // Implement logging functionality as needed
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// Also handle GET requests
export async function GET() {
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
} 