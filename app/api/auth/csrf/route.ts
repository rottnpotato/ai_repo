// Removed static exports configuration
// export const dynamic = 'force-static';
// export function generateStaticParams() {
//   return [];
// }

// Handle CSRF token API endpoint
export async function GET() {
  // Generate a random CSRF token
  const csrfToken = Math.random().toString(36).substring(2);
  
  return new Response(
    JSON.stringify({ csrfToken }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
} 