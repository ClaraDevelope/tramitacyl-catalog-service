import { isTag, getAllTags } from './tags.js';

/**
 * Reglas de tagging deterministas basadas en diccionarios y regex
 */
class TaggingRules {
  // Diccionarios por categoría
  static EMPLOYMENT_TERMS = [
    'empleo', 'trabajo', 'contrato', 'laboral', 'trabajador', 'empresa', 'contratación',
    'desempleo', 'paro', 'desempleado', 'buscar trabajo', 'inserción laboral', 'orientación laboral',
    'prácticas', 'becas empresa', 'formación profesional', 'certificado profesionalidad'
  ];

  static TRAINING_TERMS = [
    'formación', 'curso', 'taller', 'capacitación', 'aprendizaje', 'educación', 'enseñanza',
    'formación profesional', 'reciclaje', 'competencias', 'habilidades', 'perfeccionamiento',
    'curso online', 'e-learning', 'formación continua', 'formación ocupacional', 'profesional', 'ocupacional'
  ];

  static EDUCATION_TERMS = [
    'educación', 'enseñanza', 'colegio', 'instituto', 'universidad', 'estudios', 'título',
    'educación infantil', 'educación primaria', 'educación secundaria', 'bachillerato',
    'educación superior', 'master', 'postgrado', 'doctorado', 'título universitario'
  ];

  static HOUSING_TERMS = [
    'vivienda', 'alquiler', 'hipoteca', 'casa', 'piso', 'alojamiento', 'residencia',
    'alquiler vivienda', 'vivienda protegida', 'vpo', 'vivienda pública', 'rehabilitación',
    'compra vivienda', 'vivienda juvenil', 'residencia', 'piso', 'hogar'
  ];

  static FAMILY_TERMS = [
    'familia', 'familiar', 'hogar', 'unidad familiar', 'convivencia', 'matrimonio', 'pareja',
    'familia monoparental', 'familia numerosa', 'dependiente', 'cuidados familiares',
    'conciliación', 'vida familiar', 'apoyo familiar', 'monoparental', 'numerosa',
    'ayuda familiar', 'apoyo económico', 'prestación'
  ];

  static CARE_TERMS = [
    'cuidados', 'dependencia', 'atención', 'asistencia', 'cuidador', 'dependiente',
    'cuidado dependientes', 'atención temprana', 'cuidado mayores', 'cuidado infantil',
    'servicio cuidado', 'asistencia personal', 'ayuda domicilio'
  ];

  static HEALTH_TERMS = [
    'salud', 'médico', 'sanitario', 'enfermedad', 'tratamiento', 'medicina', 'hospital',
    'salud mental', 'bienestar', 'prevención', 'salud pública', 'atención sanitaria',
    'seguridad social', 'cobertura sanitaria', 'medicamentos'
  ];

  static DISABILITY_TERMS = [
    'discapacidad', 'minusvalía', 'discapacitado', 'accesibilidad', 'inclusión',
    'movilidad reducida', 'discapacidad física', 'discapacidad intelectual',
    'discapacidad sensorial', 'accesibilidad universal', 'apoyo discapacidad'
  ];

  static ENERGY_TERMS = [
    'energía', 'electricidad', 'gas', 'combustible', 'energético', 'eficiencia energética',
    'energía renovable', 'término variable', 'factura energía', 'bono social eléctrico',
    'bono social térmico', 'energía solar', 'ahorro energético', 'consumo energético'
  ];

  static TRANSPORT_TERMS = [
    'transporte', 'movilidad', 'vehículo', 'coche', 'transporte público', 'autobús',
    'tren', 'metro', 'tarjeta transporte', 'abono transporte', 'movilidad sostenible',
    'conducción', 'carnet conducir', 'transporte escolar'
  ];

  static ENTREPRENEURSHIP_TERMS = [
    'emprendimiento', 'empresa', 'negocio', 'autónomo', 'emprendedor', 'creación empresa',
    'pyme', 'pequeña empresa', 'mediana empresa', 'start up', 'innovación empresarial',
    'plan negocio', 'proyecto empresarial', 'financiación empresarial', 'crear empresas', 'emprender'
  ];

  static SOCIAL_SUPPORT_TERMS = [
    'apoyo social', 'inclusión social', 'exclusión social', 'vulnerabilidad', 'renta mínima',
    'inserción social', 'cohesión social', 'desarrollo social', 'acción social',
    'servicio social', 'trabajador social', 'asistencia social', 'protección social',
    'apoyo económico', 'prestación', 'subvención', 'ayuda económica', 'beneficio'
  ];

  static DIGITAL_INCLUSION_TERMS = [
    'digital', 'tecnología', 'informática', 'internet', 'ordenador', 'teléfono',
    'alfabetización digital', 'brecha digital', 'competencias digitales', 'teletrabajo',
    'administración digital', 'firma digital', 'identidad digital', 'conectividad'
  ];

  // Reglas de edad
  static AGE_RULES = [
    { patterns: ['menor de 18 años', 'menores', 'infantil', 'adolescente'], tag: 'age_under_18' },
    { patterns: ['jóvenes menores de 30', 'menores de 30 años', 'joven.*30'], tag: 'age_under_30' },
    { patterns: ['jóvenes menores de 35', 'menores de 35 años', 'joven.*35'], tag: 'age_under_35' },
    { patterns: ['menores de 45 años', '< 45'], tag: 'age_under_45' },
    { patterns: ['mayores de 45 años', '> 45', '45 años.*más'], tag: 'age_over_45' },
    { patterns: ['mayores de 55 años', '> 55', '55 años.*más'], tag: 'age_over_55' },
    { patterns: ['mayores de 65 años', 'jubilados', 'pensionistas', '> 65'], tag: 'age_over_65' }
  ];

  // Reglas de situación laboral
  static EMPLOYMENT_STATUS_RULES = [
    { patterns: ['desempleado', 'parado', 'en paro', 'sin empleo'], tag: 'unemployed' },
    { patterns: ['demandante de empleo', 'inscrito', 'inscripción demandante', 'sepe', 'inscritas como demandantes'], tag: 'jobseeker_registered' },
    { patterns: ['larga duración', 'paro largo', 'desempleo largo'], tag: 'long_term_unemployed' },
    { patterns: ['trabajador', 'asalariado', 'empleado'], tag: 'employee' },
    { patterns: ['autónomo', 'trabajador por cuenta propia', 'freelance'], tag: 'self_employed' },
    { patterns: ['nuevo autónomo', 'nueva actividad'], tag: 'new_self_employed' },
    { patterns: ['creación empresa', 'emprender', 'crear negocio', 'crear empresas', 'crear empresas en', 'creen empresas'], tag: 'business_creation' },
    { patterns: ['estudiante', 'educativo', 'formación', 'aprendizaje'], tag: 'student' }
  ];

  // Reglas de ingresos
  static INCOME_RULES = [
    { patterns: ['renta baja', 'bajos ingresos', 'ingresos bajos', 'ingresos inferiores'], tag: 'low_income' },
    { patterns: ['IPREM', 'indicador público renta efectos múltiples'], tag: 'income_below_iprem' },
    { patterns: ['SMI', 'salario mínimo interprofesional'], tag: 'income_below_smi' },
    { patterns: ['exclusión social', 'riesgo exclusión', 'vulnerabilidad'], tag: 'risk_of_exclusion' },
    { patterns: ['vulnerabilidad social', 'situación vulnerabilidad', 'colectivos vulnerables'], tag: 'social_vulnerability' }
  ];

  // Reglas de familia
  static FAMILY_RULES = [
    { patterns: ['familia numerosa', 'familia numeros', 'monoparental', 'solo padre', 'sola madre'], tag: 'large_family' },
    { patterns: ['monoparental', 'padre solo', 'madre sola'], tag: 'single_parent' },
    { patterns: ['dependiente', 'cuidado dependiente', 'dependencia'], tag: 'dependent_person_care' },
    { patterns: ['menores de 3 años', 'niños pequeños', 'bebés'], tag: 'children_under_3' },
    { patterns: ['menores de 12 años', 'niños', 'adolescentes'], tag: 'children_under_12' },
    { patterns: ['nacimiento', 'parto', 'maternidad', 'paternidad', 'adopción'], tag: 'birth_or_adoption' }
  ];

  // Reglas de salud
  static HEALTH_RULES = [
    { patterns: ['discapacidad reconocida', 'grado discapacidad', 'certificado'], tag: 'disability_recognized' },
    { patterns: ['dependencia reconocida', 'grado dependencia', 'valoración'], tag: 'dependency_recognized' },
    { patterns: ['enfermedad crónica', 'patología crónica', 'enfermedad prolongada'], tag: 'chronic_illness' }
  ];

  // Reglas de territorio
  static TERRITORIAL_RULES = [
    { patterns: ['castilla.*león', 'cyl', 'castilla león', 'junta castilla león'], tag: 'castilla_y_leon_specific' },
    { patterns: ['municipal', 'ayuntamiento', 'local'], tag: 'municipal_scope' },
    { patterns: ['provincial', 'diputación'], tag: 'provincial_scope' },
    { patterns: ['rural', 'mundo rural', 'entorno rural'], tag: 'rural_area' },
    { patterns: ['despoblación', 'despoblado', 'área despoblada', 'retos demográficos'], tag: 'depopulation_area' }
  ];

  // Reglas de modalidad
  static MODALITY_RULES = [
    { patterns: ['online', 'telemático', 'digital', 'internet'], tag: 'online_available' },
    { patterns: ['presencial', 'cara a cara', 'físico'], tag: 'in_person_available' },
    { patterns: ['procesamiento electrónico', 'tramitación electrónica', 'procesamiento electrónico', 'trámite telemático'], tag: 'electronic_processing_preferred' },
    { patterns: ['cita previa', 'se requiere cita previa', 'necesaria cita previa', 'con cita previa', 'previa cita', 'entrevista previa'], tag: 'appointment_required' }
  ];

  /**
   * Genera tags deterministas basados en reglas
   */
  static computeTags(input) {
    const tags = new Set();
    const text = this.combineText(input);

    // Tags temáticos (Nivel 1)
    this.addThemeTags(text, tags);
    
    // Tags específicos (Nivel 2)
    this.addAgeTags(text, tags);
    this.addEmploymentStatusTags(text, tags);
    this.addIncomeTags(text, tags);
    this.addFamilyTags(text, tags);
    this.addHealthTags(text, tags);
    this.addTerritorialTags(text, tags);
    this.addModalityTags(text, tags);
    
    // Tags de apoyo social automáticos basados en contexto
    this.addInferredSocialSupportTags(text, tags);

    // Devolver tags en orden estable (según lista TAGS)
    const allTags = getAllTags();
    return Array.from(tags).sort((a, b) => allTags.indexOf(a) - allTags.indexOf(b));
  }

  static combineText(input) {
    return [
      input.title,
      input.summary,
      input.scope,
      input.tipo,
      input.ambito
    ].filter(Boolean).join(' ').toLowerCase();
  }

  static addThemeTags(text, tags) {
    if (this.matchesTerms(text, this.EMPLOYMENT_TERMS)) tags.add('employment');
    if (this.matchesTerms(text, this.TRAINING_TERMS)) tags.add('training');
    if (this.matchesTerms(text, this.EDUCATION_TERMS)) tags.add('education');
    if (this.matchesTerms(text, this.HOUSING_TERMS)) tags.add('housing');
    if (this.matchesTerms(text, this.FAMILY_TERMS)) tags.add('family');
    if (this.matchesTerms(text, this.CARE_TERMS)) tags.add('care');
    if (this.matchesTerms(text, this.HEALTH_TERMS)) tags.add('health');
    if (this.matchesTerms(text, this.DISABILITY_TERMS)) tags.add('disability');
    if (this.matchesTerms(text, this.ENERGY_TERMS)) tags.add('energy');
    if (this.matchesTerms(text, this.TRANSPORT_TERMS)) tags.add('transport');
    if (this.matchesTerms(text, this.ENTREPRENEURSHIP_TERMS)) tags.add('entrepreneurship');
    if (this.matchesTerms(text, this.SOCIAL_SUPPORT_TERMS)) tags.add('social_support');
    if (this.matchesTerms(text, this.DIGITAL_INCLUSION_TERMS)) tags.add('digital_inclusion');
    
    // Regla especial: formación profesional implica también education
    if (text.includes('formación profesional') || text.includes('formacion profesional')) {
      tags.add('education');
    }
  }

  static addAgeTags(text, tags) {
    this.applyRules(text, this.AGE_RULES, tags);
  }

  static addEmploymentStatusTags(text, tags) {
    this.applyRules(text, this.EMPLOYMENT_STATUS_RULES, tags);
  }

  static addIncomeTags(text, tags) {
    this.applyRules(text, this.INCOME_RULES, tags);
  }

  static addFamilyTags(text, tags) {
    this.applyRules(text, this.FAMILY_RULES, tags);
  }

  static addHealthTags(text, tags) {
    this.applyRules(text, this.HEALTH_RULES, tags);
  }

  static addTerritorialTags(text, tags) {
    this.applyRules(text, this.TERRITORIAL_RULES, tags);
  }

  static addModalityTags(text, tags) {
    this.applyRules(text, this.MODALITY_RULES, tags);
  }

  static addInferredSocialSupportTags(text, tags) {
    // Si hay indicadores de ayuda económica, subvención o apoyo, añadir social_support
    const supportIndicators = [
      'ayuda económica', 'apoyo económico', 'subvención', 'prestación', 'beneficio',
      'bono', 'apoyo financiero', 'ayuda directa', 'subvencionar', 'apoyar', 'apoyo para'
    ];
    
    // También añadir si hay contextos sociales con ayuda/apoyo
    const socialContexts = ['discapacidad', 'vulnerabilidad', 'dependencia', 'monoparental', 'numerosa'];
    const hasSocialContext = socialContexts.some(context => text.includes(context));
    const hasSupportIndicator = supportIndicators.some(indicator => text.includes(indicator));
    const hasApoyo = text.includes('apoyo');
    

    
    if (hasSupportIndicator || (hasSocialContext && hasApoyo)) {
      tags.add('social_support');
    }
  }

  static matchesTerms(text, terms) {
    return terms.some(term => text.includes(term.toLowerCase()));
  }

  static applyRules(text, rules, tags) {
    for (const rule of rules) {
      if (this.matchesPatterns(text, rule.patterns)) {
        tags.add(rule.tag);
      }
    }
  }

  static matchesPatterns(text, patterns) {
    return patterns.some(pattern => {
      try {
        const regex = new RegExp(pattern, 'i');
        return regex.test(text);
      } catch {
        // Si el patrón no es una regex válida, lo tratamos como texto literal
        return text.toLowerCase().includes(pattern.toLowerCase());
      }
    });
  }
}

/**
 * Función principal para computar tags
 */
export function computeTags(input) {
  return TaggingRules.computeTags(input);
}

// Exportar clase para depuración
export { TaggingRules };