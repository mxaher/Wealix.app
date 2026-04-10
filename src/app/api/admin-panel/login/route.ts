import { NextRequest, NextResponse } from 'next/server';
import {
  buildAdminPanelCookie,
  createAdminPanelSessionToken,
  isAdminPanelHost,
  validateAdminPanelPassword,
} from '@/lib/admin-panel-auth';

export async function POST(request: NextRequest) {
  if (!isAdminPanelHost(request.headers.get('host'))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const formData = await request.formData();
  const password = String(formData.get('password') ?? '');

  if (!validateAdminPanelPassword(password)) {
    return NextResponse.redirect(new URL('/admin/login?error=invalid_password', request.url), { status: 303 });
  }

  const response = NextResponse.redirect(new URL('/admin/agents', request.url), { status: 303 });
  response.cookies.set(buildAdminPanelCookie(createAdminPanelSessionToken()));
  return response;
}
