import { NextRequest, NextResponse } from 'next/server';
import { clearAdminPanelCookie, isAdminPanelHost } from '@/lib/admin-panel-auth';

export async function POST(request: NextRequest) {
  if (!isAdminPanelHost(request.headers.get('host'))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const response = NextResponse.redirect(new URL('/admin/login', request.url), { status: 303 });
  clearAdminPanelCookie(response);
  return response;
}
