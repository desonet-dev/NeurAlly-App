// Desenhos das plantas do Jardim Zen, em coordenadas de uma caixa 100 x 100.
// Cada função devolve uma lista de formas simples ({ tipo, ...atributos }) que o componente
// PlantaSvg transforma em elementos de react-native-svg. Assim o mesmo desenho pode ser testado
// e visualizado fora do app.

const SOLO = '#8D6E63';
const SOLO_ESCURO = '#6D4C41';
const FOLHA = '#4CAF50';
const FOLHA_CLARA = '#81C784';
const FOLHA_ESCURA = '#2E7D32';

const elipse = (cx, cy, rx, ry, fill, extra = {}) => ({ tipo: 'ellipse', cx, cy, rx, ry, fill, ...extra });
const circulo = (cx, cy, r, fill, extra = {}) => ({ tipo: 'circle', cx, cy, r, fill, ...extra });
const retangulo = (x, y, width, height, rx, fill, extra = {}) => ({ tipo: 'rect', x, y, width, height, rx, fill, ...extra });
const caminho = (d, extra = {}) => ({ tipo: 'path', d, fill: 'none', ...extra });
const rotacionar = (graus, cx, cy) => `rotate(${graus} ${cx} ${cy})`;

// Montinho de terra onde tudo nasce.
function monte() {
  return [elipse(50, 92, 34, 8, SOLO_ESCURO), elipse(50, 90, 30, 7, SOLO)];
}

function semente(cor = '#5D4037') {
  return [elipse(50, 86, 6, 4, cor, { transform: rotacionar(-25, 50, 86) }), elipse(48, 85, 2, 1.2, '#A1887F', { transform: rotacionar(-25, 48, 85) })];
}

function folha(cx, cy, rx, ry, graus, cor = FOLHA) {
  return elipse(cx, cy, rx, ry, cor, { transform: rotacionar(graus, cx, cy) });
}

function vaso() {
  return [
    caminho('M30 80 L70 80 L65 98 L35 98 Z', { fill: '#C97B5A' }),
    retangulo(27, 76, 46, 7, 3, '#D98B6A'),
  ];
}

// ---------- Suculenta / cacto ----------
function suculenta(estagio) {
  if (estagio === 0) return [...monte(), ...semente()];
  const corpo = '#5FB27E';
  const sombra = '#3F9163';
  if (estagio === 1) {
    return [
      ...monte(),
      elipse(50, 78, 9, 12, sombra),
      elipse(50, 77, 8, 11, corpo),
      circulo(47, 72, 1.2, '#E8F5E9'),
      circulo(53, 76, 1.2, '#E8F5E9'),
    ];
  }
  if (estagio === 2) {
    return [
      ...monte(),
      retangulo(63, 58, 9, 18, 4.5, sombra),
      retangulo(62, 59, 9, 17, 4.5, corpo),
      elipse(48, 66, 14, 23, sombra),
      elipse(48, 65, 13, 22, corpo),
      caminho('M48 46 L48 84', { stroke: sombra, strokeWidth: 1.2, opacity: 0.5 }),
      circulo(43, 56, 1.3, '#E8F5E9'),
      circulo(53, 62, 1.3, '#E8F5E9'),
      circulo(44, 72, 1.3, '#E8F5E9'),
    ];
  }
  return [
    ...monte(),
    retangulo(25, 46, 10, 26, 5, sombra),
    retangulo(25, 62, 20, 9, 4.5, sombra),
    retangulo(24, 47, 10, 25, 5, corpo),
    retangulo(24, 62, 20, 8, 4, corpo),
    retangulo(66, 38, 10, 30, 5, sombra),
    retangulo(55, 54, 20, 9, 4.5, sombra),
    retangulo(65, 39, 10, 29, 5, corpo),
    retangulo(54, 54, 20, 8, 4, corpo),
    elipse(50, 56, 17, 33, sombra),
    elipse(50, 55, 16, 32, corpo),
    caminho('M50 24 L50 86', { stroke: sombra, strokeWidth: 1.4, opacity: 0.5 }),
    caminho('M40 30 L40 80 M60 30 L60 80', { stroke: sombra, strokeWidth: 1, opacity: 0.35 }),
    circulo(44, 40, 1.4, '#E8F5E9'),
    circulo(56, 48, 1.4, '#E8F5E9'),
    circulo(44, 64, 1.4, '#E8F5E9'),
    circulo(57, 72, 1.4, '#E8F5E9'),
    // florzinha rosa no topo
    circulo(50, 20, 4.5, '#F48FB1'),
    circulo(45.5, 23, 4, '#F8BBD0'),
    circulo(54.5, 23, 4, '#F8BBD0'),
    circulo(50, 24, 2.6, '#FFEB3B'),
  ];
}

// ---------- Lavanda ----------
const ROXO = '#8E6FD0';
const ROXO_CLARO = '#B39DDB';

function espigaDeLavanda(x, topo, cor = ROXO) {
  const formas = [];
  for (let i = 0; i < 6; i += 1) {
    const y = topo + i * 5.2;
    const tam = 3.4 - i * 0.18;
    formas.push(elipse(x - 2.2, y, tam, 2.6, i % 2 ? ROXO_CLARO : cor));
    formas.push(elipse(x + 2.2, y + 1.6, tam, 2.6, i % 2 ? cor : ROXO_CLARO));
  }
  return formas;
}

function lavanda(estagio) {
  if (estagio === 0) return [...monte(), ...semente('#4E342E')];
  if (estagio === 1) {
    return [
      ...monte(),
      caminho('M50 88 L50 68', { stroke: FOLHA_ESCURA, strokeWidth: 3, strokeLinecap: 'round' }),
      folha(43, 70, 8, 3.5, -30, '#7FB38A'),
      folha(57, 70, 8, 3.5, 30, '#7FB38A'),
    ];
  }
  if (estagio === 2) {
    return [
      ...monte(),
      caminho('M50 88 L50 52 M44 88 L40 60 M56 88 L60 60', { stroke: '#5E9C6E', strokeWidth: 2.5, strokeLinecap: 'round' }),
      folha(38, 76, 9, 3.2, -35, '#7FB38A'),
      folha(62, 76, 9, 3.2, 35, '#7FB38A'),
      folha(44, 66, 8, 3, -25, '#7FB38A'),
      folha(56, 66, 8, 3, 25, '#7FB38A'),
      circulo(50, 50, 3.2, ROXO),
      circulo(40, 58, 2.6, ROXO_CLARO),
      circulo(60, 58, 2.6, ROXO_CLARO),
    ];
  }
  return [
    ...monte(),
    caminho('M50 88 L50 30 M42 88 L33 38 M58 88 L67 38 M36 88 L22 52 M64 88 L78 52', {
      stroke: '#5E9C6E', strokeWidth: 2.4, strokeLinecap: 'round',
    }),
    folha(36, 80, 10, 3.2, -35, '#7FB38A'),
    folha(64, 80, 10, 3.2, 35, '#7FB38A'),
    folha(44, 72, 8, 3, -28, '#7FB38A'),
    folha(56, 72, 8, 3, 28, '#7FB38A'),
    ...espigaDeLavanda(22, 40),
    ...espigaDeLavanda(78, 40),
    ...espigaDeLavanda(33, 24),
    ...espigaDeLavanda(67, 24),
    ...espigaDeLavanda(50, 14),
  ];
}

// ---------- Girassol ----------
function petalas(cx, cy, raio, qtd, rx, ry, cor, offset = 0) {
  const formas = [];
  for (let i = 0; i < qtd; i += 1) {
    const ang = (360 / qtd) * i + offset;
    const rad = (ang * Math.PI) / 180;
    const px = cx + Math.cos(rad) * raio;
    const py = cy + Math.sin(rad) * raio;
    formas.push(elipse(px, py, rx, ry, cor, { transform: rotacionar(ang, px, py) }));
  }
  return formas;
}

function girassol(estagio) {
  if (estagio === 0) return [...monte(), ...semente('#37474F')];
  if (estagio === 1) {
    return [
      ...monte(),
      caminho('M50 88 L50 66', { stroke: FOLHA_ESCURA, strokeWidth: 3.4, strokeLinecap: 'round' }),
      folha(42, 68, 9, 4.2, -25),
      folha(58, 68, 9, 4.2, 25),
    ];
  }
  if (estagio === 2) {
    return [
      ...monte(),
      caminho('M50 88 L50 46', { stroke: FOLHA_ESCURA, strokeWidth: 4, strokeLinecap: 'round' }),
      folha(37, 72, 13, 5.5, -28),
      folha(63, 62, 13, 5.5, 28),
      circulo(50, 42, 7, FOLHA_CLARA),
      ...petalas(50, 42, 7.5, 8, 3, 1.8, '#FFD54F', 22),
      circulo(50, 42, 4.5, '#8D6E63'),
    ];
  }
  return [
    ...monte(),
    caminho('M50 88 L50 38', { stroke: FOLHA_ESCURA, strokeWidth: 4.6, strokeLinecap: 'round' }),
    folha(34, 74, 15, 6, -28),
    folha(66, 62, 15, 6, 28),
    ...petalas(50, 30, 16, 14, 8, 4.2, '#F9A825'),
    ...petalas(50, 30, 13, 14, 7.5, 4, '#FFC107', 12),
    circulo(50, 30, 11, '#6D4C41'),
    circulo(50, 30, 8, '#4E342E'),
    circulo(46, 27, 1.2, '#8D6E63'),
    circulo(54, 28, 1.2, '#8D6E63'),
    circulo(50, 34, 1.2, '#8D6E63'),
    circulo(45, 33, 1.2, '#8D6E63'),
    circulo(55, 34, 1.2, '#8D6E63'),
    circulo(50, 25, 1.2, '#8D6E63'),
  ];
}

// ---------- Bonsai de cerejeira ----------
const ROSA = '#F8BBD0';
const ROSA_FORTE = '#F48FB1';

function bonsai(estagio) {
  if (estagio === 0) return [...monte(), ...semente('#6D4C41')];
  if (estagio === 1) {
    return [
      ...vaso(),
      caminho('M50 80 L50 64', { stroke: '#795548', strokeWidth: 2.6, strokeLinecap: 'round' }),
      folha(44, 64, 6.5, 3, -30, '#7CB87F'),
      folha(56, 62, 6.5, 3, 30, '#7CB87F'),
    ];
  }
  if (estagio === 2) {
    return [
      ...vaso(),
      caminho('M50 80 C48 70 54 62 50 52', { stroke: '#795548', strokeWidth: 4.2, strokeLinecap: 'round' }),
      caminho('M51 62 L60 56', { stroke: '#795548', strokeWidth: 2.4, strokeLinecap: 'round' }),
      circulo(50, 46, 10, '#7CB87F'),
      circulo(60, 52, 7, '#8FC78F'),
      circulo(41, 52, 6, '#7CB87F'),
      circulo(47, 44, 3, ROSA),
      circulo(57, 49, 2.6, ROSA_FORTE),
    ];
  }
  return [
    ...vaso(),
    caminho('M50 80 C44 70 56 62 46 50 C42 44 46 38 52 34', { stroke: '#6D4C41', strokeWidth: 5.6, strokeLinecap: 'round' }),
    caminho('M48 56 L30 46', { stroke: '#6D4C41', strokeWidth: 3, strokeLinecap: 'round' }),
    caminho('M50 62 L72 52', { stroke: '#6D4C41', strokeWidth: 3, strokeLinecap: 'round' }),
    circulo(52, 26, 15, ROSA),
    circulo(34, 38, 11, ROSA),
    circulo(70, 40, 12, ROSA),
    circulo(42, 24, 9, ROSA_FORTE),
    circulo(64, 28, 8, ROSA_FORTE),
    circulo(30, 42, 5, ROSA_FORTE),
    circulo(76, 44, 5, ROSA_FORTE),
    circulo(52, 18, 4, '#FCE4EC'),
    circulo(37, 34, 3.5, '#FCE4EC'),
    circulo(68, 36, 3.5, '#FCE4EC'),
    circulo(58, 33, 2.4, '#C2185B', { opacity: 0.35 }),
    // pétala caindo
    elipse(82, 66, 3, 1.8, ROSA_FORTE, { transform: rotacionar(30, 82, 66) }),
    elipse(18, 70, 3, 1.8, ROSA, { transform: rotacionar(-20, 18, 70) }),
  ];
}

const DESENHOS = { suculenta, lavanda, girassol, bonsai };

export function desenharPlanta(especie, estagio) {
  const fn = DESENHOS[especie] || DESENHOS.suculenta;
  return fn(Math.max(0, Math.min(3, estagio)));
}

// Ervinha daninha / folha seca que o jogador limpa deslizando o dedo.
export function desenharErva() {
  return [
    caminho('M8 30 C8 20 6 14 4 8', { stroke: '#7CB342', strokeWidth: 3, strokeLinecap: 'round' }),
    caminho('M16 30 C16 18 18 10 22 4', { stroke: '#689F38', strokeWidth: 3, strokeLinecap: 'round' }),
    caminho('M24 30 C24 22 28 18 32 14', { stroke: '#AED581', strokeWidth: 3, strokeLinecap: 'round' }),
    caminho('M12 30 C12 24 14 20 14 16', { stroke: '#A1887F', strokeWidth: 2.4, strokeLinecap: 'round' }),
    elipse(18, 30, 14, 3, '#6D4C41', { opacity: 0.55 }),
  ];
}

export function desenharGota() {
  return [caminho('M10 1 C10 1 2 11 2 16 A8 8 0 0 0 18 16 C18 11 10 1 10 1 Z', { fill: '#4FC3F7' }),
    elipse(7, 15, 1.6, 3, '#E1F5FE', { opacity: 0.8 })];
}

// Converte as formas para texto SVG (usado para visualizar os desenhos fora do app).
export function formasParaSvg(formas, tamanho = 100, fundo = null, viewBox = '0 0 100 100') {
  const attrs = (f) => Object.entries(f).filter(([k]) => k !== 'tipo').map(([k, v]) => `${k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}="${v}"`).join(' ');
  const corpo = formas.map((f) => `<${f.tipo} ${attrs(f)}/>`).join('');
  const bg = fundo ? `<rect width="100%" height="100%" fill="${fundo}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tamanho}" height="${tamanho}" viewBox="${viewBox}">${bg}${corpo}</svg>`;
}
