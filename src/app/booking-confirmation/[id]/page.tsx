import { redirect } from 'next/navigation';
export default function Page({ params }: { params: { id: string } }) {
  redirect(`/en/booking-confirmation/${params.id}`);
}
