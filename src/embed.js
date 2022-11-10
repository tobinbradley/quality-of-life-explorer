import './tailwind.css'
import './lib/registerServiceWorker'
import Map from './lib/Map.svelte'

let params = new URLSearchParams(document.location.search)
const interactive = params.get("interactive")

new Map({
  target: document.getElementById("mapContainer"),
  props: {
    interactive: interactive === 'false' ? false : true
  }
})
