import { redirect } from 'next/navigation';

// Middleware intercepts all requests to / and redirects to the role-appropriate
// home before this page ever renders. This redirect is a safety fallback only.
export default function RootPage() {
  redirect('/login');
}
