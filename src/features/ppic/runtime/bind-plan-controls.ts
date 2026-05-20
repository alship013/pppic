import type { AppState, ValidationMode, WeekAllocation } from '@/features/ppic/domain/types';
import { replaceWeeksAction, setMonthlyTargetAction, setValidationModeAction } from '@/features/ppic/state/app-state-actions';
import type { AppStateAction } from '@/features/ppic/state/app-state-reducer';

interface BindPlanControlsOptions {
  appState: AppState;
  dispatchAppState: (action: AppStateAction) => void;
  applyWeekPreset: (preset: string | undefined) => void;
  rebalanceWeeks: (weeks: WeekAllocation[], targetId: string | undefined, nextValue: number) => WeekAllocation[];
}

export function bindPlanControls({
  appState,
  dispatchAppState,
  applyWeekPreset,
  rebalanceWeeks,
}: BindPlanControlsOptions) {
  document.querySelector('#monthly-target-input')?.addEventListener('change', (event) => {
    const target = event.target as HTMLInputElement;
    dispatchAppState(setMonthlyTargetAction(Number(target.value || 0)));
  });

  document.querySelector('#validation-mode')?.addEventListener('change', (event) => {
    const target = event.target as HTMLSelectElement;
    const validationMode: ValidationMode = target.value === 'block' ? 'block' : 'warn';
    dispatchAppState(setValidationModeAction(validationMode));
  });

  document.querySelectorAll<HTMLElement>('[data-preset]').forEach((button) => {
    button.addEventListener('click', () => applyWeekPreset(button.dataset.preset));
  });

  document.querySelectorAll<HTMLInputElement>('[data-week-lock]').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const weekId = checkbox.dataset.weekLock;
      const next = appState.weeks.map((week) => week.id === weekId ? { ...week, locked: checkbox.checked } : week);
      dispatchAppState(replaceWeeksAction(next));
    });
  });

  document.querySelectorAll<HTMLInputElement>('[data-week-slider]').forEach((slider) => {
    slider.addEventListener('input', () => {
      const weekId = slider.dataset.weekSlider;
      const adjustedWeeks = rebalanceWeeks(appState.weeks, weekId, Number(slider.value));
      dispatchAppState(replaceWeeksAction(adjustedWeeks));
    });
  });
}
