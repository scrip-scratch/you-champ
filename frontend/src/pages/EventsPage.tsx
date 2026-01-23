import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { api } from "../contexts/AuthContext";

interface Event {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  startDate: string;
  endDate: string;
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    const startFormatted = startDate.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
    });
    
    const endFormatted = endDate.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    if (startDate.toDateString() === endDate.toDateString()) {
      return formatDate(start);
    }

    return `${startFormatted} — ${endFormatted}`;
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
            <Card key={event.id} className="overflow-hidden">
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
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDateRange(event.startDate, event.endDate)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
