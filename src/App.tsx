import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ThemeProvider } from "next-themes";
import { AppProvider, useApp } from "@/context/AppContext";
import { LearningProvider } from "@/context/LearningContext";
import { AchievementsProvider } from "@/context/AchievementsContext";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "@/i18n";
const Onboarding = lazy(() => import("@/pages/Onboarding"));
const Home = lazy(() => import("@/pages/Home"));
const Signs = lazy(() => import("@/pages/Signs"));
const Practice = lazy(() => import("@/pages/Practice"));
const Exam = lazy(() => import("@/pages/Exam"));
const Settings = lazy(() => import("@/pages/Settings"));
const Favorites = lazy(() => import("@/pages/Favorites"));
const Stats = lazy(() => import("@/pages/Stats"));
const Learn = lazy(() => import("@/pages/Learn"));
const Achievements = lazy(() => import("@/pages/Achievements"));
const Flashcards = lazy(() => import("@/pages/Flashcards"));
const Credits = lazy(() => import("@/pages/Credits"));
const TrafficViolationPoints = lazy(() => import("@/pages/TrafficViolationPoints"));
const TrafficFinesPenalties = lazy(() => import("@/pages/TrafficFinesPenalties"));
const LicenseGuide = lazy(() => import("@/pages/LicenseGuide"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
    Loading...
  </div>
);

const queryClient = new QueryClient();

// Routes component that uses AppContext - must be inside AppProvider
function AppRoutes() {
  const { hasSeenOnboarding } = useApp();
  
  if (!hasSeenOnboarding) {
    return (
      <Suspense fallback={<RouteFallback />}>
        <Onboarding />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signs" element={<Signs />} />
        <Route path="/flashcards" element={<Flashcards />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/exam" element={<Exam />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/credits" element={<Credits />} />
        <Route path="/violation-points" element={<TrafficViolationPoints />} />
        <Route path="/traffic-fines" element={<TrafficFinesPenalties />} />
        <Route path="/license-guide" element={<LicenseGuide />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

// App content with all providers in correct order
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <AppProvider>
            <AchievementsProvider>
              <LearningProvider>
                <Toaster />
                <Sonner />
                <OfflineIndicator />
                <PWAInstallPrompt />
                <ErrorBoundary>
                  <BrowserRouter>
                    <AppRoutes />
                  </BrowserRouter>
                </ErrorBoundary>
              </LearningProvider>
            </AchievementsProvider>
          </AppProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
