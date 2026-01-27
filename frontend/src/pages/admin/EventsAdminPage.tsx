import { Calendar, ImagePlus, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Textarea } from "../../components/ui/textarea";
import { api } from "../../contexts/AuthContext";

interface Event {
  id: string;
  title: string;
  description: string | null;
  fullDescription: string | null;
  imageUrl: string | null;
  startDate: string | null;
  startTime: string | null;
  endDate: string | null;
  endTime: string | null;
  isActive: boolean;
}

interface EventFormData {
  title: string;
  description: string;
  fullDescription: string;
  imageUrl: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  isActive: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const emptyFormData: EventFormData = {
  title: "",
  description: "",
  fullDescription: "",
  imageUrl: "",
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  isActive: true,
};

export default function EventsAdminPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<EventFormData>(emptyFormData);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get("/events");
      setEvents(response.data);
    } catch (e) {
      console.error("Failed to fetch events:", e);
      setError("Не удалось загрузить события");
    } finally {
      setLoading(false);
    }
  };

  /** Форматирует YYYY-MM-DD в "15 января 2025" (без таймзон) */
  const formatDateStr = (s: string | null) => {
    if (!s) return null;
    const [y, m, d] = s.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  /** Собирает строку из заполненных полей даты/времени (отображаем как введено) */
  const formatEventDateTime = (e: Event) => {
    const parts: string[] = [];
    if (e.startDate) parts.push(formatDateStr(e.startDate) || e.startDate);
    if (e.startTime) parts.push(e.startTime);
    const start = parts.join(", ");
    const endParts: string[] = [];
    if (e.endDate) endParts.push(formatDateStr(e.endDate) || e.endDate);
    if (e.endTime) endParts.push(e.endTime);
    const end = endParts.join(", ");
    if (!start && !end) return null;
    if (start && !end) return start;
    if (!start && end) return end;
    return `${start} — ${end}`;
  };

  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("http")) return imageUrl;
    return `${API_URL}${imageUrl}`;
  };

  const handleOpenCreate = () => {
    setEditingEvent(null);
    setFormData(emptyFormData);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || "",
      fullDescription: event.fullDescription || "",
      imageUrl: event.imageUrl || "",
      startDate: event.startDate || "",
      startTime: event.startTime || "",
      endDate: event.endDate || "",
      endTime: event.endTime || "",
      isActive: event.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleOpenDelete = (event: Event) => {
    setDeletingEvent(event);
    setIsDeleteDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formDataObj = new FormData();
      formDataObj.append("file", file);

      const response = await api.post("/files/upload", formDataObj, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setFormData({ ...formData, imageUrl: response.data.url });
    } catch (e) {
      console.error("Failed to upload image:", e);
      alert("Не удалось загрузить изображение");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSave = async () => {
    if (!formData.title) {
      alert("Заполните название");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        description: formData.description || null,
        fullDescription: formData.fullDescription || null,
        imageUrl: formData.imageUrl || null,
        startDate: formData.startDate || null,
        startTime: formData.startTime || null,
        endDate: formData.endDate || null,
        endTime: formData.endTime || null,
      };

      if (editingEvent) {
        await api.patch(`/events/${editingEvent.id}`, payload);
      } else {
        await api.post("/events", payload);
      }

      await fetchEvents();
      setIsDialogOpen(false);
    } catch (e) {
      console.error("Failed to save event:", e);
      alert("Не удалось сохранить событие");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingEvent) return;

    try {
      setSaving(true);
      await api.delete(`/events/${deletingEvent.id}`);
      await fetchEvents();
      setIsDeleteDialogOpen(false);
      setDeletingEvent(null);
    } catch (e) {
      console.error("Failed to delete event:", e);
      alert("Не удалось удалить событие");
    } finally {
      setSaving(false);
    }
  };

  if (error && !loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 pb-24">
      <div className="flex flex-row items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">События</h1>
        <Button onClick={handleOpenCreate} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Добавить
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Нет событий</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {events.map((event) => (
            <Card
              key={event.id}
              className={`overflow-hidden ${!event.isActive ? "opacity-60" : ""}`}
            >
              {event.imageUrl && (
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  <img
                    src={getImageUrl(event.imageUrl) || ""}
                    alt={event.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-lg">{event.title}</h3>
                  <span
                    className={`shrink-0 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      event.isActive
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {event.isActive ? "Активно" : "Неактивно"}
                  </span>
                </div>
                {event.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                    {event.description}
                  </p>
                )}
                {formatEventDateTime(event) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="h-4 w-4" />
                    <span>{formatEventDateTime(event)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleOpenEdit(event)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Редактировать
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleOpenDelete(event)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? "Редактировать событие" : "Новое событие"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Название события"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Краткое описание (на карточке)"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullDescription">Полное описание</Label>
              <Textarea
                id="fullDescription"
                value={formData.fullDescription}
                onChange={(e) =>
                  setFormData({ ...formData, fullDescription: e.target.value })
                }
                placeholder="Полное описание (на странице события)"
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label>Изображение</Label>
              <div className="flex flex-col gap-2">
                {formData.imageUrl && (
                  <img
                    src={getImageUrl(formData.imageUrl) || ""}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded"
                  />
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <ImagePlus className="h-4 w-4 mr-2" />
                  {uploading ? "Загрузка..." : "Загрузить изображение"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Дата начала</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Время начала</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Дата окончания</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">Время окончания</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Активно</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={saving}
            >
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить событие?</DialogTitle>
          </DialogHeader>
          <p className="py-4 text-muted-foreground">
            Вы уверены, что хотите удалить событие "{deletingEvent?.title}"? Это
            действие нельзя отменить.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={saving}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={saving}
            >
              {saving ? "Удаление..." : "Удалить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
