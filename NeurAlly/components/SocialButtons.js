import React from 'react';
import { StyleSheet, View, TouchableOpacity, Image } from 'react-native';

import { useEstilos } from '../contexts/TemaContext.js';
// Botões redondos de login social com os logos oficiais (assets/logo-facebook.png e logo-google.png).
export default function SocialButtons({ onFacebookPress, onGooglePress, style }) {
  const [styles, cor] = useEstilos(criarStyles);
  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.button}
        onPress={onFacebookPress}
        accessibilityRole="button"
        accessibilityLabel="Continuar com Facebook"
      >
        <Image source={require('../assets/logo-facebook.png')} style={styles.icon} resizeMode="contain" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={onGooglePress}
        accessibilityRole="button"
        accessibilityLabel="Continuar com Google"
      >
        <Image source={require('../assets/logo-google.png')} style={styles.icon} resizeMode="contain" />
      </TouchableOpacity>
    </View>
  );
}

const criarStyles = (cor) => StyleSheet.create({
  container: { flexDirection: 'row', gap: 20 },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: cor.bg('#FFF'),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: cor.bd('#F0F0F0'),
  },
  icon: { width: 26, height: 26 },
});
