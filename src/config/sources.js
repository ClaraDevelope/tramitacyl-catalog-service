export const SOURCES = {
  'junta-cyl': {
    name: 'Junta de Castilla y León',
    baseUrl: 'https://www.tramitacastillayleon.jcyl.es',
    listUrl: 'https://www.tramitacastillayleon.jcyl.es/web/jcyl/AdministracionElectronica/es/Plantilla100ListadoTramite/1251181077965/_/1235028397244/TipoTramiteElectronico',
    selectors: {
      listItems: '.listado.fondo-documental ul li',
      title: '.titulo',
      link: 'a',
      dates: '.info-fondo .fechas',
      startDate: 'strong:contains("Fecha de inicio:")',
      endDate: 'strong:contains("Fecha de fin:")',
      electronicManagement: '.gestion-electronica a',
      downloadLink: '.descarga a'
    },
    pagination: {
      enabled: true,
      totalPagesSelector: '.paginacion p',
      pageLinksSelector: '.paginacion ul li a',
      urlPattern: 'https://www.tramitacastillayleon.jcyl.es/web/jcyl/AdministracionElectronica/es/Plantilla100ListadoTramite/1251181077965/{offset}/1235028397244/TipoTramiteElectronico',
      offsetStep: 5
    },
    delays: {
      betweenPages: 1000,
      betweenRequests: 500
    }
  }
};