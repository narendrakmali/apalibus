
import { redirect } from 'next/navigation';

// This page only redirects to the default locale's homepage.
export default function RootPage() {
  redirect('/en');
}
