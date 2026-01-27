import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get("/events?activeOnly=true");
      setEvents(response.data);
    } catch (e) {
      console.error("Failed to fetch events:", e);
      setError("Не удалось загрузить события");
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

  /** Собирает строку из заполненных полей (время выводится как введено) */
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
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
      <h1 className="text-2xl font-bold mb-6">События</h1>

      {events.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Нет доступных событий
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {events.map((event) => (
            <Link key={event.id} to={`/events/${event.id}`}>
              <Card className="overflow-hidden hover:opacity-95 transition-opacity cursor-pointer h-full">
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
                  <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                  {event.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                      {event.description}
                    </p>
                  )}
                  {formatEventDateTime(event) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span>{formatEventDateTime(event)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
