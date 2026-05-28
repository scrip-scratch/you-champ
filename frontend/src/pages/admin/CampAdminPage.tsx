import { Tent } from "lucide-react";
import { useEffect, useState } from "react";
import { CardTitle } from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import TelegramIcon from "../../components/ui/telegram-icon";
import { api } from "../../contexts/AuthContext";
import type { CampRegistration } from "../CampPage";

export default function CampAdminPage() {
  const [rows, setRows] = useState<CampRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await api.get<CampRegistration[]>("/camp/registrations");
        setRows(data);
      } catch (e) {
        console.error(e);
        setError("Не удалось загрузить заявки");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (error && !loading) {
    return (
      <div className="container mx-auto p-4 pb-24">
        <p className="text-center text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 pb-24">
      <div className="flex items-center gap-2 mb-4">
        <Tent className="h-7 w-7 text-primary" />
        <CardTitle className="text-2xl font-bold">Camp — заявки</CardTitle>
      </div>
      {!loading && (
        <p className="text-sm text-muted-foreground mb-4">
          Всего заявок: {rows.length}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : rows.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          Пока нет заявок на лагерь
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Имя</TableHead>
                <TableHead>Фамилия</TableHead>
                <TableHead>Телефон</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Город</TableHead>
                <TableHead>TG</TableHead>
                <TableHead className="whitespace-nowrap">Telegram ID</TableHead>
                <TableHead>Источник</TableHead>
                <TableHead className="whitespace-nowrap">Обновлено</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => {
                const u = r.user;
                const un = u?.username?.replace(/^@+/, "") || "";
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.firstName}</TableCell>
                    <TableCell>{r.lastName}</TableCell>
                    <TableCell className="whitespace-nowrap">{r.phone}</TableCell>
                    <TableCell className="max-w-[140px] truncate" title={r.email}>
                      {r.email}
                    </TableCell>
                    <TableCell>{r.city}</TableCell>
                    <TableCell>{un ? `@${un}` : "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm font-mono">
                      {u?.telegramId ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {u?.source ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(r.updatedAt)}
                    </TableCell>
                    <TableCell>
                      {un ? (
                        <a
                          href={`https://t.me/${un}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex"
                        >
                          <TelegramIcon size={20} />
                        </a>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
