// Removed static exports configuration
// export const dynamic = 'force-static';
// export function generateStaticParams() {
//   return [];
// }

// Return list of available providers
export async function GET() {
  return new Response(
    JSON.stringify({
      google: {
        id: "google",
        name: "Google",
        type: "oauth",
        signinUrl: "/api/auth/signin/google",
        callbackUrl: "/api/auth/callback/google"
      },
      credentials: {
        id: "credentials",
        name: "Credentials",
        type: "credentials",
        signinUrl: "/api/auth/signin/credentials",
        callbackUrl: "/api/auth/callback/credentials"
      }
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
} 