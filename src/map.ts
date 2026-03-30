import { Place, CATEGORY_COLORS, corridors, Corridor } from './data';

declare const L: any;
import { getLang } from './i18n';

let map: any;
let clusterGroup: any;
let corridorLayers: any;
let selectedMarker: any = null;
let corridorsVisible = false;

const MARKER_RADIUS = 10;
const MARKER_RADIUS_SELECTED = 14;

export function initMap(): any {
  map = L.map('map', {
    center: [34.05, -118.14],
    zoom: 12,
    zoomControl: false,
    attributionControl: false,
  });

  // Add zoom control to bottom-right on desktop
  L.control.zoom({ position: 'bottomright' }).addTo(map);

  // Attribution bottom-left
  L.control.attribution({ position: 'bottomleft', prefix: false })
    .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>')
    .addTo(map);

  // Clean, light tile style
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    subdomains: 'abcd',
  }).addTo(map);

  // Initialize marker cluster group
  clusterGroup = L.markerClusterGroup({
    maxClusterRadius: 40,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    disableClusteringAtZoom: 14,
    iconCreateFunction: (cluster: any) => {
      const count = cluster.getChildCount();
      let size = 'small';
      if (count >= 20) size = 'large';
      else if (count >= 10) size = 'medium';
      return L.divIcon({
        html: `<div>${count}</div>`,
        className: `marker-cluster marker-cluster-${size}`,
        iconSize: L.point(40, 40),
      });
    },
  });
  map.addLayer(clusterGroup);

  corridorLayers = L.layerGroup();

  return map;
}

export function setMapView(lat: number, lng: number, zoom: number): void {
  map.setView([lat, lng], zoom, { animate: true });
}

export function renderMarkers(places: Place[], onClickPlace: (place: Place) => void): void {
  clusterGroup.clearLayers();

  places.forEach(place => {
    const color = CATEGORY_COLORS[place.category] || '#6B7280';
    const marker = L.circleMarker([place.lat, place.lng], {
      radius: MARKER_RADIUS,
      fillColor: color,
      fillOpacity: 0.85,
      color: '#fff',
      weight: 2,
      className: 'place-marker',
    });

    const lang = getLang();
    const label = lang === 'zh' ? place.name_zh : place.name_en;
    marker.bindTooltip(label, {
      direction: 'top',
      offset: [0, -8],
      className: 'place-tooltip',
    });

    marker.on('click', () => {
      selectMarker(marker);
      onClickPlace(place);
    });

    (marker as any)._placeId = place.id;
    clusterGroup.addLayer(marker);
  });
}

function selectMarker(marker: any): void {
  deselectMarker();
  selectedMarker = marker;
  marker.setRadius(MARKER_RADIUS_SELECTED);
  marker.setStyle({ weight: 3, color: '#1E293B' });
  marker.bringToFront();

  // Bounce animation
  const el = marker.getElement?.();
  if (el) {
    el.classList.remove('pin-selected');
    // Force reflow to restart animation
    void el.offsetWidth;
    el.classList.add('pin-selected');
  }
}

export function deselectMarker(): void {
  if (selectedMarker) {
    selectedMarker.setRadius(MARKER_RADIUS);
    selectedMarker.setStyle({ weight: 2, color: '#fff' });
    const el = selectedMarker.getElement?.();
    if (el) el.classList.remove('pin-selected');
    selectedMarker = null;
  }
}

export function highlightPlaces(placeIds: number[]): void {
  const idSet = new Set(placeIds);
  clusterGroup.eachLayer((layer: any) => {
    if (layer._placeId !== undefined) {
      const isHighlighted = idSet.has(layer._placeId);
      layer.setStyle({
        fillOpacity: isHighlighted ? 1 : 0.25,
        opacity: isHighlighted ? 1 : 0.3,
      });
      if (isHighlighted) {
        layer.setRadius(MARKER_RADIUS + 2);
      } else {
        layer.setRadius(MARKER_RADIUS - 2);
      }
    }
  });
}

export function resetMarkerStyles(): void {
  clusterGroup.eachLayer((layer: any) => {
    if (layer._placeId !== undefined) {
      layer.setStyle({ fillOpacity: 0.85, opacity: 1 });
      layer.setRadius(MARKER_RADIUS);
    }
  });
}

export function fitToPlaces(places: Place[]): void {
  if (places.length === 0) return;
  const bounds = L.latLngBounds(places.map(p => [p.lat, p.lng] as [number, number]));
  map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
}

export function panToPlace(place: Place): void {
  map.setView([place.lat, place.lng], 15, { animate: true });
}

// Transit corridors
export function renderCorridors(onClickCorridor: (corridor: Corridor) => void): void {
  corridorLayers.clearLayers();
  corridors.forEach(corridor => {
    const polyline = L.polyline(corridor.coordinates, {
      color: corridor.color,
      weight: 4,
      opacity: 0.7,
      dashArray: '8 6',
    });
    polyline.on('click', () => onClickCorridor(corridor));
    polyline.bindTooltip(getLang() === 'zh' ? corridor.name_zh : corridor.name_en, {
      sticky: true,
      className: 'corridor-tooltip',
    });
    corridorLayers.addLayer(polyline);
  });
}

export function areCorridorsVisible(): boolean {
  return corridorsVisible;
}

export function toggleCorridors(): boolean {
  corridorsVisible = !corridorsVisible;
  if (corridorsVisible) {
    corridorLayers.addTo(map);
  } else {
    corridorLayers.remove();
  }
  return corridorsVisible;
}

export function showCorridors(): void {
  if (!corridorsVisible) {
    corridorsVisible = true;
    corridorLayers.addTo(map);
  }
}

