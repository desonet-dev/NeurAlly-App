import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { GotaSvg } from './PlantaSvg.js';

const POSICOES = [0.28, 0.5, 0.72];

// Gotinhas caindo sobre a planta quando ela é regada. `disparo` muda a cada rega para reiniciar.
export default function ChuvaDeGotas({ disparo, altura = 120 }) {
  const valores = useRef(POSICOES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (!disparo) return undefined;
    valores.forEach((v) => v.setValue(0));
    const animacao = Animated.stagger(
      120,
      valores.map((v) => Animated.timing(v, { toValue: 1, duration: 650, easing: Easing.in(Easing.quad), useNativeDriver: true }))
    );
    animacao.start();
    return () => animacao.stop();
  }, [disparo]);

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, estilos.caixa]}>
      {valores.map((v, i) => (
        <Animated.View
          key={i}
          style={[
            estilos.gota,
            {
              left: `${POSICOES[i] * 100}%`,
              opacity: v.interpolate({ inputRange: [0, 0.15, 0.85, 1], outputRange: [0, 1, 1, 0] }),
              transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [-altura * 0.25, altura * 0.55] }) }],
            },
          ]}
        >
          <GotaSvg tamanho={16} />
        </Animated.View>
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: { overflow: 'hidden' },
  gota: { position: 'absolute', top: 0, marginLeft: -8 },
});
