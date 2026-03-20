import { setOptions, importLibrary } from '@googlemaps/js-api-loader' // {{{1
import { apiKey, } from '../../../../env.mjs'

class View { // {{{1
  #map // {{{2
  #marker
  #core
  #maps

  constructor (pos) { // {{{2
    this.pos = pos
    const loader = new Loader({ apiKey, version: "weekly", })
    const mapOptions = {
      center: pos,
      mapId: "Stellar_HEX_MAP_ID",
      mapTypeId: "OSM",
      mapTypeControl: false,
      streetViewControl: false,
      zoom: 2
    };
    loader.load().then(g => {
      this.#map = new g.maps.Map(document.getElementById("div2"), mapOptions);
      let mapTypeOSM = new g.maps.ImageMapType({
        getTileUrl: function(coord, zoom) {
          return `https://tile.openstreetmap.org/${zoom}/${coord.x}/${coord.y}.png`;
        },
        tileSize: new g.maps.Size(256, 256),
        name: "OpenStreetMap",
        maxZoom: 18
      })
      this.#map.mapTypes.set("OSM", mapTypeOSM)
      return google.maps.importLibrary('marker');
    }).then(r => {
      this.#marker = r
      return google.maps.importLibrary('core');
    }).then(r => {
      this.#core = r
      return google.maps.importLibrary('maps');
    }).then(r => {
      this.#maps = r
    })
    .catch(e => { console.error(e); }); 
  }
  // }}}2
}

export { // {{{1
  View, 
}

