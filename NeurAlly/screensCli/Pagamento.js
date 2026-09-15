import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import paleta from '../styles/Tema.js';

export default function Pagamento({ navigation }) {
  const [metodo, setMetodo] = useState('cartao');

  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
  });

  if (!fontsLoaded) return null;

  const renderRadio = (isSelected) => (
    <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
      {isSelected && <View style={styles.radioInner} />}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color="#1A56DB" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pagamento</Text>
        </View>

        <View style={styles.doctorCard}>
          <View style={styles.doctorAvatarContainer}>
            <Ionicons name="person" size={32} color="#6292D6" />
          </View>
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>Dr. Thiago</Text>
            <Text style={styles.doctorSpecialty}>Especialista em traumas</Text>
          </View>
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>R$20,00</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.paymentOption, metodo === 'pix' && styles.paymentOptionActive]}
          onPress={() => setMetodo('pix')}
        >
          <View style={styles.paymentOptionLeft}>
            <MaterialCommunityIcons name="qrcode" size={24} color="#1A56DB" style={styles.paymentIcon} />
            <Text style={styles.paymentOptionText}>Pix</Text>
          </View>
          {renderRadio(metodo === 'pix')}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.paymentOption, metodo === 'cartao' && styles.paymentOptionActive]}
          onPress={() => setMetodo('cartao')}
        >
          <View style={styles.paymentOptionLeft}>
            <Ionicons name="card-outline" size={24} color="#1A56DB" style={styles.paymentIcon} />
            <Text style={styles.paymentOptionText}>Cartão</Text>
          </View>
          {renderRadio(metodo === 'cartao')}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.paymentOption, metodo === 'google' && styles.paymentOptionActive]}
          onPress={() => setMetodo('google')}
        >
          <View style={styles.paymentOptionLeft}>
            <Ionicons name="logo-google" size={24} color="#1A56DB" style={styles.paymentIcon} />
            <Text style={styles.paymentOptionText}>Google Pay</Text>
          </View>
          {renderRadio(metodo === 'google')}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.paymentOption, metodo === 'apple' && styles.paymentOptionActive]}
          onPress={() => setMetodo('apple')}
        >
          <View style={styles.paymentOptionLeft}>
            <Ionicons name="logo-apple" size={24} color="#1A56DB" style={styles.paymentIcon} />
            <Text style={styles.paymentOptionText}>Apple Pay</Text>
          </View>
          {renderRadio(metodo === 'apple')}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.payButton}
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })}
        >
          <Text style={styles.payButtonText}>Pagar</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: paleta.cor.fundo },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontFamily: 'Montserrat-Bold', fontSize: 20, color: '#1A56DB', marginLeft: 10 },
  doctorCard: { backgroundColor: '#FFF', borderRadius: 15, padding: 15, flexDirection: 'row', alignItems: 'center', marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  doctorAvatarContainer: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center' },
  doctorInfo: { flex: 1, marginLeft: 15 },
  doctorName: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#1A56DB' },
  doctorSpecialty: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#666' },
  priceBadge: { backgroundColor: '#1A56DB', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10 },
  priceText: { fontFamily: 'Montserrat-Bold', fontSize: 12, color: '#FFF' },
  paymentOption: { backgroundColor: '#FFF', borderRadius: 15, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3, borderWidth: 1, borderColor: 'transparent' },
  paymentOptionActive: { borderColor: '#1A56DB' },
  paymentOptionLeft: { flexDirection: 'row', alignItems: 'center' },
  paymentIcon: { marginRight: 15 },
  paymentOptionText: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#333' },
  radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#B0C4DE', justifyContent: 'center', alignItems: 'center' },
  radioOuterSelected: { borderColor: '#1A56DB' },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#1A56DB' },
  payButton: { backgroundColor: '#6292D6', borderRadius: 25, paddingVertical: 18, alignItems: 'center', marginTop: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  payButtonText: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#FFF' }
});