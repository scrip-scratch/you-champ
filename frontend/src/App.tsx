import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Header from "./components/Header";
import BottomNavigation from "./components/BottomNavigation";
import ProfilePage from "./pages/ProfilePage";
import EventsPage from "./pages/EventsPage";
import EventDetailPage from "./pages/EventDetailPage";
import ParticipantsPage from "./pages/admin/ParticipantsPage";
import ParticipantDetailPage from "./pages/admin/ParticipantDetailPage";
import EventsAdminPage from "./pages/admin/EventsAdminPage";
import SourcesAdminPage from "./pages/admin/SourcesAdminPage";
import MarketingPage from "./pages/admin/MarketingPage";

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Добро пожаловать!</h1>
          <p className="text-muted-foreground">
            Пожалуйста, откройте приложение через Telegram бота
          </p>
        </div>
      </div>
    );
  }

  const isAdmin = user.role === "admin";

  return (
    <>
      <Header />
      <main className="pb-16">
        <Routes>
          {/* Common routes */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />

          {/* Admin routes */}
          {isAdmin && (
            <>
              <Route
                path="/admin/participants"
                element={<ParticipantsPage />}
              />
              <Route
                path="/admin/participants/:id"
                element={<ParticipantDetailPage />}
              />
              <Route path="/admin/events" element={<EventsAdminPage />} />
              <Route path="/admin/sources" element={<SourcesAdminPage />} />
              <Route path="/admin/marketing" element={<MarketingPage />} />
            </>
          )}

          {/* Default redirect based on role */}
          <Route path="*" element={<Navigate to="/profile" replace />} />
        </Routes>
      </main>
      <BottomNavigation />
    </>
  );
}

function App() {
  const [_tg, setTg] = useState<any>(null);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      if (tg.disableVerticalSwipes) {
        tg.disableVerticalSwipes();
      }
      setTg(tg);

      console.log("Telegram WebApp initialized");
      console.log("InitData available:", !!tg.initData);
      console.log("InitData length:", tg.initData?.length);
    } else {
      console.warn("Telegram WebApp not available - running in browser mode");
    }
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
