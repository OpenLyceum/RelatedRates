import { NumberProperty, Property } from "scenerystack/axon";
import type { TModel } from "scenerystack/joist";
import { TimeModel } from "../TimeModel.js";

type Scene = "rule-lab" | "conical-tank" | "sliding-ladder" | "oil-slick";
export type Experiment = "chain" | "implicit" | Exclude<Scene, "rule-lab">;
type Sign = -1 | 0 | 1;
const ladderLength = 5;
export const tankHeight = 6;
export const coneVolume = (height: number): number => (Math.PI * height ** 3) / 12;

export const settings = {
  chain: { start: 2, min: 1, max: 4, rate: 0.5, rateMin: -1, rateMax: 1, units: "" },
  implicit: { start: 3, min: 1, max: 6, rate: 0.5, rateMin: -1, rateMax: 1, units: "" },
  "conical-tank": { start: 2, min: 0.5, max: tankHeight, rate: 0.75, rateMin: 0, rateMax: 5, units: " m/s" },
  "sliding-ladder": { start: 3, min: 0.5, max: 4.5, rate: 0.5, rateMin: -1, rateMax: 1, units: " m/s" },
  "oil-slick": { start: 1, min: 0.5, max: 4, rate: 1, rateMin: 0.05, rateMax: 5, units: " m/s" },
} as const;

export function dependent(kind: Experiment, size: number): number {
  switch (kind) {
    case "chain":
      return size ** 2;
    case "implicit":
      return 12 / size;
    case "conical-tank":
      return size / 2;
    case "sliding-ladder":
      return Math.sqrt(ladderLength ** 2 - size ** 2);
    case "oil-slick":
      return Math.PI * size ** 2;
  }
}

/** @internal Exposed for direct checks of the differentiated equations. */
export function linkedRate(kind: Experiment, size: number, rate: number): number {
  switch (kind) {
    case "chain":
      return 2 * size * rate;
    case "implicit":
      return (-12 * rate) / size ** 2;
    case "conical-tank":
      return (4 * rate) / (Math.PI * size ** 2);
    case "sliding-ladder":
      return (-size * rate) / dependent(kind, size);
    case "oil-slick":
      return rate / (2 * Math.PI * size);
  }
}

/** @internal Exposed for direct checks of geometry and boundary timing. */
export function advance(
  kind: Experiment,
  size: number,
  rate: number,
  dt: number,
): { size: number; elapsed: number; stopped: boolean } {
  const { min, max } = settings[kind];
  const amount =
    kind === "conical-tank" ? coneVolume : kind === "oil-slick" ? (r: number) => Math.PI * r ** 2 : (x: number) => x;
  const current = amount(size);
  const proposed = current + rate * dt;
  const bounded = Math.max(amount(min), Math.min(amount(max), proposed));
  const stopped = rate > 0 ? bounded === amount(max) : rate < 0 && bounded === amount(min);
  if (stopped) {
    return { size: rate > 0 ? max : min, elapsed: Math.abs((bounded - current) / rate), stopped };
  }
  const next =
    kind === "conical-tank"
      ? Math.cbrt((12 * bounded) / Math.PI)
      : kind === "oil-slick"
        ? Math.sqrt(bounded / Math.PI)
        : bounded;
  return { size: next, elapsed: dt, stopped };
}

export class RelatedRatesModel implements TModel {
  public readonly scene: Scene;
  public readonly timer = new TimeModel();
  public readonly rule = new Property<"chain" | "implicit">("chain");
  public readonly size: NumberProperty;
  public readonly rate: NumberProperty;
  public readonly prediction = new Property<Sign | null>(null);

  public constructor(scene: Scene) {
    this.scene = scene;
    this.size = new NumberProperty(settings[this.kind].start);
    this.rate = new NumberProperty(settings[this.kind].rate);
  }

  public get kind(): Experiment {
    return this.scene === "rule-lab" ? this.rule.value : this.scene;
  }

  public get actualRate(): number {
    return linkedRate(this.kind, this.size.value, this.rate.value);
  }

  public changeRule(): void {
    this.timer.reset();
    this.prediction.reset();
    this.rule.value = this.rule.value === "chain" ? "implicit" : "chain";
    this.size.value = settings[this.kind].start;
    this.rate.value = settings[this.kind].rate;
  }

  public stepOnce(dt: number): void {
    const result = advance(this.kind, this.size.value, this.rate.value, dt);
    this.size.value = result.size;
    this.timer.advance(result.elapsed);
    if (result.stopped) {
      this.timer.isPlayingProperty.value = false;
    }
  }

  public step(dt: number): void {
    if (this.timer.isPlayingProperty.value) {
      this.stepOnce(dt);
    }
  }

  public reset(): void {
    this.timer.reset();
    this.rule.reset();
    this.size.reset();
    this.rate.reset();
    this.prediction.reset();
  }

  public dispose(): void {
    this.timer.dispose();
    this.rule.dispose();
    this.size.dispose();
    this.rate.dispose();
    this.prediction.dispose();
  }
}
