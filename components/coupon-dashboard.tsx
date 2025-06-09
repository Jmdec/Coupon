"use client";

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Calendar as CalendarIcon,
  CheckCircle,
  XCircle,
  Clock,
  User,
  CalendarX,
  CheckCheck,
} from "lucide-react";
import {
  Calendar,
  momentLocalizer,
  Event as CalendarEvent,
} from "react-big-calendar";
import moment from "moment";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/cards";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import "react-big-calendar/lib/css/react-big-calendar.css";

import type { Employee, Coupon } from "../types/coupon";

const localizer = momentLocalizer(moment);

const CouponDashboard: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    claimed: 0,
    expired: 0,
    available: 0,
  });
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null); // State for selected coupon
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

  useEffect(() => {
    fetchEmployees();
    const now = new Date();

    setSelectedMonth((now.getMonth() + 1).toString());
    setSelectedYear(now.getFullYear().toString());
  }, []);

  useEffect(() => {
    if (selectedEmployee && selectedMonth && selectedYear) {
      fetchCoupons();
    }
  }, [selectedEmployee, selectedMonth, selectedYear]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/employees`,
      );

      setEmployees(response.data);
    } catch (error) {
      toast.error("Failed to fetch employees");
      console.error(error);
    }
  };

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/coupons`,
        {
          params: {
            employee_id: selectedEmployee,
            month: selectedMonth,
            year: selectedYear,
          },
        },
      );

      setCoupons(response.data.coupons);
      setStats(response.data.stats);
    } catch (error) {
      toast.error("Failed to fetch coupons");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCouponStatus = (coupon: Coupon) => {
    const today = new Date().toISOString().split("T")[0];

    if (coupon.is_claimed) {
      return {
        status: "claimed",
        label: "Claimed",
        color: "bg-green-100 text-green-800",
      };
    } else if (coupon.coupon_date < today) {
      return {
        status: "expired",
        label: "Expired",
        color: "bg-red-100 text-red-800",
      };
    } else {
      return {
        status: "available",
        label: "Available",
        color: "bg-blue-100 text-blue-800",
      };
    }
  };

  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - 1 + i);

  // Define holidays array including June 12 as Independence Day
  const holidays = [
    { date: "2025-01-01", name: "New Year's Day" },
    { date: "2025-02-25", name: "EDSA People Power Revolution" },
    { date: "2025-04-09", name: "Araw ng Kagitingan (Day of Valor)" },
    { date: "2025-04-17", name: "Maundy Thursday" },
    { date: "2025-04-18", name: "Good Friday" },
    { date: "2025-05-01", name: "Labor Day" },
    { date: "2025-06-12", name: "Independence Day" },
    { date: "2025-08-21", name: "Ninoy Aquino Day" },
    { date: "2025-08-25", name: "National Heroes Day" },
    { date: "2025-11-01", name: "All Saints' Day" },
    { date: "2025-11-30", name: "Bonifacio Day" },
    { date: "2025-12-25", name: "Christmas Day" },
    { date: "2025-12-30", name: "Rizal Day" },
  ];

  // Convert coupons and holidays to calendar events
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    const couponEvents = coupons.map((coupon) => {
      const status = getCouponStatus(coupon);

      return {
        id: coupon.id,
        title: `Coupon - ${status.label}`,
        start: new Date(coupon.coupon_date),
        end: new Date(coupon.coupon_date),
        allDay: true,
        resource: coupon,
      };
    });

    const holidayEvents = holidays.map((holiday) => ({
      id: `holiday-${holiday.date}`,
      title: holiday.name,
      start: new Date(holiday.date),
      end: new Date(holiday.date),
      allDay: true,
      resource: { holiday: true }, // Identify as a holiday event
    }));

    return [...couponEvents, ...holidayEvents];
  }, [coupons]);

  // eventStyleGetter modified to strikethrough and disable pointer for claimed and expired coupons
  const eventStyleGetter = (event: CalendarEvent) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const isHoliday = event.resource.holiday === true;
    let backgroundColor = "";
    let textDecoration = "none";
    let cursor = "pointer";

    if (isHoliday) {
      backgroundColor = "#4CAF50";
    } else {
      const isExpired = event.resource.coupon_date < todayStr;

      backgroundColor = isExpired ? "red" : "blue";

      if (event.resource.is_claimed || isExpired) {
        textDecoration = "line-through";
        cursor = "not-allowed";
      }
    }

    const style = {
      backgroundColor,
      borderRadius: "5px",
      opacity: 0.8,
      color: isHoliday ? "black" : "white",
      border: "0px",
      display: "block",
      paddingLeft: "5px",
      paddingRight: "5px",
      fontWeight: isHoliday ? "bold" : "normal",
      fontSize: isHoliday ? "0.75rem" : "0.85rem",
      textDecoration,
      cursor,
    };

    return { style };
  };

  // Prevent clicking claimed or expired coupons, show toast instead
  const onSelectEvent = (event: CalendarEvent) => {
    // Holiday case
    if (event.resource.holiday) {
      toast(
        `Holiday: ${event.title} - 🎉 Take time to relax and enjoy with your loved ones! 💖😄`,
        { icon: "🎊" },
      );

      return;
    }

    // Already claimed case
    if (event.resource.is_claimed) {
      toast("This coupon has already been claimed.", {
        icon: <CheckCheck className="text-red-600" />,
      });

      return;
    }

    // Expired coupon case
    const isExpired =
      event.resource.coupon_date < new Date().toISOString().split("T")[0];

    if (isExpired) {
      toast("This coupon has expired and cannot be viewed.", {
        icon: <CalendarX className="text-red-600" />,
      });

      return;
    }

    // If valid
    const coupon: Coupon = event.resource;

    setSelectedCoupon(coupon);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Coupon Dashboard</CardTitle>
          <CardDescription>
            View and manage meal coupons by employee and month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Employee Dropdown */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Employee
              </Label>
              <Select
                value={selectedEmployee}
                onValueChange={setSelectedEmployee}
              >
                <SelectTrigger className="w-full bg-white border-gray-300 text-gray-900 min-h-[44px]">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <SelectValue placeholder="Select employee" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg max-h-[300px] overflow-y-auto">
                  {employees.map((employee) => (
                    <SelectItem
                      key={employee.id}
                      className="text-gray-900 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer px-3 py-3 border-b border-gray-100 last:border-b-0"
                      value={employee.id.toString()}
                    >
                      <div className="flex flex-col gap-1 w-full">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-600" />
                          <span className="font-semibold text-gray-900">
                            {employee.first_name} {employee.last_name}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 ml-6">
                          ID: {employee.employee_id} • {employee.department}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Month Dropdown */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Month</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-full bg-white border-gray-300 text-gray-900">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    <SelectValue placeholder="Select month" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                  {months.map((month) => (
                    <SelectItem
                      key={month.value}
                      className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer px-3 py-2"
                      value={month.value}
                    >
                      <span className="text-gray-900">{month.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year Dropdown */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Year</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-full bg-white border-gray-300 text-gray-900">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                  {years.map((year) => (
                    <SelectItem
                      key={year}
                      className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer px-3 py-2"
                      value={year.toString()}
                    >
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {selectedEmployee && (
        <Card>
          <CardHeader>
            <CardTitle>Coupon Statistics</CardTitle>
            <CardDescription>
              Showing data for{" "}
              {
                employees.find((e) => e.id.toString() === selectedEmployee)
                  ?.first_name
              }{" "}
              {
                employees.find((e) => e.id.toString() === selectedEmployee)
                  ?.last_name
              }{" "}
              - {months.find((m) => m.value === selectedMonth)?.label}{" "}
              {selectedYear}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Badge
              className="space-x-2 flex items-center justify-center text-gray-700 border-gray-400"
              variant="outline"
            >
              <CalendarIcon className="w-5 h-5" />
              <span>Total: {stats.total}</span>
            </Badge>
            <Badge
              className="space-x-2 flex items-center justify-center text-green-700 border-green-400"
              variant="outline"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Claimed: {stats.claimed}</span>
            </Badge>
            <Badge
              className="space-x-2 flex items-center justify-center text-red-700 border-red-400"
              variant="outline"
            >
              <XCircle className="w-5 h-5" />
              <span>Expired: {stats.expired}</span>
            </Badge>
            <Badge
              className="space-x-2 flex items-center justify-center text-blue-700 border-blue-400"
              variant="outline"
            >
              <Clock className="w-5 h-5" />
              <span>Available: {stats.available}</span>
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Coupon Calendar */}
      {selectedEmployee && (
        <Card>
          <CardHeader>
            <CardTitle>Coupons Calendar</CardTitle>
            <CardDescription>
              {
                employees.find((e) => e.id.toString() === selectedEmployee)
                  ?.first_name
              }{" "}
              {
                employees.find((e) => e.id.toString() === selectedEmployee)
                  ?.last_name
              }{" "}
              - {months.find((m) => m.value === selectedMonth)?.label}{" "}
              {selectedYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              date={
                new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, 1)
              }
              defaultView="month"
              endAccessor="end"
              eventPropGetter={eventStyleGetter} // Apply styles including disabled cursor for claimed and expired coupons
              events={calendarEvents}
              localizer={localizer}
              startAccessor="start"
              style={{ height: 500 }}
              views={["month"]}
              onNavigate={() => {}}
              onSelectEvent={onSelectEvent} // Handle event click
            />
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <div className="text-center py-4 text-gray-500 font-semibold">
          Loading coupons...
        </div>
      )}

      {/* Modal for displaying barcode */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button className="hidden" variant="outline" />
        </DialogTrigger>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Coupon Barcode</DialogTitle>
          </DialogHeader>
          {selectedCoupon && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="font-mono text-lg font-bold text-gray-900">
                  {selectedCoupon.barcode}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(selectedCoupon.coupon_date).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </p>
              </div>
              {selectedCoupon.barcode_image_url && (
                <div className="flex flex-col items-center space-y-4">
                  <img
                    alt={`Barcode ${selectedCoupon.barcode}`}
                    className="max-w-full h-auto border rounded bg-white"
                    src={selectedCoupon.barcode_image_url || "/placeholder.svg"}
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CouponDashboard;
