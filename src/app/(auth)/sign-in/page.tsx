import { redirect } from 'next/navigation';
import { getOptionalSession } from '@/lib/auth/session';
import { isSafeRedirect, getDefaultLandingPath } from '@/lib/auth/redirect';
import { SignInForm } from './sign-in-form';

interface SignInPageProps {
  searchParams: Promise<{ redirectTo?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await getOptionalSession();
  const { redirectTo } = await searchParams;
  if (session) {
    redirect(isSafeRedirect(redirectTo) ? redirectTo : getDefaultLandingPath(session.user.role));
  }
  return <SignInForm redirectTo={redirectTo} />;
}