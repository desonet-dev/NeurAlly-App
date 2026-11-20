// Tradução das cores do app para o tema escuro.
// As telas continuam escrevendo as cores "do tema claro" (ex.: '#FFF'); no tema escuro cada cor
// é trocada por uma equivalente. Há três papéis: fundo (bg), texto/ícone (fg) e borda (bd).

const FUNDO_ESCURO = {
  '#FFF': '#1C2330',
  '#FFFFFF': '#1C2330',
  '#E4F0F8': '#111720', // fundo das telas
  '#9EBDF0': '#0D131B', // moldura azul das telas de perfil
  '#F0F4FF': '#262F40',
  '#F7F9FF': '#222B3A',
  '#E3F2FD': '#1B3147',
  '#EAF2FF': '#1F2C42',
  '#E4ECFF': '#222E45',
  '#E0EAFF': '#27344D',
  '#E0E8FF': '#27344D',
  '#D9E4FF': '#2A3752',
  '#D1E3F8': '#2A3A52',
  '#FDEDED': '#3A2326',
  '#E6F6EC': '#1D3A2B',
  '#FFF3E0': '#3A2E1F',
  '#EEF1F6': '#2A3342',
  '#F2F4F8': '#2A3342',
  '#F3F2F8': '#262B3A',
  '#F2F2F4': '#262B3A',
  '#F2F2FF': '#1E2536',
  '#FAFAFA': '#1C2330',
  '#EEE': '#2A3342',
  '#F0F0F0': '#2A3342',
  '#EAEAEA': '#2E3748',
  '#E5E5E5': '#2E3748',
  '#D8D8D8': '#3A4558',
  '#D0D0D0': '#3A4558',
  '#CCC': '#3A4558',
  '#D4E6F1': '#2A3A4D',
  '#99BCEE': '#2B4770',
};

const TEXTO_ESCURO = {
  '#000': '#EAEFF7',
  '#1A1A1A': '#EAEFF7',
  '#222': '#EAEFF7',
  '#333': '#E0E6F0',
  '#555': '#B8C2D4',
  '#666': '#B0BBCE',
  '#4A5568': '#B0BBCE',
  '#5A6B87': '#A9B6CC',
  '#6B7A93': '#9BA8BF',
  '#777': '#98A5BB',
  '#888': '#8E9BB2',
  '#999': '#8793AA',
  '#AAA': '#7F8BA2',
  '#A0AABB': '#7F8BA2',
  '#8696BB': '#8D9CC0',
  '#1A56DB': '#7FA9FF',
  '#2563EB': '#80A8FF',
  '#6292D6': '#8FB6F2',
  '#6196DA': '#8FB6F2',
  '#4A77D4': '#86A9F0',
  '#2A59C2': '#86A9F0',
  '#4894FE': '#7DB0FF',
  '#4E8BFA': '#7DB0FF',
  '#D64545': '#FF7B7B',
  '#B03030': '#FF9B9B',
  '#5A2A2A': '#FFB4B4',
  '#2E9E5B': '#5ED18F',
  '#3FAE7A': '#5ED18F',
};

const BORDA_ESCURA = {
  '#FFF': '#1C2330',
  '#FFFFFF': '#1C2330',
  '#F5C2C2': '#5C3236',
  '#D9E4FF': '#37435A',
  '#E0E8FF': '#37435A',
  '#E0EAFF': '#37435A',
  '#D1E3F8': '#37435A',
  '#B0C4DE': '#4A5A78',
  '#EEE': '#364156',
  '#EAEAEA': '#364156',
  '#E5E5E5': '#364156',
  '#F0F0F0': '#364156',
  '#D0D0D0': '#3F4A60',
  '#D8D8D8': '#3F4A60',
  '#CCC': '#3F4A60',
  '#1A56DB': '#7FA9FF',
  '#6292D6': '#8FB6F2',
  '#6196DA': '#8FB6F2',
  '#D64545': '#FF7B7B',
  '#2E9E5B': '#5ED18F',
};

function normalizar(hex) {
  let h = String(hex).trim().toUpperCase();
  if (/^#[0-9A-F]{3}$/.test(h)) h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
  return h;
}

// Atalhos: a tabela usa '#FFF' etc.; procura pelas duas grafias.
function procurar(tabela, hex) {
  const original = String(hex).trim().toUpperCase();
  if (tabela[original]) return tabela[original];
  const longo = normalizar(hex);
  for (const chave of Object.keys(tabela)) {
    if (normalizar(chave) === longo) return tabela[chave];
  }
  return null;
}

function hexParaHsl(hex) {
  const h = normalizar(hex);
  if (!/^#[0-9A-F]{6}$/.test(h)) return null;
  const r = parseInt(h.slice(1, 3), 16) / 255;
  const g = parseInt(h.slice(3, 5), 16) / 255;
  const b = parseInt(h.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let hh = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) hh = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) hh = (b - r) / d + 2;
    else hh = (r - g) / d + 4;
    hh /= 6;
  }
  return { h: hh, s, l };
}

function hslParaHex({ h, s, l }) {
  const f = (n) => {
    const k = (n + h * 12) % 12;
    const a = s * Math.min(l, 1 - l);
    const v = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(v * 255).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

// Cores fora das tabelas: claras viram escuras (fundo/borda) e escuras viram claras (texto).
function reserva(hex, papel) {
  const hsl = hexParaHsl(hex);
  if (!hsl) return hex;
  if (papel === 'fg') {
    if (hsl.l < 0.4 && hsl.s < 0.35) return hslParaHex({ h: hsl.h, s: hsl.s, l: 0.88 - hsl.l * 0.4 });
    return hex;
  }
  if (hsl.l >= 0.78) {
    return hslParaHex({ h: hsl.h, s: Math.min(hsl.s, 0.3), l: 0.1 + (1 - hsl.l) * 0.8 });
  }
  return hex;
}

const ESCURO = { bg: FUNDO_ESCURO, fg: TEXTO_ESCURO, bd: BORDA_ESCURA };

const identidade = (hex) => hex;
export const MAPEADOR_CLARO = { bg: identidade, fg: identidade, bd: identidade, escuro: false };

export function criarMapeadorEscuro() {
  const cache = { bg: new Map(), fg: new Map(), bd: new Map() };
  const mapear = (papel) => (hex) => {
    if (typeof hex !== 'string' || hex[0] !== '#') return hex;
    const guardado = cache[papel].get(hex);
    if (guardado) return guardado;
    const resultado = procurar(ESCURO[papel], hex) || reserva(hex, papel);
    cache[papel].set(hex, resultado);
    return resultado;
  };
  return { bg: mapear('bg'), fg: mapear('fg'), bd: mapear('bd'), escuro: true };
}
