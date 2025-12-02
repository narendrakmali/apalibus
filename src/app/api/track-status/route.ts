
import { NextResponse } from 'next/server';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let adminApp: App;
// Initialize Firebase Admin SDK
// The SDK will automatically find credentials in a secure environment.
if (!getApps().length) {
    adminApp = initializeApp();
} else {
    adminApp = getApps()[0];
}

const db = getFirestore(adminApp);

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const mobile = searchParams.get('mobile');

    if (!mobile) {
        return NextResponse.json({ error: 'Mobile number is required' }, { status: 400 });
    }

    try {
        // --- Fetch Users ---
        const usersQuery = db.collection('users').where('mobileNumber', '==', mobile);
        const usersSnapshot = await usersQuery.get();
        const foundUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // --- Fetch Private Booking Requests ---
        const privateRequestsQuery = db.collection('bookingRequests').where('contact.mobile', '==', mobile);
        const privateRequestsSnapshot = await privateRequestsQuery.get();
        const foundPrivateRequests = privateRequestsSnapshot.docs.map(doc => ({ ...doc.data(), type: 'Private', id: doc.id }));

        // --- Fetch MSRTC Booking Requests ---
        const msrtcRequestsQuery = db.collection('msrtcBookings').where('contactNumber', '==', mobile);
        const msrtcRequestsSnapshot = await msrtcRequestsQuery.get();
        const foundMsrtcRequests = msrtcRequestsSnapshot.docs.map(doc => ({ ...doc.data(), type: 'MSRTC', id: doc.id }));

        const allRequests = [...foundPrivateRequests, ...foundMsrtcRequests];
        // Sort all requests by creation date, descending
        allRequests.sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
            return dateB.getTime() - dateA.getTime();
        });

        return NextResponse.json({
            foundUsers,
            foundRequests: allRequests
        });

    } catch (error: any) {
        console.error('Error in /api/track-status:', error);
        return NextResponse.json({ error: 'An internal server error occurred.', details: error.message }, { status: 500 });
    }
}
