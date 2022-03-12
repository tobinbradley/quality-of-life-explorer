import './tailwind.css'
import './css/print.css'
import './css/table.css'
import './lib/registerServiceWorker'
import PrintMap from './lib/PrintMap.svelte'
import PrintData from './lib/PrintData.svelte'
import PrintCover from './lib/PrintCover.svelte'
import PrintControls from './lib/PrintControls.svelte'

new PrintMap({
  target: document.getElementById("mapContainer")
})

new PrintData({
  target: document.getElementById("reportSection")
})

new PrintCover({
  target: document.getElementById("cover")
})

new PrintControls({
  target: document.getElementById("controls")
})
