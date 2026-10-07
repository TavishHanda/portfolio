// A tiny isometric drawing kit for the project illustrations.
//
// World coordinates: x runs toward the bottom-right of the screen,
// y toward the bottom-left, z straight up. Every scene shares the same
// camera and the same light, so the six illustrations look like one set.
//
// Shapes are collected with a depth key and drawn back to front
// (painter's algorithm). Lower keys are further from the viewer.

const COS = Math.cos(Math.PI / 6);
type V3 = [number, number, number];

const f = (n: number) => n.toFixed(2);
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

/** Mix a hex colour toward black (amt < 0) or white (amt > 0). */
export function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const target = amt < 0 ? 0 : 255;
  const k = Math.abs(amt);
  const mix = (c: number) => Math.round(c + (target - c) * k);
  return `rgb(${mix((n >> 16) & 255)},${mix((n >> 8) & 255)},${mix(n & 255)})`;
}

// One light for everything: tops get the full colour, faces toward
// the bottom-left are a little darker, faces toward the bottom-right darkest.
const light = (nx: number, ny: number, nz: number) => -0.25 * nx - 0.12 * ny + 0.2 * Math.min(nz, 0);

export class Scene {
  private items: { k: number; svg: string }[] = [];

  constructor(private ox: number, private oy: number, private s: number) {}

  /** Project a world point to screen pixels. */
  p(x: number, y: number, z: number): [number, number] {
    return [this.ox + (x - y) * COS * this.s, this.oy + (x + y) * 0.5 * this.s - z * this.s];
  }

  private pts(list: V3[]) {
    return list.map(([x, y, z]) => this.p(x, y, z).map(f).join(',')).join(' ');
  }

  add(k: number, svg: string) {
    this.items.push({ k, svg });
  }

  /**
   * Wrap everything drawn inside `draw` in one <g> with a class, so CSS can animate it as a unit.
   * The group is drawn at depth k.
   */
  group(k: number, cls: string, draw: () => void, style = '') {
    const before = this.items.length;
    draw();
    const inner = this.items.splice(before).sort((a, b) => a.k - b.k).map((i) => i.svg).join('');
    this.add(k, `<g class="${cls}" style="${style}">${inner}</g>`);
  }

  /** Wisps of steam rising from a point, animated by CSS when the card is active. */
  steam(x: number, y: number, z: number, k: number) {
    const [px, py] = this.p(x, y, z);
    const wisps = [-4, 0, 4]
      .map((dx, i) => {
        const sx = px + dx;
        return `<path class="a-steam" style="--i:${i}" d="M${f(sx)} ${f(py)}c-3-4 3-7 0-11s3-7 0-11" fill="none" stroke="#ffffff" stroke-width="1.4" stroke-linecap="round" opacity=".85"/>`;
      })
      .join('');
    this.add(k, wisps);
  }

  poly(list: V3[], fill: string, k: number, extra = '') {
    this.add(k, `<polygon points="${this.pts(list)}" fill="${fill}" stroke="${fill}" stroke-width=".3" stroke-linejoin="round" ${extra}/>`);
  }

  line(list: V3[], stroke: string, width: number, k: number, extra = '') {
    this.add(k, `<polyline points="${this.pts(list)}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`);
  }

  /** A solid block. Returns its depth key so decals can be drawn just after it. */
  box(x: number, y: number, z: number, w: number, d: number, h: number, color: string, k = x + y + (w + d) / 2 + z * 0.01) {
    const edge = shade(color, -0.35);
    const face = (list: V3[], fill: string) =>
      `<polygon points="${this.pts(list)}" fill="${fill}" stroke="${edge}" stroke-width=".4" stroke-linejoin="round"/>`;
    this.add(
      k,
      face([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]], shade(color, -0.12)) +
        face([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]], shade(color, -0.25)) +
        face([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], color),
    );
    return k;
  }

  /** Flat rectangle lying on a horizontal surface at height z. */
  top(x: number, y: number, z: number, w: number, d: number, fill: string, k: number, extra = '') {
    this.poly([[x, y, z], [x + w, y, z], [x + w, y + d, z], [x, y + d, z]], fill, k, extra);
  }

  /** Flat rectangle on a wall facing bottom-left (the plane y = const). */
  wallY(x: number, y: number, z: number, w: number, h: number, fill: string, k: number) {
    this.poly([[x, y, z], [x + w, y, z], [x + w, y, z + h], [x, y, z + h]], fill, k);
  }

  /** Flat rectangle on a wall facing bottom-right (the plane x = const). */
  wallX(x: number, y: number, z: number, d: number, h: number, fill: string, k: number) {
    this.poly([[x, y, z], [x, y + d, z], [x, y + d, z + h], [x, y, z + h]], fill, k);
  }

  private ring(c: (t: number) => V3, n = 40): V3[] {
    return Array.from({ length: n }, (_, i) => c((i / n) * Math.PI * 2));
  }

  /** A flat disc lying on a horizontal surface. */
  disc(cx: number, cy: number, z: number, r: number, fill: string, k: number) {
    this.poly(this.ring((t) => [cx + r * Math.cos(t), cy + r * Math.sin(t), z]), fill, k);
  }

  /** A flat disc on a wall facing bottom-right (plane x = const). */
  discX(x: number, cy: number, cz: number, r: number, fill: string, k: number) {
    this.poly(this.ring((t) => [x, cy + r * Math.cos(t), cz + r * Math.sin(t)]), fill, k);
  }

  /** Upright cylinder, shaded strip by strip so it looks round. */
  cylZ(cx: number, cy: number, z: number, r: number, h: number, color: string, k = cx + cy + z * 0.01) {
    const n = 36;
    const strips: { d: number; svg: string }[] = [];
    for (let i = 0; i < n; i++) {
      const t0 = (i / n) * Math.PI * 2;
      const t1 = ((i + 1) / n) * Math.PI * 2;
      const m = (t0 + t1) / 2;
      const facing = Math.cos(m) + Math.sin(m);
      if (facing <= -0.05) continue;
      const fill = shade(color, light(Math.cos(m), Math.sin(m), 0));
      const q: V3[] = [
        [cx + r * Math.cos(t0), cy + r * Math.sin(t0), z],
        [cx + r * Math.cos(t1), cy + r * Math.sin(t1), z],
        [cx + r * Math.cos(t1), cy + r * Math.sin(t1), z + h],
        [cx + r * Math.cos(t0), cy + r * Math.sin(t0), z + h],
      ];
      strips.push({ d: facing, svg: `<polygon points="${this.pts(q)}" fill="${fill}" stroke="${fill}" stroke-width=".4"/>` });
    }
    strips.sort((a, b) => a.d - b.d);
    const lid = `<polygon points="${this.pts(this.ring((t) => [cx + r * Math.cos(t), cy + r * Math.sin(t), z + h]))}" fill="${color}"/>`;
    this.add(k, strips.map((s) => s.svg).join('') + lid);
    return k;
  }

  /** Cylinder lying along x (like a jet engine). The end at x + len faces the viewer. */
  cylX(x: number, cy: number, cz: number, r: number, len: number, color: string, k = x + len / 2 + cy) {
    const n = 48;
    const strips: { d: number; svg: string }[] = [];
    for (let i = 0; i < n; i++) {
      const t0 = (i / n) * Math.PI * 2;
      const t1 = ((i + 1) / n) * Math.PI * 2;
      const m = (t0 + t1) / 2;
      const facing = Math.cos(m) + Math.sin(m);
      if (facing <= -0.05) continue;
      const fill = shade(color, light(0, Math.cos(m), Math.sin(m)) + 0.08 * Math.sin(m));
      const q: V3[] = [
        [x, cy + r * Math.cos(t0), cz + r * Math.sin(t0)],
        [x + len, cy + r * Math.cos(t0), cz + r * Math.sin(t0)],
        [x + len, cy + r * Math.cos(t1), cz + r * Math.sin(t1)],
        [x, cy + r * Math.cos(t1), cz + r * Math.sin(t1)],
      ];
      strips.push({ d: facing, svg: `<polygon points="${this.pts(q)}" fill="${fill}" stroke="${fill}" stroke-width=".4"/>` });
    }
    strips.sort((a, b) => a.d - b.d);
    this.add(k, strips.map((s) => s.svg).join(''));
    return k;
  }

  /** Traffic cone standing at (cx, cy). */
  cone(cx: number, cy: number, r: number, h: number, color: string, k: number) {
    this.box(cx - r * 1.1, cy - r * 1.1, 0, r * 2.2, r * 2.2, 0.25, color, k);
    const side = (rr: number, z: number): [V3, V3] => [
      [cx - rr / Math.SQRT2, cy + rr / Math.SQRT2, z],
      [cx + rr / Math.SQRT2, cy - rr / Math.SQRT2, z],
    ];
    const [l0, r0] = side(r, 0.25);
    this.poly([l0, r0, [cx, cy, h]], color, k + 0.01);
    const [l1, r1] = side(r * 0.62, 0.25 + h * 0.36);
    const [l2, r2] = side(r * 0.45, 0.25 + h * 0.53);
    this.poly([l1, r1, r2, l2], '#ffffff', k + 0.02);
  }

  /** Map pin hovering at a world point, drawn flat to the screen. */
  pin(x: number, y: number, z: number, color: string, k = 200, order = 0) {
    const [px, py] = this.p(x, y, z);
    const [gx, gy] = this.p(x, y, z - 2.2);
    this.add(
      k,
      `<g class="a-pin" style="--i:${order}"><line x1="${f(px)}" y1="${f(py)}" x2="${f(gx)}" y2="${f(gy)}" stroke="${color}" stroke-width="1" stroke-dasharray="1.5 2"/>` +
        `<ellipse cx="${f(gx)}" cy="${f(gy)}" rx="3" ry="1.6" fill="${color}" opacity=".35"/>` +
        `<path d="M${f(px)} ${f(py)}C${f(px - 2)} ${f(py - 4)} ${f(px - 6)} ${f(py - 7)} ${f(px - 6)} ${f(py - 11)}A6 6 0 1 1 ${f(px + 6)} ${f(py - 11)}C${f(px + 6)} ${f(py - 7)} ${f(px + 2)} ${f(py - 4)} ${f(px)} ${f(py)}Z" fill="${color}" stroke="${shade(color, -0.3)}" stroke-width=".6"/>` +
        `<circle cx="${f(px)}" cy="${f(py - 11)}" r="2.3" fill="#fff"/></g>`,
    );
  }

  /** Text printed on a surface. */
  text(str: string, plane: 'y' | 'x' | 'top', x: number, y: number, z: number, size: number, fill: string, k: number, weight = 700) {
    const [X, Y] = this.p(x, y, z);
    const s = this.s;
    const m =
      plane === 'y' ? [COS * s, 0.5 * s, 0, s, X, Y]
      : plane === 'x' ? [COS * s, -0.5 * s, 0, s, X, Y]
      : [COS * s, 0.5 * s, -COS * s, 0.5 * s, X, Y];
    this.add(
      k,
      `<text transform="matrix(${m.map(f).join(' ')})" font-size="${size}" font-weight="${weight}" fill="${fill}" font-family="Geist, system-ui, sans-serif">${esc(str)}</text>`,
    );
  }

  /** Soft shadow under the base slab. */
  shadow(w: number, d: number, k = -100) {
    const pts = this.pts([[0.6, 0.6, -2.6], [w + 0.6, 0.6, -2.6], [w + 0.6, d + 0.6, -2.6], [0.6, d + 0.6, -2.6]]);
    this.add(k, `<polygon points="${pts}" fill="#0f172a" opacity=".12" filter="url(#soft)"/>`);
  }

  render(bg: string) {
    const body = [...this.items].sort((a, b) => a.k - b.k).map((i) => i.svg).join('');
    return `<defs><filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4"/></filter></defs><rect width="320" height="180" fill="${bg}"/>${body}`;
  }
}
