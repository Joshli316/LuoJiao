import { Place, getPlaces } from './data';
import { t, getLang, safeGetItem, safeSetItem } from './i18n';
import { highlightPlaces, resetMarkerStyles, fitToPlaces, setMapView } from './map';
import { clearFilters } from './filters';

interface OnboardingStep {
  titleKey: string;
  descKey: string;
  subcategories: string[];
  icon: string;
}

const STEPS: OnboardingStep[] = [
  {
    titleKey: 'onboard.step_grocery',
    descKey: 'onboard.step_grocery_desc',
    subcategories: ['Chinese grocery store'],
    icon: '<path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/>',
  },
  {
    titleKey: 'onboard.step_sim',
    descKey: 'onboard.step_sim_desc',
    subcategories: ['Phone/SIM card shop'],
    icon: '<path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>',
  },
  {
    titleKey: 'onboard.step_bank',
    descKey: 'onboard.step_bank_desc',
    subcategories: ['Bank with Chinese-speaking staff'],
    icon: '<path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>',
  },
  {
    titleKey: 'onboard.step_food',
    descKey: 'onboard.step_food_desc',
    subcategories: ['Regional Chinese restaurant', 'Late-night food', 'Boba tea shop'],
    icon: '<path d="M12 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>',
  },
  {
    titleKey: 'onboard.step_transit',
    descKey: 'onboard.step_transit_desc',
    subcategories: [],
    icon: '<path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>',
  },
];

let currentStep = -1; // -1 = welcome screen
let isActive = false;
let onboardEl: HTMLElement;

export function initOnboarding(): void {
  onboardEl = document.getElementById('onboarding')!;

  // Show onboarding for first-time visitors
  const hasVisited = safeGetItem('luojiao-visited');
  if (!hasVisited) {
    showOnboarding();
  }

  // Re-enter button
  document.getElementById('btn-72h')?.addEventListener('click', () => {
    showOnboarding();
  });
}

export function showOnboarding(): void {
  isActive = true;
  currentStep = -1;
  renderStep();
  onboardEl.classList.add('visible');
  document.body.classList.add('onboarding-active');
}

export function hideOnboarding(): void {
  isActive = false;
  currentStep = -1;
  onboardEl.classList.remove('visible');
  document.body.classList.remove('onboarding-active');
  // Clear content after transition
  setTimeout(() => {
    if (!isActive) onboardEl.innerHTML = '';
  }, 350);
  resetMarkerStyles();
  clearFilters();
  safeSetItem('luojiao-visited', '1');
}

function renderStep(): void {
  if (currentStep === -1) {
    renderWelcome();
    return;
  }

  const step = STEPS[currentStep];
  const places = getPlaces();
  const stepPlaces = step.subcategories.length > 0
    ? places.filter(p => step.subcategories.includes(p.subcategory))
    : [];

  // Highlight relevant pins
  if (stepPlaces.length > 0) {
    highlightPlaces(stepPlaces.map(p => p.id));
    fitToPlaces(stepPlaces);
  } else if (currentStep === STEPS.length - 1) {
    // Transit step — show corridors
    resetMarkerStyles();
    setMapView(34.05, -118.14, 11);
    window.dispatchEvent(new CustomEvent('show-corridors'));
  }

  const isLast = currentStep === STEPS.length - 1;
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  onboardEl.innerHTML = `
    <div class="onboard-card step-card">
      <div class="onboard-progress">
        <div class="progress-bar" style="width: ${progress}%"></div>
      </div>
      <div class="step-number">${currentStep + 1} / ${STEPS.length}</div>
      <div class="step-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">${step.icon}</svg>
      </div>
      <h3 class="step-title">${t(step.titleKey)}</h3>
      <p class="step-desc">${t(step.descKey)}</p>
      ${stepPlaces.length > 0 ? `
        <div class="step-places">
          ${stepPlaces.slice(0, 4).map(p => `
            <div class="step-place-item">
              <span class="step-place-zh">${p.name_zh}</span>
              <span class="step-place-en">${p.name_en}</span>
            </div>
          `).join('')}
          ${stepPlaces.length > 4 ? `<div class="step-more">+${stepPlaces.length - 4} ${t('onboard.more')}</div>` : ''}
        </div>
      ` : ''}
      <div class="onboard-actions">
        ${currentStep > 0 ? `<button class="btn-onboard btn-prev">${t('onboard.prev')}</button>` : '<div></div>'}
        <button class="btn-onboard btn-next ${isLast ? 'btn-finish' : ''}">
          ${isLast ? t('onboard.finish') : t('onboard.next')}
        </button>
      </div>
    </div>
  `;

  bindStepEvents();
}

function renderWelcome(): void {
  onboardEl.innerHTML = `
    <div class="onboard-card welcome-card">
      <div class="welcome-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-16 h-16">
          <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      </div>
      <h2 class="welcome-title">${t('onboard.welcome_title')}</h2>
      <p class="welcome-sub">${t('onboard.welcome_sub')}</p>
      <div class="welcome-actions">
        <button class="btn-onboard btn-start">${t('onboard.start')}</button>
        <button class="btn-onboard btn-skip">${t('onboard.skip')}</button>
      </div>
    </div>
  `;

  onboardEl.querySelector('.btn-start')?.addEventListener('click', () => {
    currentStep = 0;
    renderStep();
  });
  onboardEl.querySelector('.btn-skip')?.addEventListener('click', () => {
    hideOnboarding();
  });
}

function bindStepEvents(): void {
  onboardEl.querySelector('.btn-next')?.addEventListener('click', () => {
    if (currentStep === STEPS.length - 1) {
      hideOnboarding();
    } else {
      currentStep++;
      renderStep();
    }
  });
  onboardEl.querySelector('.btn-prev')?.addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep--;
      renderStep();
    }
  });
}
