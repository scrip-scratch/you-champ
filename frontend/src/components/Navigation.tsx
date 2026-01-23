import {
  CreditCard,
  Dumbbell,
  Home,
  LogOut,
  Menu,
  Settings,
  TrendingUp,
  Trophy,
  User,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { Separator } from "./ui/separator";

const menuItems = [
  {
    path: "/",
    label: "Главная",
    icon: Home,
    roles: ["admin", "trainer", "student"],
  },
  {
    path: "/profile",
    label: "Профиль",
    icon: User,
    roles: ["admin", "trainer", "student"],
  },
  {
    path: "/groups",
    label: "Группы",
    icon: Users,
    roles: ["admin", "trainer", "student"],
  },
  {
    path: "/trainers",
    label: "Тренеры",
    icon: Dumbbell,
    roles: ["admin", "trainer", "student"],
  },
  {
    path: "/payments",
    label: "Оплаты",
    icon: CreditCard,
    roles: ["admin", "student"],
  },
  {
    path: "/progress",
    label: "Прогресс",
    icon: TrendingUp,
    roles: ["admin", "trainer", "student"],
  },
  {
    path: "/ranking",
    label: "Рейтинг",
    icon: Trophy,
    roles: ["admin", "trainer", "student"],
  },
  { path: "/admin", label: "Админ-панель", icon: Settings, roles: ["admin"] },
  {
    path: "/admin/users",
    label: "Управление пользователями",
    icon: Users,
    roles: ["admin"],
  },
  {
    path: "/trainer",
    label: "Панель тренера",
    icon: Settings,
    roles: ["trainer"],
  },
];

export default function Navigation() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const handleMenuClick = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const filteredMenuItems = menuItems.filter((item) => {
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Меню</DrawerTitle>
              </DrawerHeader>
              <div className="p-4">
                <nav className="space-y-1">
                  {filteredMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <button
                        key={item.path}
                        onClick={() => handleMenuClick(item.path)}
                        className={cn(
                          "w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
                <Separator className="my-4" />
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    localStorage.removeItem("token");
                    navigate("/login");
                    setDrawerOpen(false);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Выйти
                </Button>
              </div>
            </DrawerContent>
          </Drawer>

          <h1
            className="text-lg font-semibold cursor-pointer hover:opacity-80"
            onClick={() => navigate("/")}
          >
            WeOS
          </h1>

          <div className="ml-auto flex items-center gap-4">
            {user && (
              <span className="text-sm text-muted-foreground">
                {user.firstName} {user.lastName}
              </span>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
