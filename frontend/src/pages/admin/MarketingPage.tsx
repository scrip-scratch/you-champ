import { Gift, Mail, MessageCircle, Send, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Textarea } from "../../components/ui/textarea";
import { api, useAuth, User } from "../../contexts/AuthContext";

interface Source {
  id: string;
  code: string;
  name: string;
}

export default function MarketingPage() {
  const { user: currentUser } = useAuth();
  const [sources, setSources] = useState<Source[]>([]);
  const [participants, setParticipants] = useState<User[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [isRaffling, setIsRaffling] = useState(false);
  const [winner, setWinner] = useState<User | null>(null);
  const [displayNumber, setDisplayNumber] = useState<number>(0);
  const [adminUsername, setAdminUsername] = useState<string>("");
  const [sendingNotification, setSendingNotification] = useState(false);

  // Mailing tab state
  const [mailingSource, setMailingSource] = useState<string>("all");
  const [mailingMessage, setMailingMessage] = useState("");
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<{
    sent: number;
    failed: number;
  } | null>(null);

  useEffect(() => {
    fetchSources();
    fetchParticipants();
    if (currentUser?.username) {
      setAdminUsername(currentUser.username);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchSources = async () => {
    try {
      const response = await api.get("/sources");
      setSources(response.data);
    } catch (e) {
      console.error("Failed to fetch sources:", e);
    }
  };

  const fetchParticipants = async () => {
    try {
      const response = await api.get("/users");
      setParticipants(response.data);
    } catch (e) {
      console.error("Failed to fetch participants:", e);
    }
  };

  const getInitials = (user: User) => {
    const first = user.firstName?.[0] || "";
    const last = user.lastName?.[0] || "";
    return (first + last).toUpperCase() || "U";
  };

  const getFilteredParticipants = () => {
    if (selectedSource === "all") return participants;
    return participants.filter((p) => p.source === selectedSource);
  };

  const getFilteredParticipantsCount = () => getFilteredParticipants().length;

  const conductRaffle = () => {
    const filtered = getFilteredParticipants();
    if (filtered.length === 0) {
      alert("Нет участников для розыгрыша");
      return;
    }
    setIsRaffling(true);
    setWinner(null);
    setDisplayNumber(0);
    const startTime = Date.now();
    const duration = 3000;
    const interval = 50;
    const animationInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= duration) {
        clearInterval(animationInterval);
        const randomIndex = Math.floor(Math.random() * filtered.length);
        setWinner(filtered[randomIndex]);
        setIsRaffling(false);
      } else {
        setDisplayNumber(Math.floor(Math.random() * 10000) + 1);
      }
    }, interval);
  };

  const sendNotification = async () => {
    if (!winner || !adminUsername?.trim()) {
      alert("Укажите username администратора");
      return;
    }
    try {
      setSendingNotification(true);
      await api.post("/telegram/send-notification", {
        telegramId: winner.telegramId,
        adminUsername: adminUsername.replace("@", ""),
      });
      alert("Уведомление отправлено!");
    } catch (e: any) {
      alert(e.response?.data?.message || "Не удалось отправить уведомление");
    } finally {
      setSendingNotification(false);
    }
  };

  const getMailingRecipientsCount = () => {
    if (mailingSource === "all") return participants.length;
    return participants.filter((p) => p.source === mailingSource).length;
  };

  const sendBroadcast = async () => {
    if (!mailingMessage.trim()) {
      alert("Введите сообщение");
      return;
    }
    const count = getMailingRecipientsCount();
    if (count === 0) {
      alert("Нет получателей для рассылки");
      return;
    }
    if (!confirm(`Отправить сообщение ${count} участникам?`)) return;
    try {
      setSendingBroadcast(true);
      setBroadcastResult(null);
      const res = await api.post("/telegram/broadcast", {
        message: mailingMessage.trim(),
        source: mailingSource === "all" ? undefined : mailingSource,
      });
      setBroadcastResult({ sent: res.data.sent, failed: res.data.failed });
    } catch (e: any) {
      alert(e.response?.data?.message || "Не удалось выполнить рассылку");
    } finally {
      setSendingBroadcast(false);
    }
  };

  return (
    <div className="container mx-auto p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Маркетинг</h1>

        <Tabs defaultValue="raffle">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="raffle" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Розыгрыш
            </TabsTrigger>
            <TabsTrigger value="mailing" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Рассылка
            </TabsTrigger>
          </TabsList>

          <TabsContent value="raffle">
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Фильтр по источнику</Label>
                    <Select
                      value={selectedSource}
                      onValueChange={setSelectedSource}
                      disabled={isRaffling}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите источник" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все участники</SelectItem>
                        {sources.map((s) => (
                          <SelectItem key={s.id} value={s.code}>
                            {s.name} ({s.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Участников: {getFilteredParticipantsCount()}
                  </p>
                  <Button
                    onClick={conductRaffle}
                    disabled={
                      isRaffling || getFilteredParticipantsCount() === 0
                    }
                    className="w-full"
                    size="lg"
                  >
                    {isRaffling ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                        Выбираем победителя...
                      </>
                    ) : (
                      <>
                        <Gift className="h-4 w-4 mr-2" />
                        Провести розыгрыш
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {isRaffling && (
              <Card className="mb-6">
                <CardContent className="pt-6 text-center space-y-4">
                  <div className="text-6xl font-bold text-primary animate-pulse">
                    {displayNumber}
                  </div>
                  <p className="text-muted-foreground">
                    Выбираем случайного участника...
                  </p>
                </CardContent>
              </Card>
            )}

            {winner && !isRaffling && (
              <Card className="border-primary mb-6">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <Avatar className="h-24 w-24">
                        {winner.photoUrl ? (
                          <AvatarImage
                            src={winner.photoUrl}
                            alt={winner.firstName || "Winner"}
                          />
                        ) : null}
                        <AvatarFallback className="text-2xl">
                          {getInitials(winner)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <h2 className="text-2xl font-bold">Победитель!</h2>
                    <p className="text-xl">
                      {[winner.firstName, winner.lastName]
                        .filter(Boolean)
                        .join(" ") || "Участник"}
                    </p>
                    {winner.username && (
                      <p className="text-muted-foreground">
                        @{winner.username}
                      </p>
                    )}
                    {winner.phone && (
                      <p className="text-muted-foreground">{winner.phone}</p>
                    )}
                    {winner.source && (
                      <p className="text-sm text-muted-foreground">
                        Источник:{" "}
                        {sources.find((s) => s.code === winner.source)?.name ||
                          winner.source}
                      </p>
                    )}

                    <div className="space-y-2 pt-4 border-t">
                      <Label>Username администратора</Label>
                      <Input
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        placeholder="@admin_username"
                        className="text-center"
                      />
                    </div>
                    <div className="flex flex-col gap-2 pt-2">
                      {winner.username && (
                        <Button variant="default" asChild className="w-full">
                          <a
                            href={`https://t.me/${winner.username.replace("@", "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Перейти в чат
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        onClick={sendNotification}
                        disabled={sendingNotification || !adminUsername.trim()}
                        className="w-full"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {sendingNotification
                          ? "Отправка..."
                          : "Отправить уведомление"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {!isRaffling && !winner && getFilteredParticipantsCount() === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Нет участников для розыгрыша
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="mailing">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label>Фильтр по источнику</Label>
                  <Select
                    value={mailingSource}
                    onValueChange={setMailingSource}
                    disabled={sendingBroadcast}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите источник" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все участники</SelectItem>
                      {sources.map((s) => (
                        <SelectItem key={s.id} value={s.code}>
                          {s.name} ({s.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Получателей: {getMailingRecipientsCount()}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mailingMessage">Сообщение</Label>
                  <Textarea
                    id="mailingMessage"
                    value={mailingMessage}
                    onChange={(e) => setMailingMessage(e.target.value)}
                    placeholder="Введите текст рассылки..."
                    rows={5}
                    disabled={sendingBroadcast}
                  />
                </div>

                {broadcastResult && (
                  <p className="text-sm text-muted-foreground">
                    Отправлено: {broadcastResult.sent}, не доставлено:{" "}
                    {broadcastResult.failed}
                  </p>
                )}

                <Button
                  onClick={sendBroadcast}
                  disabled={
                    sendingBroadcast ||
                    !mailingMessage.trim() ||
                    getMailingRecipientsCount() === 0
                  }
                  className="w-full"
                  size="lg"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {sendingBroadcast ? "Отправка..." : "Разослать сообщение"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
