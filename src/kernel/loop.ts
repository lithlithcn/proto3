/** Fixed 60 Hz timestep accumulator (DESIGN §9). Pure and clock-agnostic so it is testable; the caller supplies elapsed milliseconds. */
export const STEP_MS = 1000 / 60;
export class FixedLoop {
  private acc = 0;
  constructor(readonly stepMs = STEP_MS, readonly maxCatchUp = 8) {}
  /** Returns how many sim steps to run for `dtMs` elapsed. Drops time beyond `maxCatchUp` steps (tab was hidden: the Worker clock handles online). */
  advance(dtMs: number): number {
    this.acc += Math.min(dtMs, 250);
    let n = 0;
    while (this.acc >= this.stepMs && n < this.maxCatchUp) { this.acc -= this.stepMs; n++; }
    if (this.acc > this.stepMs) this.acc = this.stepMs;
    return n;
  }
  /** Fraction (0..1) between the last and the next step, for render interpolation. */
  get alpha(): number { return this.acc / this.stepMs; }
  reset(): void { this.acc = 0; }
}
