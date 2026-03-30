import { Place, CATEGORY_COLORS, filterPlaces, getPlaces } from './data';
import { t } from './i18n';

export interface FilterState {
  categories: string[];
  stages: string[];
  zones: string[];
  search: string;
}

let state: FilterState = {
  categories: [],
  stages: [],
  zones: [],
  search: '',
};

let onFilterChange: (places: Place[]) => void = () => {};

const CATEGORIES = ['food', 'services', 'spiritual', 'fun', 'academic'];
const STAGES = ['just_arrived', 'settling_in', 'living_here', 'working_here'];
const ZONES = ['SGV', 'USC', 'DTLA'];

export function initFilters(onChange: (places: Place[]) => void): void {
  onFilterChange = onChange;
  renderFilters();
  window.addEventListener('lang-change', () => renderFilters());
}

export function getFilterState(): FilterState {
  return { ...state };
}

export function clearFilters(): void {
  state = { categories: [], stages: [], zones: [], search: '' };
  const searchInput = document.getElementById('search-input') as HTMLInputElement;
  if (searchInput) searchInput.value = '';
  renderFilters();
  applyFilters();
}

function applyFilters(): void {
  const filtered = filterPlaces(state);
  onFilterChange(filtered);
  updateCounts();
  updateNoResults(filtered.length);
}

function updateCounts(): void {
  CATEGORIES.forEach(cat => {
    const count = filterPlaces({ ...state, categories: [cat] }).length;
    const el = document.querySelector(`[data-chip="${cat}"] .chip-count`);
    if (el) el.textContent = `${count}`;
  });
}

function updateNoResults(count: number): void {
  const el = document.getElementById('no-results');
  if (el) {
    el.classList.toggle('hidden', count > 0);
    el.querySelector('span')!.textContent = t('filter.no_results');
  }
}

function renderFilters(): void {
  const container = document.getElementById('filters')!;
  const allPlaces = getPlaces();

  const getCatCount = (cat: string) => allPlaces.filter(p => p.category === cat).length;

  container.innerHTML = `
    <div class="filters-inner">
      <div class="search-row">
        <div class="search-box">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input type="text" id="search-input" placeholder="${t('filter.search')}" value="${state.search}" autocomplete="off" aria-label="${t('filter.search')}" />
          <button id="search-clear" class="search-clear ${state.search ? '' : 'hidden'}" aria-label="${t('filter.clear_search')}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      </div>
      <div class="chip-groups">
        <div class="chip-group" role="group" aria-label="${t('filter.category')}">
          ${CATEGORIES.map(cat => `
            <button class="chip chip-category ${state.categories.includes(cat) ? 'active' : ''}"
                    data-chip="${cat}"
                    style="--chip-color: ${CATEGORY_COLORS[cat]}"
                    aria-pressed="${state.categories.includes(cat)}">
              <span class="chip-dot" style="background: ${CATEGORY_COLORS[cat]}"></span>
              <span>${t('cat.' + cat)}</span>
              <span class="chip-count">${getCatCount(cat)}</span>
            </button>
          `).join('')}
        </div>
        <div class="chip-group" role="group" aria-label="${t('filter.stage')}">
          ${STAGES.map(stage => `
            <button class="chip chip-stage ${state.stages.includes(stage) ? 'active' : ''}"
                    data-chip="${stage}"
                    aria-pressed="${state.stages.includes(stage)}">
              ${t('stage.' + stage)}
            </button>
          `).join('')}
        </div>
        <div class="chip-group" role="group" aria-label="${t('filter.zone')}">
          ${ZONES.map(zone => `
            <button class="chip chip-zone ${state.zones.includes(zone) ? 'active' : ''}"
                    data-chip="${zone}"
                    aria-pressed="${state.zones.includes(zone)}">
              ${t('zone.' + zone)}
            </button>
          `).join('')}
        </div>
      </div>
      ${hasActiveFilters() ? `
        <button class="clear-btn" id="clear-filters">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M18 6L6 18M6 6l12 12"/></svg>
          ${t('filter.clear')}
        </button>
      ` : ''}
    </div>
    <div id="no-results" class="no-results hidden">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-8 h-8">
        <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
      </svg>
      <span>${t('filter.no_results')}</span>
    </div>
  `;

  // Bind events
  const searchInput = container.querySelector('#search-input') as HTMLInputElement;
  let debounceTimer: ReturnType<typeof setTimeout>;
  searchInput?.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      state.search = searchInput.value.trim();
      const clearBtn = container.querySelector('#search-clear');
      clearBtn?.classList.toggle('hidden', !state.search);
      applyFilters();
    }, 200);
  });

  container.querySelector('#search-clear')?.addEventListener('click', () => {
    searchInput.value = '';
    state.search = '';
    container.querySelector('#search-clear')?.classList.add('hidden');
    applyFilters();
  });

  // Category chips
  CATEGORIES.forEach(cat => {
    container.querySelector(`[data-chip="${cat}"]`)?.addEventListener('click', () => {
      toggleArrayItem(state.categories, cat);
      renderFilters();
      applyFilters();
    });
  });

  // Stage chips
  STAGES.forEach(stage => {
    container.querySelector(`[data-chip="${stage}"]`)?.addEventListener('click', () => {
      toggleArrayItem(state.stages, stage);
      renderFilters();
      applyFilters();
    });
  });

  // Zone chips
  ZONES.forEach(zone => {
    container.querySelector(`[data-chip="${zone}"]`)?.addEventListener('click', () => {
      toggleArrayItem(state.zones, zone);
      renderFilters();
      applyFilters();
    });
  });

  // Clear button
  container.querySelector('#clear-filters')?.addEventListener('click', () => clearFilters());
}

function toggleArrayItem(arr: string[], item: string): void {
  const idx = arr.indexOf(item);
  if (idx >= 0) arr.splice(idx, 1);
  else arr.push(item);
}

function hasActiveFilters(): boolean {
  return state.categories.length > 0 || state.stages.length > 0 ||
    state.zones.length > 0 || state.search.length > 0;
}
