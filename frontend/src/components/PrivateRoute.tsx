import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

type Role = "admin" | "trainer" | "student" | "parent" | "owner" | "super_admin";

interface PrivateRouteProps {
  children: React.ReactElement;
  requiredRole?: Role | Role[];
}

// Check if user's subscription is expired and should be blocked
function isSubscriptionBlocked(user: {
  role: string;
  subscriptionExpired?: boolean;
}): boolean {
  // super_admin and owner are never blocked by subscription
  if (user.role === "super_admin" || user.role === "owner") {
    return false;
  }
  // For other roles (admin, trainer, student, parent) check subscription
  return user.subscriptionExpired === true;
}

export function PrivateRoute({ children, requiredRole }: PrivateRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check subscription expiry for applicable roles
  if (isSubscriptionBlocked(user)) {
    return <Navigate to="/subscription-expired" replace />;
  }

  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole)
      ? requiredRole
      : [requiredRole];
    if (!allowedRoles.includes(user.role as any)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
