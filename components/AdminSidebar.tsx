"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Building2, Home, Scan, Ticket, BarChart3, LogOut } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Close sidebar on mobile when navigation item clicked
  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  // Check token on mount
  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      router.replace("/admin/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  if (!isAuthenticated) {
    return null; // or a loading indicator if you want
  }

  return (
    <Sidebar className="border-r border-blue-600/20">
      <SidebarHeader className="h-[100px] border-b border-blue-600/20 bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900">
        <div className="flex items-center justify-center gap-2 px-6 py-5">
          <div className="bg-white p-1.5 rounded-full">
            <img alt="Logo" className="h-12 w-auto" src="/aftershift.png" />
          </div>
          <span className="text-xl font-bold tracking-wide text-white">
            Admin
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 text-white scrollbar-hide">
        <SidebarGroup>
          <SidebarGroupLabel className="text-blue-100">Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="text-blue-50 hover:bg-blue-600/30 data-[active=true]:bg-blue-600/50"
                  isActive={pathname === "/admin"}
                  tooltip="Dashboard"
                  onClick={handleNavClick}
                >
                  <Link href="/admin">
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-blue-100">
            Employee
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="text-blue-50 hover:bg-blue-600/30 data-[active=true]:bg-blue-600/50"
                  isActive={pathname === "/admin/employee"}
                  tooltip="Employee"
                  onClick={handleNavClick}
                >
                  <Link href="/admin/employee">
                    <Building2 className="h-4 w-4" />
                    <span>Employee</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-blue-100">
            Meal Coupons
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="text-blue-50 hover:bg-blue-600/30 data-[active=true]:bg-blue-600/50"
                  isActive={pathname === "/admin/coupons/scanner"}
                  tooltip="Scan Coupons"
                  onClick={handleNavClick}
                >
                  <Link href="/admin/coupons/scanner">
                    <Scan className="h-4 w-4" />
                    <span>Scan Coupons</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="text-blue-50 hover:bg-blue-600/30 data-[active=true]:bg-blue-600/50"
                  isActive={pathname === "/admin/coupons/generate"}
                  tooltip="Generate Coupons"
                  onClick={handleNavClick}
                >
                  <Link href="/admin/coupons/generate">
                    <Ticket className="h-4 w-4" />
                    <span>Generate Coupons</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="text-blue-50 hover:bg-blue-600/30 data-[active=true]:bg-blue-600/50"
                  isActive={pathname === "/admin/coupons/dashboard"}
                  tooltip="Coupon Dashboard"
                  onClick={handleNavClick}
                >
                  <Link href="/admin/coupons/dashboard">
                    <BarChart3 className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-blue-600/20 bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 p-4">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">
              Admin-Aftershift
            </span>
            <span className="text-xs text-blue-200">admin@aftershift.com</span>
          </div>
          <Button
            className="ml-auto text-blue-200 hover:bg-blue-600/30 hover:text-white"
            size="icon"
            variant="ghost"
            onClick={() => {
              localStorage.removeItem("adminToken"); // Clear token on logout
              router.push("/admin/login");
            }}
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Log out</span>
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
