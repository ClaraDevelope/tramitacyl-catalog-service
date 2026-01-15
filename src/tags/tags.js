// Lista cerrada de tags para el catálogo de ayudas
export const TAGS = [
  // Nivel 1 · Temática
  'employment',
  'training',
  'education',
  'housing',
  'family',
  'care',
  'health',
  'disability',
  'energy',
  'transport',
  'entrepreneurship',
  'social_support',
  'digital_inclusion',

  // Nivel 2 · Edad
  'age_under_18',
  'age_under_30',
  'age_under_35',
  'age_under_45',
  'age_over_45',
  'age_over_55',
  'age_over_65',

  // Nivel 2 · Situación laboral
  'unemployed',
  'jobseeker_registered',
  'long_term_unemployed',
  'employee',
  'self_employed',
  'new_self_employed',
  'business_creation',
  'student',

  // Nivel 2 · Ingresos y vulnerabilidad
  'low_income',
  'income_below_iprem',
  'income_below_smi',
  'risk_of_exclusion',
  'social_vulnerability',

  // Nivel 2 · Familia y cuidados
  'large_family',
  'single_parent',
  'dependent_person_care',
  'children_under_3',
  'children_under_12',
  'birth_or_adoption',

  // Nivel 2 · Salud y discapacidad
  'disability_recognized',
  'dependency_recognized',
  'chronic_illness',

  // Nivel 2 · Territorio y ámbito
  'castilla_y_leon_specific',
  'municipal_scope',
  'provincial_scope',
  'rural_area',
  'depopulation_area',

  // Nivel 2 · Modalidad (informativas, NO excluyentes)
  'online_available',
  'in_person_available',
  'electronic_processing_preferred',
  'appointment_required'
];

// TypeScript-like const behavior for JavaScript
export const TAGS_READONLY = Object.freeze(TAGS);

// For JavaScript, we'll use a function to check if a value is a valid tag
// In TypeScript, this would be: export type Tag = typeof TAGS[number];

/**
 * Verifica si un valor es un tag válido
 */
export function isTag(value) {
  return TAGS.includes(value);
}

/**
 * Devuelve la lista de tags válidos
 */
export function getAllTags() {
  return TAGS;
}

/**
 * Filtra tags válidos de un array de strings
 */
export function filterValidTags(values) {
  return values.filter(isTag);
}

/**
 * Verifica si un tag pertenece a una categoría específica
 */
export function isCategoryTag(tag, category) {
  const categoryGroups = {
    tematica: ['employment', 'training', 'education', 'housing', 'family', 'care', 'health', 'disability', 'energy', 'transport', 'entrepreneurship', 'social_support', 'digital_inclusion'],
    edad: ['age_under_18', 'age_under_30', 'age_under_35', 'age_under_45', 'age_over_45', 'age_over_55', 'age_over_65'],
    situacion_laboral: ['unemployed', 'jobseeker_registered', 'long_term_unemployed', 'employee', 'self_employed', 'new_self_employed', 'business_creation', 'student'],
    ingresos: ['low_income', 'income_below_iprem', 'income_below_smi', 'risk_of_exclusion', 'social_vulnerability'],
    familia: ['large_family', 'single_parent', 'dependent_person_care', 'children_under_3', 'children_under_12', 'birth_or_adoption'],
    salud: ['disability_recognized', 'dependency_recognized', 'chronic_illness'],
    territorio: ['castilla_y_leon_specific', 'municipal_scope', 'provincial_scope', 'rural_area', 'depopulation_area'],
    modalidad: ['online_available', 'in_person_available', 'electronic_processing_preferred', 'appointment_required']
  };

  return categoryGroups[category].includes(tag);
}