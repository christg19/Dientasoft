export enum ToothStatus {
  'Tratamiento Preventivo' = 0,
  'Enfermedad Corto Plazo' = 1,
  'Enfermedad Largo Plazo' = 2,
  'Extracción y Protesis' = 3,
  'Reservado' = 4,
  
}

export enum ToothNames {
  "Incisivo Central Superior Derecho" = 1,
  "Incisivo Lateral Superior Derecho" = 2,
  "Canino Superior Derecho" = 3,
  "Primer Premolar Superior Derecho" = 4,
  "Segundo Premolar Superior Derecho" = 5,
  "Primer Molar Superior Derecho" = 6,
  "Segundo Molar Superior Derecho" = 7,
  "Tercer Molar Superior Derecho" = 8,
  "Incisivo Central Superior Izquierdo" = 9,
  "Incisivo Lateral Superior Izquierdo" = 10,
  "Canino Superior Izquierdo" = 11,
  "Primer Premolar Superior Izquierdo" = 12,
  "Segundo Premolar Superior Izquierdo" = 13,
  "Primer Molar Superior Izquierdo" = 14,
  "Segundo Molar Superior Izquierdo" = 15,
  "Tercer Molar Superior Izquierdo" = 16,
  "Tercer Molar Inferior Izquierdo" = 17,
  "Segundo Molar Inferior Izquierdo" = 18,
  "Primer Molar Inferior Izquierdo" = 19,
  "Segundo Premolar Inferior Izquierdo" = 20,
  "Primer Premolar Inferior Izquierdo" = 21,
  "Canino Inferior Izquierdo" = 22,
  "Incisivo Lateral Inferior Izquierdo" = 23,
  "Incisivo Central Inferior Izquierdo" = 24,
  "Incisivo Central Inferior Derecho" = 25,
  "Incisivo Lateral Inferior Derecho" = 26,
  "Canino Inferior Derecho" = 27,
  "Primer Premolar Inferior Derecho" = 28,
  "Segundo Premolar Inferior Derecho" = 29,
  "Primer Molar Inferior Derecho" = 30,
  "Segundo Molar Inferior Derecho" = 31,
  "Tercer Molar Inferior Derecho" = 32
}


export interface DataRow<T> {
  map: Map<string, string>;
  columns:string[]
}