"use client";

import type React from "react";
import { usePathname } from "next/navigation";

import { Toaster } from "react-hot-toast";
import { AdminSidebar } from "@/components/AdminSidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Exclude sidebar on login page (adjust the path if different)
  const isLoginPage = pathname === "/admin/login";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full overflow-hidden">
        {/* Sidebar is shown only if NOT on login page */}
        {!isLoginPage && <AdminSidebar />}

        {/* Main Content */}
        <SidebarInset className="flex-1 flex flex-col overflow-auto">
          {/* Header with Sidebar Trigger (hide if login page to avoid blank space) */}
          {!isLoginPage && (
            <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 z-10">
              <SidebarTrigger className="md:flex" />
              <h1 className="text-xl font-semibold">Admin Dashboard</h1>
            </header>
          )}

          {/* Main Content */}
          <main>{children}</main>
        </SidebarInset>
      </div>

      <Toaster position="top-right" />
    </SidebarProvider>
  );
}
