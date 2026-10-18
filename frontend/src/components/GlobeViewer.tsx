import React, { useEffect, useRef, useState } from 'react';
import * as Cesium from 'cesium';
import {
  Layers,
  Compass,
  Plus,
  Minus,
  RotateCcw,
  Eye,
  Crosshair,
  Satellite,
  Shield,
  Wind,
  Flame,
  Activity,
  Sparkles
} from 'lucide-react';
import type { ForestRegion, FirmsThermalAnomaly, ActiveLayers } from '../types';

export type BasemapMode = 'satellite' | 'hybrid' | 'topo' | 'dark';

interface GlobeViewerProps {
  forests: ForestRegion[];
  hotspots: FirmsThermalAnomaly[];
  activeLayers: ActiveLayers;
  selectedRegionCode: string | null;
  onSelectRegion: (code: string) => void;
  viewerRefCallback?: (viewer: Cesium.Viewer | null) => void;
}

// Protected Reserves & Sanctuaries with accurate geospatial coordinates
const PROTECTED_RESERVES = [
  {
    id: "PA-TAPAJOS",
    code: "AMZ-BR-01",
    name: "Tapajós National Forest & Indigenous Reserve",
    designation: "IUCN VI // MANAGED CONSERVATION RESERVE",
    country: "Brazil",
    lon: -55.0,
    lat: -3.2,
    polygon: [
      [-56.2, -2.5], [-54.2, -2.7], [-54.4, -4.5], [-56.5, -4.3], [-56.2, -2.5]
    ]
  },
  {
    id: "PA-VIRUNGA",
    code: "CGO-DRC-02",
    name: "Virunga National Park",
    designation: "UNESCO WORLD HERITAGE SITE",
    country: "DR Congo",
    lon: 29.5,
    lat: -0.6,
    polygon: [
      [29.0, 0.4], [30.1, 0.2], [29.9, -1.5], [29.1, -1.3], [29.0, 0.4]
    ]
  },
  {
    id: "PA-SALONGA",
    code: "CGO-DRC-02",
    name: "Salonga Peatland Reserve",
    designation: "IUCN II // PEATLAND REFUGE",
    country: "DR Congo",
    lon: 21.5,
    lat: -2.0,
    polygon: [
      [19.8, -0.8], [22.8, -1.0], [22.5, -3.2], [19.6, -3.0], [19.8, -0.8]
    ]
  },
  {
    id: "PA-LEUSER",
    code: "BOR-IDN-03",
    name: "Gunung Leuser Peatland Sanctuary",
    designation: "UNESCO BIOSPHERE // TROPICAL RAINFOREST",
    country: "Indonesia",
    lon: 97.5,
    lat: 3.5,
    polygon: [
      [96.7, 2.8], [98.4, 3.0], [98.2, 4.3], [96.6, 4.1], [96.7, 2.8]
    ]
  },
  {
    id: "PA-BANDIPUR",
    code: "WGH-IND-06",
    name: "Bandipur-Nagarhole Tiger Reserve",
    designation: "PROJECT TIGER // UNESCO BIOSPHERE",
    country: "India",
    lon: 76.6,
    lat: 11.6,
    polygon: [
      [76.0, 11.2], [77.2, 11.3], [77.1, 12.2], [75.9, 12.0], [76.0, 11.2]
    ]
  },
  {
    id: "PA-YASUNI",
    code: "AMZ-BR-01",
    name: "Yasuní Biosphere Reserve",
    designation: "UNESCO BIOSPHERE RESERVE",
    country: "Ecuador / Amazon Frontier",
    lon: -76.0,
    lat: -1.0,
    polygon: [
      [-77.0, -0.4], [-75.2, -0.5], [-75.3, -1.9], [-76.9, -1.8], [-77.0, -0.4]
    ]
  },
  {
    id: "PA-VALDIVIA",
    code: "VAL-CHL-05",
    name: "Valdivian Coastal Reserve",
    designation: "IUCN IV // TEMPERATE BIOSPHERE",
    country: "Chile",
    lon: -73.6,
    lat: -40.0,
    polygon: [
      [-74.1, -39.5], [-73.0, -39.6], [-73.1, -40.6], [-74.2, -40.5], [-74.1, -39.5]
    ]
  },
  {
    id: "PA-DAINTREE",
    code: "DAI-AUS-07",
    name: "Daintree Rainforest National Park",
    designation: "UNESCO WORLD HERITAGE AREA",
    country: "Australia",
    lon: 145.4,
    lat: -16.1,
    polygon: [
      [144.9, -15.6], [145.8, -15.7], [145.7, -16.7], [144.8, -16.6], [144.9, -15.6]
    ]
  }
];

export const GlobeViewer: React.FC<GlobeViewerProps> = ({
  forests,
  hotspots,
  activeLayers,
  selectedRegionCode,
  onSelectRegion,
  viewerRefCallback
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);

  // Entity Tracking Refs
  const forestEntitiesRef = useRef<{ [code: string]: Cesium.Entity }>({});
  const hotspotEntitiesRef = useRef<Cesium.Entity[]>([]);
  const protectedEntitiesRef = useRef<Cesium.Entity[]>([]);
  const weatherEntitiesRef = useRef<Cesium.Entity[]>([]);
  const vegetationEntitiesRef = useRef<Cesium.Entity[]>([]);
  const riskEntitiesRef = useRef<Cesium.Entity[]>([]);

  // Imagery Layer Tracking Refs
  const boundariesLayerRef = useRef<Cesium.ImageryLayer | null>(null);
  const weatherImageryLayerRef = useRef<Cesium.ImageryLayer | null>(null);

  const [currentBasemap, setCurrentBasemap] = useState<BasemapMode>('satellite');
  const [showBasemapMenu, setShowBasemapMenu] = useState<boolean>(false);
  const [is3DMode, setIs3DMode] = useState<boolean>(true);
  const [telemetryCoords, setTelemetryCoords] = useState<{ lat: string; lon: string; alt: string }>({
    lat: '03°28\'N',
    lon: '62°13\'W',
    alt: '16,500 km'
  });

  // Helper to create imagery provider by basemap mode
  const createImageryProvider = (mode: BasemapMode): Cesium.ImageryProvider => {
    switch (mode) {
      case 'satellite':
      case 'hybrid':
        return new Cesium.UrlTemplateImageryProvider({
          url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          maximumLevel: 19,
          credit: '© Esri, Maxar, Earthstar Geographics, CNES/Airbus DS, USGS, AeroGRID, IGN'
        });
      case 'topo':
        return new Cesium.UrlTemplateImageryProvider({
          url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
          maximumLevel: 19,
          credit: '© Esri, HERE, Garmin, Intermap, increment P Corp.'
        });
      case 'dark':
        return new Cesium.UrlTemplateImageryProvider({
          url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
          maximumLevel: 16,
          credit: '© Esri, HERE, Garmin, © OpenStreetMap contributors'
        });
    }
  };

  // 1. Initialize Cesium Viewer with Photorealistic Satellite Earth
  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return;

    const baseImageryProvider = createImageryProvider('satellite');

    const viewer = new Cesium.Viewer(containerRef.current, {
      baseLayer: new Cesium.ImageryLayer(baseImageryProvider),
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: false,
      navigationHelpButton: false,
      animation: false,
      shouldAnimate: true,
      fullscreenButton: false,
      skyAtmosphere: new Cesium.SkyAtmosphere(),
      contextOptions: {
        webgl: {
          alpha: true,
          preserveDrawingBuffer: true
        }
      }
    });

    // Reference Layer: National Boundaries and Labels
    const boundariesProvider = new Cesium.UrlTemplateImageryProvider({
      url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      maximumLevel: 19,
      credit: '© Esri, HERE, Garmin, OpenStreetMap'
    });
    const boundariesLayer = viewer.imageryLayers.addImageryProvider(boundariesProvider);
    boundariesLayer.alpha = 0.65;
    boundariesLayerRef.current = boundariesLayer;

    // Visual Settings
    viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#0B1E2D');
    viewer.scene.globe.showGroundAtmosphere = true;
    viewer.scene.globe.enableLighting = false;
    viewer.scene.globe.depthTestAgainstTerrain = false;

    if (viewer.scene.skyAtmosphere) {
      viewer.scene.skyAtmosphere.show = true;
      viewer.scene.skyAtmosphere.hueShift = -0.02;
      viewer.scene.skyAtmosphere.saturationShift = 0.25;
      viewer.scene.skyAtmosphere.brightnessShift = 0.20;
    }

    // Centered on Amazon / Tropical Belt
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(-50.0, -4.0, 15000000.0),
      orientation: {
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(-85.0),
        roll: 0.0
      },
      duration: 2.0
    });

    // Click handler for picking entities
    const clickHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    clickHandler.setInputAction((click: any) => {
      const pickedObject = viewer.scene.pick(click.position);
      if (Cesium.defined(pickedObject) && pickedObject.id) {
        const entity = pickedObject.id;
        const code = entity.properties?.regionCode?.getValue();
        if (code) {
          onSelectRegion(code);
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // Mouse movement telemetry tracker
    const moveHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    moveHandler.setInputAction((movement: any) => {
      const ray = viewer.camera.getPickRay(movement.endPosition);
      if (!ray) return;
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
      if (cartesian) {
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        const lat = Cesium.Math.toDegrees(cartographic.latitude);
        const lon = Cesium.Math.toDegrees(cartographic.longitude);
        const heightKm = Math.round(viewer.camera.positionCartographic.height / 1000);

        const latDMS = `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? 'N' : 'S'}`;
        const lonDMS = `${Math.abs(lon).toFixed(2)}° ${lon >= 0 ? 'E' : 'W'}`;
        const altStr = `${heightKm.toLocaleString()} km`;

        setTelemetryCoords({ lat: latDMS, lon: lonDMS, alt: altStr });
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    viewerRef.current = viewer;
    if (viewerRefCallback) viewerRefCallback(viewer);

    return () => {
      clickHandler.destroy();
      moveHandler.destroy();
      viewer.destroy();
      viewerRef.current = null;
      if (viewerRefCallback) viewerRefCallback(null);
    };
  }, []);

  // 2. Basemap Switcher Handler
  const handleBasemapChange = (mode: BasemapMode) => {
    setCurrentBasemap(mode);
    setShowBasemapMenu(false);
    const viewer = viewerRef.current;
    if (!viewer) return;

    while (viewer.imageryLayers.length > 0) {
      viewer.imageryLayers.remove(viewer.imageryLayers.get(0));
    }

    const newBase = viewer.imageryLayers.addImageryProvider(createImageryProvider(mode));
    viewer.imageryLayers.lowerToBottom(newBase);

    if (mode === 'satellite' || mode === 'hybrid') {
      const boundariesProvider = new Cesium.UrlTemplateImageryProvider({
        url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        maximumLevel: 19,
        credit: '© Esri, HERE, Garmin, OpenStreetMap'
      });
      const boundLayer = viewer.imageryLayers.addImageryProvider(boundariesProvider);
      boundLayer.alpha = mode === 'hybrid' ? 0.90 : 0.65;
      boundariesLayerRef.current = boundLayer;
    }

    // Re-attach weather layer if active
    if (activeLayers.weatherOverlay) {
      attachWeatherLayer(viewer);
    }
  };

  // Weather radar tile helper
  const attachWeatherLayer = (viewer: Cesium.Viewer) => {
    if (weatherImageryLayerRef.current) {
      viewer.imageryLayers.remove(weatherImageryLayerRef.current);
      weatherImageryLayerRef.current = null;
    }
    const weatherProvider = new Cesium.UrlTemplateImageryProvider({
      url: 'https://tilecache.rainviewer.com/v2/radar/nowcast_512/{z}/{x}/{y}/2/1_1.png',
      maximumLevel: 10,
      credit: 'RainViewer Global Precipitation Radar'
    });
    const layer = viewer.imageryLayers.addImageryProvider(weatherProvider);
    layer.alpha = 0.65;
    weatherImageryLayerRef.current = layer;
  };

  const removeWeatherLayer = (viewer: Cesium.Viewer) => {
    if (weatherImageryLayerRef.current) {
      viewer.imageryLayers.remove(weatherImageryLayerRef.current);
      weatherImageryLayerRef.current = null;
    }
  };

  // 3. LAYER: Day/Night Solar Terminator Lighting
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const isNightOn = !!activeLayers.nightAtmosphere;
    viewer.scene.globe.enableLighting = isNightOn;
    viewer.scene.globe.dynamicAtmosphereLighting = isNightOn;
  }, [activeLayers.nightAtmosphere]);

  // 4. LAYER: Real Weather Radar & 3D Wind Vector Streamlines
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    // Clear old vector entities
    weatherEntitiesRef.current.forEach((ent) => viewer.entities.remove(ent));
    weatherEntitiesRef.current = [];

    const isWeatherOn = !!activeLayers.weatherOverlay;
    if (isWeatherOn) {
      attachWeatherLayer(viewer);

      // Render 3D wind velocity vector arrows & atmospheric telemetry beacons at regional nodes
      forests.forEach((forest) => {
        const windSpeed = 8.5 + (Math.abs(forest.latitude) % 7.5);
        const windHeading = (Math.abs(forest.longitude * 3) % 360);

        const vectorEntity = viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(forest.longitude + 1.2, forest.latitude + 0.8, 55000.0),
          label: {
            text: `💨 ${windSpeed.toFixed(1)} km/h • ${windHeading.toFixed(0)}°\nRH: 68% // SAT: 1.4 kPa`,
            font: 'bold 9px "JetBrains Mono", monospace',
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            fillColor: Cesium.Color.fromCssColorString('#20F5D4'),
            outlineColor: Cesium.Color.fromCssColorString('#020B09'),
            outlineWidth: 3,
            pixelOffset: new Cesium.Cartesian2(0, -10),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 18000000.0)
          },
          point: {
            pixelSize: 8,
            color: Cesium.Color.fromCssColorString('#20F5D4'),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 1.5,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          }
        });
        weatherEntitiesRef.current.push(vectorEntity);
      });
    } else {
      removeWeatherLayer(viewer);
    }
  }, [activeLayers.weatherOverlay, forests]);

  // 5. LAYER: Forest Boundaries & 3D Extrusions
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    Object.values(forestEntitiesRef.current).forEach((ent) => viewer.entities.remove(ent));
    forestEntitiesRef.current = {};

    const showBoundaries = activeLayers.forestBoundaries ?? activeLayers.forestCanopy ?? true;
    if (!showBoundaries) return;

    forests.forEach((forest) => {
      const isSelected = forest.code === selectedRegionCode;
      let fillColor = Cesium.Color.fromCssColorString('#00E5A0').withAlpha(0.22);
      let outlineColor = Cesium.Color.fromCssColorString('#00E5A0');

      if (forest.critical_threshold >= 68.0 || forest.canopy_loss_pct > 25.0) {
        fillColor = Cesium.Color.fromCssColorString('#EF4444').withAlpha(0.28);
        outlineColor = Cesium.Color.fromCssColorString('#EF4444');
      } else if (forest.critical_threshold >= 60.0) {
        fillColor = Cesium.Color.fromCssColorString('#F97316').withAlpha(0.24);
        outlineColor = Cesium.Color.fromCssColorString('#F97316');
      }

      if (isSelected) {
        outlineColor = Cesium.Color.fromCssColorString('#20F5D4');
      }

      // 3D Extruded Biome Volume
      if (forest.coordinates_polygon && forest.coordinates_polygon.length > 2) {
        const degreesArray: number[] = [];
        forest.coordinates_polygon.forEach(([lon, lat]) => {
          degreesArray.push(lon, lat);
        });

        const polygonEntity = viewer.entities.add({
          name: forest.name,
          polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray(degreesArray),
            material: fillColor,
            outline: true,
            outlineColor: outlineColor,
            outlineWidth: isSelected ? 4 : 2,
            height: 1000,
            extrudedHeight: isSelected ? 38000 : 15000
          },
          properties: {
            regionCode: forest.code
          }
        });

        forestEntitiesRef.current[forest.code] = polygonEntity;
      }

      // Tactical Centroid Marker
      const markerEntity = viewer.entities.add({
        name: forest.name,
        position: Cesium.Cartesian3.fromDegrees(forest.longitude, forest.latitude, 42000.0),
        point: {
          pixelSize: isSelected ? 16 : 10,
          color: isSelected ? Cesium.Color.fromCssColorString('#20F5D4') : outlineColor,
          outlineColor: Cesium.Color.fromCssColorString('#020B09'),
          outlineWidth: 2.5,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        },
        label: {
          text: `${forest.name.toUpperCase()}\n[${forest.code}] • ${(forest.area_sqkm / 1000).toFixed(0)}k km²`,
          font: 'bold 10px "JetBrains Mono", monospace',
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          fillColor: isSelected ? Cesium.Color.fromCssColorString('#20F5D4') : Cesium.Color.WHITE,
          outlineColor: Cesium.Color.fromCssColorString('#020B09'),
          outlineWidth: 4,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -14),
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 18000000.0)
        },
        properties: {
          regionCode: forest.code
        }
      });

      forestEntitiesRef.current[`${forest.code}_marker`] = markerEntity;
    });
  }, [forests, activeLayers.forestBoundaries, activeLayers.forestCanopy, selectedRegionCode]);

  // 6. LAYER: Protected Areas (National Parks & Sanctuaries)
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    protectedEntitiesRef.current.forEach((ent) => viewer.entities.remove(ent));
    protectedEntitiesRef.current = [];

    const showProtected = !!activeLayers.protectedAreas;
    if (!showProtected) return;

    PROTECTED_RESERVES.forEach((res) => {
      const degreesArray: number[] = [];
      res.polygon.forEach(([lon, lat]) => degreesArray.push(lon, lat));

      // Golden-Amber / Cyan Protected Envelope
      const paPolygon = viewer.entities.add({
        name: res.name,
        polygon: {
          hierarchy: Cesium.Cartesian3.fromDegreesArray(degreesArray),
          material: Cesium.Color.fromCssColorString('#F59E0B').withAlpha(0.28),
          outline: true,
          outlineColor: Cesium.Color.fromCssColorString('#FBBF24'),
          outlineWidth: 3,
          height: 1500,
          extrudedHeight: 28000
        },
        properties: {
          regionCode: res.code
        }
      });
      protectedEntitiesRef.current.push(paPolygon);

      // Sanctuary Shield Pin Marker
      const paMarker = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(res.lon, res.lat, 48000.0),
        point: {
          pixelSize: 12,
          color: Cesium.Color.fromCssColorString('#F59E0B'),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        },
        label: {
          text: `🛡️ ${res.name.toUpperCase()}\n[${res.designation}]`,
          font: 'bold 9px "JetBrains Mono", monospace',
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          fillColor: Cesium.Color.fromCssColorString('#FDE68A'),
          outlineColor: Cesium.Color.fromCssColorString('#020B09'),
          outlineWidth: 3.5,
          pixelOffset: new Cesium.Cartesian2(0, -14),
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 16000000.0)
        },
        properties: {
          regionCode: res.code
        }
      });
      protectedEntitiesRef.current.push(paMarker);
    });
  }, [activeLayers.protectedAreas]);

  // 7. LAYER: Vegetation Health & NDVI Indices
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    vegetationEntitiesRef.current.forEach((ent) => viewer.entities.remove(ent));
    vegetationEntitiesRef.current = [];

    const showVegetation = !!activeLayers.vegetationHealth;
    if (!showVegetation) return;

    forests.forEach((forest) => {
      const ndvi = Math.max(0.42, 0.88 - (forest.canopy_loss_pct / 55.0));
      const ndviColor = ndvi > 0.75
        ? Cesium.Color.fromCssColorString('#00E5A0')
        : ndvi > 0.60
        ? Cesium.Color.fromCssColorString('#84CC16')
        : Cesium.Color.fromCssColorString('#F97316');

      // NDVI Chlorophyll Density Badge
      const vegTag = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(forest.longitude - 1.5, forest.latitude - 0.8, 46000.0),
        label: {
          text: `🌿 NDVI: ${ndvi.toFixed(2)} // CANOPY: ${(100 - forest.canopy_loss_pct).toFixed(0)}%\nCARBON: ${forest.carbon_stock_mt.toLocaleString()} Mt`,
          font: 'bold 9px "JetBrains Mono", monospace',
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          fillColor: ndviColor,
          outlineColor: Cesium.Color.fromCssColorString('#020B09'),
          outlineWidth: 3,
          pixelOffset: new Cesium.Cartesian2(0, 14),
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 15000000.0)
        },
        point: {
          pixelSize: 8,
          color: ndviColor,
          outlineColor: Cesium.Color.fromCssColorString('#020B09'),
          outlineWidth: 1.5,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        }
      });
      vegetationEntitiesRef.current.push(vegTag);
    });
  }, [activeLayers.vegetationHealth, forests]);

  // 8. LAYER: Environmental Risk Heatmap & Danger Corridors
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    riskEntitiesRef.current.forEach((ent) => viewer.entities.remove(ent));
    riskEntitiesRef.current = [];

    const showRisk = activeLayers.environmentalRisk ?? activeLayers.riskHeatmap ?? true;
    if (!showRisk) return;

    forests.forEach((forest) => {
      const score = forest.critical_threshold ?? 55.0;
      const isCritical = score >= 65.0;
      const isHigh = score >= 58.0;

      const riskColor = isCritical
        ? Cesium.Color.fromCssColorString('#EF4444')
        : isHigh
        ? Cesium.Color.fromCssColorString('#F97316')
        : Cesium.Color.fromCssColorString('#F59E0B');

      // 3D Extruded Danger Column Cylinder
      const cylinder = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(forest.longitude, forest.latitude, (score * 500) / 2),
        cylinder: {
          length: score * 500,
          topRadius: 120000.0,
          bottomRadius: 180000.0,
          material: riskColor.withAlpha(0.28),
          outline: true,
          outlineColor: riskColor,
          outlineWidth: 2
        },
        label: {
          text: `⚠️ RISK ${score.toFixed(0)}/100 [${isCritical ? 'CRITICAL' : isHigh ? 'HIGH ALERT' : 'ELEVATED'}]\n24h Spread: ${(score * 0.22).toFixed(0)}%`,
          font: 'bold 9px "JetBrains Mono", monospace',
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          fillColor: riskColor,
          outlineColor: Cesium.Color.fromCssColorString('#020B09'),
          outlineWidth: 3.5,
          pixelOffset: new Cesium.Cartesian2(0, -22),
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 15000000.0)
        }
      });
      riskEntitiesRef.current.push(cylinder);
    });
  }, [activeLayers.environmentalRisk, activeLayers.riskHeatmap, forests]);

  // 9. LAYER: NASA FIRMS Thermal Hotspots
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    hotspotEntitiesRef.current.forEach((ent) => viewer.entities.remove(ent));
    hotspotEntitiesRef.current = [];

    const showFires = activeLayers.satelliteFires ?? activeLayers.firmsHotspots ?? true;
    if (!showFires) return;

    hotspots.forEach((spot) => {
      const frp = spot.frp_mw || 25.0;
      const pixelSize = Math.min(22, Math.max(9, Math.round(frp / 4.5)));
      const isExtreme = frp > 60.0;

      const fireEntity = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(spot.longitude, spot.latitude, 6000.0),
        point: {
          pixelSize: pixelSize,
          color: Cesium.Color.fromCssColorString(isExtreme ? '#EF4444' : '#F97316'),
          outlineColor: Cesium.Color.fromCssColorString('#FEF08A'),
          outlineWidth: 2,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        },
        description: `NASA FIRMS ${spot.satellite || 'VIIRS'} • FRP: ${frp.toFixed(1)} MW [ACTIVE COMBUSTION]`
      });

      hotspotEntitiesRef.current.push(fireEntity);
    });
  }, [hotspots, activeLayers.firmsHotspots, activeLayers.satelliteFires]);

  // Camera Control Actions
  const handleZoomIn = () => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.camera.zoomIn(viewer.camera.positionCartographic.height * 0.35);
  };

  const handleZoomOut = () => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.camera.zoomOut(viewer.camera.positionCartographic.height * 0.45);
  };

  const handleToggle3D = () => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const currentPitch = Cesium.Math.toDegrees(viewer.camera.pitch);

    if (Math.abs(currentPitch + 90) < 15) {
      viewer.camera.flyTo({
        destination: viewer.camera.position,
        orientation: {
          heading: viewer.camera.heading,
          pitch: Cesium.Math.toRadians(-45.0),
          roll: 0.0
        },
        duration: 1.2
      });
      setIs3DMode(true);
    } else {
      viewer.camera.flyTo({
        destination: viewer.camera.position,
        orientation: {
          heading: viewer.camera.heading,
          pitch: Cesium.Math.toRadians(-89.9),
          roll: 0.0
        },
        duration: 1.2
      });
      setIs3DMode(false);
    }
  };

  const handleResetGlobalView = () => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(-50.0, -4.0, 15000000.0),
      orientation: {
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(-85.0),
        roll: 0.0
      },
      duration: 1.8
    });
  };

  const handleCompassNorth = () => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.camera.flyTo({
      destination: viewer.camera.position,
      orientation: {
        heading: 0.0,
        pitch: viewer.camera.pitch,
        roll: 0.0
      },
      duration: 1.0
    });
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#020B09]">
      {/* Primary Cesium WebGL 3D Globe Canvas */}
      <div id="cesiumContainer" ref={containerRef} className="w-full h-full" />

      {/* Subtle Central Targeting Reticle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 opacity-30">
        <div className="w-12 h-12 border border-[#00E5A0]/40 rounded-full flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-[#00E5A0] rounded-full" />
        </div>
      </div>

      {/* Floating Tactical Coordinate Telemetry Bar (Positioned Cleanly at Top-Center) */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-3 px-4 py-1.5 rounded-full bg-[#020B09]/90 backdrop-blur-md border border-[#00E5A0]/25 text-[10px] font-mono text-slate-300 shadow-glass pointer-events-none select-none">
        <span className="flex items-center space-x-1.5 text-[#00E5A0]">
          <Crosshair className="w-3.5 h-3.5 animate-pulse" />
          <span className="text-slate-400">TARGET:</span>
          <span className="font-bold text-white">{telemetryCoords.lat}, {telemetryCoords.lon}</span>
        </span>
        <span className="text-slate-600">|</span>
        <span className="text-slate-300">
          ALT: <span className="font-semibold text-[#20F5D4]">{telemetryCoords.alt}</span>
        </span>
        <span className="text-slate-600">|</span>
        <span className="text-slate-400">
          IMAGERY: <span className="text-[#00E5A0] font-semibold uppercase">{currentBasemap}</span>
        </span>
      </div>

      {/* Floating Camera & Basemap Control Cluster (Bottom-Right) */}
      <div className="absolute bottom-6 right-4 lg:right-6 z-20 flex flex-col items-end space-y-2 select-none">
        {/* Basemap Selection Flyout Menu */}
        {showBasemapMenu && (
          <div className="p-2 mb-1 w-52 rounded-xl bg-[#041410]/95 backdrop-blur-md border border-[#00E5A0]/30 shadow-glass space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-2 py-1 border-b border-slate-800">
              Orbital Imagery Sensor
            </div>

            <button
              onClick={() => handleBasemapChange('satellite')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                currentBasemap === 'satellite'
                  ? 'bg-[#00E5A0]/20 text-[#00E5A0] border border-[#00E5A0]/40'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <span className="flex items-center space-x-2">
                <Satellite className="w-3.5 h-3.5 text-[#00E5A0]" />
                <span>True Satellite (Real)</span>
              </span>
              {currentBasemap === 'satellite' && <span className="w-1.5 h-1.5 rounded-full bg-[#00E5A0]" />}
            </button>

            <button
              onClick={() => handleBasemapChange('hybrid')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                currentBasemap === 'hybrid'
                  ? 'bg-[#00E5A0]/20 text-[#00E5A0] border border-[#00E5A0]/40'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <span className="flex items-center space-x-2">
                <Layers className="w-3.5 h-3.5 text-[#20F5D4]" />
                <span>Satellite + Boundaries</span>
              </span>
              {currentBasemap === 'hybrid' && <span className="w-1.5 h-1.5 rounded-full bg-[#20F5D4]" />}
            </button>

            <button
              onClick={() => handleBasemapChange('topo')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                currentBasemap === 'topo'
                  ? 'bg-[#00E5A0]/20 text-[#00E5A0] border border-[#00E5A0]/40'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <span className="flex items-center space-x-2">
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>World Topo Elevation</span>
              </span>
              {currentBasemap === 'topo' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
            </button>

            <button
              onClick={() => handleBasemapChange('dark')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                currentBasemap === 'dark'
                  ? 'bg-[#00E5A0]/20 text-[#00E5A0] border border-[#00E5A0]/40'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded-full bg-slate-800 border border-slate-600 inline-block" />
                <span>Tactical Dark Radar</span>
              </span>
              {currentBasemap === 'dark' && <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />}
            </button>
          </div>
        )}

        {/* Primary Controls Floating Column */}
        <div className="flex flex-col space-y-1.5 p-1 rounded-xl bg-[#020B09]/85 backdrop-blur-md border border-[#00E5A0]/25 shadow-glass">
          {/* Basemap Toggle Trigger */}
          <button
            onClick={() => setShowBasemapMenu(!showBasemapMenu)}
            className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
              showBasemapMenu
                ? 'bg-[#00E5A0]/25 text-[#00E5A0] border border-[#00E5A0]/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
            title="Switch Orbital Basemap"
          >
            <Satellite className="w-4 h-4 text-[#00E5A0]" />
          </button>

          {/* Compass North Reset */}
          <button
            onClick={handleCompassNorth}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-lg transition-colors flex items-center justify-center"
            title="Align North"
          >
            <Compass className="w-4 h-4 text-slate-300 hover:text-[#20F5D4]" />
          </button>

          {/* 3D Oblique / 2D Nadir Toggle */}
          <button
            onClick={handleToggle3D}
            className={`p-2 rounded-lg transition-colors flex items-center justify-center font-mono text-[10px] font-bold ${
              is3DMode
                ? 'text-[#20F5D4] bg-[#20F5D4]/15'
                : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
            }`}
            title="Toggle 3D Oblique Perspective"
          >
            3D
          </button>

          {/* Zoom In */}
          <button
            onClick={handleZoomIn}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-lg transition-colors flex items-center justify-center"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Zoom Out */}
          <button
            onClick={handleZoomOut}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-lg transition-colors flex items-center justify-center"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>

          {/* Reset Global Equatorial View */}
          <button
            onClick={handleResetGlobalView}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-lg transition-colors flex items-center justify-center"
            title="Reset Planetary View"
          >
            <RotateCcw className="w-4 h-4 text-[#00E5A0]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobeViewer;
