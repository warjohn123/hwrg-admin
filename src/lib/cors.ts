import { NextResponse } from 'next/server';

export function handleCors(request: Request): NextResponse | null {
  const origin = request.headers.get('origin');

  // Allow from localhost:5173 in dev, adjust for prod
  const allowedOrigin =
    (origin && origin.includes('localhost:5173')) ||
    (origin && origin.includes('hwrg-sales-report.vercel.app/')) ||
    (origin && origin.includes('hwrg-employee.vercel.app/')) ||
    (origin && origin.includes('localhost:8081'))
      ? origin
      : null;

  const headers = {
    'Access-Control-Allow-Origin': allowedOrigin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers });
  }

  // ❗️ Not null — return headers so they can be merged in GET/POST responses too
  return new NextResponse(null, { headers });
}
