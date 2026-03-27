'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_AUTH_COOKIE, createAdminSessionToken, getAdminPassword } from '@/lib/admin-auth';

export async function loginAdmin(formData: FormData) {
  const providedPassword = String(formData.get('password') ?? '');
  const expectedPassword = getAdminPassword();

  if (!expectedPassword) {
    redirect('/admin/login?error=config');
  }

  if (providedPassword !== expectedPassword) {
    redirect('/admin/login?error=invalid');
  }

  const sessionToken = await createAdminSessionToken(expectedPassword);
  cookies().set(ADMIN_AUTH_COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  });

  redirect('/admin/orders');
}

export async function logoutAdmin() {
  cookies().delete(ADMIN_AUTH_COOKIE);
  redirect('/admin/login');
}

