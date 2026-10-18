import React, { useState, useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import { GlobeViewer } from './components/GlobeViewer';
import { Header } from './components/Header';
import { LeftControlPanel } from './components/LeftControlPanel';
import { IntelligenceCard } from './components/IntelligenceCard';
import { AlertPanel } from './components/AlertPanel';
import { TimelineSlider } from './components/TimelineSlider';
import { LinuxONEDashboard } from './components/LinuxONEDashboard';
import { BenchmarkModal } from './components/BenchmarkModal';
import { AboutModal } from './components/AboutModal';
import { api } from './services/api';
import { alertStream } from './services/sse';
import type {
  ForestRegion,
  SearchResult,
  EnvironmentalReport,
  RiskAssessment,
  PriorityAlert,
  LinuxONETelemetry,
  ModelBenchmark,
  ActiveLayers,
  FirmsThermalAnomaly,
  ComprehensiveRegionalReport
} from './types';

export const App: React.FC = () => {
  const viewerRef = useRef<Cesium.Viewer | null>(null);

  // Core Data State
  const [forests, setForests] = useState<ForestRegion[]>([]);
  const [hotspots, setHotspots] = useState<FirmsThermalAnomaly[]>([]);
  const [alerts, setAlerts] = useState<PriorityAlert[]>([]);
  const [telemetry, setTelemetry] = useState<LinuxONETelemetry | null>(null);
  const [benchmark, setBenchmark] = useState<ModelBenchmark | null>(null);

  // Selection & Intelligence State
  const [selectedRegion, setSelectedRegion] = useState<ForestRegion | null>(null);
  const [report, setReport] = useState<EnvironmentalReport | null>(null);
  const [risk, setRisk] = useState<RiskAssessment | null>(null);
  const [comprehensiveReport, setComprehensiveReport] = useState<ComprehensiveRegionalReport | null>(null);
  const [isLoadingIntelligence, setIsLoadingIntelligence] = useState<boolean>(false);

  // Modals & Panels Visibility
  const [showTelemetryModal, setShowTelemetryModal] = useState<boolean>(false);
  const [showBenchmarkModal, setShowBenchmarkModal] = useState<boolean>(false);
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false);
  const [showAlertPanel, setShowAlertPanel] = useState<boolean>(true);

  // Connection & Health State
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean>(true);
  const [isStreamConnected, setIsStreamConnected] = useState<boolean>(false);

  // Timeline & Layers
  const [timelineYear, setTimelineYear] = useState<number>(2026);
  const [activeLayers, setActiveLayers] = useState<ActiveLayers>({
    firmsHotspots: true,
    riskHeatmap: true,
    forestCanopy: true,
    weatherOverlay: false,
    nightAtmosphere: false,
    forestBoundaries: true,
    protectedAreas: true,
    satelliteFires: true,
    vegetationHealth: true,
    environmentalRisk: true
  });

  // 1. Initial Data Fetch
  useEffect(() => {
    const initData = async () => {
      try {
        const [regionsData, hotspotsData, alertsData, telemData, benchData] = await Promise.all([
          api.getRegions().catch(() => []),
          api.getGlobalHotspots().catch(() => []),
          api.getAlerts().catch(() => []),
          api.getLinuxONETelemetry().catch(() => null),
          api.getModelBenchmark().catch(() => null)
        ]);

        setForests(regionsData);
        setHotspots(hotspotsData);
        setAlerts(alertsData);
        setTelemetry(telemData);
        setBenchmark(benchData);
        setIsBackendHealthy(true);

        // Auto-select Amazon Rainforest on initial load for instant demonstration
        if (regionsData.length > 0) {
          const defaultRegion = regionsData.find((r) => r.code === 'AMZ-BR-01') || regionsData[0];
          setSelectedRegion(defaultRegion);
          setIsLoadingIntelligence(true);
          Promise.all([
            api.getEnvironmentalData(defaultRegion.code).catch(() => null),
            api.getRiskAssessment(defaultRegion.code).catch(() => null),
            api.getRegionReport(defaultRegion.code).catch(() => null)
          ]).then(([envReport, riskAssessment, compReport]) => {
            if (envReport) setReport(envReport);
            if (riskAssessment) setRisk(riskAssessment);
            if (compReport) setComprehensiveReport(compReport);
          }).finally(() => {
            setIsLoadingIntelligence(false);
          });
        }
      } catch (err) {
        console.warn('Initial backend fetch warning:', err);
        setIsBackendHealthy(false);
      }
    };

    initData();
  }, []);

  // 2. Setup Real-time SSE Stream
  useEffect(() => {
    alertStream.connect();

    const unsubAlert = alertStream.onAlert((newAlert) => {
      setAlerts((prev) => [newAlert, ...prev]);
    });

    const unsubStatus = alertStream.onStatusChange((connected) => {
      setIsStreamConnected(connected);
    });

    return () => {
      unsubAlert();
      unsubStatus();
      alertStream.disconnect();
    };
  }, []);

  // 3. Camera Fly-To Animation Helper
  const flyToCoordinates = (lat: number, lon: number, height: number = 2200000.0) => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(lon, lat, height),
      orientation: {
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(-45.0),
        roll: 0.0
      },
      duration: 1.8,
      easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT
    });
  };

  // 4. Region Selection Handler (Smooth Zoom + Live Report Fetch)
  const handleSelectRegion = async (code: string, shouldFly: boolean = true) => {
    const reg = forests.find((f) => f.code.toLowerCase() === code.toLowerCase());
    if (!reg) return;

    setSelectedRegion(reg);
    setIsLoadingIntelligence(true);

    if (shouldFly) {
      flyToCoordinates(reg.latitude, reg.longitude, 2000000.0);
    }

    try {
      const [envReport, riskAssessment, compReport] = await Promise.all([
        api.getEnvironmentalData(reg.code),
        api.getRiskAssessment(reg.code),
        api.getRegionReport(reg.code).catch(() => null)
      ]);
      setReport(envReport);
      setRisk(riskAssessment);
      setComprehensiveReport(compReport);
    } catch (e) {
      console.error('Error loading region intelligence:', e);
    } finally {
      setIsLoadingIntelligence(false);
    }
  };

  // 5. Search Bar Selection Handler (Biomes, Countries, Coordinates)
  const handleSearchResult = (result: SearchResult) => {
    if (result.type === 'coordinate') {
      flyToCoordinates(result.latitude, result.longitude, 1200000.0);
      const customRegion: ForestRegion = {
        code: result.code || `COORD_${result.latitude.toFixed(2)}`,
        name: result.name,
        country: result.country || 'Target Coordinate Sector',
        biome_type: 'Direct Coordinate Sector',
        latitude: result.latitude,
        longitude: result.longitude,
        area_sqkm: 50000.0,
        canopy_loss_pct: 12.0,
        protected_status: 'Target Observation Sector',
        carbon_stock_mt: 1200.0,
        critical_threshold: 65.0
      };
      setSelectedRegion(customRegion);
    } else if (result.code) {
      handleSelectRegion(result.code, true);
    }
  };

  // 6. Priority Alert Selection Handler
  const handleSelectAlert = (alert: PriorityAlert) => {
    flyToCoordinates(alert.latitude, alert.longitude, 1400000.0);
    if (alert.region_code) {
      handleSelectRegion(alert.region_code, false);
    }
  };

  // 7. Toggle Layers with Bi-directional synchronization
  const handleToggleLayer = (key: keyof ActiveLayers) => {
    setActiveLayers((prev) => {
      const nextVal = !prev[key];
      const updated = { ...prev, [key]: nextVal };

      // Keep alias layer names synchronized
      if (key === 'forestBoundaries') updated.forestCanopy = nextVal;
      if (key === 'forestCanopy') updated.forestBoundaries = nextVal;
      if (key === 'satelliteFires') updated.firmsHotspots = nextVal;
      if (key === 'firmsHotspots') updated.satelliteFires = nextVal;
      if (key === 'environmentalRisk') updated.riskHeatmap = nextVal;
      if (key === 'riskHeatmap') updated.environmentalRisk = nextVal;

      return updated;
    });
  };

  // 8. Navigation Dispatcher from Header
  const handleHeaderNavigate = (tab: 'command' | 'explore' | 'alerts' | 'intelligence' | 'about') => {
    if (tab === 'command') {
      // Reset view to global rainforest belt
      const viewer = viewerRef.current;
      if (viewer) {
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(-30.0, 5.0, 16000000.0),
          orientation: {
            heading: Cesium.Math.toRadians(0.0),
            pitch: Cesium.Math.toRadians(-85.0),
            roll: 0.0
          },
          duration: 2.0
        });
      }
    } else if (tab === 'alerts') {
      setShowAlertPanel((prev) => !prev);
    } else if (tab === 'intelligence') {
      if (!selectedRegion && forests.length > 0) {
        handleSelectRegion(forests[0].code, true);
      }
    } else if (tab === 'about') {
      setShowAboutModal(true);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#020B09] text-slate-100 select-none">
      {/* Cinematic 3D Cesium Globe (Main Planetary Interface — Never Navigates Away) */}
      <GlobeViewer
        forests={forests}
        hotspots={hotspots}
        activeLayers={activeLayers}
        selectedRegionCode={selectedRegion?.code || null}
        onSelectRegion={(code) => handleSelectRegion(code, true)}
        viewerRefCallback={(viewer) => {
          viewerRef.current = viewer;
        }}
      />

      {/* Top Header Command HUD */}
      <Header
        telemetry={telemetry}
        onOpenTelemetry={() => setShowTelemetryModal(true)}
        onOpenBenchmark={() => setShowBenchmarkModal(true)}
        onOpenAbout={() => setShowAboutModal(true)}
        isBackendHealthy={isBackendHealthy}
        activeHotspotsCount={hotspots.length}
        alertsCount={alerts.length}
        selectedRegionName={selectedRegion?.name}
        onNavigate={handleHeaderNavigate}
      />

      {/* Left Floating Control Panel: Search, Map Layers & Severity Legend */}
      <LeftControlPanel
        layers={activeLayers}
        onToggleLayer={handleToggleLayer}
        onSelectResult={handleSearchResult}
        selectedCode={selectedRegion?.code}
        hotspotsCount={hotspots.length}
      />

      {/* Floating Translucent Glassmorphism Regional Intelligence Panel Over Globe */}
      <IntelligenceCard
        region={selectedRegion}
        report={report}
        risk={risk}
        comprehensiveReport={comprehensiveReport}
        isLoading={isLoadingIntelligence}
        onClose={() => setSelectedRegion(null)}
        onFlyToCoord={(lat, lon, height) => flyToCoordinates(lat, lon, height || 250000.0)}
      />

      {/* Live Threat Alert Panel (Ranked, Source, Click-to-Focus) */}
      {showAlertPanel && (
        <AlertPanel
          alerts={alerts}
          onSelectAlert={handleSelectAlert}
          isStreamConnected={isStreamConnected}
        />
      )}

      {/* Historical Timeline Slider (Bottom Center) */}
      <TimelineSlider
        currentYear={timelineYear}
        onYearChange={(y) => setTimelineYear(y)}
      />

      {/* About KAALVAN & Architecture Workflow Modal */}
      {showAboutModal && (
        <AboutModal onClose={() => setShowAboutModal(false)} />
      )}

      {/* IBM LinuxONE Enterprise Architecture Telemetry Modal */}
      {showTelemetryModal && (
        <LinuxONEDashboard
          telemetry={telemetry}
          onClose={() => setShowTelemetryModal(false)}
        />
      )}

      {/* Scikit-Learn Model Benchmark Evaluation Modal */}
      {showBenchmarkModal && (
        <BenchmarkModal
          benchmark={benchmark}
          onClose={() => setShowBenchmarkModal(false)}
        />
      )}
    </div>
  );
};

export default App;
