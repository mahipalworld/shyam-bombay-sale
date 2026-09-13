export const dynamic = 'force-static';

export async function GET() {
  return Response.json({
    status: 'ok',
    service: 'SBS Store Frontend',
    timestamp: new Date().toISOString()
  });
}
