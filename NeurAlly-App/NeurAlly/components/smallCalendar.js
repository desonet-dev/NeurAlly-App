import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

import paleta from '../styles/Tema.js';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useFonts } from 'expo-font';

const dates = [
  {dayNum: 1, dayName: 'Segunda', abrv: 'Seg'},
  {dayNum: 2, dayName: 'Ter', abrv: 'Ter'},
  {dayNum: 3, dayName: 'Qua', abrv: 'Qua'},
  {dayNum: 4, dayName: 'Qui', abrv: 'Qui'},
  {dayNum: 5, dayName: 'Sex', abrv: 'Sex'},
]

export default function SmallCalendar() {
  const navigation = useNavigation();
  const route = useRoute();

  const telaAtual = (grupo) => {
    return screens[grupo].includes(route.name);
  };

  const currentDay = 3;

  
  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
  });
  if (!fontsLoaded) {
    return null;
  }

  return (
  <View style={styles.calendarView}>
  {dates.map((date) => (
    <TouchableOpacity style={date.dayNum == currentDay ? styles.selectedDateView : styles.dateView}>
      <Text style={date.dayNum == currentDay ? styles.selectedTitleText : styles.titleText}> { date.abrv} </Text>
      <View style={{flex:1}}/>
      <Text style={date.dayNum == currentDay ? styles.selectedTitleText : styles.titleText}> {date.dayNum} </Text>
    </TouchableOpacity>
  ))}
  </View>)
}

const styles = StyleSheet.create({
  calendarView: {
    height: 87,
    flexDirection: 'row',
    backgroundColor: paleta.cor.branco,
    marginHorizontal: 20,
    marginBottom: 35,
    borderRadius: 20,
    borderBottomWidth: 5,
    borderColor: paleta.cor.cinza,
  },
  dateView: {
    flex: 1,
    margin: 2,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDateView: {
    flex: 1,
    margin: 2,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: paleta.cor.a7,
  },
  titleText: {
    fontSize: 19,
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
  },
  selectedTitleText: {
    fontSize: 19,
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
    color: paleta.cor.branco,
  }
});
