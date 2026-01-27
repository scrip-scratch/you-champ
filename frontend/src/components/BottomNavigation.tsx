import { Calendar, Megaphone, QrCode, User, Users } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { cn } from "../lib/utils";

export default function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  const isAdmin = user.role === "admin";

  // Навигация для Участника
  const participantMenuItems = [
    { path: "/profile", label: "Профиль", icon: User },
    { path: "/events", label: "События", icon: Calendar },
  ];

  // Навигация для Администратора
  const adminMenuItems = [
    { path: "/profile", label: "Профиль", icon: User },
    { path: "/admin/participants", label: "Участники", icon: Users },
    { path: "/admin/events", label: "События", icon: Calendar },
    { path: "/admin/sources", label: "Источники", icon: QrCode },
    { path: "/admin/marketing", label: "Маркетинг", icon: Megaphone },
  ];

  const menuItems = isAdmin ? adminMenuItems : participantMenuItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 pb-safe">
      <div className="container mx-auto">
        <div className="flex items-center justify-center h-16 gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path === "/profile" &&
                location.pathname.startsWith("/profile")) ||
              (item.path === "/events" &&
                location.pathname.startsWith("/events")) ||
              (item.path === "/admin/participants" &&
                location.pathname.startsWith("/admin/participants")) ||
              (item.path === "/admin/events" &&
                location.pathname.startsWith("/admin/events")) ||
              (item.path === "/admin/sources" &&
                location.pathname.startsWith("/admin/sources")) ||
              (item.path === "/admin/marketing" &&
                location.pathname.startsWith("/admin/marketing"));

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
