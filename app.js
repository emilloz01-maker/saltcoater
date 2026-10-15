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
  { id: 'bed', n: 'Fluid bed-leje med kamre', fn: 'Rektangulært leje opdelt i kamre, hvor granulatet svæver i varm luft og flyder kontinuert fra indløb til udløb.', facts: ['Flere kamre giver en smallere opholdstidsfordeling', 'Kamre kan styres hver for sig eller parvis', 'Anlægget er lukket, så enzymstøv holdes inde'], ex: 'Antal kamre og mål i modellen er et ' + E + ' – ikke et bestemt anlæg.' },
  { id: 'plate', n: 'Bundplade (perforeret)', fn: 'Fordeler den varme luft jævnt op gennem lejet, så partiklerne fluidiseres.', facts: ['For lidt luft: lejet ligger stille og klumper', 'For meget luft: fine partikler blæses op i filtrene', 'En blokeret bundplade giver dårlig fluidisering'], ex: 'Perforeringen er illustrativ.' },
  { id: 'air', n: 'Indløbsluft · luftkasser', fn: 'Opvarmet luft føres ind under kamrene og leverer energien til at fordampe vandet.', facts: ['Hvert kammer har typisk sin egen luftmængde og temperatur', 'Et minimum af luft er nødvendigt for at holde lejet fluidiseret', 'Højere indløbstemperatur sænker fugten i afgangsluften'], ex: 'Generel lærebogsbeskrivelse.' },
  { id: 'lance', n: 'Lanser / dyser', fn: 'Forstøver saltopløsningen til fine dråber i lejet.', facts: ['Mange dyser fordeler væsken jævnt over lejet', 'Tostofdyser bruger trykluft til at danne dråber', 'Dyserne kan sidde over lejet (top-spray) eller i bunden (bottom-spray)'], ex: 'Placeringen over lejet er en forenkling – ' + E + '.' },
  { id: 'salt', n: 'Saltopløsning', fn: 'Vandig opløsning af overvejende natriumsulfat (Na₂SO₄), evt. med lidt binder, pumpes til dyserne.', facts: ['Opløsningen er mest vand, som skal fordampes', 'Natriumsulfat kan krystallisere, hvis opløsningen bliver for kold', 'Blandingen kontrolleres før start'], ex: 'Generel lærebogsbeskrivelse.' },
  { id: 'atom', n: 'Forstøvningsluft', fn: 'Filtreret og tempereret trykluft, der river væsken op i dråber.', facts: ['Mere luft pr. kg væske → mindre dråber', 'For store dråber → våde pletter og klumper', 'For små dråber → tørrer i luften (spraytørring, støv)'], ex: 'Balancen mellem klumper og støv styres i høj grad her.' },
  { id: 'exh', n: 'Afgangsluft · filter · fugtmåling', fn: 'Den fugtige luft forlader lejet gennem filtre; dens relative fugt er et vigtigt styresignal.', facts: ['Høj fugt: lejet er vådt og tæt på at klumpe', 'Lav fugt: dråber tørrer for hurtigt, mere støv', 'Fugten kan bruges til at regulere indløbstemperaturen'], ex: 'Filtrene holder fint støv inde i anlægget.' },
  { id: 'out', n: 'Udløb · saltcoatet granulat', fn: 'Det saltcoatede granulat forlader lejet i den anden ende.', facts: ['Produktmængden ud er råt granulat plus det påførte salt', 'Produkttemperaturen ligger tæt på afgangsluftens'], ex: 'Generel lærebogsbeskrivelse.' },
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
// Leje / hus
const housingMats = [];
{ const g = part('bed', [0, 0, 0]); const m = M(0xc8cccb, { transparent: true, opacity: .28, depthWrite: false }); m.userData.base = { opacity: .28, transparent: true }; housingMats.push(m);
  const solid = steel(); housingMats.push(solid);
  add(g, box(18.4, 4.6, .12), solid, 0, 1.1, -2.1); add(g, box(18.4, 4.6, .12), m, 0, 1.1, 2.1);
  add(g, box(.15, 4.6, 4.3), solid, -9.2, 1.1, 0); add(g, box(.15, 4.6, 4.3), solid, 9.2, 1.1, 0);
  add(g, box(18.4, .12, 4.3), m, 0, 3.4, 0);
  for (let i = 1; i < 5; i++) add(g, box(.08, 2.4, 4.1), M(0x8f948f), -9 + i * 3.6, 0.1, 0);
  
  const lab = (t) => { const c = document.createElement('canvas'); c.width = 128; c.height = 64; const x = c.getContext('2d'); x.fillStyle = '#ece2c8'; x.fillRect(0, 0, 128, 64); x.strokeStyle = '#3b3426'; x.lineWidth = 4; x.strokeRect(2, 2, 124, 60); x.fillStyle = '#3b3426'; x.font = 'italic 34px Georgia'; x.textAlign = 'center'; x.fillText(t, 64, 45); const tx = new THREE.CanvasTexture(tx_cs(c)); return new THREE.MeshBasicMaterial({ map: tx }); };
  function tx_cs(c) { return c; }
  for (let i = 0; i < 5; i++) { const s = add(g, new THREE.PlaneGeometry(1.4, .7), lab('K' + (i + 1)), -7.2 + i * 3.6, 2.9, 2.17); s.material.map.colorSpace = THREE.SRGBColorSpace; } }
// Bundplade
{ const g = part('plate', [0, -1.6, 0]); const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.fillStyle = '#8c9090'; x.fillRect(0, 0, 128, 128); x.fillStyle = '#2b2b28'; for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) { x.beginPath(); x.arc(4 + i * 8, 4 + j * 8, 2, 0, 7); x.fill(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(18, 4); add(g, box(18.2, .1, 4.1), M(0xffffff, { map: t }), 0, -1.15, 0); }
// Indløbsluft
{ const g = part('air', [0, -3.6, 1.5]); const m = M(0x9b8f74);
  for (let i = 0; i < 5; i++) { const X = -7.2 + i * 3.6; add(g, box(3.4, 1.5, 4.1), m, X, -2, 0); pipe(g, [[X, -2.3, 2], [X, -2.3, 3.4], [X, -2.3, 4.2]], .35, m); add(g, cyl(.38, .38, .12), cop(), X, -2.3, 3.2).rotation.x = Math.PI / 2; }
  add(g, box(19, .9, .9), M(0x7d735e), 0, -2.3, 4.6); add(g, box(2.2, 1.8, 1.6), cop(), 10.8, -2.3, 4.6); }
// Lanser
{ const g = part('lance', [0, 3.2, 0]); const m = M(0x4d4b45); const tip = cop();
  for (let i = 0; i < 10; i++) for (const z of [-1.35, -.45, .45, 1.35]) { const X = -8.1 + i * 1.8; add(g, cyl(.04, .04, 2.3, 8), m, X, 2.55, z); add(g, cyl(.09, .03, .2, 8), tip, X, 1.35, z); } }
// Saltopløsning
{ const g = part('salt', [0, 5, 1.5]); const m = M(0x6f9fc0, { metalness: .3 });
  for (const z of [-1.35, -.45, .45, 1.35]) add(g, cyl(.08, .08, 18, 10), m, 0, 3.75, z).rotation.z = Math.PI / 2;
  add(g, cyl(.13, .13, 4, 10), m, -9.3, 3.75, 0).rotation.x = Math.PI / 2;
  pipe(g, [[-9.3, 3.75, -2], [-9.8, 3.75, -3.2], [-10.5, 1.5, -3.5]], .13, m);
  add(g, cyl(.9, .9, 2.2), M(0xa8c6d8), -11, .5, -3.6); add(g, cyl(.95, .95, .12), dark(), -11, 1.65, -3.6); }
// Lanseluft
{ const g = part('atom', [0, 0, -3.5]); const m = steel();
  add(g, box(.8, 1.2, .8), M(0x8b8f72), -4, -1.6, -4.2); add(g, box(1.6, 1.4, 1.1), M(0x5f7d8f), -2, -1.5, -4.2); add(g, cyl(.45, .45, 1.6), M(0x6f9fc0), .2, -1.4, -4.2).rotation.z = Math.PI / 2; add(g, box(.8, 1.2, .8), M(0x8b8f72), 2.2, -1.6, -4.2);
  pipe(g, [[-4, -1.6, -4.2], [2.2, -1.6, -4.2]], .1, m); pipe(g, [[2.2, -1.2, -4.2], [3.5, 0, -4.2], [3.6, 3.95, -3.2], [3.6, 3.95, -2.3]], .1, m);
  add(g, cyl(.08, .08, 18, 10), M(0xb08a3a), 0, 3.95, -2.25).rotation.z = Math.PI / 2; }
// Afgangsluft
{ const g = part('exh', [0, 3, 0]); const m = M(0xb3b1a2);
  for (let k = 0; k < 3; k++) { const x = -6 + k * 6; add(g, cyl(1.5, 2.2, 1.2, 4), m, x, 4.6, 0).rotation.y = Math.PI / 4; add(g, box(4, 2.2, 2.6), m, x, 6.3, 0); for (let f = -1.4; f <= 1.4; f += .7) add(g, cyl(.15, .15, 1.9, 10), M(0xe8e1cc), x + f, 6.3, 1.32);
    pipe(g, [[x, 7.4, 0], [x, 8.2, 0], [x + 1, 8.6, 0]], .3, m); add(g, cyl(.22, .22, .5, 12), cop(), x - 1.2, 7.6, 0); }
  add(g, cyl(.3, .3, 13, 12), m, 1, 8.6, 0).rotation.z = Math.PI / 2; }
// Udløb
{ const g = part('out', [2, -.5, 0]); const m = M(0xc9a26a, { metalness: .2 }); add(g, box(.9, .8, 1.2), cop(), 9.75, -.3, 0); pipe(g, [[9.9, -.7, 0], [10.6, -1.3, 0], [11.6, -.2, 0]], .22, m); }
// T-coater
{ const g = part('tcoat', [4, 0, 0]); add(g, cyl(1.3, 1.3, 3, 32), M(0xd9c48a), 13, -.6, 0).rotation.z = Math.PI / 2; add(g, cyl(.5, .5, .6), cop(), 13, 1, 0); add(g, box(3.2, .3, 2.6), dark(), 13, -2.2, 0); add(g, cyl(.6, .6, 1.4), M(0xf2ead2), 12, 1.6, 1.4); add(g, cyl(.6, .6, 1.4), M(0xd8d2c4), 14, 1.6, 1.4); }
// Køling
{ const g = part('cool', [7, 0, 0]); add(g, box(4.2, 1.6, 2.6), M(0x8fa7b0), 17.6, -1, 0); add(g, box(1.6, 1.6, 1.6), M(0x6f9fc0), 17.6, -1, -2.4); add(g, cyl(1, .3, 1.3), steel(), 20.4, -1.2, 0);
  pipe(g, [[14.5, -.6, 0], [15.5, -.6, 0]], .22, M(0xc9a26a)); }
const ALL_PARTS = Object.keys(groups);

// ---------- process stages ----------
const STAGES = [
  { n: 'Råt granulat i buffer', parts: ['silo'], cam: [-14, 3, 0, 16], t: 'Granuleringen producerer rå kerner: enzym fordelt i en matrix af salt/fyldstof, fibre og binder. De lagres i buffersiloer.', f: ['Kernen bærer enzymaktiviteten', 'Bufferen udjævner forskelle mellem granulering og coating'] },
  { n: 'Indføring', parts: ['feed'], cam: [-10.5, 3, 0, 14], t: 'Granulatet doseres med et stabilt flow ind i første kammer.', f: ['Stabilt flow = stabil drift', 'Ændringer laves gradvist'] },
  { n: 'Fluidisering med varm luft', parts: ['air', 'plate', 'bed'], cam: [-3, -.5, 0, 20], t: 'Varm luft blæses op gennem bundpladen. Partiklerne svæver og opfører sig som en kogende væske og flyder langsomt fra kammer til kammer.', f: ['Luften leverer energien til tørring', E + ' Indløbsluft er typisk langt varmere end produktet'] },
  { n: 'Saltsprøjtning i kamrene', parts: ['lance', 'salt', 'atom'], cam: [-1, 2, 0, 17], t: 'Dyserne forstøver saltopløsning. Dråben skal ramme partiklen, mens den er flydende, sprede sig og tørre til en tæt krystallinsk film.', f: ['Dråbestørrelsen styres af forstøvningsluften', E + ' Saltlaget udgør typisk en mindre del af kernens vægt'] },
  { n: 'Tørring og fugtstyring', parts: ['exh', 'bed'], cam: [0, 4, 0, 22], t: 'Vandet fordamper og forlader lejet med luften. Afgangsluftens fugt viser, om lejet er for vådt eller for tørt.', f: ['Varme fra luften ≈ varme til fordampning', 'For vådt → klumper · for tørt → støv'] },
  { n: 'Udløb – saltcoatet', parts: ['out'], cam: [9.5, 0, 0, 12], t: 'Granulatet forlader sidste kammer med et saltlag uden på kernen.', f: ['Saltlaget: fugt- og kemibarriere', 'Giver styrke og varmestabilitet'] },
  { n: 'Voks og kaolin', parts: ['tcoat'], cam: [13, 0, 0, 12], t: 'Smeltet voks og et mineralsk pulver lægges uden på som støvbindende yderlag.', f: ['Voks binder pulver og støv', 'Giver ensartet, hvid overflade'] },
  { n: 'Køling og afstøvning', parts: ['cool'], cam: [17.6, -1, 0, 12], t: 'Køling får voksen til at stivne til en lukket skal, og løst støv fjernes.', f: ['Enzymstøv er et luftvejsallergen', 'Tæt anlæg og god rengøring er afgørende'] },
];

// ---------- particles ----------
const N = 360;
const pGeo = new THREE.SphereGeometry(.13, 10, 8);
const pMat = new THREE.MeshStandardMaterial({ roughness: .7, metalness: 0 });
const pMesh = new THREE.InstancedMesh(pGeo, pMat, N); scene.add(pMesh);
const PATH = [[-14, .6, 0], [-13, .3, 0], [-11.6, 2.5, 0], [-11, 4.6, 0], [-9.6, 4.2, 0], [-8.6, .3, 0], [8.6, .3, 0], [9.8, -.4, 0], [10.6, -1.2, 0], [11.6, -.6, 0], [14.3, -.6, 0], [15.8, -.8, 0], [19.4, -1, 0], [20.4, -1.8, 0]];
const SEG_STAGE = [0, 1, 1, 1, 1, 2, 5, 5, 5, 6, 7, 7, 7];
const lens = []; let tot = 0; for (let i = 0; i < PATH.length - 1; i++) { const d = new THREE.Vector3(...PATH[i]).distanceTo(new THREE.Vector3(...PATH[i + 1])) * (i === 5 ? .35 : 1); lens.push(d); tot += d; }
const parts = Array.from({ length: N }, () => ({ s: Math.random(), z: (Math.random() - .5) * 3.4, ph: Math.random() * 7, h: .3 + Math.random() }));
const cRaw = new THREE.Color(0xb98a52), cSalt = new THREE.Color(0xf2f2ee), cT = new THREE.Color(0xf6ecc9), tmpC = new THREE.Color(), dummy = new THREE.Object3D();
// spray drops and air
const D = 300, dMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(.05, 6, 4), new THREE.MeshBasicMaterial({ color: 0x5aa0d0 }), D); scene.add(dMesh);
const drops = Array.from({ length: D }, (_, i) => ({ x: -8.1 + (i % 10) * 1.8, z: [-1.35, -.45, .45, 1.35][i % 4], t: Math.random(), dx: (Math.random() - .5) * .5, dz: (Math.random() - .5) * .5 }));
const A = 90, aMesh = new THREE.InstancedMesh(new THREE.ConeGeometry(.12, .4, 8), new THREE.MeshBasicMaterial({ color: 0xd0643a, transparent: true, opacity: .75 }), A); scene.add(aMesh);
const airs = Array.from({ length: A }, () => ({ x: -8.8 + Math.random() * 17.6, z: (Math.random() - .5) * 3.6, t: Math.random() }));
let flowOn = true, curStage = -1;
function stageOf(s) { let d = s * tot; for (let i = 0; i < lens.length; i++) { if (d <= lens[i]) return [i, d / lens[i]]; d -= lens[i]; } return [lens.length - 1, 1]; }
function updateParticles(dt, time) {
  for (let k = 0; k < N; k++) { const p = parts[k]; p.s = (p.s + dt * .012) % 1; const [i, f] = stageOf(p.s); const a = PATH[i], b = PATH[i + 1];
    let x = a[0] + (b[0] - a[0]) * f, y = a[1] + (b[1] - a[1]) * f, z = (a[2] + (b[2] - a[2]) * f);
    if (i === 5) { y += Math.abs(Math.sin(time * 2.2 + p.ph)) * p.h * 1.3; z = p.z; } else if (i > 5 && i < 9) z = p.z * .15; else if (i >= 10) z = p.z * .3;
    if (i === 9) { const r = 1.0; z = Math.sin(time * 3 + p.ph) * r * .8; y = -.6 + Math.cos(time * 3 + p.ph) * r * .8; }
    const st = SEG_STAGE[i]; const bed = i === 5 ? f : (i > 5 ? 1 : 0);
    tmpC.copy(cRaw).lerp(cSalt, bed); if (i >= 9) tmpC.lerp(cT, i === 9 ? f : 1);
    if (curStage >= 0 && !(st === curStage || (curStage === 3 || curStage === 4) && i === 5)) tmpC.lerp(new THREE.Color(0xc8bfa8), .65);
    const sc = curStage >= 0 && !(st === curStage || ((curStage === 3 || curStage === 4) && i === 5)) ? .6 : 1;
    dummy.position.set(x, y, z); dummy.scale.setScalar(sc); dummy.updateMatrix(); pMesh.setMatrixAt(k, dummy.matrix); pMesh.setColorAt(k, tmpC); }
  pMesh.instanceMatrix.needsUpdate = true; pMesh.instanceColor.needsUpdate = true;
  const showDrops = flowOn && (curStage < 0 || curStage === 3); dMesh.visible = showDrops;
  if (showDrops) for (let k = 0; k < D; k++) { const d = drops[k]; d.t = (d.t + dt * .9) % 1; dummy.position.set(d.x + d.dx * d.t, 1.25 - d.t * 1.2, d.z + d.dz * d.t); dummy.scale.setScalar(1 - d.t * .6); dummy.updateMatrix(); dMesh.setMatrixAt(k, dummy.matrix); }
  dMesh.instanceMatrix.needsUpdate = true;
  const showAir = flowOn && (curStage < 0 || curStage === 2 || curStage === 4); aMesh.visible = showAir;
  if (showAir) for (let k = 0; k < A; k++) { const a = airs[k]; a.t = (a.t + dt * .5) % 1; const y = -2.4 + a.t * (curStage === 4 ? 9 : 4.5); dummy.position.set(a.x, y, a.z); dummy.scale.setScalar(1); dummy.updateMatrix(); aMesh.setMatrixAt(k, dummy.matrix); }
  aMesh.instanceMatrix.needsUpdate = true;
  aMesh.material.color.set(curStage === 4 ? 0x7aa8c8 : 0xd0643a);
}

// ---------- labels ----------
const labelsEl = $('labels'); const labels = [];
const anchors = { silo: [-14, 6.4, 0], feed: [-11, 5.3, 0], bed: [-4.5, 1.4, 2.2], plate: [3, -1.15, 2.1], air: [-4.5, -2.3, 3.6], lance: [1.5, 2.6, 1.4], salt: [-11, 1.9, -3.6], atom: [-2, -.7, -4.2], exh: [0, 7.5, 1.3], out: [9.8, .3, .6], tcoat: [13, .8, 1.3], cool: [17.6, -.1, 1.3] };
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
const HOME = { t: new THREE.Vector3(2.5, 1, 0), dir: new THREE.Vector3(.35, .45, 1).normalize() };
function homeDist() { const a = canvas.clientWidth / canvas.clientHeight; const hw = Math.tan(THREE.MathUtils.degToRad(18)) * a; return Math.min(150, (a < 1 ? 17 : 19) / hw); }
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
  ['Princip', 'Kontinuert fluid bed med flere kamre'], ['Lag', 'Kerne → saltlag → voks/kaolin'], ['Salt', 'Overvejende natriumsulfat (Na₂SO₄)'], ['Styring', 'Afgangsluftens fugt og produkttemperatur'],
  ['Fordampning', 'Vands fordampningsvarme ca. 2.260 kJ/kg ved 100 °C (lærebogsværdi) ' + E], ['Voks', 'Smeltelig voks, fx PEG'], ['3D-model', 'Kamre, dyser, mål og rørføring er illustrative ' + E],
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
  pMesh.visible = flowOn && explode < .05; if (flowOn && explode < .05) updateParticles(dt, t); else { pMesh.visible = dMesh.visible = aMesh.visible = false; }
  controls.update(); renderer.render(scene, camera); updateLabels(); });
$('load').style.opacity = 0; setTimeout(() => $('load').remove(), 500);
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
// test hooks
window.__app = { setStage, select, setXray: v => { if (v !== xray) $('bXray').click(); }, explode: v => { explodeT = v; } };
