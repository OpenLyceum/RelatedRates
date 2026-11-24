import { DerivedProperty, Multilink, Property } from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import { localeProperty } from "scenerystack/joist";
import { Shape } from "scenerystack/kite";
import { Circle, Line, Path, Rectangle } from "scenerystack/scenery";
import { StringManager } from "../i18n/StringManager.js";
import Colors from "../RelatedRatesColors.js";
import { button, column, computed, format, LessonView, row, slider, text } from "./LessonView.js";
import {
  coneVolume,
  dependent,
  type Experiment,
  ladderLength,
  type RelatedRatesModel,
  settings,
  tankHeight,
} from "./model/RelatedRatesModel.js";

const equations = {
  chain: { base: "y = u²", derivative: "dy/dt = 2u · du/dt", input: "du/dt", output: "dy/dt", size: "u" },
  implicit: { base: "xy = 12", derivative: "dy/dt = −(y/x) · dx/dt", input: "dx/dt", output: "dy/dt", size: "x" },
  "conical-tank": {
    base: "r = h/2     V = πh³/12",
    derivative: "dh/dt = 4(dV/dt)/(πh²)",
    input: "dV/dt",
    output: "dh/dt",
    size: "h",
  },
  "sliding-ladder": {
    base: "x² + y² = 25 m²",
    derivative: "dy/dt = −(x/y) · dx/dt",
    input: "dx/dt",
    output: "dy/dt",
    size: "x",
  },
  "oil-slick": { base: "A = πr²", derivative: "dr/dt = (dA/dt)/(2πr)", input: "dA/dt", output: "dr/dt", size: "r" },
};

// Plot-pixel geometry of the three pictured experiments, shared by drawing and dragging.
const tank = { x: 305, top: 55, tip: 319, radius: 158 };
const ladder = { left: 120, floor: 310, scale: 54 };
const oil = { x: 305, y: 180, scale: 38 };

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
    const rule = model.scene === "rule-lab";
    const dependencies = [model.size, model.rate, model.rule, model.prediction] as const;
    const ruleName = computed([model.rule], () => strings[`${model.rule.value}StringProperty`].value);
    const equation = computed([model.rule], () => equations[model.kind].base);
    const rateUnit = () =>
      model.kind === "conical-tank" ? " m³/s" : model.kind === "oil-slick" ? " m²/s" : rule ? "" : " m/s";
    const measurements = computed([...dependencies], () => {
      const size = model.size.value;
      const other = dependent(model.kind, size);
      switch (model.kind) {
        case "chain":
          return `u = ${format(size)}    y = ${format(other)}`;
        case "implicit":
          return `x = ${format(size)}    y = ${format(other)}`;
        case "conical-tank":
          return `h = ${format(size)} m    r = ${format(other)} m    V = ${format(coneVolume(size))} m³`;
        case "sliding-ladder":
          return `x = ${format(size)} m    y = ${format(other)} m`;
        case "oil-slick":
          return `r = ${format(size)} m    A = ${format(other)} m²`;
      }
    });
    const input = computed(
      [...dependencies],
      () => `${equations[model.kind].input} = ${format(model.rate.value)}${rateUnit()}`,
    );
    const answer = computed([...dependencies], () =>
      model.prediction.value === null
        ? ""
        : `${equations[model.kind].output} = ${format(model.actualRate, 4)}${settings[model.kind].units}`,
    );
    const feedback = computed([...dependencies], () => {
      if (model.prediction.value === null) {
        return "";
      }
      return Math.sign(model.actualRate) === model.prediction.value
        ? strings.correctStringProperty.value
        : strings.incorrectStringProperty.value;
    });
    const derivative = computed([...dependencies], () =>
      model.prediction.value === null ? "" : equations[model.kind].derivative,
    );
    const snapshot = new Property<{ kind: Experiment; size: number; rate: number; linked: number } | null>(null);
    const comparison = computed([snapshot], () => {
      const sample = snapshot.value;
      if (!sample) {
        return "";
      }
      const e = equations[sample.kind];
      return `${strings.recordedStringProperty.value}   ${e.size} = ${format(sample.size)} m   ${e.input} = ${format(sample.rate)}${rateUnit()}   ${e.output} = ${format(sample.linked, 4)}${settings[sample.kind].units}`;
    });
    super({
      title,
      hint: summary.interactionHintStringProperty,
      playDescription: summary.playAreaStringProperty,
      controlDescription: summary.controlAreaStringProperty,
      details: computed([...dependencies, snapshot, model.timer.timeProperty], () =>
        [
          equation.value,
          measurements.value,
          input.value,
          `t = ${format(model.timer.timeProperty.value)} s`,
          derivative.value,
          answer.value,
          feedback.value,
          comparison.value,
        ]
          .filter(Boolean)
          .join(". "),
      ),
    });

    const recordButton = button(strings.captureStringProperty, () => {
      snapshot.value = { kind: model.kind, size: model.size.value, rate: model.rate.value, linked: model.actualRate };
    });
    model.prediction.link((value) => {
      recordButton.enabled = value !== null;
    });
    const sizeRange = new DerivedProperty(
      [model.rule],
      () => new Range(settings[model.kind].min, settings[model.kind].max),
    );
    const controls = column(
      ...(rule
        ? [text(ruleName, 16, 286, true), button(strings.changeRuleStringProperty, () => model.changeRule())]
        : []),
      text(equation, 20, 286, true),
      slider(
        strings.sizeStringProperty,
        model.size,
        settings[model.kind].min,
        rule ? settings.implicit.max : settings[model.kind].max,
        2,
        undefined,
        0.05,
        sizeRange,
      ),
      slider(
        strings.rateStringProperty,
        model.rate,
        settings[model.kind].rateMin,
        settings[model.kind].rateMax,
        2,
        undefined,
        0.05,
      ),
      text(input, 15),
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
      text(strings.predictStringProperty, 15, 286, true),
      row(
        button(strings.negativeStringProperty, () => {
          model.prediction.value = -1;
        }),
        button(strings.zeroStringProperty, () => {
          model.prediction.value = 0;
        }),
        button(strings.positiveStringProperty, () => {
          model.prediction.value = 1;
        }),
      ),
      text(feedback, 15),
      text(derivative, 16, 286, true),
      text(answer, 17, 286, true),
      button(strings.resetPredictionStringProperty, () => {
        model.prediction.value = null;
      }),
      ...(!rule ? [recordButton] : []),
    );
    this.finish(
      controls,
      column(text(measurements, 20, 610, true), text(note, 15, 610), text(comparison, 15, 610)),
      () => {
        model.reset();
        snapshot.reset();
      },
    );
    this.addHandles(model);
    Multilink.multilink([localeProperty, model.rule, model.size], () => this.draw(model));
  }

  /** Repositions the handles for the current scene; set by `addHandles`. */
  private placeHandles: () => void = () => undefined;

  /**
   * Grab handles on the play area drive `model.size`, the same quantity as the size slider,
   * so the slider stays the keyboard path. Grabbing pauses the animation so the drag wins.
   */
  private addHandles(model: RelatedRatesModel): void {
    const plot = this.plot;
    const setSize = (value: number) => {
      const { min, max } = settings[model.kind];
      model.size.value = Math.max(min, Math.min(max, Math.round(value * 100) / 100));
    };
    const pause = () => {
      model.timer.isPlayingProperty.value = false;
    };
    if (model.kind === "chain" || model.kind === "implicit") {
      const point = plot.handle({
        fill: Colors.secondaryColorProperty,
        cursor: "ew-resize",
        start: pause,
        drag: (x) => setSize(plot.modelX(x)),
      });
      this.placeHandles = () => {
        const x = model.size.value;
        point.place(plot.plotX(x), plot.plotY(dependent(model.kind, x)));
      };
    } else if (model.kind === "conical-tank") {
      const surface = plot.handle({
        cursor: "ns-resize",
        start: pause,
        drag: (_x, y) => setSize(((tank.tip - y) / (tank.tip - tank.top)) * tankHeight),
      });
      this.placeHandles = () => {
        const fraction = model.size.value / tankHeight;
        surface.place(tank.x + tank.radius * fraction, tank.tip - (tank.tip - tank.top) * fraction);
      };
    } else if (model.kind === "sliding-ladder") {
      const foot = plot.handle({
        fill: Colors.secondaryColorProperty,
        cursor: "ew-resize",
        start: pause,
        drag: (x) => setSize((x - ladder.left) / ladder.scale),
      });
      const top = plot.handle({
        fill: Colors.secondaryColorProperty,
        cursor: "ns-resize",
        start: pause,
        // The ladder keeps its length: raising the top pulls the foot toward the wall.
        drag: (_x, y) => {
          const height = Math.max(0, (ladder.floor - y) / ladder.scale);
          setSize(Math.sqrt(Math.max(0, ladderLength ** 2 - height ** 2)));
        },
      });
      this.placeHandles = () => {
        const x = model.size.value;
        foot.place(ladder.left + x * ladder.scale, ladder.floor);
        top.place(ladder.left, ladder.floor - dependent("sliding-ladder", x) * ladder.scale);
      };
    } else {
      const edge = plot.handle({
        fill: Colors.secondaryColorProperty,
        cursor: "move",
        start: pause,
        drag: (x, y) => setSize(Math.hypot(x - oil.x, y - oil.y) / oil.scale),
      });
      this.placeHandles = () => edge.place(oil.x + model.size.value * oil.scale, oil.y);
    }
  }

  private draw(model: RelatedRatesModel): void {
    this.plot.clear();
    const size = model.size.value;
    if (model.kind === "chain" || model.kind === "implicit") {
      this.drawRule(model.kind, size);
    } else if (model.kind === "conical-tank") {
      this.drawTank(size);
    } else if (model.kind === "sliding-ladder") {
      this.drawLadder(size);
    } else {
      this.drawOil(size);
    }
    this.placeHandles();
  }

  private drawRule(kind: "chain" | "implicit", x: number): void {
    const plot = this.plot;
    const max = kind === "chain" ? 16 : 12;
    plot.setDomain([-0.2, 6.4, -0.5, 17], kind === "chain" ? "u" : "x", "y", [1, 2, 3, 4, 5, 6], [0, 4, 8, 12, 16]);
    const { min, max: end } = settings[kind];
    plot.line(
      Array.from({ length: 141 }, (_, i) => {
        const value = min + ((end - min) * i) / 140;
        return [value, dependent(kind, value)];
      }),
    );
    const y = Math.min(max, dependent(kind, x));
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
    plot.point(x, y, Colors.secondaryColorProperty, false, 6);
  }

  private drawTank(height: number): void {
    const plot = this.plot;
    const { x, top, tip, radius } = tank;
    const fraction = height / tankHeight;
    const surface = tip - (tip - top) * fraction;
    const half = radius * fraction;
    plot.layers.addChild(
      new Path(Shape.ellipse(x, top, radius, 24, 0), {
        stroke: Colors.textColorProperty,
        lineDash: [5, 4],
        lineWidth: 2,
      }),
    );
    const level = new Path(Shape.ellipse(x, surface, half, 24 * fraction, 0), {
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
  }

  private drawLadder(x: number): void {
    const layers = this.plot.layers;
    const { left, floor, scale } = ladder;
    const end = left + x * scale;
    const top = floor - dependent("sliding-ladder", x) * scale;
    layers.addChild(new Rectangle(left - 13, 22, 13, floor - 22, { fill: Colors.panelBorderColorProperty }));
    layers.addChild(new Rectangle(left - 13, floor, 415, 11, { fill: Colors.panelBorderColorProperty }));
    layers.addChild(new Line(left, top, end, floor, { stroke: Colors.accentColorProperty, lineWidth: 12 }));
    layers.addChild(
      new Line(left, top, end, floor, { stroke: Colors.textColorProperty, lineWidth: 2, lineDash: [4, 11] }),
    );
    layers.addChild(new Circle(6, { x: left, y: top, fill: Colors.secondaryColorProperty }));
    layers.addChild(new Circle(6, { x: end, y: floor, fill: Colors.secondaryColorProperty }));
    const xText = text("x", 18);
    xText.centerX = (left + end) / 2;
    xText.top = floor + 13;
    const yText = text("y", 18);
    yText.right = left - 22;
    yText.centerY = (top + floor) / 2;
    layers.addChild(xText);
    layers.addChild(yText);
  }

  private drawOil(radius: number): void {
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
    const label = text("r", 18);
    label.centerX = x + pixels / 2;
    label.bottom = y - 5;
    this.plot.layers.addChild(label);
  }
}
