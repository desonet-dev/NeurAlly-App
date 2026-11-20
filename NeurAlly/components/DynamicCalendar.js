import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';

import { useEstilos } from '../contexts/TemaContext.js';
LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
  dayNames: ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'],
  dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

export default function MeuCalendario({ selectedDate, onDayPress, datasComRegistro = new Set(), datasConsulta = new Set() }) {
  const [styles, cor] = useEstilos(criarStyles);
  // Azul usado para destacar os dias com consulta marcada.
  const COR_CONSULTA = cor.bg('#4894FE');

  const markedDates = {};
  datasComRegistro.forEach((data) => {
    markedDates[data] = {
      ...(markedDates[data] || {}),
      dots: [{ key: 'registro', color: cor.fg('#FF8C42') }],
    };
  });
  
  // Dias com consulta: círculo azul preenchido e número branco.
  datasConsulta.forEach((data) => {
    markedDates[data] = {
      ...(markedDates[data] || {}),
      selected: true,
      selectedColor: COR_CONSULTA,
      selectedTextColor: cor.fg('#FFF'),
    };
  });

  // Dia tocado: só um contorno, a não ser que ele já tenha consulta (aí continua preenchido).
  const selecionadoTemConsulta = datasConsulta.has(selectedDate);
  markedDates[selectedDate] = {
    ...(markedDates[selectedDate] || {}),
    selected: true,
    selectedColor: selecionadoTemConsulta ? COR_CONSULTA : 'transparent',
    selectedTextColor: selecionadoTemConsulta ? cor.fg('#FFF') : cor.fg('#6292D6'),
  };

  return (
    <View style={styles.calendarWrapper}>
      <Calendar
        key={cor.escuro ? 'escuro' : 'claro'}
        current={selectedDate}
        markingType={'multi-dot'}
        markedDates={markedDates}
        onDayPress={onDayPress}
        style={styles.calendarStyle}
        theme={{
          calendarBackground: cor.bg('#FFF'),
          textSectionTitleColor: cor.fg('#FFF'),
          textSectionTitleDisabledColor: cor.fg('#FFF'),
          selectedDayBackgroundColor: 'transparent',
          selectedDayTextColor: cor.fg('#6292D6'),
          todayTextColor: cor.fg('#6292D6'),
          dayTextColor: cor.fg('#333'),
          textDisabledColor: cor.fg('#FFB890'),
          dotColor: cor.fg('#FF8C42'),
          selectedDotColor: cor.fg('#FF8C42'),
          arrowColor: cor.fg('#FFF'),
          monthTextColor: cor.fg('#FFF'),
          textDayFontFamily: 'Montserrat-Regular',
          textMonthFontFamily: 'Montserrat-Bold',
          textDayHeaderFontFamily: 'Montserrat-Regular',
          textDayFontSize: 12,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 12,
          'stylesheet.calendar.header': {
            header: {
              backgroundColor: cor.bg('#6292D6'),
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 10,
              paddingHorizontal: 10,
            },
            dayHeader: {
              color: cor.fg('#FFF'),
              fontFamily: 'Montserrat-Regular',
              fontSize: 12,
              marginTop: 10,
              marginBottom: 10,
            },
            week: {
              marginTop: 0,
              flexDirection: 'row',
              justifyContent: 'space-around',
              backgroundColor: cor.bg('#6292D6'),
              paddingBottom: 5,
            }
          },
          'stylesheet.day.multiDot': {
            selected: {
              borderColor: cor.bd('#6292D6'),
              borderWidth: 1.5,
              borderRadius: 20,
            }
          }
        }}
      />
    </View>
  );
}

const criarStyles = (cor) => StyleSheet.create({
  calendarWrapper: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: cor.bg('#FFF'),
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