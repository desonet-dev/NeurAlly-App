import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { useEstilos } from '../contexts/TemaContext.js';
// Frase de aceite com os dois textos clicáveis (Termos de uso e Política de privacidade e segurança).
// Fica nas telas de login e cadastro e abre a tela DocumentoLegal.
export default function LinksLegais({ navigation, prefixo = 'Ao continuar, você concorda com os' }) {
  const [styles, cor] = useEstilos(criarStyles);
  return (
    <Text style={styles.texto}>
      {prefixo}{' '}
      <Text
        style={styles.link}
        onPress={() => navigation.navigate('DocumentoLegal', { tipo: 'termos' })}
        accessibilityRole="link"
        accessibilityLabel="Abrir os termos de uso"
      >
        Termos de uso
      </Text>{' '}
      e a{' '}
      <Text
        style={styles.link}
        onPress={() => navigation.navigate('DocumentoLegal', { tipo: 'privacidade' })}
        accessibilityRole="link"
        accessibilityLabel="Abrir a política de privacidade e segurança dos dados"
      >
        Política de privacidade e segurança
      </Text>
      .
    </Text>
  );
}

const criarStyles = (cor) => StyleSheet.create({
  texto: { fontFamily: 'Montserrat-Regular', fontSize: 11, color: cor.fg('#5A6B87'), textAlign: 'center', lineHeight: 17, marginTop: 14 },
  link: { fontFamily: 'Montserrat-Bold', color: cor.fg('#1A56DB'), textDecorationLine: 'underline' },
});
