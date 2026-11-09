import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';

LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
  dayNames: ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'],
  dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

// Azul usado para destacar os dias com consulta marcada.
const COR_CONSULTA = '#4894FE';

export default function MeuCalendario({ selectedDate, onDayPress, datasComRegistro = new Set(), datasConsulta = new Set() }) {
  
  const markedDates = {};
  datasComRegistro.forEach((data) => {
    markedDates[data] = {
      ...(markedDates[data] || {}),
      dots: [{ key: 'registro', color: '#FF8C42' }],
    };
  });
  
  // Dias com consulta: círculo azul preenchido e número branco.
  datasConsulta.forEach((data) => {
    markedDates[data] = {
      ...(markedDates[data] || {}),
      selected: true,
      selectedColor: COR_CONSULTA,
      selectedTextColor: '#FFF',
    };
  });

  // Dia tocado: só um contorno, a não ser que ele já tenha consulta (aí continua preenchido).
  const selecionadoTemConsulta = datasConsulta.has(selectedDate);
  markedDates[selectedDate] = {
    ...(markedDates[selectedDate] || {}),
    selected: true,
    selectedColor: selecionadoTemConsulta ? COR_CONSULTA : 'transparent',
    selectedTextColor: selecionadoTemConsulta ? '#FFF' : '#6292D6',
  };

  return (
    <View style={styles.calendarWrapper}>
      <Calendar
        current={selectedDate}
        markingType={'multi-dot'}
        markedDates={markedDates}
        onDayPress={onDayPress}
        style={styles.calendarStyle}
        theme={{
          calendarBackground: '#FFF',
          textSectionTitleColor: '#FFF',
          textSectionTitleDisabledColor: '#FFF',
          selectedDayBackgroundColor: 'transparent',
          selectedDayTextColor: '#6292D6',
          todayTextColor: '#6292D6',
          dayTextColor: '#333',
          textDisabledColor: '#FFB890',
          dotColor: '#FF8C42',
          selectedDotColor: '#FF8C42',
          arrowColor: '#FFF',
          monthTextColor: '#FFF',
          textDayFontFamily: 'Montserrat-Regular',
          textMonthFontFamily: 'Montserrat-Bold',
          textDayHeaderFontFamily: 'Montserrat-Regular',
          textDayFontSize: 12,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 12,
          'stylesheet.calendar.header': {
            header: {
              backgroundColor: '#6292D6',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 10,
              paddingHorizontal: 10,
            },
            dayHeader: {
              color: '#FFF',
              fontFamily: 'Montserrat-Regular',
              fontSize: 12,
              marginTop: 10,
              marginBottom: 10,
            },
            week: {
              marginTop: 0,
              flexDirection: 'row',
              justifyContent: 'space-around',
              backgroundColor: '#6292D6',
              paddingBottom: 5,
            }
          },
          'stylesheet.day.multiDot': {
            selected: {
              borderColor: '#6292D6',
              borderWidth: 1.5,
              borderRadius: 20,
            }
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  calendarWrapper: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#FFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  calendarStyle: {
    borderRadius: 15,
    overflow: 'hidden',
  },
});