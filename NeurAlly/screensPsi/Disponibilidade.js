import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, TextInput } from 'react-native';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function DisponibilidadePsi({ navigation }) {
  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
  });

  if (!fontsLoaded) return null;

  const days = [
    { label: 'Dom', active: false },
    { label: 'Seg', active: true },
    { label: 'Ter', active: true },
    { label: 'Qua', active: false },
    { label: 'Qui', active: true },
    { label: 'Sex', active: true },
    { label: 'Sáb', active: true }
  ];

  const DropdownField = ({ label, value }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.dropdownWrapper}>
        <Text style={styles.inputText}>{value}</Text>
        <Ionicons name="caret-down" size={20} color="#000" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color="#1A56DB" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Disponibilidade</Text>
        </View>

        <View style={styles.divider} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <Text style={styles.label}>Horários disponíveis</Text>
          <View style={styles.timeRow}>
            <View style={styles.timeInputBox}>
              <TextInput style={styles.timeInput} value="1:00" editable={false} />
            </View>
            <View style={styles.timeInputBox}>
              <TextInput style={styles.timeInput} value="2:00" editable={false} />
            </View>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="trash-outline" size={20} color="#1A56DB" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.timeRow}>
            <View style={styles.timeInputBox}>
              <TextInput style={styles.timeInput} value="1:00" editable={false} />
            </View>
            <View style={styles.timeInputBox}>
              <TextInput style={styles.timeInput} value="2:00" editable={false} />
            </View>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="add" size={24} color="#1A56DB" />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { marginTop: 10 }]}>Dias disponíveis</Text>
          <View style={styles.daysRow}>
            {days.map((day, index) => (
              <TouchableOpacity key={index} style={[styles.dayPill, day.active && styles.dayPillActive]}>
                <Text style={[styles.dayText, day.active && styles.dayTextActive]}>{day.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.spacer} />

          <DropdownField label="Janela de intervalo entre consultas" value="10 minutos" />
          <DropdownField label="Bloqueio de datas" value="Feriados" />

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#9EBDF0', padding: 20 },
  card: { flex: 1, backgroundColor: '#FFF', borderRadius: 20, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingBottom: 10 },
  headerTitle: { fontFamily: 'Montserrat-Bold', fontSize: 20, color: '#1A56DB', marginLeft: 10 },
  divider: { height: 2, backgroundColor: '#1A56DB', opacity: 0.5, marginHorizontal: 20, marginBottom: 20 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  label: { fontFamily: 'Montserrat-Bold', fontSize: 11, color: '#1A56DB', marginBottom: 10, marginLeft: 5 },
  timeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  timeInputBox: { flex: 1, backgroundColor: '#F0F4FF', borderRadius: 10, height: 40, justifyContent: 'center', alignItems: 'center', marginRight: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  timeInput: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#333' },
  iconButton: { width: 30, height: 30, justifyContent: 'center', alignItems: 'center' },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  dayPill: { flex: 1, height: 35, backgroundColor: '#F0F4FF', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginHorizontal: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1, elevation: 2 },
  dayPillActive: { backgroundColor: '#1A56DB' },
  dayText: { fontFamily: 'Montserrat-Bold', fontSize: 10, color: '#1A56DB' },
  dayTextActive: { color: '#FFF' },
  spacer: { height: 10 },
  inputContainer: { marginBottom: 20 },
  dropdownWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F0F4FF', borderRadius: 12, paddingHorizontal: 15, height: 45, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  inputText: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#333' }
});