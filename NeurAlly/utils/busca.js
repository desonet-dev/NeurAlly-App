// Busca simples sem diferenciar maiúsculas nem acentos: "João" encontra "joao".

export function normalizarTexto(texto) {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// Mantém os itens em que TODAS as palavras digitadas aparecem em algum dos campos informados.
// `campos(item)` devolve a lista de textos em que procurar.
export function filtrarPorTexto(lista, busca, campos) {
  const palavras = normalizarTexto(busca).split(/\s+/).filter(Boolean);
  if (palavras.length === 0) return lista;

  return lista.filter((item) => {
    const texto = normalizarTexto(campos(item).join(' '));
    return palavras.every((palavra) => texto.includes(palavra));
  });
}
