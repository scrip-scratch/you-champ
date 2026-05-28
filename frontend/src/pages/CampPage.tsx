import { CheckCircle2, Tent } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { api, useAuth, User } from "../contexts/AuthContext";
import { cn } from "../lib/utils";

export interface CampRegistration {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  city: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

function displayUsername(raw: string | null | undefined) {
  if (!raw) return "";
  return raw.replace(/^@+/, "");
}

const RU_PHONE_DIGITS = 11;

/** Только цифры, максимум 11, всегда с ведущей 7 (РФ). */
function parseRuPhoneDigits(input: string): string {
  let d = input.replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("8")) d = "7" + d.slice(1);
  if (!d.startsWith("7")) d = "7" + d;
  return d.slice(0, RU_PHONE_DIGITS);
}

/** Маска отображения: +7-999-999-99-99 */
function formatRuPhoneMask(digits: string): string {
  if (!digits) return "";
  const d = digits.startsWith("7") ? digits : `7${digits}`.slice(0, RU_PHONE_DIGITS);
  const body = d.slice(1, RU_PHONE_DIGITS);
  let out = "+7";
  if (body.length === 0) return out;
  out += `-${body.slice(0, 3)}`;
  if (body.length <= 3) return out;
  out += `-${body.slice(3, 6)}`;
  if (body.length <= 6) return out;
  out += `-${body.slice(6, 8)}`;
  if (body.length <= 8) return out;
  out += `-${body.slice(8, 10)}`;
  return out;
}

function maskRuPhoneInput(raw: string): string {
  return formatRuPhoneMask(parseRuPhoneDigits(raw));
}

/** Для API: +79991234567 при полном номере, иначе как в поле */
function ruPhoneForApi(masked: string): string {
  const d = parseRuPhoneDigits(masked);
  if (d.length === RU_PHONE_DIGITS) return `+7${d.slice(1)}`;
  return masked.trim();
}

const SUCCESS_HIGHLIGHT_MS = 2200;

export default function CampPage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const successAlertRef = useRef<HTMLDivElement>(null);
  /** Увеличивается при каждом успешном сохранении, чтобы повторно запустить скролл и анимацию */
  const [successPulse, setSuccessPulse] = useState(0);
  const [showSuccessRing, setShowSuccessRing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [registration, setRegistration] = useState<CampRegistration | null>(
    null
  );
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    city: "",
    username: "",
  });

  const loadRegistration = async () => {
    try {
      const { data } = await api.get<CampRegistration | null>("/camp/me");
      setRegistration(data);
      if (data) {
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          phone: maskRuPhoneInput(data.phone || ""),
          email: data.email || "",
          city: data.city || "",
          username: displayUsername(data.user?.username),
        });
      } else if (user) {
        setFormData({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          phone: maskRuPhoneInput(user.phone || ""),
          email: user.email || "",
          city: user.city || "",
          username: displayUsername(user.username),
        });
      }
    } catch (e) {
      console.error("Failed to load camp registration:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadRegistration();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load when user id available
  }, [user?.id]);

  useEffect(() => {
    if (!user || registration) return;
    setFormData((prev) => ({
      ...prev,
      firstName: prev.firstName || user.firstName || "",
      lastName: prev.lastName || user.lastName || "",
      phone: prev.phone || maskRuPhoneInput(user.phone || ""),
      email: prev.email || user.email || "",
      city: prev.city || user.city || "",
      username: prev.username || displayUsername(user.username),
    }));
  }, [user, registration]);

  useEffect(() => {
    if (successPulse === 0) return;
    let cancelled = false;
    let rafAttempts = 0;
    const maxRafAttempts = 40;
    setShowSuccessRing(true);
    const scrollToSuccess = () => {
      if (cancelled) return;
      const el = successAlertRef.current;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      rafAttempts += 1;
      if (rafAttempts < maxRafAttempts) requestAnimationFrame(scrollToSuccess);
    };
    requestAnimationFrame(() => requestAnimationFrame(scrollToSuccess));
    const t = window.setTimeout(() => {
      if (!cancelled) setShowSuccessRing(false);
    }, SUCCESS_HIGHLIGHT_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [successPulse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) return;
    if (parseRuPhoneDigits(formData.phone).length !== RU_PHONE_DIGITS) {
      alert("Введите полный номер телефона в формате +7-999-999-99-99");
      return;
    }
    try {
      setSaving(true);
      await api.put("/camp/me", {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: ruPhoneForApi(formData.phone),
        email: formData.email.trim(),
        city: formData.city.trim(),
        username: formData.username.trim() || null,
      });
      await refreshUser();
      await loadRegistration();
      setSuccessPulse((n) => n + 1);
    } catch (err) {
      console.error(err);
      alert("Не удалось сохранить заявку. Проверьте поля и попробуйте снова.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const hasRegistration = !!registration;

  return (
    <div className="container mx-auto p-4 pb-24 max-w-lg">
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Tent className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold">Camp</h1>
        </div>
        <span className="text-sm text-muted-foreground">
          Оставь заявку и получи <b>1000₽ бонусов</b> + доступ к первым путёвкам
          за полцены!
        </span>
      </div>

      {hasRegistration && (
        <Alert
          ref={successAlertRef}
          id="camp-registration-success"
          variant="success"
          className={cn(
            "mb-4 scroll-mt-24 transition-[box-shadow,transform] duration-700 ease-out motion-reduce:transition-none",
            showSuccessRing &&
              "shadow-lg ring-2 ring-success ring-offset-2 ring-offset-background motion-safe:scale-[1.02]"
          )}
        >
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Заявка принята</AlertTitle>
          <AlertDescription>
            Вы зарегистрированы на лагерь. Ниже можно изменить данные и
            сохранить снова.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="camp-firstName">Имя</Label>
          <Input
            id="camp-firstName"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            placeholder="Имя"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="camp-lastName">Фамилия</Label>
          <Input
            id="camp-lastName"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            placeholder="Фамилия"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="camp-phone">Телефон</Label>
          <Input
            id="camp-phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData({
                ...formData,
                phone: maskRuPhoneInput(e.target.value),
              })
            }
            placeholder="+7-999-999-99-99"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="camp-email">Email</Label>
          <Input
            id="camp-email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="email@example.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="camp-city">Город</Label>
          <Input
            id="camp-city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="Город"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="camp-telegram">Телеграм ник</Label>
          <Input
            id="camp-telegram"
            value={formData.username}
            onChange={(e) =>
              setFormData({
                ...formData,
                username: displayUsername(e.target.value),
              })
            }
            placeholder="username"
          />
          <p className="text-xs text-muted-foreground">
            Без @; сохраняется в вашем профиле как Telegram username
          </p>
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={saving}>
          {saving
            ? "Отправка..."
            : hasRegistration
              ? "Сохранить изменения"
              : "Отправить заявку"}
        </Button>
      </form>
    </div>
  );
}
