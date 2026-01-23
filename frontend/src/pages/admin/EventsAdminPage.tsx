import { Calendar, ImagePlus, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Textarea } from "../../components/ui/textarea";
import { api } from "../../contexts/AuthContext";

interface Event {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface EventFormData {
  title: string;
  description: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const emptyFormData: EventFormData = {
  title: "",
  description: "",
  imageUrl: "",
  startDate: "",
  endDate: "",
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

  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
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
      imageUrl: event.imageUrl || "",
      startDate: formatDateForInput(event.startDate),
      endDate: formatDateForInput(event.endDate),
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
    if (!formData.title || !formData.startDate || !formData.endDate) {
      alert("Заполните обязательные поля: название, дата начала и окончания");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        description: formData.description || null,
        imageUrl: formData.imageUrl || null,
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>События</CardTitle>
          <Button onClick={handleOpenCreate} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Добавить
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : events.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Нет событий
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead className="hidden sm:table-cell">Даты</TableHead>
                  <TableHead className="hidden md:table-cell">Статус</TableHead>
                  <TableHead className="w-24">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {event.imageUrl && (
                          <img
                            src={getImageUrl(event.imageUrl) || ""}
                            alt={event.title}
                            className="w-12 h-12 object-cover rounded hidden sm:block"
                          />
                        )}
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground sm:hidden">
                            {formatDate(event.startDate)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {formatDate(event.startDate)} — {formatDate(event.endDate)}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          event.isActive
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {event.isActive ? "Активно" : "Неактивно"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(event)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDelete(event)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

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
                placeholder="Описание события"
                rows={3}
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
                <Label htmlFor="startDate">Дата начала *</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Дата окончания *</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
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
