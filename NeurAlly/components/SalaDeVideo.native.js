import React from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

// Navegador "comum" para a sala de vídeo (o Jitsi funciona melhor com o identificador de Chrome/Safari
// do que com o de uma WebView genérica).
const NAVEGADOR =
  Platform.OS === 'ios'
    ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    : 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36';

// Sala de vídeo no celular: abre o endereço da sala dentro do app (com câmera e microfone liberados).
export default function SalaDeVideo({ url, onErro }) {
  return (
    <WebView
      testID="sala-de-video"
      source={{ uri: url }}
      style={estilos.web}
      userAgent={NAVEGADOR}
      javaScriptEnabled
      domStorageEnabled
      allowsInlineMediaPlayback
      mediaPlaybackRequiresUserAction={false}
      mediaCapturePermissionGrantType="grant"
      originWhitelist={['*']}
      setSupportMultipleWindows={false}
      startInLoadingState
      renderLoading={() => (
        <View style={estilos.carregando}>
          <ActivityIndicator size="large" color="#6292D6" />
        </View>
      )}
      onError={onErro}
      onHttpError={onErro}
    />
  );
}

const estilos = StyleSheet.create({
  web: { flex: 1, backgroundColor: '#000' },
  carregando: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' },
});
