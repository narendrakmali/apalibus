
# Web Developer Documentation: Samagam Transport Seva

## 1. Project Overview

This document provides a technical overview of the Samagam Transport Seva application. The primary goal of this project is to streamline and manage transport logistics for the 59th Annual Samagam in Sangli. It provides a public-facing interface for attendees to request transport services and an admin-facing panel for coordinators to manage these requests.

### 1.1. Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Library**: [React](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Firestore, Firebase Authentication, Cloud Storage)
- **Internationalization (i18n)**: `next-intl`
- **Mapping & Geolocation**: Google Maps Platform (Places API)

---

## 2. Key Features

- **Private Bus Quote Request**: Users can fill out a detailed form to request a price quote for chartering a private bus.
- **MSRTC Group Booking**: Users can submit a formal request for booking MSRTC buses in groups, including bifurcation for concession eligibility.
- **Inform Transport Department**: Attendees who have already booked a vehicle can submit their travel and vehicle details to the transport committee for coordination.
- **Track Request Status**: Users can check the status of their submitted requests using their mobile number.
- **Admin Dashboard**: A secure area for administrators and bus operators to view, manage, approve, and reject user requests.
- **Multi-lingual Support**: The entire user interface is available in English, Marathi, and Hindi.

---

## 3. Architecture and Logic

The application follows a modern server-centric architecture leveraging the Next.js App Router and Firebase for backend services.

### 3.1. Frontend Architecture (Next.js App Router)

The application is structured around the Next.js App Router, located in `src/app`.

- **Internationalization (`[locale]` segment)**: The entire app is wrapped in a dynamic `[locale]` route (`/en`, `/mr`, `/hi`). The `src/middleware.ts` file, using `next-intl`, is responsible for routing and ensuring every path has a locale prefix.
- **Server Components by Default**: Most pages and components are React Server Components (RSCs), which improves performance by rendering on the server and sending minimal JavaScript to the client.
- **Client Components (`'use client'`)**: Components requiring interactivity, state, and lifecycle effects (e.g., forms, components using `useState` or `useEffect`) are explicitly marked with the `'use client'` directive at the top of the file. All form pages (`request-quote`, `msrtc-booking`, etc.) are client components.
- **Layouts (`layout.tsx`)**: The root layout in `src/app/[locale]/layout.tsx` establishes the main page structure, including the `Header` and `Footer`, and sets up the `NextIntlClientProvider` and `FirebaseClientProvider`.

### 3.2. User Request and Data Handling Flow

All user-facing forms follow a consistent pattern for capturing and submitting data to Firebase Firestore. Let's use the **Private Bus Request** (`/request-quote`) as an example:

1.  **User Interaction**: The user fills out the form on the `src/app/[locale]/request-quote/page.tsx` page. This is a Client Component to handle form state (`useState`).
2.  **Anonymous Authentication**: Since the application does not require users to sign up, we use Firebase Anonymous Authentication. When a user is about to submit a form, the code checks if `auth.currentUser` exists. If not, it calls `signInAnonymously(auth)` to get a temporary, anonymous user UID. This UID is crucial for associating data with a specific session and for security rules (e.g., allowing a user to upload files to a unique path in Cloud Storage).
3.  **Data Validation**: Basic client-side validation checks for the presence of required fields before submission is enabled.
4.  **Firestore Document Creation**: Upon submission (`handleCreateRequest` function):
    - A unique, human-readable ID is generated for the request (e.g., `RQ-XXXXXXXX`).
    - An object `requestData` is created, structuring all the form data (locations, dates, passenger counts, contact info).
    - A `serverTimestamp()` is included to ensure an accurate, server-verified creation time.
    - The status is set to `"pending"`.
5.  **Writing to Firestore**:
    - A document reference is created: `doc(firestore, "bookingRequests", requestId)`.
    - The `setDoc()` function is called to write the `requestData` object to the `bookingRequests` collection in Firestore.
6.  **Security Rules**: The operation is validated against `firestore.rules`. The rule for this path is `allow create: if true;`, which permits any user (including anonymous ones) to create a new document in the `bookingRequests` collection. This open-write policy is a deliberate design choice to minimize user friction. Reading the full list, however, is restricted to authenticated operators and admins.
7.  **User Feedback**: After a successful submission, a success dialog is shown, and the user is redirected to the `track-status` page.

This same pattern (Anonymous Auth -> Data Structuring -> `setDoc`) is used across all user submission forms, writing to their respective collections (`msrtcBookings`, `vehicleSubmissions`).

### 3.3. File Uploads (Inform Transport Page)

The "Inform Transport" page (`/inform-transport`) includes file uploads for tickets.

1.  **File Reading**: When a user selects a file or captures a photo, the file is read into memory as a `data_url` (Base64 string) using the `FileReader` API.
2.  **Cloud Storage Path**: A unique path is created in Firebase Cloud Storage, typically using the anonymous user's UID and a unique submission ID to prevent collisions: `ticketSubmissions/<USER_ID>/<SUBMISSION_ID>-<FILE_NAME>`.
3.  **Upload**: The `uploadString()` function from the Firebase Storage SDK is used to upload the `data_url`.
4.  **Get Download URL**: After the upload is successful, `getDownloadURL()` is called to get a publicly accessible URL for the uploaded file.
5.  **Store URL in Firestore**: This download URL (not the file itself) is stored in the corresponding Firestore document (`vehicleSubmissions`) as part of the submission record.

### 3.4. Admin Panel and Data Fetching

The admin panel resides in `/src/app/admin`.

- **Authentication**: Access is guarded by `react-firebase-hooks` (`useAuthState`) to check for an authenticated user. Pages will redirect to `/admin/login` if no user is logged in. Additional checks for admin/operator roles are performed for specific actions.
- **Data Fetching**: The `useAdminData` custom hook (`src/hooks/use-admin-data.ts`) is the central point for fetching all necessary data for the admin panel. It queries the `bookingRequests`, `users`, `busOperators`, and `msrtcBookings` collections from Firestore.
- **Data Management**: Admin components (`requests-table`, `operators-table`, etc.) use `updateDoc` and `deleteDoc` to modify Firestore data. These operations are again subject to `firestore.rules`, which grant these permissions only to users who are admins (`isAdmin()`) or operators (`isOperator()`).
