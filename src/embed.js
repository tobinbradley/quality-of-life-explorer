import './tailwind.css'
import './lib/registerServiceWorker'
import Map from './lib/Map.svelte'

new Map({
  target: document.getElementById("mapContainer")
})
