import { Place, CATEGORY_COLORS, Corridor } from './data';
import { t, getLang } from './i18n';

let sidebarEl: HTMLElement;
let overlayEl: HTMLElement;
let isOpen = false;
let onClose: (() => void) | null = null;

// Touch handling for bottom sheet
let touchStartY = 0;
let touchCurrentY = 0;
let isDragging = false;

export function initSidebar(closeCallback: () => void): void {
  onClose = closeCallback;
  sidebarEl = document.getElementById('sidebar')!;
  overlayEl = document.getElementById('sidebar-overlay')!;
  overlayEl.addEventListener('click', closeSidebar);
}

function bindSidebarEvents(): void {
  sidebarEl.querySelector('.sidebar-close')?.addEventListener('click', closeSidebar);
  const handle = sidebarEl.querySelector('.sidebar-handle');
  if (handle) {
    (handle as HTMLElement).addEventListener('touchstart', onTouchStart as EventListener, { passive: true });
    (handle as HTMLElement).addEventListener('touchmove', onTouchMove as EventListener, { passive: false });
    handle.addEventListener('touchend', onTouchEnd);
  }
}

function onTouchStart(e: any): void {
  touchStartY = e.touches[0].clientY;
  isDragging = true;
  sidebarEl.style.transition = 'none';
}

function onTouchMove(e: any): void {
  if (!isDragging) return;
  touchCurrentY = e.touches[0].clientY;
  const diff = touchCurrentY - touchStartY;
  if (diff > 0) {
    sidebarEl.style.transform = `translateY(${diff}px)`;
    e.preventDefault();
  }
}

function onTouchEnd(): void {
  if (!isDragging) return;
  isDragging = false;
  sidebarEl.style.transition = '';
  const diff = touchCurrentY - touchStartY;
  if (diff > 120) {
    closeSidebar();
  } else {
    sidebarEl.style.transform = '';
  }
  touchStartY = 0;
  touchCurrentY = 0;
}

export function openPlace(place: Place): void {
  const lang = getLang();
  const color = CATEGORY_COLORS[place.category] || '#6B7280';
  const catLabel = t('cat.' + place.category);
  const stageLabel = t('stage.' + place.need_stage);

  const languageTags = place.languages.map(l => `<span class="lang-tag">${t('lang.' + l)}</span>`).join('');

  // Build metadata section
  let metaHtml = '';
  if (place.metadata) {
    const entries = Object.entries(place.metadata).filter(([k]) =>
      !['type', 'chain'].includes(k)
    );
    if (entries.length) {
      metaHtml = `<div class="meta-grid">${entries.map(([k, v]) => `
        <div class="meta-item">
          <span class="meta-label">${formatMetaKey(k)}</span>
          <span class="meta-value">${v}</span>
        </div>
      `).join('')}</div>`;
    }
  }

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;

  sidebarEl.innerHTML = `
    <div class="sidebar-handle"><div class="handle-bar"></div></div>
    <div class="sidebar-content">
      <button class="sidebar-close" aria-label="${t('sidebar.close')}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>

      <div class="place-header">
        <span class="cat-badge" style="background: ${color}">${catLabel}</span>
        <span class="stage-badge">${stageLabel}</span>
      </div>

      <h2 class="place-name-zh">${place.name_zh}</h2>
      <h3 class="place-name-en">${place.name_en}</h3>

      <p class="place-address">${place.address}</p>

      <div class="place-section">
        <h4>${t('sidebar.languages')}</h4>
        <div class="lang-tags">${languageTags}</div>
      </div>

      <div class="place-section">
        <h4>${t('sidebar.transit')}</h4>
        <p class="transit-status ${place.transit_accessible ? 'accessible' : 'not-accessible'}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
            ${place.transit_accessible
              ? '<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>'
              : '<path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>'}
          </svg>
          ${place.transit_accessible ? t('sidebar.transit_yes') : t('sidebar.transit_no')}
        </p>
        ${place.nearest_transit ? `<p class="nearest-transit">${t('sidebar.nearest_transit')}: ${place.nearest_transit}</p>` : ''}
      </div>

      ${metaHtml ? `<div class="place-section"><h4>${t('sidebar.details')}</h4>${metaHtml}</div>` : ''}

      <div class="place-section verified-section">
        <span class="verified-date">${t('sidebar.verified')}: ${place.last_verified}</span>
      </div>

      <div class="sidebar-actions">
        <a href="${directionsUrl}" target="_blank" rel="noopener" class="btn-directions">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
            <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
          </svg>
          ${t('sidebar.directions')}
        </a>
        <button class="btn-flag" id="flag-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
            <path d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2z"/>
          </svg>
          ${t('sidebar.flag')}
        </button>
      </div>
    </div>
  `;

  bindSidebarEvents();

  sidebarEl.querySelector('#flag-btn')?.addEventListener('click', (e) => {
    const btn = e.currentTarget as HTMLButtonElement;
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> ${t('sidebar.flagged')}`;
    btn.disabled = true;
    btn.classList.add('flagged');
  });

  openSidebar();
}

export function openCorridor(corridor: Corridor): void {
  const lang = getLang();

  sidebarEl.innerHTML = `
    <div class="sidebar-handle"><div class="handle-bar"></div></div>
    <div class="sidebar-content">
      <button class="sidebar-close" aria-label="${t('sidebar.close')}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>

      <div class="place-header">
        <span class="cat-badge" style="background: ${corridor.color}">${corridor.route_number}</span>
      </div>

      <h2 class="place-name-zh">${corridor.name_zh}</h2>
      <h3 class="place-name-en">${corridor.name_en}</h3>

      <p class="corridor-desc">${lang === 'zh' ? corridor.description_zh : corridor.description_en}</p>

      <div class="place-section">
        <h4>${t('filter.zone')}</h4>
        <div class="lang-tags">
          ${corridor.zones_connected.map(z => `<span class="lang-tag">${t('zone.' + z)}</span>`).join('')}
        </div>
      </div>
    </div>
  `;

  bindSidebarEvents();
  openSidebar();
}

function openSidebar(): void {
  isOpen = true;
  sidebarEl.classList.add('open');
  overlayEl.classList.add('visible');
  document.body.classList.add('sidebar-open');
}

export function closeSidebar(): void {
  isOpen = false;
  sidebarEl.classList.remove('open');
  sidebarEl.style.transform = '';
  overlayEl.classList.remove('visible');
  document.body.classList.remove('sidebar-open');
  if (onClose) onClose();
}

function formatMetaKey(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
