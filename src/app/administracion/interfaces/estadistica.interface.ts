export interface EstadisticasDepartamentoResponse {
  success: boolean;
  departamento: {
    id: string;
    nombre: string;
  };
  resumen: {
    total_personas_encuestadas: number;
    total_respuestas_registradas: number;
    total_tramites_con_respuestas: number;
  };
  tramites: any[];
  preguntas: any[];
  detalle_por_tramite: any[];
}



export interface EstadisticasGeneralResponse {
  success: boolean;
  resumen: ResumenEstadisticasGeneral;
  departamentos_criticos: DepartamentoCritico[];
  tramites_criticos: TramiteCritico[];
  preguntas_criticas: PreguntaCritica[];
  distribucion_respuestas: DistribucionRespuesta[];
}

export interface ResumenEstadisticasGeneral {
  total_personas_encuestadas: number;
  total_respuestas_registradas: number;
  total_departamentos_evaluados: number;
  total_tramites_evaluados: number;
  total_respuestas_negativas: number;
  porcentaje_respuestas_negativas: number;
}

export interface DepartamentoCritico {
  departamento_id: string;
  departamento: string;
  total_personas: number;
  total_respuestas: number;
  total_negativas: number;
  porcentaje_negativas: number;
}

export interface TramiteCritico {
  departamento_id: string;
  departamento: string;
  tramite_id: string;
  tramite: string;
  total_personas: number;
  total_respuestas: number;
  total_negativas: number;
  porcentaje_negativas: number;
}

export interface PreguntaCritica {
  departamento: string;
  tramite: string;
  pregunta: string;
  total_respuestas: number;
  total_negativas: number;
  porcentaje_negativas: number;
}

export interface DistribucionRespuesta {
  respuesta_id: string;
  respuesta: string;
  orden: number;
  total: number;
  porcentaje: number;
}