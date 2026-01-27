import { ArrowLeft, Calendar, Mail, MapPin, Phone, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import TelegramIcon from "../../components/ui/telegram-icon";
import { api, User as UserType } from "../../contexts/AuthContext";

interface Source {
  id: string;
  code: string;
  name: string;
}

export default function ParticipantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [participant, setParticipant] = useState<UserType | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchParticipant();
  }, [id]);

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchParticipant = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await api.get(`/users/${id}`);
      setParticipant(response.data);
    } catch (e) {
      console.error("Failed to fetch participant:", e);
      setError("Участник не найден");
    } finally {
      setLoading(false);
    }
  };

  const fetchSources = async () => {
    try {
      const response = await api.get("/sources");
      setSources(response.data);
    } catch (e) {
      console.error("Failed to fetch sources:", e);
    }
  };

  const getInitials = (user: UserType) => {
    const first = user.firstName?.[0] || "";
    const last = user.lastName?.[0] || "";
    return (first + last).toUpperCase() || "U";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSourceName = (code: string | null) => {
    if (!code) return null;
    return sources.find((s) => s.code === code)?.name || code;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !participant) {
    return (
      <div className="container mx-auto p-4 pb-24">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/participants")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-destructive">
              {error || "Участник не найден"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 pb-24">
      <Button
        variant="ghost"
        onClick={() => navigate("/admin/participants")}
        className="mb-4 -ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Назад к участникам
      </Button>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 mb-6">
            <Avatar className="h-24 w-24">
              {participant.photoUrl ? (
                <AvatarImage
                  src={participant.photoUrl}
                  alt={participant.firstName || "Участник"}
                />
              ) : null}
              <AvatarFallback className="text-2xl">
                {getInitials(participant)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h1 className="text-2xl font-bold">
                {[participant.firstName, participant.lastName]
                  .filter(Boolean)
                  .join(" ") || "Участник"}
              </h1>
              {participant.username && (
                <div className="flex items-center justify-center gap-1 mt-1">
                  <TelegramIcon size={16} />
                  <span className="text-muted-foreground">
                    @{participant.username}
                  </span>
                  <a
                    href={`https://t.me/${participant.username.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline ml-1"
                  >
                    Написать
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label className="text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Имя
              </Label>
              <p>
                {[participant.firstName, participant.lastName]
                  .filter(Boolean)
                  .join(" ") || "—"}
              </p>
            </div>

            {participant.phone && (
              <div className="grid gap-2">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Телефон
                </Label>
                <p>{participant.phone}</p>
              </div>
            )}

            {participant.email && (
              <div className="grid gap-2">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <p>{participant.email}</p>
              </div>
            )}

            {participant.city && (
              <div className="grid gap-2">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Город
                </Label>
                <p>{participant.city}</p>
              </div>
            )}

            <div className="grid gap-2 pt-4 border-t">
              <Label className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Дата регистрации
              </Label>
              <p>{formatDate(participant.createdAt)}</p>
            </div>

            {participant.source && (
              <div className="grid gap-2">
                <Label className="text-muted-foreground">Источник регистрации</Label>
                <p>{getSourceName(participant.source) || participant.source}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
