// Removed static exports configuration
// export const dynamic = 'force-static';
// export function generateStaticParams() {
//   return [];
// }

// Handle credentials callback
export async function GET() {
  // Redirect to the login page with error
  return new Response(null, {
    status: 302,
    headers: {
      'Location': '/login?error=Callback',
    },
  });
}

export async function POST() {
  // Process credentials callback
  return new Response(
    JSON.stringify({ 
      error: 'Direct API authentication required',
    }),
    {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
} 