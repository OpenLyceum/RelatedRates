import { Shape } from "scenerystack/kite";
import { Circle, Node, Path, Rectangle } from "scenerystack/scenery";
import { ScreenIcon } from "scenerystack/sim";
import Colors from "../RelatedRatesColors.js";

function makeIcon(outline: string, points: readonly (readonly [number, number])[] = []): ScreenIcon {
  const background = new Rectangle(0, 0, 548, 373, { fill: Colors.backgroundColorProperty });
  const line = new Path(new Shape(outline), {
    stroke: Colors.accentColorProperty,
    lineWidth: 18,
    lineCap: "round",
    lineJoin: "round",
  });
  const markers = points.map(([x, y]) => new Circle(12, { x, y, fill: Colors.secondaryColorProperty }));
  return new ScreenIcon(new Node({ children: [background, line, ...markers] }), {
    maxIconWidthProportion: 1,
    maxIconHeightProportion: 1,
    fill: Colors.backgroundColorProperty,
  });
}

export function createRuleLabIcon(): ScreenIcon {
  return makeIcon("M 72 291 L 142 284 L 201 269 L 252 246 L 311 208 L 363 160 L 420 90 M 143 299 L 424 111", [
    [311, 208],
  ]);
}

export function createConicalTankIcon(): ScreenIcon {
  return makeIcon("M 87 69 L 273 312 L 460 69 M 87 69 L 460 69 M 163 169 L 382 169");
}

export function createSlidingLadderIcon(): ScreenIcon {
  return makeIcon("M 106 66 L 106 295 L 466 295 M 106 103 L 378 295", [
    [106, 103],
    [378, 295],
  ]);
}

export function createOilSlickIcon(): ScreenIcon {
  return makeIcon("M 274 78 C 417 78 417 295 274 295 C 131 295 131 78 274 78 M 274 186 L 381 186", [[274, 186]]);
}
