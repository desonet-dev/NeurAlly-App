import React from 'react';
import { View } from 'react-native';

// Sala de vídeo na web: abre o endereço da sala em um quadro (iframe) com câmera e microfone liberados.
export default function SalaDeVideo({ url }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }} testID="sala-de-video">
      {React.createElement('iframe', {
        src: url,
        title: 'Chamada de vídeo da consulta',
        allow: 'camera; microphone; fullscreen; display-capture; autoplay',
        style: { border: 0, width: '100%', height: '100%', flex: 1 },
      })}
    </View>
  );
}
