// Removed static exports configuration
// export const dynamic = 'force-static';
// export function generateStaticParams() {
//   return [];
// }

// Handle auth error API endpoint
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const error = searchParams.get('error');
  
  return new Response(
    JSON.stringify({
      error: error || 'Unknown error',
      description: getErrorDescription(error || ''),
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

// Helper function to get error descriptions
function getErrorDescription(error: string): string {
  const errorMap: Record<string, string> = {
    'Configuration': 'There is a problem with the server configuration.',
    'AccessDenied': 'You do not have access to this resource.',
    'Verification': 'The verification token has expired or has already been used.',
    'Default': 'An unexpected error occurred.',
  };
  
  return errorMap[error] || errorMap['Default'];
} 