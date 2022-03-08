import "./app.css";
import Tabs from './lib/Tabs.svelte'
import Meta from './lib/Meta.svelte'
import Map from './lib/Map.svelte'
import SubMap from './lib/SubMap.svelte'


new Tabs({
  target: document.getElementById("tabs")
})

new Meta({
  target: document.getElementById("meta")
})

new Map({
  target: document.getElementById("mapContainer")
})

new SubMap({
  target: document.getElementById("misccontrols")
})
