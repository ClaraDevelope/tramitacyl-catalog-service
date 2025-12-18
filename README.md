<<<<<<< HEAD
# tramitacyl-catalog-service
=======
# Scraper de Ayudas Públicas

Scraper modular y extensible para obtener ayudas y convocatorias públicas de la Junta de Castilla y León.

## 🚀 Características

- **Modular y extensible**: Fácil añadir nuevos organismos
- **CLI completa**: Interfaz de línea de comandos con múltiples opciones
- **API programática**: Función `runScraping()` reutilizable
- **Almacenamiento JSON**: Persistencia local con deduplicación
- **Filtros avanzados**: Por tipo, ámbito, fechas, palabras clave
- **Logging detallado**: Con colores y progreso
- **Manejo robusto de errores**: Reintentos automáticos

## 📦 Instalación

```bash
npm install
```

## 🎯 Uso

### Desde Terminal

```bash
# Scraping básico
npm run scrape

# Con filtros
npm run scrape -- --tipo=subvencion --ambito=cultura --estado=abierta

# Ver estadísticas
npm run stats

# Ayuda completa
npm start -- --help
```

### Desde App Node.js

```javascript
import { runScraping } from './src/index.js';

// Scraping básico
const resultados = await runScraping({ 
  source: 'junta-cyl' 
});

// Con filtros avanzados
const ayudasRecientes = await runScraping({
  source: 'junta-cyl',
  filters: {
    tipo: 'subvencion',
    fechaDesde: '01/01/2024',
    ambito: 'cultura'
  },
  updateStorage: true
});
```

## 📁 Estructura del Proyecto

```
src/
├── scrapers/          # Lógica de scraping específica
├── parsers/           # Parseo de HTML a datos normalizados
├── services/          # Orquestación y servicios
├── storage/           # Almacenamiento en JSON
├── config/            # Configuración de fuentes
├── utils/             # Utilidades HTTP
├── types/             # Tipos de datos
└── index.js           # Script principal
```

## 🔧 Configuración

El scraper se configura a través del archivo `src/config/sources.js`, donde se definen:

- URLs de las fuentes
- Selectores CSS
- Configuración de paginación
- Tiempos de espera

## 📊 Formato de Datos

Cada ayuda tiene la siguiente estructura:

```javascript
{
  "id": "junta-cyl-abc12345",
  "titulo": "Ayuda para proyectos culturales 2024",
  "organismo": "Junta de Castilla y León",
  "tipo": "subvencion",
  "ambito": "cultura",
  "fechaPublicacion": "2024-01-15T00:00:00.000Z",
  "fechaLimite": "2024-03-01T23:59:59.000Z",
  "descripcion": "Convocatoria de ayudas para...",
  "url": "https://...",
  "estado": "abierta",
  "fechaScraping": "2024-01-20T10:30:00.000Z"
}
```

## 🔄 Extensión

Para añadir un nuevo organismo:

1. Crear scraper en `src/scrapers/NuevoOrganismoScraper.js`
2. Crear parser en `src/parsers/NuevoOrganismoParser.js`
3. Añadir configuración en `src/config/sources.js`
4. Registrar en `src/services/ScrapingService.js`

## 📄 Licencia

MIT
>>>>>>> 83948a9 (Initial commit: Tramitacyl catalog scraping service)
