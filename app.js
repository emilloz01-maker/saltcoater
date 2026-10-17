import * as THREE from './vendor/three.module.js';
import { OrbitControls } from './vendor/OrbitControls.js';
const $ = id => document.getElementById(id);
const E = '<span class="tag e">Eksempel</span>';

// ---------- renderer ----------
const canvas = $('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 400);
const controls = new OrbitControls(camera, canvas); controls.enableDamping = true; controls.minDistance = 4; controls.maxDistance = 170;
scene.add(new THREE.HemisphereLight(0xfff6e0, 0x6a6050, 1.3));
const sun = new THREE.DirectionalLight(0xfff1d6, 1.9); sun.position.set(8, 14, 10); scene.add(sun);
const fill = new THREE.DirectionalLight(0xdfe8ff, 0.6); fill.position.set(-10, 2, -8); scene.add(fill);

// ---------- parts catalogue ----------
const PARTS = [
  { id: 'silo', n: 'Buffersiloer', fn: 'Råt granulat fra granuleringen lagres her, før det fødes ind i coateren.', facts: ['En buffer lader coateren køre videre, hvis granuleringen står stille et stykke tid', 'Bufferens størrelse afhænger af flowet og den ønskede driftssikkerhed'], ex: 'Generel lærebogsbeskrivelse.' },
  { id: 'feed', n: 'Indføring af råt granulat', fn: 'Doserer rågranulat jævnt ind i den ene ende af lejet.', facts: ['Et stabilt fødeflow giver stabil vandbalance i kamrene', 'Ændringer foretages typisk gradvist, så regulering kan følge med'], ex: 'Generel lærebogsbeskrivelse.' },
  { id: 'bed', n: 'Fluid bed-coater med kamre', fn: 'Langt, vandret rustfrit hus opdelt i kamre. Granulatet svæver i luften og flyder kontinuert fra indløb til udløb.', facts: ['Flere kamre giver en smallere opholdstidsfordeling', 'Isolerede inspektionslåger i siden giver adgang til kamrene ved stop og rengøring', 'Anlægget er lukket, så enzymstøv holdes inde'], ex: 'Antal kamre, låger og mål i modellen er et ' + E + ' – ikke et bestemt anlæg.' },
  { id: 'plate', n: 'Rillet bundplade (slidser)', fn: 'Bunden i lejet er en plade med smalle, rillede slidser. Procesluften strømmer OPAD gennem slidserne og løfter granulatet, så det fluidiseres.', facts: ['Slidserne fordeler luften jævnt over hele bunden', 'Slidserne kan være vinklet, så luften også skubber produktet frem mod udløbet', 'For lidt luft: lejet ligger stille og klumper · for meget: fine partikler blæses op i filtrene', 'Dyserne stikker op gennem bundpladen'], ex: 'Rillernes mønster er illustrativt.' },
  { id: 'air', n: 'Procesluft · indblæsning nedefra', fn: 'Opvarmet procesluft føres i store luftkanaler ned til luftkasser under hvert kammer og blæses derfra op gennem bundpladen.', facts: ['Luften kommer altid nedefra – det er den, der bærer lejet', 'Hvert kammer har typisk sin egen luftmængde og temperatur', 'Luften leverer energien til at fordampe vandet'], ex: 'Kanalføringen er en forenkling – ' + E + '.' },
  { id: 'lance', n: 'Lanser / dyser (bottom-spray)', fn: 'Lanserne går op gennem bunden. Dyserne stikker lige op over bundpladen og sprøjter saltopløsningen OPAD ind i det fluidiserede leje.', facts: ['Bottom-spray: dråber og partikler bevæger sig samme vej – opad', 'Kort vej fra dyse til partikel giver mindre tørring i luften', 'Tostofdyser: væske og trykluft mødes i dysen', 'Lanserne tilsluttes nedefra med slanger'], ex: 'Antal og placering af dyser er et ' + E + '.' },
  { id: 'salt', n: 'Saltopløsning · slanger', fn: 'Vandig opløsning af overvejende natriumsulfat (Na₂SO₄), evt. med lidt binder. Den pumpes til en fordelingsledning under anlægget og videre i slanger op til hver lanse.', facts: ['Opløsningen er mest vand, som skal fordampes', 'Natriumsulfat kan krystallisere, hvis opløsningen bliver for kold', 'Blandingen kontrolleres før start'], ex: 'Generel lærebogsbeskrivelse.' },
  { id: 'atom', n: 'Forstøvningsluft', fn: 'Filtreret og tempereret trykluft, der føres til lanserne nedefra og river væsken op i dråber.', facts: ['Mere luft pr. kg væske → mindre dråber', 'For store dråber → våde pletter og klumper', 'For små dråber → tørrer i luften (spraytørring, støv)'], ex: 'Balancen mellem klumper og støv styres i høj grad her.' },
  { id: 'exh', n: 'Afgangsluft · filter · fugtmåling', fn: 'Den fugtige luft forlader lejet opad gennem filtre og store luftkanaler; dens relative fugt er et vigtigt styresignal.', facts: ['Høj fugt: lejet er vådt og tæt på at klumpe', 'Lav fugt: dråber tørrer for hurtigt, mere støv', 'Filtrene holder fint støv inde i anlægget'], ex: 'Generel lærebogsbeskrivelse.' },
  { id: 'out', n: 'Udløb · cellesluse · snegl', fn: 'I enden falder det saltcoatede granulat ud gennem en cellesluse i gavlen og føres med en snegl videre til kopelevatoren.', facts: ['Celleslusen tømmer produkt ud uden at slippe luft ud af lejet', 'Produktmængden ud er råt granulat plus det påførte salt', 'Produkttemperaturen ligger tæt på afgangsluftens'], ex: 'Generel lærebogsbeskrivelse.' },
  { id: 'elev', n: 'Kopelevator', fn: 'Lodret elevator med kopper (bægre) på et bånd. Den løfter det færdige granulat fra coaterens udløb op, så det kan falde videre til næste trin.', facts: ['Skånsom transport – granulatet ligger stille i kopperne', 'Lukket kasse holder støvet inde', 'Kopperne tømmes i toppen, og produktet glider ned gennem et faldrør'], ex: 'Højde og placering er et ' + E + '.' },
  { id: 'tcoat', n: 'Voks-/kaolin-coater', fn: 'Lægger et yderlag af smeltet voks (fx PEG) og et mineralsk pulver (fx kaolin) uden på – støvværnet.', facts: ['Den smeltede voks binder pulver og støv til overfladen', 'Et sidste tyndt vokslag kan forsegle overfladen', 'Mindre voks giver hurtigt mere støv'], ex: 'Generel lærebogsbeskrivelse.' },
  { id: 'cool', n: 'Køling og afstøvning', fn: 'Granulatet køles, så voksen stivner til en lukket skal, og løst støv fjernes.', facts: ['Kølig luft størkner voksen', 'Afstøvning fjerner fine partikler', 'Færdigt granulat: kerne → saltlag → voks/kaolin'], ex: 'Generel lærebogsbeskrivelse.' },
];
const P = Object.fromEntries(PARTS.map((p, i) => (p.i = i + 1, [p.id, p])));

// ---------- materials ----------
const mats = [];
const M = (c, o = {}) => { const m = new THREE.MeshStandardMaterial({ color: c, roughness: .55, metalness: .35, ...o }); m.userData.base = { opacity: m.opacity, transparent: m.transparent }; mats.push(m); return m; };
const steel = () => M(0xb8bcbc), dark = () => M(0x6c6a62), cop = () => M(0x8a3b1e, { metalness: .2 });
const groups = {};
const root = new THREE.Group(); scene.add(root);
function part(id, ex) { const g = new THREE.Group(); g.userData = { part: id, ex: new THREE.Vector3(...ex) }; groups[id] = g; root.add(g); return g; }
function add(g, geo, mat, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.userData.part = g.userData.part; g.add(m); return m; }
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d), cyl = (r1, r2, h, s = 28) => new THREE.CylinderGeometry(r1, r2, h, s);
function pipe(g, pts, r, mat) { const c = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)), false, 'catmullrom', 0.05); return add(g, new THREE.TubeGeometry(c, 60, r, 10), mat); }

// Buffersiloer
{ const g = part('silo', [-4, 0, 0]); const m = steel();
  for (const z of [-1.3, 1.3]) { add(g, cyl(1.1, 1.1, 4), m, -14, 4, z); add(g, cyl(1.1, .25, 1.4), m, -14, 1.3, z); add(g, cyl(1.15, 1.15, .15), dark(), -14, 6.05, z); }
  for (const x of [-15, -13]) for (const z of [-2.2, 2.2]) add(g, box(.12, 3.4, .12), dark(), x, -.6, z * .9);
  pipe(g, [[-14, .6, -1.3], [-14, .3, 0], [-13, .3, 0]], .18, m); pipe(g, [[-14, .6, 1.3], [-14, .3, 0]], .18, m); }
// Indføring
{ const g = part('feed', [-2, 2.5, 0]); const m = M(0xc9a26a, { metalness: .2 });
  pipe(g, [[-13, .3, 0], [-12, .6, 0], [-11, 4.4, 0]], .22, m); add(g, cyl(.45, .45, .7), cop(), -11, 4.7, 0).rotation.x = Math.PI / 2;
  pipe(g, [[-11, 4.6, 0], [-10, 4.6, 0], [-9.2, 3.2, 0]], .2, m); }
// Coater-hus: langt, vandret, rustfrit med inspektionslåger
const housingMats = [];
const CH = [-7.2, -3.6, 0, 3.6, 7.2]; // kammercentre
{ const g = part('bed', [0, 0, 0]); const m = M(0xc8cccb, { transparent: true, opacity: .28, depthWrite: false }); m.userData.base = { opacity: .28, transparent: true }; housingMats.push(m);
  const solid = M(0xc9cdcd, { metalness: .55, roughness: .38 }); housingMats.push(solid);
  const door = M(0xd7dada, { metalness: .5, roughness: .32 }), frame = M(0x9aa0a0, { metalness: .6, roughness: .35 }), hnd = dark();
  add(g, box(18.4, 4.6, .3), solid, 0, 1.1, -2.2); add(g, box(18.4, 4.6, .12), m, 0, 1.1, 2.1);
  add(g, box(.3, 4.6, 4.5), solid, -9.25, 1.1, 0); add(g, box(.3, 4.6, 4.5), solid, 9.25, 1.1, 0);
  add(g, box(18.4, .12, 4.3), m, 0, 3.4, 0);
  add(g, box(18.8, .25, 4.6), frame, 0, 3.5, 0).scale.set(1, 1, 1);
  for (let i = 1; i < 5; i++) add(g, box(.08, 2.4, 4.1), M(0x8f948f), -9 + i * 3.6, 0.1, 0);
  // isolerede inspektionslåger: massive på bagsiden, rammer på forsiden (gennemsigtig)
  for (const X of CH) for (const dx of [-.85, .85]) {
    add(g, box(1.3, 1.9, .14), door, X + dx, .9, -2.42); add(g, box(.12, .5, .1), hnd, X + dx + (dx < 0 ? .45 : -.45), .9, -2.54);
    for (const [w, h, ox, oy] of [[1.4, .08, 0, .98], [1.4, .08, 0, -.98], [.08, 2, -.68, 0], [.08, 2, .68, 0]]) add(g, box(w, h, .1), frame, X + dx + ox, .9 + oy, 2.17);
    add(g, box(.1, .45, .1), hnd, X + dx + (dx < 0 ? .5 : -.5), .9, 2.25); }
  // stativ
  for (const x of [-9, -3, 3, 9]) for (const z of [-2.1, 2.1]) add(g, box(.18, 2.4, .18), dark(), x, -4.1, z);
  const lab = (t) => { const c = document.createElement('canvas'); c.width = 128; c.height = 64; const x = c.getContext('2d'); x.fillStyle = '#ece2c8'; x.fillRect(0, 0, 128, 64); x.strokeStyle = '#3b3426'; x.lineWidth = 4; x.strokeRect(2, 2, 124, 60); x.fillStyle = '#3b3426'; x.font = 'italic 34px Georgia'; x.textAlign = 'center'; x.fillText(t, 64, 45); const tx = new THREE.CanvasTexture(c); return new THREE.MeshBasicMaterial({ map: tx }); };
  for (let i = 0; i < 5; i++) { const s = add(g, new THREE.PlaneGeometry(1.2, .6), lab('K' + (i + 1)), CH[i], 2.75, 2.17); s.material.map.colorSpace = THREE.SRGBColorSpace; } }
// Rillet bundplade (slidser) + dyser stikker op
{ const g = part('plate', [0, -1.6, 0]); const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.fillStyle = '#9da2a2'; x.fillRect(0, 0, 128, 128);
  for (let j = 0; j < 16; j++) { x.fillStyle = '#2b2b28'; for (let i = 0; i < 4; i++) x.fillRect(4 + i * 32 + (j % 2) * 16, 3 + j * 8, 22, 2.2); x.fillStyle = '#c4c8c8'; x.fillRect(0, 6 + j * 8, 128, 1); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(14, 3); add(g, box(18.2, .1, 4.1), M(0xffffff, { map: t, metalness: .5, roughness: .4 }), 0, -1.15, 0); }
// Procesluft: store kanaler over anlægget, nedføring bag coateren, luftkasser under kamrene
{ const g = part('air', [0, -3.6, -2]); const m = M(0x9b8f74), duct = M(0xb9bdbb, { metalness: .5, roughness: .4 });
  add(g, box(22, 1.6, 1.6), duct, -.5, 7.4, -3.4); add(g, box(2.4, 2.2, 2.2), cop(), -11.2, 7.4, -3.4);
  for (const X of CH) { add(g, box(3.4, 1.5, 4.1), m, X, -2, 0); add(g, box(.9, 9.4, .9), duct, X, 2.7, -3.4); add(g, box(.9, .9, 1.3), duct, X, -2, -2.7); add(g, cyl(.5, .5, .14), cop(), X, 4.5, -3.4); } }
// Lanser nedefra (bottom-spray)
const LX = [], LZ = [-1, 1];
for (const X of CH) LX.push(X - .9, X + .9);
{ const g = part('lance', [0, -3.2, 0]); const m = M(0xc0c4c4, { metalness: .7, roughness: .3 }); const tip = cop();
  for (const X of LX) for (const z of LZ) { add(g, cyl(.06, .06, 3.2, 8), m, X, -2.45, z); add(g, cyl(.04, .1, .22, 10), tip, X, -.98, z); add(g, cyl(.13, .13, .25, 10), dark(), X, -3.9, z); } }
// Saltopløsning: tank, fordelingsledning under anlægget, blå slanger op til lanserne
{ const g = part('salt', [0, -2.5, 3]); const m = M(0x6f9fc0, { metalness: .3 }), hose = M(0x2f6fb5, { metalness: .05, roughness: .6 });
  for (const z of [-1.9, 1.9]) add(g, cyl(.1, .1, 18, 10), m, 0, -4.7, z).rotation.z = Math.PI / 2;
  for (const X of LX) for (const z of LZ) pipe(g, [[X, -4.0, z], [X + .15, -4.4, z * 1.25], [X + .25, -4.7, z * 1.9]], .045, hose);
  pipe(g, [[-9, -4.7, -1.9], [-10, -4.7, -3], [-10.6, -1, -3.5]], .1, m);
  add(g, cyl(.9, .9, 2.2), M(0xa8c6d8), -11, .5, -3.6); add(g, cyl(.95, .95, .12), dark(), -11, 1.65, -3.6); }
// Forstøvningsluft
{ const g = part('atom', [0, -1, -3.5]); const m = steel();
  add(g, box(.8, 1.2, .8), M(0x8b8f72), -4, -3.6, -5.4); add(g, box(1.6, 1.4, 1.1), M(0x5f7d8f), -2, -3.5, -5.4); add(g, cyl(.45, .45, 1.6), M(0x6f9fc0), .2, -3.4, -5.4).rotation.z = Math.PI / 2; add(g, box(.8, 1.2, .8), M(0x8b8f72), 2.2, -3.6, -5.4);
  pipe(g, [[-4, -3.6, -5.4], [2.2, -3.6, -5.4]], .1, m); pipe(g, [[2.2, -3.6, -5.4], [3.4, -5.1, -4], [3.4, -5.1, 0]], .1, m);
  add(g, cyl(.08, .08, 18, 10), M(0xb08a3a), 0, -5.1, 0).rotation.z = Math.PI / 2;
  const hs = M(0x55524a); for (const X of LX) for (const z of LZ) pipe(g, [[X, -4.0, z], [X - .1, -4.7, z * .5], [X - .15, -5.1, 0]], .03, hs); }
// Afgangsluft
{ const g = part('exh', [0, 3, 0]); const m = M(0xb3b1a2);
  for (let k = 0; k < 3; k++) { const x = -6 + k * 6; add(g, cyl(1.5, 2.2, 1.2, 4), m, x, 4.6, 0).rotation.y = Math.PI / 4; add(g, box(4, 2.2, 2.6), m, x, 6.3, 0); for (let f = -1.4; f <= 1.4; f += .7) add(g, cyl(.15, .15, 1.9, 10), M(0xe8e1cc), x + f, 6.3, 1.32);
    pipe(g, [[x, 7.4, 0], [x, 8.2, 0], [x + 1, 8.9, 0]], .45, m); add(g, cyl(.22, .22, .5, 12), cop(), x - 1.2, 7.6, 0); }
  add(g, cyl(.75, .75, 16, 16), m, 1.5, 8.9, 0).rotation.z = Math.PI / 2; }
// Udløb: cellesluse i gavlen + snegl
{ const g = part('out', [2, -.5, 0]); const m = M(0xc9a26a, { metalness: .2 }), st = steel();
  add(g, box(.8, .7, 1.2), st, 9.8, -.85, 0); add(g, cyl(.55, .55, .9, 20), cop(), 9.95, -1.7, 0).rotation.x = Math.PI / 2; add(g, box(.5, .5, .7), dark(), 9.95, -1.7, .75);
  add(g, cyl(.32, .32, 1.6, 16), st, 10.75, -2.75, 0).rotation.z = Math.PI / 2; add(g, cyl(.3, .3, .5, 12), dark(), 10.1, -2.75, 0).rotation.z = Math.PI / 2;
  pipe(g, [[9.95, -2.2, 0], [9.95, -2.6, 0]], .25, m); }
// Kopelevator
const bucketMesh = (() => { const g = part('elev', [3.5, .5, 0]); const st = M(0xc4c8c8, { metalness: .55, roughness: .4 });
  const glass = M(0xc8cccb, { transparent: true, opacity: .3, depthWrite: false }); glass.userData.base = { opacity: .3, transparent: true }; housingMats.push(glass);
  add(g, box(1.2, 12, .9), glass, 11.6, 3.2, 0); add(g, box(1.6, 1.3, 1.4), st, 11.6, -3.3, 0); add(g, box(1.7, 1.4, 1.2), st, 11.75, 9.8, 0);
  for (const y of [-1.5, 1.5, 4.5, 7.5]) add(g, box(1.3, .12, 1.0), st, 11.6, y, 0);
  for (const x of [11.05, 12.15]) for (const z of [-.42, .42]) add(g, box(.08, 12, .08), st, x, 3.2, z);
  add(g, cyl(.6, .6, .3, 20), dark(), 11.6, 9.8, .65).rotation.x = Math.PI / 2; add(g, box(.7, .6, .6), M(0x5f7d8f), 11.6, 9.8, 1.1);
  pipe(g, [[12.4, 9.4, 0], [13.6, 5, 0], [14.2, 1.6, 0], [14.2, 1, 0]], .22, M(0xc9a26a, { metalness: .2 }));
  add(g, box(.05, 12.4, .05), dark(), 11.35, 3.2, 0); add(g, box(.05, 12.4, .05), dark(), 11.85, 3.2, 0);
  const bm = new THREE.InstancedMesh(new THREE.BoxGeometry(.32, .2, .5), new THREE.MeshStandardMaterial({ color: 0x8a3b1e, metalness: .3, roughness: .5 }), 40); bm.userData.part = 'elev'; g.add(bm); return bm; })();
// T-coater
{ const g = part('tcoat', [5, 0, 0]); add(g, cyl(1.3, 1.3, 3, 32), M(0xd9c48a), 15, -.6, 0).rotation.z = Math.PI / 2; add(g, cyl(.5, .5, .6), cop(), 14.2, 1, 0); add(g, box(3.2, .3, 2.6), dark(), 15, -2.2, 0); add(g, cyl(.6, .6, 1.4), M(0xf2ead2), 15.2, 1.6, 1.4); add(g, cyl(.6, .6, 1.4), M(0xd8d2c4), 16.4, 1.6, 1.4); }
// Køling
{ const g = part('cool', [8, 0, 0]); add(g, box(4.2, 1.6, 2.6), M(0x8fa7b0), 19.6, -1, 0); add(g, box(1.6, 1.6, 1.6), M(0x6f9fc0), 19.6, -1, -2.4); add(g, cyl(1, .3, 1.3), steel(), 22.4, -1.2, 0);
  pipe(g, [[16.5, -.6, 0], [17.5, -.6, 0]], .22, M(0xc9a26a)); }
const ALL_PARTS = Object.keys(groups);

// ---------- process stages ----------
const STAGES = [
  { n: 'Råt granulat i buffer', parts: ['silo'], cam: [-14, 3, 0, 16], t: 'Granuleringen producerer rå kerner: enzym fordelt i en matrix af salt/fyldstof, fibre og binder. De lagres i buffersiloer.', f: ['Kernen bærer enzymaktiviteten', 'Bufferen udjævner forskelle mellem granulering og coating'] },
  { n: 'Indføring', parts: ['feed'], cam: [-10.5, 3, 0, 14], t: 'Granulatet doseres med et stabilt flow ind i første kammer.', f: ['Stabilt flow = stabil drift', 'Ændringer laves gradvist'] },
  { n: 'Indblæsning nedefra', parts: ['air', 'plate', 'bed'], cam: [-2, -.5, 0, 22], t: 'Varm procesluft føres ned i luftkasserne under kamrene og blæses OP gennem den rillede bundplade. Partiklerne svæver og opfører sig som en kogende væske og flyder langsomt fra kammer til kammer.', f: ['Luften kommer nedefra og bærer lejet', E + ' Indløbsluft er typisk langt varmere end produktet'] },
  { n: 'Saltsprøjtning nedefra', parts: ['lance', 'salt', 'atom', 'plate'], cam: [-2, -2, 0, 16], t: 'Lanserne går op gennem bunden, og dyserne sprøjter saltopløsningen OPAD ind i lejet (bottom-spray). Dråben skal ramme partiklen, mens den er flydende, sprede sig og tørre til en tæt krystallinsk film.', f: ['Saltopløsning og forstøvningsluft tilføres nedefra via slanger', E + ' Saltlaget udgør typisk en mindre del af kernens vægt'] },
  { n: 'Tørring og fugtstyring', parts: ['exh', 'bed'], cam: [0, 4, 0, 24], t: 'Vandet fordamper, og den fugtige luft forlader lejet opad gennem filtre og store luftkanaler. Afgangsluftens fugt viser, om lejet er for vådt eller for tørt.', f: ['Varme fra luften ≈ varme til fordampning', 'For vådt → klumper · for tørt → støv'] },
  { n: 'Udløb – cellesluse og snegl', parts: ['out'], cam: [10.3, -1.8, 0, 10], t: 'Det saltcoatede granulat forlader sidste kammer gennem en cellesluse i gavlen og føres med en snegl til kopelevatoren.', f: ['Celleslusen holder luften inde i lejet', 'Saltlaget: fugt- og kemibarriere'] },
  { n: 'Kopelevator', parts: ['elev'], cam: [12, 3, 0, 20], t: 'Det færdige produkt løftes ud af coateren med en kopelevator: kopper på et bånd tager granulatet op, tømmes i toppen, og produktet falder videre til næste trin.', f: ['Skånsom, lukket transport', 'Kopperne tømmes i toppen ned i et faldrør'] },
  { n: 'Voks og kaolin', parts: ['tcoat'], cam: [15, 0, 0, 12], t: 'Smeltet voks og et mineralsk pulver lægges uden på som støvbindende yderlag.', f: ['Voks binder pulver og støv', 'Giver ensartet, hvid overflade'] },
  { n: 'Køling og afstøvning', parts: ['cool'], cam: [19.6, -1, 0, 12], t: 'Køling får voksen til at stivne til en lukket skal, og løst støv fjernes.', f: ['Enzymstøv er et luftvejsallergen', 'Tæt anlæg og god rengøring er afgørende'] },
];

// ---------- particles ----------
const N = 380;
const pGeo = new THREE.SphereGeometry(.13, 10, 8);
const pMat = new THREE.MeshStandardMaterial({ roughness: .7, metalness: 0 });
const pMesh = new THREE.InstancedMesh(pGeo, pMat, N); scene.add(pMesh);
const PATH = [[-14, .6, 0], [-13, .3, 0], [-11.6, 2.5, 0], [-11, 4.6, 0], [-9.6, 4.2, 0], [-8.6, -.7, 0], [8.6, -.7, 0], [9.95, -1.1, 0], [9.95, -2.6, 0], [11.2, -2.8, 0], [11.35, -3.2, 0], [11.35, 9.3, 0], [12.4, 9.5, 0], [14.2, -.6, 0], [16.3, -.6, 0], [17.8, -.8, 0], [21.4, -1, 0], [22.4, -1.8, 0]];
const BED = 5, RING = 13;
const SEG_STAGE = [0, 1, 1, 1, 1, 2, 5, 5, 5, 6, 6, 6, 6, 7, 8, 8, 8];
const lens = []; let tot = 0; for (let i = 0; i < PATH.length - 1; i++) { const d = new THREE.Vector3(...PATH[i]).distanceTo(new THREE.Vector3(...PATH[i + 1])) * (i === BED ? .35 : i === 10 ? .55 : 1); lens.push(d); tot += d; }
const parts = Array.from({ length: N }, () => ({ s: Math.random(), z: (Math.random() - .5) * 3.4, ph: Math.random() * 7, h: .3 + Math.random() }));
const cRaw = new THREE.Color(0xb98a52), cSalt = new THREE.Color(0xf2f2ee), cT = new THREE.Color(0xf6ecc9), cDim = new THREE.Color(0xc8bfa8), tmpC = new THREE.Color(), dummy = new THREE.Object3D();
// spraydråber (nedefra og op) og luftpile
const D = 320, dMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(.05, 6, 4), new THREE.MeshBasicMaterial({ color: 0x3f8fd0 }), D); scene.add(dMesh);
const drops = Array.from({ length: D }, (_, i) => ({ x: LX[i % LX.length], z: LZ[Math.floor(i / LX.length) % 2], t: Math.random(), dx: (Math.random() - .5) * .9, dz: (Math.random() - .5) * .9 }));
const A = 110, aMesh = new THREE.InstancedMesh(new THREE.ConeGeometry(.12, .4, 8), new THREE.MeshBasicMaterial({ color: 0xd0643a, transparent: true, opacity: .8 }), A); scene.add(aMesh);
const airs = Array.from({ length: A }, (_, i) => ({ duct: i < 30, x: i < 30 ? CH[i % 5] : -8.8 + Math.random() * 17.6, z: (Math.random() - .5) * 3.6, t: Math.random() }));
const B = 40, BH = 12.4;
let flowOn = true, curStage = -1;
function stageOf(s) { let d = s * tot; for (let i = 0; i < lens.length; i++) { if (d <= lens[i]) return [i, d / lens[i]]; d -= lens[i]; } return [lens.length - 1, 1]; }
function updateBuckets(time) { // kopper kører op i venstre side og ned i højre side
  for (let k = 0; k < B; k++) { let u = (k / B + time * .05) % 1, x, y, rz = 0; const L = 2 * BH; let d = u * L;
    if (d < BH) { x = 11.32; y = -3 + d; } else { x = 11.88; y = -3 + BH - (d - BH); rz = Math.PI; }
    dummy.position.set(x, y, 0); dummy.rotation.set(0, 0, rz); dummy.scale.setScalar(1); dummy.updateMatrix(); bucketMesh.setMatrixAt(k, dummy.matrix); }
  dummy.rotation.set(0, 0, 0); bucketMesh.instanceMatrix.needsUpdate = true; }
function updateParticles(dt, time) {
  for (let k = 0; k < N; k++) { const p = parts[k]; p.s = (p.s + dt * .011) % 1; const [i, f] = stageOf(p.s); const a = PATH[i], b = PATH[i + 1];
    let x = a[0] + (b[0] - a[0]) * f, y = a[1] + (b[1] - a[1]) * f, z = (a[2] + (b[2] - a[2]) * f);
    if (i === BED) { y += Math.abs(Math.sin(time * 2.2 + p.ph)) * p.h * 1.4; z = p.z; } else if (i > BED && i < RING) z = p.z * .08; else if (i >= RING + 1) z = p.z * .3;
    if (i === RING) { const r = 1.0; z = Math.sin(time * 3 + p.ph) * r * .8; y = -.6 + Math.cos(time * 3 + p.ph) * r * .8; }
    const st = SEG_STAGE[i]; const bed = i === BED ? f : (i > BED ? 1 : 0);
    tmpC.copy(cRaw).lerp(cSalt, bed); if (i >= RING) tmpC.lerp(cT, i === RING ? f : 1);
    const on = curStage < 0 || st === curStage || ((curStage === 3 || curStage === 4) && i === BED);
    if (!on) tmpC.lerp(cDim, .65);
    dummy.position.set(x, y, z); dummy.scale.setScalar(on ? 1 : .6); dummy.updateMatrix(); pMesh.setMatrixAt(k, dummy.matrix); pMesh.setColorAt(k, tmpC); }
  pMesh.instanceMatrix.needsUpdate = true; pMesh.instanceColor.needsUpdate = true;
  const showDrops = flowOn && (curStage < 0 || curStage === 3); dMesh.visible = showDrops;
  if (showDrops) for (let k = 0; k < D; k++) { const d = drops[k]; d.t = (d.t + dt * .9) % 1; dummy.position.set(d.x + d.dx * d.t, -.88 + d.t * 1.7, d.z + d.dz * d.t); dummy.scale.setScalar(1 - d.t * .6); dummy.updateMatrix(); dMesh.setMatrixAt(k, dummy.matrix); }
  dMesh.instanceMatrix.needsUpdate = true;
  const showAir = flowOn && (curStage < 0 || curStage === 2 || curStage === 4); aMesh.visible = showAir;
  if (showAir) for (let k = 0; k < A; k++) { const a = airs[k]; a.t = (a.t + dt * .5) % 1;
    if (a.duct) { if (curStage === 4) { dummy.scale.setScalar(0); } else { dummy.position.set(a.x, 6.6 - a.t * 8.4, -3.4); dummy.rotation.set(Math.PI, 0, 0); dummy.scale.setScalar(1.3); } }
    else { dummy.position.set(a.x, -2.2 + a.t * (curStage === 4 ? 9.5 : 4.4), a.z); dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(1); }
    dummy.updateMatrix(); aMesh.setMatrixAt(k, dummy.matrix); }
  dummy.rotation.set(0, 0, 0); aMesh.instanceMatrix.needsUpdate = true;
  aMesh.material.color.set(curStage === 4 ? 0x7aa8c8 : 0xd0643a);
}

// ---------- labels ----------
const labelsEl = $('labels'); const labels = [];
const anchors = { silo: [-14, 6.4, 0], feed: [-11, 5.3, 0], bed: [-5.4, 2.2, 2.3], plate: [4.5, -1.15, 2.1], air: [-3.6, 5.5, -3.4], lance: [1.5, -.7, 1.2], salt: [-4.5, -4.7, 1.9], atom: [-2, -2.7, -5.4], exh: [0, 7.5, 1.3], out: [10, -1.7, .9], elev: [11.6, 10.7, 0], tcoat: [15, .8, 1.3], cool: [19.6, -.1, 1.3] };
for (const id of ALL_PARTS) { const el = document.createElement('div'); el.className = 'lb'; el.innerHTML = `<span class="d">${P[id].i}</span><span class="t">${P[id].n.split(' (')[0].split(' ·')[0]}</span>`; el.onclick = () => select(id); labelsEl.appendChild(el); labels.push({ id, el, v: new THREE.Vector3() }); }
let showLabels = true;
function updateLabels() { const w = canvas.clientWidth, h = canvas.clientHeight; const camDist = camera.position.distanceTo(controls.target);
  for (const L of labels) { const g = groups[L.id]; L.v.set(...anchors[L.id]).add(g.position); const d = camera.position.distanceTo(L.v); const v = L.v.clone().project(camera);
    const vis = showLabels && v.z < 1 && Math.abs(v.x) < 1.05 && Math.abs(v.y) < 1.05 && (curStage < 0 || STAGES[curStage].parts.includes(L.id)); L.el.style.display = vis ? 'flex' : 'none'; if (!vis) continue;
    L.el.style.left = (v.x * .5 + .5) * w + 'px'; L.el.style.top = (-v.y * .5 + .5) * h + 'px'; L.el.classList.toggle('near', d < 22 || camDist < 20 || curStage >= 0); L.el.classList.toggle('sel', L.id === selId); } }

// ---------- highlight / xray / explode ----------
let xray = false, explode = 0, explodeT = 0, selId = null;
function applyLook() { for (const id of ALL_PARTS) { const g = groups[id]; const hi = curStage >= 0 ? STAGES[curStage].parts.includes(id) : (selId ? id === selId : true);
  g.traverse(o => { if (!o.isMesh || !o.material.userData.base) return; const m = o.material; const base = m.userData.base; const housing = housingMats.includes(m);
    const op = xray ? (housing ? .08 : .35) : (hi ? base.opacity : .22); m.transparent = op < 1; m.opacity = op; m.depthWrite = op >= 1;
    m.emissive && m.emissive.set(selId === id || (curStage >= 0 && hi) ? 0x3a1a08 : 0x000000); m.needsUpdate = true; }); } }

// ---------- card ----------
function showCard(num, title, fn, facts, ex) { $('cardNum').textContent = num; $('cardTitle').textContent = title; $('cardFn').textContent = fn; $('cardFacts').innerHTML = facts.map(f => `<li>${f}</li>`).join(''); $('cardEx').textContent = ex || ''; $('card').hidden = false; }
function select(id) { curStage = -1; selId = id; const p = P[id]; showCard(p.i, p.n, p.fn, p.facts, p.ex); const a = new THREE.Vector3(...anchors[id]); focus(a, 15); applyLook(); renderStages(); renderParts(); collapse(); }
$('cardX').onclick = () => { $('card').hidden = true; selId = null; curStage = -1; stopPlay(); applyLook(); renderStages(); renderParts(); reset(); };

// ---------- camera ----------
let camGoal = null;
const HOME = { t: new THREE.Vector3(3.5, 2, 0), dir: new THREE.Vector3(.35, .45, 1).normalize() };
function homeDist() { const a = canvas.clientWidth / canvas.clientHeight; const hw = Math.tan(THREE.MathUtils.degToRad(18)) * a; return Math.min(150, (a < 1 ? 19 : 21) / hw); }
function focus(t, dist) { const dir = camera.position.clone().sub(controls.target).normalize(); camGoal = { t: t.clone(), p: t.clone().add(dir.multiplyScalar(dist * Math.max(1, .9 / (canvas.clientWidth / canvas.clientHeight)))) }; }
function reset() { camGoal = { t: HOME.t.clone(), p: HOME.t.clone().add(HOME.dir.clone().multiplyScalar(homeDist())) }; }

// ---------- stages UI ----------
function setStage(i) { curStage = i; selId = null; const s = STAGES[i]; showCard(i + 1, s.n, s.t, s.f, `Trin ${i + 1} af ${STAGES.length}`); focus(new THREE.Vector3(s.cam[0], s.cam[1], s.cam[2]), s.cam[3]); applyLook(); renderStages(); renderParts(); }
function renderStages() { $('stageList').innerHTML = STAGES.map((s, i) => `<li><button data-s="${i}" class="${i === curStage ? 'on' : ''}"><b>${i + 1}</b>${s.n}</button></li>`).join(''); }
$('stageList').onclick = e => { const b = e.target.closest('[data-s]'); if (b) { stopPlay(); setStage(+b.dataset.s); collapse(); } };
$('pNext').onclick = () => { stopPlay(); setStage((curStage + 1) % STAGES.length); };
$('pPrev').onclick = () => { stopPlay(); setStage((curStage - 1 + STAGES.length) % STAGES.length); };
let playT = null; function stopPlay() { clearInterval(playT); playT = null; $('pPlay').textContent = '▶ Afspil'; $('pPlay').classList.remove('on'); }
$('pPlay').onclick = () => { if (playT) return stopPlay(); setStage(curStage < 0 ? 0 : curStage); playT = setInterval(() => setStage((curStage + 1) % STAGES.length), 6000); $('pPlay').textContent = '❚❚ Pause'; $('pPlay').classList.add('on'); collapse(); };
function renderParts() { $('partList').innerHTML = PARTS.map(p => `<li><button data-p="${p.id}" class="${p.id === selId ? 'on' : ''}"><b>${p.i}</b>${p.n.split(' (')[0]}</button></li>`).join(''); }
$('partList').onclick = e => { const b = e.target.closest('[data-p]'); if (b) select(b.dataset.p); };

// ---------- facts ----------
$('facts').innerHTML = '<dl>' + [
  ['Princip', 'Kontinuert fluid bed med flere kamre, bottom-spray'], ['Luft', 'Indblæses nedefra op gennem en rillet bundplade'], ['Dyser', 'Lanser nedefra – sprøjter opad'], ['Udløb', 'Cellesluse → snegl → kopelevator'], ['Lag', 'Kerne → saltlag → voks/kaolin'], ['Salt', 'Overvejende natriumsulfat (Na₂SO₄)'], ['Styring', 'Afgangsluftens fugt og produkttemperatur'],
  ['Fordampning', 'Vands fordampningsvarme ca. 2.260 kJ/kg ved 100 °C (lærebogsværdi) ' + E], ['Voks', 'Smeltelig voks, fx PEG'], ['3D-model', 'Kamre, dyser, låger, mål og rørføring er illustrative ' + E], ['Version', '3 · oktober 2026'],
].map(([a, b]) => `<dt>${a}</dt><dd style="margin:0">${b}</dd>`).join('') + '</dl>';

// ---------- UI wiring ----------
document.querySelectorAll('.tabs button').forEach(b => b.onclick = () => { document.querySelectorAll('.tabs button').forEach(x => x.classList.toggle('on', x === b)); document.querySelectorAll('.pane').forEach(p => p.classList.toggle('on', p.dataset.pane === b.dataset.tab)); $('sheet').classList.remove('collapsed'); });
$('handle').onclick = () => $('sheet').classList.toggle('collapsed');
function collapse() { if (innerWidth < 900) $('sheet').classList.add('collapsed'); }
$('explode').oninput = e => { explodeT = e.target.value / 100; $('exv').textContent = e.target.value + ' %'; };
$('bXray').onclick = e => { xray = !xray; e.currentTarget.classList.toggle('on', xray); applyLook(); };
$('bFlow').onclick = e => { flowOn = !flowOn; e.currentTarget.classList.toggle('on', flowOn); pMesh.visible = flowOn; };
$('bLabels').onclick = e => { showLabels = !showLabels; e.currentTarget.classList.toggle('on', showLabels); };
$('bReset').onclick = () => { $('explode').value = 0; explodeT = 0; $('exv').textContent = '0 %'; $('cardX').onclick(); reset(); };
// picking
const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(); let down = null;
canvas.addEventListener('pointerdown', e => down = [e.clientX, e.clientY]);
canvas.addEventListener('pointerup', e => { if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return; const r = canvas.getBoundingClientRect(); ptr.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(ptr, camera);
  const hit = ray.intersectObjects(root.children, true).find(h => h.object.material.opacity > .2 || xray); if (hit) select(hit.object.userData.part); });

// ---------- resize / loop ----------
function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h;
  if (w < 900) camera.setViewOffset(w, h, 0, h * .2, w, h); else camera.setViewOffset(w, h, -140, 0, w, h); camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();
camera.position.copy(HOME.t).add(HOME.dir.clone().multiplyScalar(homeDist())); controls.target.copy(HOME.t);
if (innerWidth < 900) $('sheet').classList.add('collapsed');
renderStages(); renderParts(); applyLook();
const clock = new THREE.Clock();
renderer.setAnimationLoop(() => { const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime;
  explode += (explodeT - explode) * .12; for (const id of ALL_PARTS) groups[id].position.copy(groups[id].userData.ex).multiplyScalar(explode);
  if (camGoal) { controls.target.lerp(camGoal.t, .08); camera.position.lerp(camGoal.p, .08); if (camera.position.distanceTo(camGoal.p) < .05) camGoal = null; }
  updateBuckets(t); pMesh.visible = flowOn && explode < .05; if (flowOn && explode < .05) updateParticles(dt, t); else { pMesh.visible = dMesh.visible = aMesh.visible = false; }
  controls.update(); renderer.render(scene, camera); updateLabels(); });
$('load').style.opacity = 0; setTimeout(() => $('load').remove(), 500);
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
// test hooks
window.__app = { setStage, select, setXray: v => { if (v !== xray) $('bXray').click(); }, explode: v => { explodeT = v; } };
