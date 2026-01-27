import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { api } from "../contexts/AuthContext";

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

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await api.get(`/events/${id}`);
      setEvent(response.data);
    } catch (e) {
      console.error("Failed to fetch event:", e);
      setError("Событие не найдено");
    } finally {
      setLoading(false);
    }
  };

  /** Форматирует YYYY-MM-DD в "15 января 2025" без таймзон */
  const formatDateStr = (s: string | null) => {
    if (!s) return null;
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  /** Строки для вывода: только заполненные поля */
  // const dateTimeParts = (e: Event) => {
  //   const lines: string[] = [];
  //   if (e.startDate) lines.push(`Дата начала: ${formatDateStr(e.startDate) || e.startDate}`);
  //   if (e.startTime) lines.push(`Время начала: ${e.startTime}`);
  //   if (e.endDate) lines.push(`Дата окончания: ${formatDateStr(e.endDate) || e.endDate}`);
  //   if (e.endTime) lines.push(`Время окончания: ${e.endTime}`);
  //   return lines;
  // };

  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("http")) return imageUrl;
    return `${API_URL}${imageUrl}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto p-4 pb-24">
        <Button
          variant="ghost"
          onClick={() => navigate("/events")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-destructive">
              {error || "Событие не найдено"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const descriptionToShow = event.fullDescription || event.description || null;
  // const dtParts = dateTimeParts(event);

  return (
    <div className="container mx-auto p-4 pb-24">
      <Button
        variant="ghost"
        onClick={() => navigate("/events")}
        className="mb-4 -ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Назад к событиям
      </Button>

      <Card className="overflow-hidden">
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
          <h1 className="text-2xl font-bold mb-4">{event.title}</h1>
          {event.startDate && (
            <div className="space-y-1 text-sm mb-2">
              <div className="font-bold">Начало:</div>
              <div className="flex items-center gap-2 text-muted-foreground ">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>{formatDateStr(event.startDate)} </span>
                {event.startTime && (
                  <>
                    <Clock className="h-4 w-4 shrink-0 ml-2" />
                    <span>{event.startTime} </span>
                  </>
                )}
              </div>
            </div>
          )}
          {event.endDate && (
            <div className="space-y-1 text-sm mb-2">
              <div className="font-bold">Конец:</div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>{formatDateStr(event.endDate)} </span>
                {event.endTime && (
                  <>
                    <Clock className="h-4 w-4 shrink-0 ml-2" />
                    <span>{event.endTime} </span>
                  </>
                )}
              </div>
            </div>
          )}
          {descriptionToShow && (
            <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
              {descriptionToShow}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
