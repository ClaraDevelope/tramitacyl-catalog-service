import { test, describe } from 'node:test';
import assert from 'node:assert';
import { computeTags } from '../src/tags/taggingRules.js';
import { computeAidKeywords } from '../src/tags/keywordExtractor.js';
import { AiEnrich, aiSuggest } from '../src/tags/aiEnrich.js';
import { isTag, getAllTags } from '../src/tags/tags.js';

describe('Tags Module', () => {
  test('getAllTags devuelve lista cerrada de tags', () => {
    const tags = getAllTags();
    assert.ok(tags.length > 0);
    assert.ok(tags.includes('employment'));
    assert.ok(tags.includes('housing'));
    assert.ok(tags.includes('age_under_35'));
  });

  test('isTag valida correctamente tags', () => {
    assert.ok(isTag('employment'));
    assert.ok(isTag('age_under_30'));
    assert.ok(!isTag('invalid_tag'));
    assert.ok(!isTag(''));
  });
});

describe('Tagging Rules', () => {
  test('ayuda alquiler para jóvenes menores de 35', () => {
    const input = {
      title: 'Ayuda alquiler para jóvenes menores de 35 años',
      summary: 'Subvención para alquiler de vivienda destinada a jóvenes menores de 35 años',
      scope: 'vivienda',
      tipo: 'subvencion'
    };

    const tags = computeTags(input);
    
    assert.ok(tags.includes('housing'), 'Debe incluir tag housing');
    assert.ok(tags.includes('age_under_35'), 'Debe incluir tag age_under_35');
    assert.ok(tags.includes('social_support'), 'Debe incluir tag social_support');
  });

  test('desempleo de larga duración', () => {
    const input = {
      title: 'Programa de inserción laboral para desempleados de larga duración',
      summary: 'Ayudas para personas en situación de desempleo de larga duración inscritas como demandantes de empleo',
      scope: 'empleo',
      tipo: 'ayuda'
    };

    const tags = computeTags(input);
    
    assert.ok(tags.includes('employment'), 'Debe incluir tag employment');
    assert.ok(tags.includes('unemployed'), 'Debe incluir tag unemployed');
    assert.ok(tags.includes('long_term_unemployed'), 'Debe incluir tag long_term_unemployed');
    assert.ok(tags.includes('jobseeker_registered'), 'Debe incluir tag jobseeker_registered');
  });

  test('familia numerosa monoparental', () => {
    const input = {
      title: 'Ayuda para familias numerosas y monoparentales',
      summary: 'Apoyo económico para familias numerosas y monoparentales con hijos menores a cargo',
      scope: 'familia',
      tipo: 'subvencion'
    };

    const tags = computeTags(input);
    
    assert.ok(tags.includes('family'), 'Debe incluir tag family');
    assert.ok(tags.includes('large_family'), 'Debe incluir tag large_family');
    assert.ok(tags.includes('single_parent'), 'Debe incluir tag single_parent');
    assert.ok(tags.includes('social_support'), 'Debe incluir tag social_support');
  });

  test('renta baja IPREM', () => {
    const input = {
      title: 'Renta mínima de insercción social',
      summary: 'Prestación para personas con ingresos inferiores al IPREM que se encuentran en riesgo de exclusión social',
      scope: 'social',
      tipo: 'prestacion'
    };

    const tags = computeTags(input);
    
    assert.ok(tags.includes('social_support'), 'Debe incluir tag social_support');
    assert.ok(tags.includes('income_below_iprem'), 'Debe incluir tag income_below_iprem');
    assert.ok(tags.includes('low_income'), 'Debe incluir tag low_income');
    assert.ok(tags.includes('risk_of_exclusion'), 'Debe incluir tag risk_of_exclusion');
  });

  test('discapacidad reconocida', () => {
    const input = {
      title: 'Ayuda para personas con discapacidad reconocida',
      summary: 'Apoyo para personas con discapacidad reconocida con grado igual o superior al 33%',
      scope: 'discapacidad',
      tipo: 'ayuda'
    };

    const tags = computeTags(input);
    
    assert.ok(tags.includes('disability'), 'Debe incluir tag disability');
    assert.ok(tags.includes('disability_recognized'), 'Debe incluir tag disability_recognized');
    assert.ok(tags.includes('social_support'), 'Debe incluir tag social_support');
  });

  test('trámite telemático con cita previa', () => {
    const input = {
      title: 'Solicitud de certificado digital (trámite telemático)',
      summary: 'Gestión de certificado digital de forma telemática mediante cita previa',
      scope: 'administracion',
      tipo: 'tramite'
    };

    const tags = computeTags(input);
    
    assert.ok(tags.includes('online_available'), 'Debe incluir tag online_available');
    assert.ok(tags.includes('appointment_required'), 'Debe incluir tag appointment_required');
    assert.ok(tags.includes('electronic_processing_preferred'), 'Debe incluir tag electronic_processing_preferred');
  });

  test('área rural de Castilla y León', () => {
    const input = {
      title: 'Ayuda para emprendedores en áreas rurales de Castilla y León',
      summary: 'Apoyo a la creación de empresas en municipios rurales de Castilla y León afectados por la despoblación',
      scope: 'emprendimiento',
      tipo: 'subvencion'
    };

    const tags = computeTags(input);
    
    assert.ok(tags.includes('entrepreneurship'), 'Debe incluir tag entrepreneurship');
    assert.ok(tags.includes('business_creation'), 'Debe incluir tag business_creation');
    assert.ok(tags.includes('castilla_y_leon_specific'), 'Debe incluir tag castilla_y_leon_specific');
    assert.ok(tags.includes('rural_area'), 'Debe incluir tag rural_area');
    assert.ok(tags.includes('depopulation_area'), 'Debe incluir tag depopulation_area');
  });

  test('formación profesional para desempleados', () => {
    const input = {
      title: 'Curso de formación profesional para desempleados',
      summary: 'Formación ocupacional para personas inscritas como demandantes de empleo',
      scope: 'formacion',
      tipo: 'curso'
    };

    const tags = computeTags(input);
    
    assert.ok(tags.includes('training'), 'Debe incluir tag training');
    assert.ok(tags.includes('education'), 'Debe incluir tag education');
    assert.ok(tags.includes('unemployed'), 'Debe incluir tag unemployed');
    assert.ok(tags.includes('jobseeker_registered'), 'Debe incluir tag jobseeker_registered');
    assert.ok(tags.includes('student'), 'Debe incluir tag student');
  });

  test('energía bono social térmico', () => {
    const input = {
      title: 'Bono social térmico para vulnerabilidad energética',
      summary: 'Ayuda para gastos de calefacción para personas en situación de vulnerabilidad',
      scope: 'energia',
      tipo: 'bono'
    };

    const tags = computeTags(input);
    
    assert.ok(tags.includes('energy'), 'Debe incluir tag energy');
    assert.ok(tags.includes('social_vulnerability'), 'Debe incluir tag social_vulnerability');
    assert.ok(tags.includes('low_income'), 'Debe incluir tag low_income');
    assert.ok(tags.includes('social_support'), 'Debe incluir tag social_support');
  });

  test('sin texto relevante devuelve tags vacíos', () => {
    const input = {
      title: 'Documento sin contenido relevante',
      summary: 'Texto genérico sin términos específicos',
      scope: 'general',
      tipo: 'documento'
    };

    const tags = computeTags(input);
    assert.strictEqual(tags.length, 0, 'Debe devolver array vacío sin tags relevantes');
  });
});

describe('Keywords Extraction', () => {
  test('extrae keywords de ayuda alquiler', () => {
    const keywords = computeAidKeywords(
      'Ayuda alquiler para jóvenes',
      'Subvención para pago de alquiler de vivienda destinada a jóvenes menores de 35 años en Castilla y León',
      'vivienda'
    );

    assert.ok(keywords.length > 0);
    assert.ok(keywords.some(k => k.includes('alquiler')));
    assert.ok(keywords.some(k => k.includes('joven')));
    assert.ok(keywords.some(k => k.includes('vivienda')));
    assert.ok(keywords.some(k => k.includes('subvencion')));
  });

  test('extrae keywords de desempleo', () => {
    const keywords = computeAidKeywords(
      'Programa inserción laboral',
      'Apoyo a desempleados de larga duración inscritos en el SEPE',
      'empleo'
    );

    assert.ok(keywords.length > 0);
    assert.ok(keywords.some(k => k.includes('insercion')));
    assert.ok(keywords.some(k => k.includes('laboral')));
    assert.ok(keywords.some(k => k.includes('desempleado')));
    assert.ok(keywords.some(k => k.includes('sepe')));
  });

  test('filtra stopwords correctamente', () => {
    const keywords = computeAidKeywords(
      'El la los las ayuda para',
      'Este es un texto con muchas palabras comunes pero algunos términos importantes',
      'general'
    );

    // No debe incluir stopwords básicas
    assert.ok(!keywords.includes('el'));
    assert.ok(!keywords.includes('la'));
    assert.ok(!keywords.includes('los'));
    assert.ok(!keywords.includes('las'));
    assert.ok(!keywords.includes('para'));
    
    // Debe incluir términos relevantes
    assert.ok(keywords.some(k => k.includes('ayuda')));
    assert.ok(keywords.some(k => k.includes('terminos')));
    assert.ok(keywords.some(k => k.includes('importantes')));
  });
});

describe('AI Enrich (Fallback Mode)', () => {
  test('aiSuggest fallback funciona sin IA', async () => {
    const input = {
      title: 'Ayuda alquiler para jóvenes',
      summary: 'Subvención para alquiler de vivienda',
      scope: 'vivienda'
    };

    const result = await aiSuggest(input, { enabled: false });
    
    assert.strictEqual(result.source, 'fallback');
    assert.ok(Array.isArray(result.tags));
    assert.ok(Array.isArray(result.keywords));
    assert.ok(result.tags.length > 0);
    assert.ok(result.keywords.length > 0);
  });

  test('AiEnrich clase fallback', async () => {
    const aiEnrich = new AiEnrich({ enabled: false });
    
    const input = {
      title: 'Test de ayuda',
      summary: 'Descripción de test',
      scope: 'test'
    };

    const result = await aiEnrich.suggestTagsAndKeywords(input);
    
    assert.strictEqual(result.source, 'fallback');
    assert.ok(!aiEnrich.isEnabled());
  });
});

describe('Integration Tests', () => {
  test('caso completo: ayuda real con enriquecimiento', async () => {
    const input = {
      title: 'Ayuda alquiler para jóvenes desempleados menores de 35 años en áreas rurales',
      summary: 'Subvención destinada a jóvenes menores de 35 años en situación de desempleo que residan en municipios rurales de Castilla y León. Para acceder es necesario estar inscrito como demandante de empleo y tener ingresos inferiores al IPREM.',
      scope: 'vivienda y empleo',
      tipo: 'subvencion'
    };

    // Tags deterministas
    const tags = computeTags(input);
    
    // Keywords
    const keywords = computeAidKeywords(input.title, input.summary, input.scope);

    // Verificar tags principales
    assert.ok(tags.includes('housing'), 'Debe incluir housing');
    assert.ok(tags.includes('employment'), 'Debe incluir employment');
    assert.ok(tags.includes('age_under_35'), 'Debe incluir age_under_35');
    assert.ok(tags.includes('unemployed'), 'Debe incluir unemployed');
    assert.ok(tags.includes('jobseeker_registered'), 'Debe incluir jobseeker_registered');
    assert.ok(tags.includes('income_below_iprem'), 'Debe incluir income_below_iprem');
    assert.ok(tags.includes('castilla_y_leon_specific'), 'Debe incluir castilla_y_leon_specific');
    assert.ok(tags.includes('rural_area'), 'Debe incluir rural_area');

    // Verificar keywords relevantes
    assert.ok(keywords.some(k => k.includes('alquiler')));
    assert.ok(keywords.some(k => k.includes('joven')));
    assert.ok(keywords.some(k => k.includes('desempleado')));
    assert.ok(keywords.some(k => k.includes('rural')));
    assert.ok(keywords.some(k => k.includes('iprem')));

    // Verificar que todos los tags son válidos
    tags.forEach(tag => {
      assert.ok(isTag(tag), `Tag inválido: ${tag}`);
    });
  });
});