import './tailwind.css'
import './lib/registerServiceWorker'
import Map from './lib/Map.svelte'

// get params
// flyto [btoa encoding of maplibre flyto params, null] default null
let params = new URLSearchParams(document.location.search)
let flyto = null

try {
  flyto = window.atob(params.get("flyto"))
  flyto = JSON.parse(flyto)
} catch (error) {
  flyto = null
}

new Map({
  target: document.getElementById("mapContainer"),
  props: {
    flyto: flyto,
    interactive: false
  }
})
