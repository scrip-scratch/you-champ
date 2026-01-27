import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import logo from "../assets/logo.png";

export default function Header() {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4">
        <img
          src={logo}
          alt="YouChamp"
          className="h-8 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate("/profile")}
        />
      </div>
    </header>
  );
}
