import { ReactElement, Suspense, lazy, useEffect, useState } from "react";
import { lazyWithPreload } from "react-lazy-with-preload";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import { convertLegacyUrl, isLegacyUrl } from "@/backend/metadata/getmeta";
import { convertEmbedUrl } from "@/backend/metadata/tmdb";
import { useOnlineListener } from "@/hooks/usePing";
import VideoTesterView from "@/pages/developer/VideoTesterView";
import { Discover } from "@/pages/discover/Discover";
import MaintenancePage from "@/pages/errors/MaintenancePage";
import { NotFoundPage } from "@/pages/errors/NotFoundPage";
import { JipPage } from "@/pages/Jip";
import { Layout } from "@/setup/Layout";
import { useHistoryListener } from "@/stores/history";
import { LanguageProvider } from "@/stores/language";

const DeveloperPage = lazy(() => import("@/pages/DeveloperPage"));
const TestView = lazy(() => import("@/pages/developer/TestView"));
const PlayerView = lazyWithPreload(() => import("@/pages/PlayerView"));
const SettingsPage = lazyWithPreload(() => import("@/pages/Settings"));

PlayerView.preload();
SettingsPage.preload();

function LegacyUrlView({ children }: { children: ReactElement }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const url = location.pathname;
    if (!isLegacyUrl(url)) return;
    convertLegacyUrl(location.pathname).then((convertedUrl) => {
      navigate(convertedUrl ?? "/", { replace: true });
    });
  }, [location.pathname, navigate]);

  if (isLegacyUrl(location.pathname)) return null;
  return children;
}

export const maintenanceTime = "March 31th 11:00 PM - 5:00 AM EST";

function App() {
  useHistoryListener();
  useOnlineListener();
  const maintenance = false; // Shows maintance page
  const [showDowntime, setShowDowntime] = useState(maintenance);

  const handleButtonClick = () => {
    setShowDowntime(false);
  };

  useEffect(() => {
    const sessionToken = sessionStorage.getItem("downtimeToken");
    if (!sessionToken && maintenance) {
      setShowDowntime(true);
      sessionStorage.setItem("downtimeToken", "true");
    }
  }, [setShowDowntime, maintenance]);

  function EmbedRedirectView({ children }: { children: ReactElement }) {
    const { media, seasonNumber, episodeNumber } = useParams<{
      media: string;
      seasonNumber: string;
      episodeNumber: string;
    }>();
    const navigate = useNavigate();

    useEffect(() => {
      if (!media || !seasonNumber || !episodeNumber) return;
      convertEmbedUrl(media, seasonNumber, episodeNumber).then((url) => {
        navigate(url ?? "/", { replace: true });
      });
    }, [media, seasonNumber, episodeNumber, navigate]);

    return children;
  }

  return (
    <Layout>
      <LanguageProvider />
      {!showDowntime && (
        <Routes>
          {/* pages */}
          <Route
            path="/embed/:media"
            element={
              <EmbedRedirectView>
                <Suspense fallback={null}>
                  <PlayerView />
                </Suspense>
              </EmbedRedirectView>
            }
          />
          <Route
            path="/embed/:media/:seasonNumber/:episodeNumber"
            element={
              <EmbedRedirectView>
                <Suspense fallback={null}>
                  <PlayerView />
                </Suspense>
              </EmbedRedirectView>
            }
          />
          <Route
            path="/media/:media"
            element={
              <LegacyUrlView>
                <Suspense fallback={null}>
                  <PlayerView />
                </Suspense>
              </LegacyUrlView>
            }
          />
          <Route
            path="/media/:media/:season/:episode"
            element={
              <LegacyUrlView>
                <Suspense fallback={null}>
                  <PlayerView />
                </Suspense>
              </LegacyUrlView>
            }
          />
          <Route path="/jip" element={<JipPage />} />
          {/* Discover page */}
          <Route path="/discover" element={<Discover />} />
          {/* Settings page */}
          <Route path="/dev" element={<DeveloperPage />} />
          <Route path="/dev/video" element={<VideoTesterView />} />
          {/* developer routes that can abuse workers are disabled in production */}
          {process.env.NODE_ENV === "development" ? (
            <Route path="/dev/test" element={<TestView />} />
          ) : null}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      )}
      {showDowntime && (
        <MaintenancePage onHomeButtonClick={handleButtonClick} />
      )}
    </Layout>
  );
}

export default App;
