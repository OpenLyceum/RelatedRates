import { DerivedProperty, Multilink } from "scenerystack/axon";
import { Range, toFixedNumber } from "scenerystack/dot";
import { localeProperty } from "scenerystack/joist";
import { Shape } from "scenerystack/kite";
import { StringUtils } from "scenerystack/phetcommon";
import { Circle, Line, Path, Rectangle } from "scenerystack/scenery";
import { ArrowNode } from "scenerystack/scenery-phet";
import { StringManager } from "../i18n/StringManager.js";
import Colors from "../RelatedRatesColors.js";
import {
  ARROW_SECONDS,
  KEYBOARD_SIZE_STEP,
  LADDER_PICTURE as ladder,
  MAX_ARROW,
  MINI_GRAPH as mini,
  OIL_PICTURE as oil,
  TANK_PICTURE as tank,
} from "../RelatedRatesConstants.js";
import {
  button,
  type Choice,
  column,
  comboBox,
  computed,
  format,
  LessonView,
  niceTicks,
  richText,
  row,
  slider,
  text,
} from "./LessonView.js";
import {
  coneVolume,
  DERIVATION_STEPS,
  dependent,
  type Experiment,
  ladderLength,
  linkedRate,
  type RelatedRatesModel,
  type Rule,
  rules,
  settings,
  type Trend,
  tankHeight,
} from "./model/RelatedRatesModel.js";

/** Symbols for each relation: the measurement, the input rate and the linked rate. */
const symbols: Record<Experiment, { relation: string; size: string; other: string; input: string; output: string }> = {
  chain: { relation: "y = u<sup>2</sup>", size: "u", other: "y", input: "du/dt", output: "dy/dt" },
  root: { relation: "y = √u", size: "u", other: "y", input: "du/dt", output: "dy/dt" },
  sine: { relation: "y = sin u", size: "u", other: "y", input: "du/dt", output: "dy/dt" },
  implicit: { relation: "xy = 12", size: "x", other: "y", input: "dx/dt", output: "dy/dt" },
  circle: { relation: "x<sup>2</sup> + y<sup>2</sup> = 25", size: "x", other: "y", input: "dx/dt", output: "dy/dt" },
  "conical-tank": { relation: "V = πh<sup>3</sup>/12", size: "h", other: "r", input: "dV/dt", output: "dh/dt" },
  "sliding-ladder": {
    relation: "x<sup>2</sup> + y<sup>2</sup> = 25 m<sup>2</sup>",
    size: "x",
    other: "y",
    input: "dx/dt",
    output: "dy/dt",
  },
  "oil-slick": { relation: "A = πr<sup>2</sup>", size: "r", other: "A", input: "dA/dt", output: "dr/dt" },
};

/**
 * The four lines of each derivation, with the current values substituted:
 * the relation, both sides differentiated, the solved rate with numbers in, and the result.
 */
function derivation(kind: Experiment, size: number, rate: number, unit: string): string[] {
  const n = (value: number) => format(value, 3);
  const y = dependent(kind, size);
  const result = `${symbols[kind].output} = ${format(linkedRate(kind, size, rate), 4)}${unit}`;
  switch (kind) {
    case "chain":
      return ["y = u<sup>2</sup>", "dy/dt = 2u · du/dt", `dy/dt = 2 · (${n(size)}) · (${n(rate)})`, result];
    case "root":
      return [
        "y = √u = u<sup>1/2</sup>",
        "dy/dt = (1 / (2√u)) · du/dt",
        `dy/dt = (${n(rate)}) / (2√${n(size)})`,
        result,
      ];
    case "sine":
      return ["y = sin u", "dy/dt = cos u · du/dt", `dy/dt = cos(${n(size)}) · (${n(rate)})`, result];
    case "implicit":
      return [
        "xy = 12",
        "x · dy/dt + y · dx/dt = 0",
        `dy/dt = −(y/x) · dx/dt = −(${n(y)}/${n(size)}) · (${n(rate)})`,
        result,
      ];
    case "circle":
    case "sliding-ladder":
      return [
        "x<sup>2</sup> + y<sup>2</sup> = 25",
        "2x · dx/dt + 2y · dy/dt = 0",
        `dy/dt = −(x/y) · dx/dt = −(${n(size)}/${n(y)}) · (${n(rate)})`,
        result,
      ];
    case "conical-tank":
      return [
        "V = πr<sup>2</sup>h/3  and  r = h/2,  so  V = πh<sup>3</sup>/12",
        "dV/dt = (πh<sup>2</sup>/4) · dh/dt",
        `dh/dt = 4 · dV/dt / (πh<sup>2</sup>) = 4 · (${n(rate)}) / (π · ${n(size)}<sup>2</sup>)`,
        result,
      ];
    case "oil-slick":
      return [
        "A = πr<sup>2</sup>",
        "dA/dt = 2πr · dr/dt",
        `dr/dt = dA/dt / (2πr) = (${n(rate)}) / (2π · ${n(size)})`,
        result,
      ];
  }
}

// Pixels per metre in each picture. A velocity arrow shows the distance covered in ARROW_SECONDS,
// long enough for slow edges to show and still in the picture's own scale.
const pixelsPerMetre = {
  "conical-tank": (tank.tip - tank.top) / tankHeight,
  "sliding-ladder": ladder.scale,
  "oil-slick": oil.scale,
};

export class RelatedRatesView extends LessonView {
  public constructor(model: RelatedRatesModel) {
    const manager = StringManager.getInstance();
    const names = manager.getScreenNames();
    const strings = manager.getLessonStrings();
    const namesByScene = {
      "rule-lab": [
        names.ruleLabStringProperty,
        manager.getRuleLabA11yStrings().screenSummary,
        strings.ruleNoteStringProperty,
      ],
      "conical-tank": [
        names.conicalTankStringProperty,
        manager.getConicalTankA11yStrings().screenSummary,
        strings.tankNoteStringProperty,
      ],
      "sliding-ladder": [
        names.slidingLadderStringProperty,
        manager.getSlidingLadderA11yStrings().screenSummary,
        strings.ladderNoteStringProperty,
      ],
      "oil-slick": [
        names.oilSlickStringProperty,
        manager.getOilSlickA11yStrings().screenSummary,
        strings.oilNoteStringProperty,
      ],
    } as const;
    const [title, summary, note] = namesByScene[model.scene];
    const isRuleLab = model.scene === "rule-lab";
    const dependencies = [
      model.sizeProperty,
      model.rateProperty,
      model.rule,
      model.prediction,
      model.answer,
      model.revealed,
      model.timer.timeProperty,
    ] as const;
    const physical = () => !isRuleLab;
    const sizeUnit = () => (physical() ? " m" : "");
    const rateUnit = () =>
      model.kind === "conical-tank" ? " m³/s" : model.kind === "oil-slick" ? " m²/s" : physical() ? " m/s" : "";
    const outputUnit = () => settings[model.kind].units;
    const measurements = computed([...dependencies], () => {
      const size = model.sizeProperty.value;
      const other = dependent(model.kind, size);
      const s = symbols[model.kind];
      const time = `t = ${format(model.timer.timeProperty.value)} s`;
      switch (model.kind) {
        case "conical-tank":
          return `h = ${format(size)} m   r = ${format(other)} m   V = ${format(coneVolume(size))} m³   ${time}`;
        case "oil-slick":
          return `r = ${format(size)} m   A = ${format(other)} m²   ${time}`;
        default:
          return `${s.size} = ${format(size)}${sizeUnit()}   ${s.other} = ${format(other)}${sizeUnit()}   ${time}`;
      }
    });
    const input = computed(
      [...dependencies],
      () => `${symbols[model.kind].input} = ${format(model.rateProperty.value)}${rateUnit()}`,
    );
    const output = computed(
      [...dependencies],
      () => `${symbols[model.kind].output} = ${format(model.actualRate, 4)}${outputUnit()}`,
    );
    const prompt = computed([model.rule, strings.predictPromptStringProperty], () =>
      StringUtils.fillIn(strings.predictPromptStringProperty.value, {
        size: symbols[model.kind].size,
        output: symbols[model.kind].output,
      }),
    );
    const feedback = computed([...dependencies, note], () => {
      const guess = model.prediction.value;
      const answer = model.answer.value;
      if (guess === null || answer === null) {
        return "";
      }
      const verdict = guess === answer ? strings.correctStringProperty.value : strings.incorrectStringProperty.value;
      const fact = StringUtils.fillIn(strings[`${answer}TrendStringProperty`].value, {
        size: symbols[model.kind].size,
        output: symbols[model.kind].output,
      });
      return `${verdict} ${fact} ${note.value}`;
    });
    const steps = Array.from({ length: DERIVATION_STEPS }, (_, i) =>
      computed([...dependencies], () =>
        i < model.revealed.value
          ? (derivation(model.kind, model.sizeProperty.value, model.rateProperty.value, outputUnit())[i] ?? "")
          : "",
      ),
    );
    const plain = (markup: string) => markup.replace(/<sup>([^<]*)<\/sup>/g, "^$1").replace(/<[^>]+>/g, "");
    super({
      title,
      hint: summary.interactionHintStringProperty,
      playDescription: summary.playAreaStringProperty,
      controlDescription: summary.controlAreaStringProperty,
      details: computed([...dependencies, feedback], () =>
        [
          plain(symbols[model.kind].relation),
          measurements.value,
          input.value,
          output.value,
          ...steps.map((step) => plain(step.value)),
          feedback.value,
        ]
          .filter(Boolean)
          .join(". "),
      ),
    });

    const sizeRangeProperty = new DerivedProperty(
      [model.rule],
      () => new Range(settings[model.kind].min, settings[model.kind].max),
    );
    const sizeRange = isRuleLab ? new Range(0, 6) : new Range(settings[model.kind].min, settings[model.kind].max);
    const relationChoices: Choice<Rule>[] = rules.map((relation) => ({
      value: relation,
      label: symbols[relation].relation,
      name: plain(symbols[relation].relation),
    }));
    const predictButtons = (["larger", "same", "smaller"] as const satisfies readonly Trend[]).map((guess) =>
      button(strings[`${guess}StringProperty`], () => model.predict(guess)),
    );
    const outputLine = text(output, 17, 290, true);
    outputLine.fill = Colors.secondaryColorProperty;
    const controls = column(
      ...(isRuleLab
        ? [comboBox(model.rule, relationChoices, this.listParent, strings.relationStringProperty, 290)]
        : []),
      ...(isRuleLab ? [] : [richText(symbols[model.kind].relation, 18, 290, true)]),
      slider(
        computed(
          [strings.sizeStringProperty, model.rule],
          () => `${strings.sizeStringProperty.value} ${symbols[model.kind].size}`,
        ),
        model.sizeProperty,
        sizeRange.min,
        sizeRange.max,
        2,
        undefined,
        0.05,
        sizeRangeProperty,
      ),
      slider(
        computed(
          [strings.rateStringProperty, model.rule],
          () => `${strings.rateStringProperty.value} ${symbols[model.kind].input}`,
        ),
        model.rateProperty,
        settings[model.kind].rateMin,
        settings[model.kind].rateMax,
        2,
        undefined,
        0.05,
      ),
      text(input, 15),
      outputLine,
      row(
        button(
          computed([model.timer.isPlayingProperty], () =>
            model.timer.isPlayingProperty.value ? strings.pauseStringProperty.value : strings.playStringProperty.value,
          ),
          () => {
            model.timer.isPlayingProperty.value = !model.timer.isPlayingProperty.value;
          },
        ),
        button(strings.stepStringProperty, () => {
          model.timer.isPlayingProperty.value = false;
          model.stepOnce(0.2);
        }),
      ),
      richText(prompt, 14, 290, true, true),
      row(...predictButtons),
      richText(feedback, 13, 290, false, true),
    );
    const nextStep = button(strings.nextStepStringProperty, () => model.revealStep());
    const hideSteps = button(strings.hideStepsStringProperty, () => {
      model.revealed.value = 0;
    });
    model.revealed.link((count) => {
      nextStep.enabled = count < DERIVATION_STEPS;
      hideSteps.enabled = count > 0;
    });
    this.finish(
      controls,
      column(
        row(text(measurements, 16, 340, true), nextStep, hideSteps),
        ...steps.map((step, i) =>
          richText(step, i === DERIVATION_STEPS - 1 ? 16 : 15, this.notesWidth, i === DERIVATION_STEPS - 1),
        ),
      ),
      () => model.reset(),
    );
    this.addHandles(model, () => measurements.value);
    Multilink.multilink([localeProperty, model.rule, model.sizeProperty, model.rateProperty], () => this.draw(model));
  }

  /** Repositions the handles for the current scene; set by `addHandles`. */
  private placeHandles: () => void = () => undefined;

  /** Play-area handles drive the same size as the slider. Moving a handle pauses playback. */
  private addHandles(model: RelatedRatesModel, readout: () => string): void {
    const plot = this.plot;
    const setSize = (value: number, digits = 2) => {
      const { min, max } = settings[model.kind];
      model.sizeProperty.value = Math.max(min, Math.min(max, toFixedNumber(value, digits)));
    };
    const pause = () => {
      model.timer.isPlayingProperty.value = false;
    };
    const strings = StringManager.getInstance().getLessonStrings();
    const nudgeSize = (steps: number) => {
      pause();
      setSize(model.sizeProperty.value + steps * KEYBOARD_SIZE_STEP);
    };
    if (model.scene === "rule-lab") {
      const point = plot.handle({
        fill: Colors.secondaryColorProperty,
        cursor: "ew-resize",
        start: pause,
        readout,
        drag: (x) => setSize(plot.modelX(x)),
        keyboard: { name: strings.curveHandleStringProperty, direction: "leftRight", step: nudgeSize },
      });
      this.placeHandles = () => {
        const x = model.sizeProperty.value;
        point.place(plot.plotX(x), plot.plotY(dependent(model.kind, x)));
      };
    } else if (model.kind === "conical-tank") {
      const surface = plot.handle({
        cursor: "ns-resize",
        start: pause,
        readout,
        drag: (_x, y) => setSize(((tank.tip - y) / (tank.tip - tank.top)) * tankHeight),
        keyboard: { name: strings.waterHandleStringProperty, direction: "upDown", step: (_dx, dy) => nudgeSize(dy) },
      });
      this.placeHandles = () => {
        const fraction = model.sizeProperty.value / tankHeight;
        surface.place(tank.x + tank.radius * fraction, tank.tip - (tank.tip - tank.top) * fraction);
      };
    } else if (model.kind === "sliding-ladder") {
      const foot = plot.handle({
        fill: Colors.secondaryColorProperty,
        cursor: "ew-resize",
        start: pause,
        readout,
        drag: (x) => setSize((x - ladder.left) / ladder.scale),
        keyboard: { name: strings.ladderFootStringProperty, direction: "leftRight", step: nudgeSize },
      });
      const sizeAtHeight = (height: number) => {
        const clamped = Math.max(0, Math.min(ladderLength, height));
        return Math.sqrt(Math.max(0, ladderLength ** 2 - clamped ** 2));
      };
      const top = plot.handle({
        fill: Colors.secondaryColorProperty,
        cursor: "ns-resize",
        start: pause,
        readout,
        // The ladder keeps its length: raising the top pulls the foot toward the wall.
        drag: (_x, y) => setSize(sizeAtHeight((ladder.floor - y) / ladder.scale)),
        keyboard: {
          name: strings.ladderTopStringProperty,
          direction: "upDown",
          step: (_dx, dy) => {
            pause();
            const height = dependent("sliding-ladder", model.sizeProperty.value) + dy * KEYBOARD_SIZE_STEP;
            setSize(sizeAtHeight(height), 6);
          },
        },
      });
      this.placeHandles = () => {
        const x = model.sizeProperty.value;
        foot.place(ladder.left + x * ladder.scale, ladder.floor);
        top.place(ladder.left, ladder.floor - dependent("sliding-ladder", x) * ladder.scale);
      };
    } else {
      const edge = plot.handle({
        fill: Colors.secondaryColorProperty,
        cursor: "move",
        start: pause,
        readout,
        drag: (x, y) => setSize(Math.hypot(x - oil.x, y - oil.y) / oil.scale),
        keyboard: { name: strings.oilEdgeStringProperty, direction: "leftRight", step: nudgeSize },
      });
      this.placeHandles = () => edge.place(oil.x + model.sizeProperty.value * oil.scale, oil.y);
    }
  }

  /** A velocity arrow in plot pixels, capped at MAX_ARROW and skipped when too short to see. */
  private arrow(x: number, y: number, dx: number, dy: number, fill: typeof Colors.secondaryColorProperty): void {
    const length = Math.hypot(dx, dy);
    if (!(length > 3 && Number.isFinite(length))) {
      return;
    }
    const scale = Math.min(1, MAX_ARROW / length);
    this.plot.layers.addChild(
      new ArrowNode(x, y, x + dx * scale, y + dy * scale, {
        fill,
        stroke: null,
        headHeight: 11,
        headWidth: 13,
        tailWidth: 4,
        pickable: false,
      }),
    );
  }

  private draw(model: RelatedRatesModel): void {
    this.plot.clear();
    const size = model.sizeProperty.value;
    if (model.scene === "rule-lab") {
      this.drawRule(model);
    } else {
      if (model.kind === "conical-tank") {
        this.drawTank(size, model.actualRate);
      } else if (model.kind === "sliding-ladder") {
        this.drawLadder(size, model.rateProperty.value, model.actualRate);
      } else {
        this.drawOil(size, model.actualRate);
      }
      this.drawRateGraph(model);
    }
    this.placeHandles();
  }

  /** The relation's curve with the moving point and its two velocity components. */
  private drawRule(model: RelatedRatesModel): void {
    const plot = this.plot;
    const kind = model.kind;
    const { min, max } = settings[kind];
    const samples = Array.from({ length: 161 }, (_, i): [number, number] => {
      const u = min + ((max - min) * i) / 160;
      return [u, dependent(kind, u)];
    });
    const ys = samples.map(([, value]) => value);
    const low = Math.min(0, ...ys);
    const high = Math.max(0, ...ys);
    const pad = (high - low) * 0.12 || 1;
    const s = symbols[kind];
    plot.setDomain([Math.min(0, min) - 0.3, max + 0.4, low - pad, high + pad], s.size, s.other, niceTicks(0, max, 6));
    plot.line(samples);
    const x = model.sizeProperty.value;
    const y = dependent(kind, x);
    plot.line(
      [
        [x, 0],
        [x, y],
        [0, y],
      ],
      Colors.secondaryColorProperty,
      1.5,
      [5, 5],
    );
    // Velocity components over one second, drawn in graph units.
    const px = plot.plotX(x);
    const py = plot.plotY(y);
    this.arrow(px, py, plot.plotX(x + model.rateProperty.value) - px, 0, Colors.accentColorProperty);
    this.arrow(px, py, 0, plot.plotY(y + model.actualRate) - py, Colors.secondaryColorProperty);
  }

  /** |linked rate| against the measurement at the current input rate, with the present state marked. */
  private drawRateGraph(model: RelatedRatesModel): void {
    const layers = this.plot.layers;
    const kind = model.kind;
    const { min, max } = settings[kind];
    const rate = model.rateProperty.value;
    const points = Array.from({ length: 121 }, (_, i): [number, number] => {
      const s = min + ((max - min) * i) / 120;
      return [s, Math.abs(linkedRate(kind, s, rate))];
    });
    const top = Math.max(1e-9, ...points.map(([, r]) => r).filter(Number.isFinite));
    const px = (s: number) => mini.left + ((mini.right - mini.left) * (s - min)) / (max - min);
    const py = (r: number) => mini.bottom - ((mini.bottom - mini.top) * Math.min(r, top)) / top;
    layers.addChild(
      new Path(new Shape().moveTo(mini.left, mini.top).lineTo(mini.left, mini.bottom).lineTo(mini.right, mini.bottom), {
        stroke: Colors.textColorProperty,
        lineWidth: 1,
      }),
    );
    const curve = new Shape();
    for (const [i, [s, r]] of points.entries()) {
      if (i === 0) {
        curve.moveTo(px(s), py(r));
      } else {
        curve.lineTo(px(s), py(r));
      }
    }
    layers.addChild(new Path(curve, { stroke: Colors.secondaryColorProperty, lineWidth: 2 }));
    const size = model.sizeProperty.value;
    const current = Math.abs(model.actualRate);
    layers.addChild(
      new Line(px(size), mini.bottom, px(size), py(current), {
        stroke: Colors.secondaryColorProperty,
        lineDash: [4, 4],
      }),
    );
    layers.addChild(new Circle(6, { x: px(size), y: py(current), fill: Colors.secondaryColorProperty }));
    const symbol = symbols[kind];
    const yLabel = richText(`|${symbol.output}|`, 14, 120, true);
    yLabel.left = mini.left + 6;
    yLabel.bottom = mini.top - 4;
    const xLabel = text(symbol.size, 15, 40, true);
    xLabel.centerX = (mini.left + mini.right) / 2;
    xLabel.top = mini.bottom + 4;
    const ends = [min, max].map((value) => {
      const tick = text(format(value), 12, 50);
      tick.centerX = px(value);
      tick.top = mini.bottom + 4;
      return tick;
    });
    const peak = text(format(top, 3), 12, 60);
    peak.right = mini.left - 4;
    peak.centerY = mini.top;
    for (const node of [yLabel, xLabel, ...ends, peak]) {
      layers.addChild(node);
    }
  }

  private drawTank(height: number, rise: number): void {
    const plot = this.plot;
    const { x, top, tip, radius } = tank;
    const fraction = height / tankHeight;
    const surface = tip - (tip - top) * fraction;
    const half = radius * fraction;
    plot.layers.addChild(
      new Path(Shape.ellipse(x, top, radius, 22, 0), {
        stroke: Colors.textColorProperty,
        lineDash: [5, 4],
        lineWidth: 2,
      }),
    );
    const level = new Path(Shape.ellipse(x, surface, half, 22 * fraction, 0), {
      fill: Colors.accentColorProperty,
      stroke: Colors.textColorProperty,
    });
    plot.layers.addChild(
      new Path(
        new Shape()
          .moveTo(x - half, surface)
          .lineTo(x, tip)
          .lineTo(x + half, surface)
          .close(),
        { fill: Colors.positiveFillColorProperty },
      ),
    );
    plot.layers.addChild(new Line(x - radius, top, x, tip, { stroke: Colors.textColorProperty, lineWidth: 3 }));
    plot.layers.addChild(new Line(x, tip, x + radius, top, { stroke: Colors.textColorProperty, lineWidth: 3 }));
    plot.layers.addChild(level);
    plot.layers.addChild(
      new Line(x, surface, x, tip, { stroke: Colors.secondaryColorProperty, lineWidth: 2, lineDash: [5, 4] }),
    );
    plot.layers.addChild(
      new Line(x, surface, x + half, surface, { stroke: Colors.secondaryColorProperty, lineWidth: 2 }),
    );
    this.arrow(
      x - half - 22,
      surface,
      0,
      -rise * ARROW_SECONDS * pixelsPerMetre["conical-tank"],
      Colors.secondaryColorProperty,
    );
  }

  private drawLadder(x: number, footRate: number, topRate: number): void {
    const layers = this.plot.layers;
    const { left, floor, scale } = ladder;
    const end = left + x * scale;
    const top = floor - dependent("sliding-ladder", x) * scale;
    layers.addChild(new Rectangle(left - 13, 22, 13, floor - 22, { fill: Colors.panelBorderColorProperty }));
    layers.addChild(new Rectangle(left - 13, floor, 300, 11, { fill: Colors.panelBorderColorProperty }));
    layers.addChild(new Line(left, top, end, floor, { stroke: Colors.accentColorProperty, lineWidth: 12 }));
    layers.addChild(
      new Line(left, top, end, floor, { stroke: Colors.textColorProperty, lineWidth: 2, lineDash: [4, 11] }),
    );
    layers.addChild(new Circle(6, { x: left, y: top, fill: Colors.secondaryColorProperty }));
    layers.addChild(new Circle(6, { x: end, y: floor, fill: Colors.secondaryColorProperty }));
    this.arrow(end, floor - 22, footRate * ARROW_SECONDS * scale, 0, Colors.accentColorProperty);
    this.arrow(left + 22, top, 0, -topRate * ARROW_SECONDS * scale, Colors.secondaryColorProperty);
    const xText = text("x", 18);
    xText.centerX = (left + end) / 2;
    xText.top = floor + 13;
    const yText = text("y", 18);
    yText.left = left + 8;
    yText.centerY = (top + floor) / 2;
    layers.addChild(xText);
    layers.addChild(yText);
  }

  private drawOil(radius: number, growth: number): void {
    const { x, y } = oil;
    const pixels = radius * oil.scale;
    this.plot.layers.addChild(
      new Circle(pixels, {
        x,
        y,
        fill: Colors.positiveFillColorProperty,
        stroke: Colors.accentColorProperty,
        lineWidth: 3,
      }),
    );
    this.plot.layers.addChild(new Line(x, y, x + pixels, y, { stroke: Colors.secondaryColorProperty, lineWidth: 2 }));
    const diagonal = Math.SQRT1_2;
    this.arrow(
      x + pixels * diagonal,
      y - pixels * diagonal,
      growth * ARROW_SECONDS * oil.scale * diagonal,
      -growth * ARROW_SECONDS * oil.scale * diagonal,
      Colors.secondaryColorProperty,
    );
    const label = text("r", 18);
    label.centerX = x + pixels / 2;
    label.bottom = y - 5;
    this.plot.layers.addChild(label);
  }
}
