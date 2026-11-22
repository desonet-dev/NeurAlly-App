import React, { useMemo } from 'react';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { desenharErva, desenharGota, desenharPlanta } from '../utils/plantasDesenho.js';

const ELEMENTOS = { circle: Circle, ellipse: Ellipse, path: Path, rect: Rect };

function Formas({ formas }) {
  return formas.map((forma, i) => {
    const { tipo, ...atributos } = forma;
    const Elemento = ELEMENTOS[tipo];
    return <Elemento key={i} {...atributos} />;
  });
}

// Desenho de uma planta em um dos 4 estágios (0 semente, 1 broto, 2 planta jovem, 3 planta adulta).
// `adormecida` deixa o desenho mais apagado (a planta nunca morre, só dorme até receber cuidado).
export default function PlantaSvg({ especie, estagio, tamanho = 80, adormecida = false }) {
  const formas = useMemo(() => desenharPlanta(especie, estagio), [especie, estagio]);

  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 100 100">
      <G opacity={adormecida ? 0.45 : 1}>
        <Formas formas={formas} />
      </G>
    </Svg>
  );
}

// Ervinha que o jogador limpa deslizando o dedo.
export function ErvaSvg({ tamanho = 26 }) {
  const formas = useMemo(() => desenharErva(), []);
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 36 36">
      <Formas formas={formas} />
    </Svg>
  );
}

// Gotinha de água (contador de gotas e chuva da rega).
export function GotaSvg({ tamanho = 18 }) {
  const formas = useMemo(() => desenharGota(), []);
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 20 24">
      <Formas formas={formas} />
    </Svg>
  );
}
