import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { Pencil, Save, X, User } from "lucide-react";

export default function ProfilePage() {
  const { user, updateProfile, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Пожалуйста, откройте приложение через Telegram
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateProfile(formData);
      setIsEditing(false);
    } catch (e) {
      console.error("Failed to save profile:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phone: user.phone || "",
    });
    setIsEditing(false);
  };

  const getInitials = () => {
    const first = user.firstName?.[0] || "";
    const last = user.lastName?.[0] || "";
    return (first + last).toUpperCase() || "U";
  };

  const getRoleName = () => {
    return user.role === "admin" ? "Администратор" : "Участник";
  };

  return (
    <div className="container mx-auto p-4 pb-24">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Профиль</CardTitle>
          {!isEditing ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                disabled={saving}
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSave}
                disabled={saving}
              >
                <Save className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-3">
            <Avatar className="h-24 w-24">
              {user.photoUrl ? (
                <AvatarImage src={user.photoUrl} alt={user.firstName || "User"} />
              ) : null}
              <AvatarFallback className="text-2xl">
                {user.photoUrl ? getInitials() : <User className="h-10 w-10" />}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                @{user.username || "нет username"}
              </p>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {getRoleName()}
              </span>
            </div>
          </div>

          {/* Profile Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Имя</Label>
              {isEditing ? (
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  placeholder="Введите имя"
                />
              ) : (
                <p className="text-sm py-2 px-3 bg-muted rounded-md">
                  {user.firstName || "Не указано"}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Фамилия</Label>
              {isEditing ? (
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  placeholder="Введите фамилию"
                />
              ) : (
                <p className="text-sm py-2 px-3 bg-muted rounded-md">
                  {user.lastName || "Не указано"}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+7 (999) 123-45-67"
                />
              ) : (
                <p className="text-sm py-2 px-3 bg-muted rounded-md">
                  {user.phone || "Не указано"}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
