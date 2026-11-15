/** Legacy player palette (COLS = body/outline, LCOLS = light bullets). Index = player id % 8. */
export const COLS = ['#ff4a5a', '#ffd23a', '#4ab3ff', '#5cff8a', '#ff8a2a', '#c070ff', '#3ae0e0', '#ff6ec7'] as const;
export const LCOLS = ['#ff9aa4', '#ffe98a', '#a6d8ff', '#b0ffc8', '#ffc08a', '#e0b0ff', '#a0f4f4', '#ffb0e0'] as const;
export const hexOf = (c: number): string => '#' + (c & 0xffffff).toString(16).padStart(6, '0');
