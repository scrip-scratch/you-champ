import { Copy, Link, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
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

interface Source {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
}

interface SourceFormData {
  code: string;
  name: string;
  description: string;
  isActive: boolean;
}

const BOT_USERNAME = import.meta.env.VITE_BOT_USERNAME || "your_bot";

const emptyFormData: SourceFormData = {
  code: "",
  name: "",
  description: "",
  isActive: true,
};

export default function SourcesAdminPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [deletingSource, setDeletingSource] = useState<Source | null>(null);
  const [formData, setFormData] = useState<SourceFormData>(emptyFormData);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      setLoading(true);
      const response = await api.get("/sources");
      setSources(response.data);
    } catch (e) {
      console.error("Failed to fetch sources:", e);
      setError("Не удалось загрузить источники");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getBotLink = (code: string) => {
    return `https://t.me/${BOT_USERNAME}?start=${code}`;
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  };

  const handleOpenCreate = () => {
    setEditingSource(null);
    setFormData(emptyFormData);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (source: Source) => {
    setEditingSource(source);
    setFormData({
      code: source.code,
      name: source.name,
      description: source.description || "",
      isActive: source.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleOpenDelete = (source: Source) => {
    setDeletingSource(source);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.code || !formData.name) {
      alert("Заполните обязательные поля: код и название");
      return;
    }

    // Validate code format
    if (!/^[A-Za-z0-9_-]+$/.test(formData.code)) {
      alert("Код может содержать только буквы, цифры, дефис и подчёркивание");
      return;
    }

    if (formData.code.length > 64) {
      alert("Код не должен превышать 64 символа");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        description: formData.description || null,
      };

      if (editingSource) {
        await api.patch(`/sources/${editingSource.id}`, payload);
      } else {
        await api.post("/sources", payload);
      }

      await fetchSources();
      setIsDialogOpen(false);
    } catch (e: any) {
      console.error("Failed to save source:", e);
      if (e.response?.status === 409) {
        alert("Источник с таким кодом уже существует");
      } else {
        alert("Не удалось сохранить источник");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingSource) return;

    try {
      setSaving(true);
      await api.delete(`/sources/${deletingSource.id}`);
      await fetchSources();
      setIsDeleteDialogOpen(false);
      setDeletingSource(null);
    } catch (e) {
      console.error("Failed to delete source:", e);
      alert("Не удалось удалить источник");
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
        <h1 className="text-2xl font-bold">Источники</h1>
        <Button onClick={handleOpenCreate} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Добавить
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : sources.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Нет источников. Создайте первый код для отслеживания регистраций.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sources.map((source) => (
            <Card
              key={source.id}
              className={`overflow-hidden ${!source.isActive ? "opacity-60" : ""}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{source.name}</h3>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {source.code}
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`shrink-0 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        source.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {source.isActive ? "Активен" : "Неактивен"}
                    </span>
                  </div>
                </div>

                {source.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {source.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span>Регистраций: {source.usageCount}</span>
                  <span>Создан: {formatDate(source.createdAt)}</span>
                </div>

                <div className="flex items-center gap-2 p-2 bg-muted rounded mb-3">
                  <Link className="h-4 w-4 shrink-0" />
                  <span className="text-sm truncate flex-1">
                    {getBotLink(source.code)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(getBotLink(source.code), source.id)}
                  >
                    <Copy className="h-4 w-4" />
                    {copiedId === source.id ? "Скопировано!" : "Копировать"}
                  </Button>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleOpenEdit(source)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Редактировать
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleOpenDelete(source)}
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
              {editingSource ? "Редактировать источник" : "Новый источник"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">Код *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="promo_summer2026"
                disabled={!!editingSource}
              />
              <p className="text-xs text-muted-foreground">
                Только буквы, цифры, дефис и подчёркивание. Макс. 64 символа.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Название *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Летняя промо-кампания 2026"
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
                placeholder="Описание источника"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Активен</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
            </div>

            {!editingSource && formData.code && (
              <div className="p-3 bg-muted rounded">
                <p className="text-sm font-medium mb-1">Ссылка для QR-кода:</p>
                <code className="text-sm break-all">
                  {getBotLink(formData.code)}
                </code>
              </div>
            )}
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
            <DialogTitle>Удалить источник?</DialogTitle>
          </DialogHeader>
          <p className="py-4 text-muted-foreground">
            Вы уверены, что хотите удалить источник "{deletingSource?.name}"?
            Это действие нельзя отменить.
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
