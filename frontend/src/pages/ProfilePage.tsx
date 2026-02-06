import { ImagePlus, Pencil, Save, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { api, useAuth } from "../contexts/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ProfilePage() {
  const { user, updateProfile, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    email: user?.email || "",
    city: user?.city || "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        email: user.email || "",
        city: user.city || "",
      });
    }
  }, [user]);

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
      // Пустые строки отправляем как null, чтобы бэкенд не падал по валидации
      const payload = {
        firstName: formData.firstName || null,
        lastName: formData.lastName || null,
        phone: formData.phone || null,
        email: formData.email || null,
        city: formData.city || null,
      };
      await updateProfile(payload);
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
      email: user.email || "",
      city: user.city || "",
    });
    setIsEditing(false);
  };

  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("http")) return imageUrl;
    return `${API_URL}${imageUrl}`;
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formDataObj = new FormData();
      formDataObj.append("file", file);

      const response = await api.post("/files/upload-avatar", formDataObj, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await updateProfile({ photoUrl: response.data.url });
    } catch (e) {
      console.error("Failed to upload avatar:", e);
      alert("Не удалось загрузить аватар");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
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
      <div>
        <CardTitle className="mb-6">Профиль</CardTitle>
        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Avatar className="h-24 w-24">
                {user.photoUrl ? (
                  <AvatarImage
                    src={getImageUrl(user.photoUrl) || ""}
                    alt={user.firstName || "User"}
                  />
                ) : null}
                <AvatarFallback className="text-2xl">
                  {user.photoUrl ? (
                    getInitials()
                  ) : (
                    <User className="h-10 w-10" />
                  )}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <ImagePlus className="h-4 w-4" />
                </Button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
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

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="example@mail.com"
                />
              ) : (
                <p className="text-sm py-2 px-3 bg-muted rounded-md">
                  {user.email || "Не указано"}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Город</Label>
              {isEditing ? (
                <Input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="Москва"
                />
              ) : (
                <p className="text-sm py-2 px-3 bg-muted rounded-md">
                  {user.city || "Не указано"}
                </p>
              )}
            </div>
          </div>

          {/* Кнопки действий внизу блока */}
          <div className="flex flex-col gap-2 pt-2">
            {!isEditing ? (
              <Button
                className="w-full"
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Редактировать
              </Button>
            ) : (
              <>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Отменить
                </Button>
                <Button
                  className="w-full"
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Сохранение..." : "Сохранить"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
