import { redirect } from 'next/navigation';
import { getOptionalSession } from '@/lib/auth/session';
import { isSafeRedirect, getDefaultLandingPath } from '@/lib/auth/redirect';
import { SignUpForm } from './sign-up-form';

interface SignUpPageProps {
  searchParams: Promise<{ redirectTo?: string }>;
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const session = await getOptionalSession();
  const { redirectTo } = await searchParams;
  if (session) {
    redirect(isSafeRedirect(redirectTo) ? redirectTo : getDefaultLandingPath(session.user.role));
  }
  return <SignUpForm redirectTo={redirectTo} />;
}