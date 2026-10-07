import { Scene } from './iso';

// Each scene is a little isometric diorama on a 22 x 16 base slab.
// Same camera, light, and slab for all of them so they read as one set.

const BLUE = '#2f43ff';
const DARK = '#2b313b';
const W = 22;
const D = 16;

function base(bg: string, slab: string) {
  const s = new Scene(146, 56, 5.5);
  s.shadow(W, D);
  s.box(0, 0, -1.5, W, D, 1.5, slab, -50);
  return s;
}

/** Monitor on a stand. Returns the depth key of the screen so the display can be drawn on it. */
function monitor(s: Scene, x: number, y: number, w: number, h: number, body = DARK) {
  s.box(x + w / 2 - 2, y - 1.6, 0, 4, 3, 0.35, body);
  s.box(x + w / 2 - 0.5, y - 0.9, 0.35, 1, 0.8, 3, body, x + y - 2);
  return s.box(x, y, 3.2, w, 0.8, h, body, x + y + 0.4);
}

function calgary311() {
  const s = base('#e6ebf2', '#dde3eb');
  // Roads with lane markings.
  s.top(0, 7, 0.01, W, 2, '#8e98a8', -40);
  s.top(10, 0, 0.01, 2, D, '#8e98a8', -40);
  for (const x of [1, 4, 7, 13.5, 16.5, 19.5]) s.top(x, 7.9, 0.02, 1.4, 0.2, '#ffffff', -39);
  for (const y of [1, 4, 10.5, 13.5]) s.top(10.9, y, 0.02, 0.2, 1.4, '#ffffff', -39);

  const building = (x: number, y: number, w: number, d: number, h: number, color: string) => {
    const k = s.box(x, y, 0, w, d, h, color);
    // Windows on both visible walls.
    for (let z = 1; z < h - 0.6; z += 1.4) {
      for (let wx = x + 0.5; wx < x + w - 0.5; wx += 1.1) s.wallY(wx, y + d + 0.01, z, 0.6, 0.7, '#f4f7fb', k + 0.01);
      for (let wy = y + 0.5; wy < y + d - 0.5; wy += 1.1) s.wallX(x + w + 0.01, wy, z, 0.6, 0.7, '#9fb0c8', k + 0.01);
    }
    return k;
  };
  building(1, 1, 4, 5, 6, '#c9d2df');
  building(6, 1, 3, 3, 9.5, '#aebbd0');
  building(6, 4.6, 3, 2, 3, '#d6dde7');
  building(13, 1, 3, 5, 5, '#d0d7e2');
  building(18.5, 1, 3, 3, 7.5, '#b9c5d6');
  building(1, 10, 3.5, 5, 4, '#d6dde7');
  building(5.5, 10, 3.5, 2.5, 7, '#bcc8d9');
  building(5.5, 13, 3.5, 2.2, 2.5, '#e4e8ee');
  building(13, 10, 4, 5, 3, '#cfd7e3');
  building(18.5, 10, 3, 3, 5.5, '#b3c0d3');

  // The Calgary Tower.
  const tk = s.cylZ(17.4, 5.4, 0, 0.55, 11, '#d6d9de', 25);
  s.cylZ(17.4, 5.4, 11, 1.5, 1.2, '#3a404b', tk + 0.01);
  s.group(tk + 0.02, 'a-blink', () => s.cylZ(17.4, 5.4, 12.2, 1.0, 0.6, '#e8443a', 0));
  s.line([[17.4, 5.4, 12.8], [17.4, 5.4, 15.2]], '#3a404b', 1, tk + 0.03);

  // Service requests showing up as map pins.
  s.pin(7.5, 2.5, 10.8, BLUE, 200, 0);
  s.pin(11, 3, 2.4, '#e8443a', 200, 1);
  s.pin(2.8, 12.5, 6.4, '#e8443a', 200, 2);
  s.pin(15, 12.5, 5.4, BLUE, 200, 3);
  return s.render('#e6ebf2');
}

function clinicScheduler() {
  const s = base('#e9eef3', '#e6d9c4');
  const k = monitor(s, 1.5, 2.6, 14, 8);
  // Calendar on the screen.
  s.wallY(2, 3.41, 3.7, 13, 7, '#ffffff', k + 0.01);
  s.wallY(2, 3.42, 9.5, 13, 1.2, BLUE, k + 0.02);
  s.text('Thursday clinic', 'y', 2.5, 3.43, 9.8, 0.75, '#ffffff', k + 0.03);
  const booked: Record<string, string> = { '0,1': '#16a34a', '1,3': '#16a34a', '2,0': '#bbf7d0', '2,2': BLUE, '3,1': '#bbf7d0', '4,3': '#16a34a', '1,0': '#bbf7d0', '3,3': '#16a34a' };
  for (let c = 0; c < 5; c++) {
    for (let r = 0; r < 4; r++) {
      const fill = booked[`${c},${r}`] ?? '#eef1f5';
      const cell = () => s.wallY(2.5 + c * 2.42 + 0.08, 3.43, 4.1 + r * 1.3 + 0.08, 2.26, 1.14, fill, k + 0.03);
      // The selected (blue) slot is the "new booking" that pops in when the card is active.
      if (fill === BLUE) s.group(k + 0.03, 'a-pop', cell);
      else cell();
    }
  }

  // Keyboard.
  const kk = s.box(3, 8.6, 0, 10, 3, 0.45, '#eef0f3');
  for (let i = 0; i < 12; i++) for (let j = 0; j < 4; j++) s.top(3.35 + i * 0.78, 8.9 + j * 0.62, 0.46, 0.6, 0.45, '#d3d9e1', kk + 0.01);

  // Stethoscope lying on the desk.
  const tube: [number, number, number][] = [];
  for (let i = 0; i <= 40; i++) {
    const t = 0.15 * Math.PI + (i / 40) * 1.9 * Math.PI;
    tube.push([16.2 + 2.3 * Math.cos(t), 12.8 + 1.5 * Math.sin(t), 0.05]);
  }
  tube.push([13.6, 14.6, 0.05]);
  s.line(tube, DARK, 1.6, 27);
  s.cylZ(13.1, 14.9, 0, 0.75, 0.35, '#c0c7d1', 28);

  // Mug and plant.
  const mk = s.cylZ(19, 9.5, 0, 1.15, 2.2, '#ffffff', 28.6);
  s.disc(19, 9.5, 2.21, 0.95, '#6b4226', mk + 0.01);
  s.steam(19, 9.5, 2.6, mk + 0.05);
  s.line([[20.1, 9.5, 1.8], [20.9, 9.5, 1.6], [20.9, 9.5, 0.8], [20.1, 9.5, 0.6]], '#c9ced6', 3, mk + 0.02);
  s.line([[20.1, 9.5, 1.8], [20.9, 9.5, 1.6], [20.9, 9.5, 0.8], [20.1, 9.5, 0.6]], '#ffffff', 1.8, mk + 0.03);
  const pk = s.cylZ(19, 3, 0, 1.3, 2, '#5b6b8c', 22);
  s.disc(19, 3, 2.01, 1.1, '#5a4636', pk + 0.01);
  const [lx, ly] = s.p(19, 3, 2);
  const leaves = [[-30, 9], [10, 10], [45, 8], [-60, 7], [80, 7], [-5, 12]]
    .map(([a, len]) => `<ellipse cx="${lx}" cy="${ly - len / 2}" rx="2.6" ry="${len / 2}" transform="rotate(${a} ${lx} ${ly})" fill="#2f8f4e" stroke="#22703c" stroke-width=".5"/>`)
    .join('');
  s.add(pk + 0.02, leaves);
  return s.render('#e9eef3');
}

function taskSync() {
  const s = base('#e8ecf3', '#dde3eb');
  // Laptop.
  const bk = s.box(2.5, 6.5, 0, 11, 7.5, 0.6, '#c5cbd4');
  s.top(3.4, 7.1, 0.61, 9.2, 3.6, '#2f3540', bk + 0.01);
  for (let i = 0; i < 13; i++) for (let j = 0; j < 5; j++) s.top(3.6 + i * 0.68, 7.3 + j * 0.66, 0.62, 0.5, 0.48, '#525a68', bk + 0.02);
  s.top(6.5, 11.3, 0.61, 3, 1.9, '#b4bbc6', bk + 0.01);
  const k = s.box(2.5, 5.9, 0.6, 11, 0.6, 7.2, DARK, 8);
  s.wallY(3, 6.51, 1.1, 10, 6.2, '#f4f6fa', k + 0.01);
  s.wallY(3, 6.52, 6.5, 10, 0.8, BLUE, k + 0.02);
  s.text('Task-Sync', 'y', 3.4, 6.53, 6.72, 0.6, '#ffffff', k + 0.03);
  const cols = [
    ['#ffcf33', '#2f43ff', '#16a34a'],
    ['#2f43ff', '#ffcf33'],
    ['#16a34a'],
  ];
  // How far one column to the right and one card up is on screen, for the sliding card.
  const [ax, ay] = s.p(0, 0, 0);
  const [bx, by] = s.p(3.15, 0, 1.2);
  cols.forEach((cards, c) => {
    const cx = 3.35 + c * 3.15;
    s.wallY(cx, 6.52, 1.4, 3.0, 4.8, '#e3e8f0', k + 0.02);
    cards.forEach((color, i) => {
      const z = 5.1 - i * 1.2;
      s.wallY(cx + 0.2, 6.53, z, 2.6, 0.95, '#ffffff', k + 0.03);
      s.wallY(cx + 0.2, 6.54, z + 0.8, 2.6, 0.15, color, k + 0.04);
    });
  });
  s.group(k + 0.05, 'a-move', () => {
    const cx = 3.35 + 3.15;
    s.wallY(cx + 0.2, 6.55, 2.7, 2.6, 0.95, '#ffffff', 0);
    s.wallY(cx + 0.2, 6.56, 3.5, 2.6, 0.15, '#ff6c2f', 0.01);
  }, `--dx:${(bx - ax).toFixed(1)}px;--dy:${(by - ay).toFixed(1)}px`);

  // Sticky notes with a finished task.
  s.box(15.5, 10, 0, 4.2, 4.2, 0.25, '#f5c518', 30);
  const nk = s.box(15.9, 10.3, 0.25, 4.2, 4.2, 0.25, '#ffd84d', 30.1);
  s.line([[16.5, 11.2, 0.51], [16.9, 11.6, 0.51], [17.6, 10.8, 0.51]], BLUE, 1.2, nk + 0.01);
  s.line([[18, 11.1, 0.51], [19.6, 11.1, 0.51]], '#6b5a1a', 0.9, nk + 0.01);
  s.line([[16.5, 12.5, 0.51], [19.6, 12.5, 0.51]], '#6b5a1a', 0.9, nk + 0.01);
  s.line([[16.5, 13.6, 0.51], [18.8, 13.6, 0.51]], '#6b5a1a', 0.9, nk + 0.01);

  // Stacked shipping containers, for the Docker setup.
  const container = (z: number, color: string, k0: number) => {
    const ck = s.box(15, 1, z, 6.5, 2.8, 2.6, color, k0);
    for (let x = 15.4; x < 21.3; x += 0.5) s.line([[x, 3.81, z + 0.2], [x, 3.81, z + 2.4]], 'rgba(0,0,0,.18)', 0.6, ck + 0.01);
    s.wallX(21.51, 1.3, z + 0.2, 1.05, 2.2, 'rgba(0,0,0,.12)', ck + 0.01);
    s.wallX(21.51, 2.45, z + 0.2, 1.05, 2.2, 'rgba(0,0,0,.12)', ck + 0.01);
  };
  container(0, BLUE, 20);
  container(2.6, '#0ea5a4', 20.1);
  return s.render('#e8ecf3');
}

function acadiaPizza() {
  const s = base('#f1ece9', '#f5f6f8');
  // Checked tablecloth.
  for (let i = 0; i < 11; i++) for (let j = 0; j < 8; j++) if ((i + j) % 2 === 0) s.top(i * 2, j * 2, 0.005, 2, 2, '#f1b2a8', -45);

  // Point-of-sale screen with the menu.
  const k = monitor(s, 1.5, 3, 8.5, 6);
  s.wallY(1.9, 3.81, 3.6, 7.7, 5.3, '#ffffff', k + 0.01);
  s.wallY(1.9, 3.82, 8.0, 7.7, 0.9, '#ff6c2f', k + 0.02);
  s.text('Acadia Pizza', 'y', 2.3, 3.83, 8.23, 0.65, '#ffffff', k + 0.03);
  for (let r = 0; r < 4; r++) {
    const z = 6.9 - r * 0.95;
    s.wallY(2.4, 3.83, z, 0.6, 0.6, '#f6c45c', k + 0.03);
    s.wallY(3.3, 3.83, z + 0.15, 3.6, 0.32, '#dfe4ec', k + 0.03);
    s.wallY(7.6, 3.83, z + 0.05, 1.5, 0.5, '#ff6c2f', k + 0.03);
  }

  // Open pizza box: lid standing at the back, pizza inside.
  const lk = s.box(12, 6.6, 0.9, 7.5, 0.4, 7, '#efdcb8', 21);
  s.text('Acadia', 'y', 13.2, 7.01, 5.6, 1.4, '#c2410c', lk + 0.01, 800);
  s.text('Pizza', 'y', 13.2, 7.01, 4.1, 1.4, '#c2410c', lk + 0.01, 800);
  const bk = s.box(12, 7, 0, 7.5, 7.5, 0.9, '#e9d3a8', 24);
  s.top(12.35, 7.35, 0.91, 6.8, 6.8, '#d9bf8e', bk + 0.01);
  s.disc(15.75, 10.75, 0.92, 3.15, '#d9913f', bk + 0.02);
  s.disc(15.75, 10.75, 0.93, 2.7, '#f4be55', bk + 0.03);
  for (const [dx, dy] of [[-1.3, -1], [0.9, -1.5], [1.6, 0.4], [-0.3, 1.5], [-1.7, 0.6], [0.2, -0.1], [1, 1.6]]) {
    s.disc(15.75 + dx, 10.75 + dy, 0.94, 0.45, '#b8291e', bk + 0.04);
  }
  for (const [dx, dy] of [[-0.8, 0.2], [1.2, -0.5], [0.6, 0.9]]) s.disc(15.75 + dx, 10.75 + dy, 0.95, 0.22, '#2f8f4e', bk + 0.05);
  s.steam(15.75, 10.75, 2.2, bk + 0.1);

  // Database: three stacked tiers.
  for (const [i, z] of [0, 1.25, 2.5].entries()) s.cylZ(19.6, 2.8, z, 1.7, 1, BLUE, 22 + i * 0.01);

  // Order ticket on the table.
  const tk = s.box(4, 10.5, 0, 3, 4.2, 0.05, '#ffffff', 15);
  for (let i = 0; i < 5; i++) s.top(4.4, 11 + i * 0.7, 0.06, i === 4 ? 1.2 : 2.2, 0.18, '#9aa3b0', tk + 0.01);
  return s.render('#f1ece9');
}

function valorantAnalyst() {
  const RED = '#ff4655';
  const TEAL = '#18e5b5';
  const s = base('#1c222c', '#3b414d');
  // Desk mat with a red trim.
  const mk = s.box(1, 8.4, 0, 20, 6.8, 0.12, '#16191f', -30);
  s.line([[1.4, 8.8, 0.13], [20.6, 8.8, 0.13], [20.6, 14.8, 0.13], [1.4, 14.8, 0.13], [1.4, 8.8, 0.13]], RED, 0.8, mk + 0.01);

  // Monitor showing a round-by-round review.
  const k = monitor(s, 1.5, 2.6, 15, 8.4, '#15181e');
  s.wallY(2, 3.41, 3.6, 14, 7.5, '#0f1923', k + 0.01);
  s.text('13 - 9', 'y', 2.6, 3.42, 9.6, 1.1, '#ffffff', k + 0.02, 800);
  s.text('Round review', 'y', 7.2, 3.42, 9.75, 0.6, '#8b97a8', k + 0.02, 500);
  const rounds = 'wwlwlwwlwwlwlwwlwlwwlw';
  rounds.split('').forEach((r, i) => {
    const h = r === 'w' ? 1.6 + ((i * 37) % 23) / 10 : 0.8 + ((i * 13) % 9) / 10;
    s.group(k + 0.02, 'a-bar', () => s.wallY(2.6 + i * 0.6, 3.42, 4.8, 0.42, h, r === 'w' ? TEAL : RED, 0), `--i:${i}`);
    s.wallY(2.6 + i * 0.6, 3.42, 4.0, 0.42, 0.42, r === 'w' ? TEAL : RED, k + 0.02);
  });

  // Keyboard with WASD picked out.
  const kk = s.box(2.5, 9.6, 0.12, 10.5, 3.6, 0.55, '#252a33', 14);
  const wasd = new Set(['2,0', '1,1', '2,1', '3,1']);
  for (let i = 0; i < 14; i++) {
    for (let j = 0; j < 5; j++) {
      s.top(2.8 + i * 0.72, 9.85 + j * 0.64, 0.68, 0.55, 0.48, wasd.has(`${i},${j}`) ? RED : '#3a404b', kk + 0.01);
    }
  }
  s.line([[2.5, 13.2, 0.13], [13, 13.2, 0.13]], RED, 1.2, kk + 0.02, 'class="a-glow" opacity=".7"');

  // Mouse and a can.
  const mo = s.box(16.4, 10.2, 0.12, 1.8, 2.8, 0.75, '#252a33', 27);
  s.top(17.1, 10.5, 0.88, 0.4, 0.8, RED, mo + 0.01);
  const ck = s.cylZ(19.6, 4, 0, 0.85, 2.6, TEAL, 23);
  s.disc(19.6, 4, 2.61, 0.7, '#c9ced6', ck + 0.01);
  return s.render('#1c222c');
}

function turbineInspection() {
  const s = base('#e4e8ee', '#cdd3db');
  // Yellow safety lines around the bay.
  const Y = '#f5b301';
  s.top(0.7, 0.7, 0.01, W - 1.4, 0.35, Y, -40);
  s.top(0.7, D - 1.05, 0.01, W - 1.4, 0.35, Y, -40);
  s.top(0.7, 0.7, 0.01, 0.35, D - 1.4, Y, -40);
  s.top(W - 1.05, 0.7, 0.01, 0.35, D - 1.4, Y, -40);

  // Engine stands.
  s.box(5, 6.6, 0, 1.2, 4.8, 2.2, Y, 10);
  s.box(13, 6.6, 0, 1.2, 4.8, 2.2, Y, 10.1);

  // The engine.
  const ek = s.cylX(2.5, 9, 4.6, 3.3, 13.5, '#c3cad4', 18);
  s.cylX(15.4, 9, 4.6, 3.5, 1.2, '#aab3bf', ek + 0.01);
  s.discX(16.6, 9, 4.6, 3.5, '#8d97a5', ek + 0.02);
  s.discX(16.61, 9, 4.6, 3.0, '#2a303b', ek + 0.03);
  const blades = Array.from({ length: 18 }, (_, i) => (i / 18) * Math.PI * 2)
    .map((a) => {
      const [x1, y1] = s.p(16.62, 9 + 0.8 * Math.cos(a), 4.6 + 0.8 * Math.sin(a));
      const [x2, y2] = s.p(16.62, 9 + 2.85 * Math.cos(a + 0.4), 4.6 + 2.85 * Math.sin(a + 0.4));
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#a7b0bd" stroke-width="1.3" stroke-linecap="round"/>`;
    })
    .join('');
  const [fx, fy] = s.p(16.62, 9, 4.6);
  s.add(ek + 0.04, `<g class="a-fan" data-cx="${fx}" data-cy="${fy}" data-s="5.5">${blades}</g>`);
  s.discX(16.63, 9, 4.6, 0.8, '#e9edf2', ek + 0.05);
  s.discX(16.64, 9, 4.6, 0.25, '#2a303b', ek + 0.06);

  // Tool cart with a tablet showing the inspection site.
  const ck = s.box(18.3, 1.2, 0, 3.3, 2.8, 3.2, '#e8443a', 19);
  for (const z of [0.9, 1.9]) {
    s.wallY(18.6, 4.01, z, 2.7, 0.06, 'rgba(0,0,0,.35)', ck + 0.01);
    s.wallY(19.6, 4.01, z + 0.35, 0.8, 0.15, '#f1f3f6', ck + 0.01);
  }
  const tk = s.box(18.7, 2.2, 3.2, 2.6, 0.35, 2.1, DARK, ck + 0.02);
  s.wallY(18.85, 2.56, 3.35, 2.3, 1.8, '#ffffff', tk + 0.01);
  s.wallY(18.85, 2.57, 4.75, 2.3, 0.4, BLUE, tk + 0.02);
  s.line([[19.4, 2.58, 4.0], [19.8, 2.58, 3.65], [20.6, 2.58, 4.45]], '#16a34a', 1.2, tk + 0.03);

  // Cones at the front.
  s.cone(19.5, 13.8, 0.75, 2.6, '#f97316', 33);
  s.cone(3, 13.8, 0.75, 2.6, '#f97316', 17);
  return s.render('#e4e8ee');
}

export const scenes: Record<string, () => string> = {
  'calgary-311-explorer': calgary311,
  'clinic-scheduler': clinicScheduler,
  'task-sync': taskSync,
  'acadia-pizza': acadiaPizza,
  'valorant-analyst': valorantAnalyst,
  'turbine-inspection-site': turbineInspection,
};
