"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bell,
  X,
  Check,
  AlertTriangle,
  Info,
  Award,
  Building2,
  Wifi,
  Settings,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/cards";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  useDynamicNotifications,
  type DynamicNotification,
} from "@/hooks/use-dynamic-notifications";

const getNotificationIcon = (type: DynamicNotification["type"]) => {
  switch (type) {
    case "coupon_expiry":
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    case "usage_alert":
      return <Info className="h-4 w-4 text-blue-500" />;
    case "achievement":
      return <Award className="h-4 w-4 text-green-500" />;
    case "department_alert":
      return <Building2 className="h-4 w-4 text-purple-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

const getPriorityColor = (priority: DynamicNotification["priority"]) => {
  switch (priority) {
    case "high":
      return "border-l-red-500 bg-red-50";
    case "medium":
      return "border-l-yellow-500 bg-yellow-50";
    case "low":
      return "border-l-blue-500 bg-blue-50";
    default:
      return "border-l-gray-500 bg-gray-50";
  }
};

export function DynamicNotificationCenter() {
  const {
    notifications,
    unreadCount,
    connected,
    markAsRead,
    markAllAsRead,
    removeNotification,
    subscribeToNotifications,
    refresh,
    requestNotificationPermission,
  } = useDynamicNotifications();

  const [open, setOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false); // Disabled by default
  const [filter, setFilter] = useState<string>("all");
  const [browserNotifications, setBrowserNotifications] = useState(false);
  const refreshIntervalRef = useRef<NodeJS.Timeout>();
  const subscriptionInitialized = useRef(false);

  // Check browser notification permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setBrowserNotifications(Notification.permission === "granted");
    }
  }, []);

  // Subscribe to notification types on mount (only once)
  useEffect(() => {
    if (!subscriptionInitialized.current) {
      subscriptionInitialized.current = true;
      subscribeToNotifications([
        "coupon_expiry",
        "usage_alert",
        "department_alert",
        "achievement",
        "system",
      ]);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  // Auto-refresh notifications (much longer intervals)
  useEffect(() => {
    if (autoRefresh) {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }

      refreshIntervalRef.current = setInterval(() => {
        refresh();
      }, 300000); // Refresh every 5 minutes when enabled

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    }
  }, [autoRefresh]);

  const handleBrowserNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      await requestNotificationPermission();
      setBrowserNotifications(Notification.permission === "granted");
    } else {
      setBrowserNotifications(false);
    }
  };

  const formatTime = (timestamp: string) => {
    if (!timestamp) return "Just now";

    try {
      const date = new Date(timestamp);
      const now = new Date();

      if (isNaN(date.getTime())) return "Just now";

      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return "Just now";
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;

      return `${days}d ago`;
    } catch (e) {
      return "Just now";
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.read;

    return notification.type === filter;
  });

  const notificationTypes = [
    { value: "all", label: "All" },
    { value: "unread", label: "Unread" },
    { value: "coupon_expiry", label: "Expiry" },
    { value: "usage_alert", label: "Usage" },
    { value: "department_alert", label: "Department" },
    { value: "achievement", label: "Achievement" },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button className="relative" size="sm" variant="outline">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              variant="destructive"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">
            {unreadCount > 0
              ? `${unreadCount} unread notifications`
              : "No unread notifications"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                {connected ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <Wifi className="h-3 w-3" />
                    <span className="text-xs">Live</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-blue-600">
                    <Settings className="h-3 w-3" />
                    <span className="text-xs">Polling</span>
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={autoRefresh}
                    id="auto-refresh"
                    onCheckedChange={setAutoRefresh}
                  />
                  <label
                    className="text-xs text-muted-foreground"
                    htmlFor="auto-refresh"
                  >
                    Auto-refresh (5min)
                  </label>
                </div>

                {unreadCount > 0 && (
                  <Button
                    className="text-xs h-6 px-2"
                    size="sm"
                    variant="ghost"
                    onClick={markAllAsRead}
                  >
                    Mark all read
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={browserNotifications}
                    id="browser-notifications"
                    onCheckedChange={handleBrowserNotificationToggle}
                  />
                  <label
                    className="text-xs text-muted-foreground"
                    htmlFor="browser-notifications"
                  >
                    Browser alerts
                  </label>
                </div>

                <Button
                  className="text-xs h-6 px-2"
                  size="sm"
                  variant="ghost"
                  onClick={refresh}
                >
                  Refresh now
                </Button>
              </div>
            </div>

            {/* Filter */}
            <div className="flex gap-1 pt-2">
              {notificationTypes.map((type) => (
                <Button
                  key={type.value}
                  className="text-xs h-6 px-2"
                  size="sm"
                  variant={filter === type.value ? "default" : "ghost"}
                  onClick={() => setFilter(type.value)}
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {filteredNotifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                  {filter !== "all" && (
                    <Button
                      className="mt-2 text-xs"
                      size="sm"
                      variant="ghost"
                      onClick={() => setFilter("all")}
                    >
                      Show all notifications
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-l-4 ${getPriorityColor(notification.priority)} ${
                        !notification.read ? "bg-opacity-100" : "bg-opacity-50"
                      } hover:bg-opacity-75 transition-all duration-200`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4
                                className={`text-sm font-medium ${!notification.read ? "font-semibold" : ""}`}
                              >
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="h-2 w-2 bg-blue-500 rounded-full" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-muted-foreground">
                                {formatTime(notification.timestamp)}
                              </p>
                              {notification.department && (
                                <Badge
                                  className="text-xs px-1 py-0"
                                  variant="outline"
                                >
                                  {notification.department}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {!notification.read && (
                            <Button
                              className="h-6 w-6 p-0 hover:bg-green-100"
                              size="sm"
                              variant="ghost"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            className="h-6 w-6 p-0 hover:bg-red-100"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeNotification(notification.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
