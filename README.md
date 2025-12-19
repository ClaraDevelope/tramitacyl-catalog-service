# TramitaCyL Catalog Service

Servicio de **scraping, normalización e ingesta** de datos públicos de la Junta de Castilla y León para la creación de un **catálogo estructurado de ayudas, becas, subvenciones y trámites administrativos**.

Este servicio actúa como **pipeline de datos**: obtiene información desde fuentes oficiales, la transforma a un modelo estable y la persiste en **Supabase (PostgreSQL)** para su posterior consumo por otras aplicaciones.

---

## 🚀 Características

- **Arquitectura modular y extensible**
  - Scrapers desacoplados por fuente
  - Normalización independiente del origen
- **Ingesta directa en Supabase**
  - Uso de Service Role
  - Upserts idempotentes
- **Modelo de datos unificado**
  - Independiente de la estructura HTML original
- **Ejecución controlada**
  - Pensado para uso manual, cron o pipelines
- **Separación de responsabilidades**
  - Scraping ≠ API ≠ frontend
- **Catálogo público de solo lectura**
  - Escritura restringida a este servicio

---

## 🎯 Objetivo

Proveer una **fuente de datos fiable y actualizada** sobre ayudas y trámites públicos, evitando:

- dependencias de scraping desde frontend,
- duplicación de lógica en distintas apps,
- inconsistencias entre fuentes,
- mantenimiento manual de catálogos.

El servicio está diseñado como **componente reutilizable**, no como script puntual.

---

## Flujo de datos

```text
Fuente oficial (Junta de Castilla y León)
              ↓
       Scraping controlado
              ↓
     Parseo y extracción
              ↓
     Normalización de datos
              ↓
     Validación y limpieza
              ↓
   Supabase (PostgreSQL)
