import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  onClick?: () => void;
  tooltip?: string;
}

export default function BackButton({ onClick, tooltip = "Назад" }: BackButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className="mb-2"
      aria-label={tooltip}
    >
      <ArrowLeft className="h-4 w-4" />
    </Button>
  );
}
