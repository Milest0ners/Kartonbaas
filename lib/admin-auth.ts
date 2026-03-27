export const ADMIN_AUTH_COOKIE = 'kartonbaas_admin_auth';

export function getAdminPassword(): string {
  return process.env.ADMIN_DASHBOARD_PASSWORD ?? process.env.ADMIN_DASHBOARD_TOKEN ?? '';
}

