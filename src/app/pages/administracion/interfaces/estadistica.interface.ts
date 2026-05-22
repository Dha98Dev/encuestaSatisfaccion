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





// estadisticas.interface.ts

export interface EstadisticasResponse {
  success: boolean;
  data: {
    configuracion?: ConfiguracionRespuestas; // Nuevo campo opcional
    resumen_ejecutivo: ResumenEjecutivo;
    desempeno_departamentos: DesempenoDepartamento[];
    tramites_criticos: TramiteCritico[];
    preguntas_criticas: PreguntaCritica[];
    distribucion_calificaciones: DistribucionCalificacionesResponse; // ⚠️ CAMBIA AQUÍ
    tendencias_mensuales: TendenciasMensuales;
    ranking_departamentos: RankingDepartamentos;
  };
  metadata: {
    fecha_generacion: string;
    umbral_negativo: number;
    total_registros_analizados: number;
  };
}

// Nueva interfaz para la distribución (estructura anidada)
export interface DistribucionCalificacionesResponse {
  distribucion: DistribucionCalificacion[];  // Array de calificaciones
  metricas_salud: MetricasSalud;             // Métricas agregadas
  total_respuestas: number;                  // Total de respuestas
}

// Interfaz para métricas de salud (nueva)
export interface MetricasSalud {
  tasa_positividad: number;
  tasa_negatividad: number;
  tasa_neutralidad: number;
  indice_salud: number;
  balance: 'positivo' | 'negativo' | 'neutral';
}

// Interfaz para cada distribución de calificación (se mantiene igual)
export interface DistribucionCalificacion {
  orden: number;
  nivel: string;
  descripcion: string;
  total_respuestas: number;
  porcentaje: number;
  categoria: string;
  color?: string;    // Opcional (nuevo)
  icono?: string;    // Opcional (nuevo)
  respuesta_id?: string | null; // Opcional (nuevo)
}

// Nueva interfaz opcional para configuración
export interface ConfiguracionRespuestas {
  umbral_negativo: number;
  total_categorias_respuesta: number;
  rango_respuestas: {
    min: number;
    max: number;
  };
}

// El resto de interfaces se mantienen igual...
export interface ResumenEjecutivo {
  total_personas_encuestadas: number;
  total_respuestas: number;
  total_tramites_evaluados: number;
  total_departamentos_evaluados: number;
  calificacion_promedio: number;
  tasa_satisfaccion: number;
  tasa_insatisfaccion: number;
  nps: number;
  evaluacion_general: {
    nivel: string;
    mensaje: string;
    color: string;
  };
  umbrales_utilizados?: {  // Opcional (nuevo)
    negativo: number;
    excelente: number;
  };
}

export interface DesempenoDepartamento {
  id: string;
  nombre: string;
  total_personas: number;
  total_respuestas: number;
  calificacion_promedio: number;
  tasa_satisfaccion: number;
  tasa_insatisfaccion: number;
  nivel_riesgo: {
    nivel: string;
    color: string;
    recomendacion: string;
  };
  tramites_evaluados: number;
}

export interface TramiteCritico {
  id: string;
  nombre: string;
  departamento: string;
  total_respuestas: number;
  respuestas_negativas: number;
  tasa_insatisfaccion: number;
  calificacion_promedio: number;
  personas_afectadas: number;
  prioridad: {
    nivel: string;
    color: string;
    plazo: string;
  };
}

export interface PreguntaCritica {
  id: string;
  pregunta: string;
  departamento: string;
  tramite: string;
  total_respuestas: number;
  respuestas_negativas: number;
  tasa_insatisfaccion: number;
  calificacion_promedio: number;
}

export interface TendenciasMensuales {
  datos: TendenciaMensual[];
  tendencia: {
    direccion: string;
    cambio: number;
    interpretacion: string;
  };
}

export interface TendenciaMensual {
  mes: string;
  total_respuestas: number;
  personas_encuestadas: number;
  tasa_insatisfaccion: number;
  calificacion_promedio: number;
}

export interface RankingDepartamentos {
  mejor_departamento: DesempenoDepartamento;
  peor_departamento: DesempenoDepartamento;
  top_3_mejores: DesempenoDepartamento[];
  top_3_peores: DesempenoDepartamento[];
}