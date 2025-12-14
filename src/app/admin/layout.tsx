// src/app/admin/layout.tsx
import React from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen">
        {/* You can add a specific Admin Navbar here if you want */}
        <div className="p-4">
          {children}
        </div>
      </body>
    </html>
  );
}