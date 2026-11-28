// Configuração das chamadas de vídeo das consultas on-line.

// Servidor de vídeo (Jitsi Meet). O endereço público não exige cadastro nem chave. Para produção,
// o ideal é um servidor próprio ou o serviço pago do Jitsi (JaaS), que permitem salas com senha/JWT.
export const SERVIDOR_VIDEO = 'https://meet.jit.si';

// A sala fica disponível a partir de X minutos antes do horário da consulta...
export const ABRE_ANTES_MIN = 10;
// ...e continua disponível até X minutos depois do fim previsto (para a consulta poder passar um pouco do horário).
export const FECHA_DEPOIS_MIN = 30;
