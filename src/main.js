import "./tailwind.css"
import './css/metadata.css'
import './css/table.css'
import './lib/registerServiceWorker'
import Tabs from './lib/Tabs.svelte'
import Meta from './lib/Meta.svelte'
import Map from './lib/Map.svelte'
import SubMap from './lib/SubMap.svelte'
import Charts from './lib/Charts.svelte'
import Search from './lib/Search.svelte'
import Toast from './lib/Toast.svelte'
import Embed from './lib/Embed.svelte'
import Contact from './lib/Contact.svelte'
import NavMenu from './lib/NavMenu.svelte'
import Help from './lib/Help.svelte'
import Welcome from './lib/Welcome.svelte'

new NavMenu({
  target: document.getElementById("navmenu")
})

new Welcome({
  target: document.getElementById("welcome")
})

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

new Charts({
  target: document.getElementById("charts")
})

new Search({
  target: document.getElementById("search")
})

new Toast({
  target: document.getElementById("toast")
})

new Help({
  target: document.getElementById("help")
})

new Embed({
  target: document.getElementById("embed")
})

new Contact({
  target: document.getElementById("contact")
})
