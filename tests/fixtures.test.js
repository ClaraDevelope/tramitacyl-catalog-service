import { test, describe } from 'node:test';
import assert from 'node:assert';

describe('Tags Integration Tests', () => {
  test('fixtures reales de ayudas públicas', () => {
    // Fixture 1: Ayuda alquiler para jóvenes
    const fixture1 = {
      title: 'Ayuda alquiler para jóvenes menores de 35 años en Castilla y León',
      summary: 'Subvención de hasta 300 euros mensuales para el pago de alquiler de vivienda destinada a jóvenes menores de 35 años con ingresos inferiores al IPREM',
      scope: 'Vivienda',
      tipo: 'subvencion'
    };

    const expectedTags1 = ['housing', 'age_under_35', 'low_income', 'income_below_iprem', 'castilla_y_leon_specific'];
    const expectedKeywords1 = ['alquiler', 'joven', 'subvencion', 'vivienda', 'iprem', 'ingresos'];

    // Verificar fixture 1
    // (Las funciones de tagging se probarán en el archivo principal)

    // Fixture 2: Programa de formación para desempleados
    const fixture2 = {
      title: 'Curso de formación profesional para desempleados de larga duración',
      summary: 'Formación ocupacional gratuita para personas inscritas como demandantes de empleo en situación de paro de larga duración',
      scope: 'Formación y Empleo',
      tipo: 'curso'
    };

    const expectedTags2 = ['training', 'education', 'unemployed', 'long_term_unemployed', 'jobseeker_registered'];
    const expectedKeywords2 = ['formacion', 'profesional', 'desempleado', 'ocupacional', 'demandante', 'paro'];

    // Fixture 3: Ayuda familias monoparentales
    const fixture3 = {
      title: 'Apoyo económico para familias monoparentales',
      summary: 'Ayuda destinada a familias monoparentales con hijos menores de 12 años a cargo, especialmente madres solteras con bajos ingresos',
      scope: 'Familia y Servicios Sociales',
      tipo: 'ayuda'
    };

    const expectedTags3 = ['family', 'single_parent', 'children_under_12', 'low_income', 'social_support'];
    const expectedKeywords3 = ['apoyo', 'economico', 'monoparental', 'hijos', 'madres', 'solteras', 'ingresos'];

    // Fixture 4: Bono social energía
    const fixture4 = {
      title: 'Bono social eléctrico y térmico para colectivos vulnerables',
      summary: 'Ayuda para pago de facturas de electricidad y calefacción destinada a personas en situación de vulnerabilidad energética y riesgo de exclusión social',
      scope: 'Energía',
      tipo: 'bono'
    };

    const expectedTags4 = ['energy', 'social_vulnerability', 'risk_of_exclusion', 'low_income', 'social_support'];
    const expectedKeywords4 = ['bono', 'social', 'electrico', 'termico', 'vulnerable', 'energia', 'facturas', 'exclusion'];

    // Fixture 5: Discapacidad reconocida
    const fixture5 = {
      title: 'Subvención para accesibilidad en viviendas de personas con discapacidad',
      summary: 'Ayudas para adaptación y accesibilidad en viviendas de personas con discapacidad reconocida con grado igual o superior al 33%',
      scope: 'Discapacidad y Dependencia',
      tipo: 'subvencion'
    };

    const expectedTags5 = ['disability', 'disability_recognized', 'housing', 'social_support'];
    const expectedKeywords5 = ['subvencion', 'accesibilidad', 'viviendas', 'discapacidad', 'reconocida', 'grado'];

    // Fixture 6: Emprendimiento rural
    const fixture6 = {
      title: 'Ayudas para creación de empresas en zonas rurales despobladas',
      summary: 'Apoyo económico para emprendedores que creen empresas en municipios de menos de 5000 habitantes afectados por la despoblación en Castilla y León',
      scope: 'Emprendimiento y Desarrollo Rural',
      tipo: 'subvencion'
    };

    const expectedTags6 = ['entrepreneurship', 'business_creation', 'castilla_y_leon_specific', 'rural_area', 'depopulation_area'];
    const expectedKeywords6 = ['ayudas', 'creacion', 'empresas', 'zonas', 'rurales', 'despobladas', 'emprendedores', 'municipios'];

    // Fixture 7: Cita previa telemática
    const fixture7 = {
      title: 'Solicitud de cita previa telemática',
      summary: 'Trámite para solicitar cita previa de forma telemática para atención presencial en oficinas',
      scope: 'Administración Digital',
      tipo: 'tramite'
    };

    const expectedTags7 = ['online_available', 'appointment_required', 'in_person_available', 'digital_inclusion'];
    const expectedKeywords7 = ['cita', 'previa', 'telematica', 'tramite', 'presencial', 'oficinas'];

    // Fixture 8: Dependencia reconocida
    const fixture8 = {
      title: 'Ayuda para cuidados de personas en situación de dependencia',
      summary: 'Prestación económica para cuidados en el domicilio para personas con dependencia reconocida de grado II o III',
      scope: 'Dependencia y Cuidados',
      tipo: 'prestacion'
    };

    const expectedTags8 = ['care', 'dependency_recognized', 'dependent_person_care', 'health', 'social_support'];
    const expectedKeywords8 = ['ayuda', 'cuidados', 'dependencia', 'reconocida', 'grado', 'prestacion', 'domicilio'];

    // Exportar fixtures para uso en otros tests
    return {
      fixtures: [fixture1, fixture2, fixture3, fixture4, fixture5, fixture6, fixture7, fixture8],
      expectedTags: [expectedTags1, expectedTags2, expectedTags3, expectedTags4, expectedTags5, expectedTags6, expectedTags7, expectedTags8],
      expectedKeywords: [expectedKeywords1, expectedKeywords2, expectedKeywords3, expectedKeywords4, expectedKeywords5, expectedKeywords6, expectedKeywords7, expectedKeywords8]
    };
  });
});