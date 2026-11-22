// Máscaras de digitação: a pessoa digita só os números e a formatação aparece sozinha.

export function apenasDigitos(texto) {
  return String(texto || '').replace(/\D/g, '');
}

// "12345678901" -> "123.456.789-01" (vai formatando enquanto digita; no máximo 11 números)
export function formatarCpf(texto) {
  const n = apenasDigitos(texto).slice(0, 11);
  if (n.length <= 3) return n;
  if (n.length <= 6) return `${n.slice(0, 3)}.${n.slice(3)}`;
  if (n.length <= 9) return `${n.slice(0, 3)}.${n.slice(3, 6)}.${n.slice(6)}`;
  return `${n.slice(0, 3)}.${n.slice(3, 6)}.${n.slice(6, 9)}-${n.slice(9)}`;
}

// "25122000" -> "25/12/2000" (vai formatando enquanto digita; no máximo 8 números)
export function formatarDataNascimento(texto) {
  const n = apenasDigitos(texto).slice(0, 8);
  if (n.length <= 2) return n;
  if (n.length <= 4) return `${n.slice(0, 2)}/${n.slice(2)}`;
  return `${n.slice(0, 2)}/${n.slice(2, 4)}/${n.slice(4)}`;
}
