import { Search, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Card, CardContent, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import TelegramIcon from "../../components/ui/telegram-icon";
import { api, User } from "../../contexts/AuthContext";

interface Source {
  id: string;
  code: string;
  name: string;
}

export default function ParticipantsPage() {
  const navigate = useNavigate();
  const [participants, setParticipants] = useState<User[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchParticipants();
  }, [debouncedSearch]);

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      const response = await api.get("/sources");
      setSources(response.data);
    } catch (e) {
      console.error("Failed to fetch sources:", e);
    }
  };

  const getSourceName = (code: string | null) => {
    if (!code) return null;
    return sources.find((s) => s.code === code)?.name || code;
  };

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const params = debouncedSearch
        ? `?search=${encodeURIComponent(debouncedSearch)}`
        : "";
      const response = await api.get(`/users${params}`);
      setParticipants(response.data);
    } catch (e) {
      console.error("Failed to fetch participants:", e);
      setError("Не удалось загрузить список участников");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (user: User) => {
    const first = user.firstName?.[0] || "";
    const last = user.lastName?.[0] || "";
    return (first + last).toUpperCase() || "U";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
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
      <div>
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Участники</CardTitle>
            {!loading && (
              <span className="text-sm text-muted-foreground">
                Всего: {participants.length}
              </span>
            )}
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по имени, фамилии, телефону..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : participants.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {debouncedSearch
                ? "Участники не найдены"
                : "Нет зарегистрированных участников"}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Имя</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Username
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Телефон
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Дата регистрации
                  </TableHead>
                  <TableHead className="hidden xl:table-cell">
                    Источник
                  </TableHead>
                  <TableHead className="w-20">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((participant) => (
                  <TableRow
                    key={participant.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/admin/participants/${participant.id}`)}
                  >
                    <TableCell>
                      <Avatar className="h-8 w-8">
                        {participant.photoUrl ? (
                          <AvatarImage
                            src={participant.photoUrl}
                            alt={participant.firstName || "User"}
                          />
                        ) : null}
                        <AvatarFallback className="text-xs">
                          {participant.photoUrl ? (
                            getInitials(participant)
                          ) : (
                            <UserIcon className="h-4 w-4" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {[participant.firstName, participant.lastName]
                            .filter(Boolean)
                            .join(" ") || "Не указано"}
                        </p>
                        <p className="text-sm text-muted-foreground sm:hidden">
                          @{participant.username || "—"}
                        </p>
                        {participant.source && (
                          <p className="text-xs text-muted-foreground mt-0.5 xl:hidden">
                            {getSourceName(participant.source) || participant.source}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {participant.username ? `@${participant.username}` : "—"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {participant.phone || "—"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {formatDate(participant.createdAt)}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
                      {participant.source
                        ? getSourceName(participant.source) || participant.source
                        : "—"}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {participant.username && (
                        <a
                          href={`https://t.me/${participant.username.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <TelegramIcon size={20} />
                        </a>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
