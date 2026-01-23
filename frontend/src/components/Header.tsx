import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";

export default function Header() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <h1
          className="text-lg font-semibold cursor-pointer hover:opacity-80"
          onClick={() => navigate("/profile")}
        >
          YouChamp
        </h1>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user.firstName} {user.lastName}
            </span>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Выйти</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
