import { redirect } from 'next/navigation';
export default function Page({ params }: { params: { id: string, locale: string } }) {
  redirect(`/${params.locale}/admin/requests/${params.id}`);
}
