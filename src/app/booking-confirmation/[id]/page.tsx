
import BookingConfirmation from "@/components/booking/confirmation";

export default function BookingConfirmationPage({ params }: { params: { id: string } }) {
  return <BookingConfirmation bookingId={params.id} />;
}
