<script>
  import Legend from './Legend.svelte'
  import { selectedData, breaks, yearIdx, colors, selectedNeighborhoods, selectedConfig, highlightNeighborhoods, mapZoom } from "../store/store"
  import { isNumeric, formatNumber } from "./utils"
  import "maplibre-gl/dist/maplibre-gl.css"
  import mapStyle from "../assets/positron-mecklenburg.json"

  // TODO: adress search point

  let map
  let mapReady
  let maplibre
  let geoJSON

  // get GeoJSON for zooming
  fetch('data/geography/geography.geojson.json')
    .then(response => response.json())
    .then(json => geoJSON = json)
    .catch(error => {
      console.error('There has been a problem with your fetch operation:', error);
    })

  function init(node) {
    (async () => {
      const { default: gl } = await import("maplibre-gl")
      maplibre = gl
      createMap(gl)
    })()
  }

  // shade in things
  $: if (mapReady && $breaks && $selectedData && ($yearIdx >= 0)) {
    renderPolys()
  }

  // zoom to selected on page load or on search result
  $: if (mapReady && geoJSON && $mapZoom && $selectedNeighborhoods.length > 0) {
    $mapZoom = false
    let bounds = new maplibre.LngLatBounds()

    geoJSON.features.forEach(el => {
      if ($selectedNeighborhoods.indexOf(el.properties.id) !== -1) {
        el.geometry.coordinates.forEach(coords => {
            coords.forEach(coord => {
              bounds.extend(coord)
            })
          })
      }
    })

    map.fitBounds(bounds, { padding: 100 })
  }

  // show selected
  $: if (mapReady && $selectedNeighborhoods) {
    if ($selectedNeighborhoods.length > 0) {
      map.setFilter("neighborhoods-outline", ["match", ["get", "id"], $selectedNeighborhoods, true, false])
    } else {
      map.setFilter("neighborhoods-outline", ["match", ["get", "id"], ["-1"], true, false])
    }
  }

  // show highlighted neighborhoods
  $: if (mapReady && $highlightNeighborhoods) {
    if ($highlightNeighborhoods.length > 0) {
      map.setFilter("neighborhoods-highlight", ["match", ["get", "id"], $highlightNeighborhoods, true, false])
    } else {
      map.setFilter("neighborhoods-highlight", ["match", ["get", "id"], ["-1"], true, false])
    }
  }


  function createMap(gl) {
    let mapOptions = {
      container: "map",
      style: mapStyle,
      attributionControl: false,
      minZoom: 8,
      bounds: [
        [-81.058099999999996, 35.0016000000000034],
        [-80.5503999999999962, 35.5152000000000001],
      ],
      maxBounds: [
        [-82.641, 34.115],
        [-79.008, 36.762],
      ],
      preserveDrawingBuffer: navigator.userAgent.toLowerCase().indexOf("firefox") > -1
    }

    map = new gl.Map(mapOptions)

    map.addControl(new gl.NavigationControl(), "top-right")
    map.addControl(new FullExtent({}), "top-right")
    map.addControl(new gl.FullscreenControl(), "top-right")
    map.addControl(new gl.AttributionControl(), 'bottom-left')

    let popup = new gl.Popup({
      closeButton: false,
      closeOnClick: false
    })

    map.on("click", "neighborhoods", e => {
      const id = e.features[0].properties.id
      const idx = $selectedNeighborhoods.indexOf(id)
      if (idx === -1) {
        $selectedNeighborhoods.push(id)
      } else {
        $selectedNeighborhoods.splice(idx, 1)
      }
      $selectedNeighborhoods = $selectedNeighborhoods
    })

    map.on("mousemove", "neighborhoods", e => {
      map.getCanvas().style.cursor = "pointer"
      const id = e.features[0].properties.id

      popup
        .setLngLat(e.lngLat)
        .setHTML(
          `<div style="text-align: center; margin: 0; padding: 0;"><h3 style="font-size: 1.2em; margin: 0; padding: 0; line-height: 1em; font-weight: bold;">NPA ${
            id
          }</h3>${formatNumber($selectedData.m[id][$yearIdx], $selectedConfig.format || null, $selectedConfig.decimals || null)}</div>`
        )
        .addTo(map)
    })

    map.on("mouseleave", "neighborhoods", e => {
      popup.remove()
      map.getCanvas().style.cursor = ""
    })

    map.on("rotate", (e) => {
      if (map.getPitch() >= 20) {
        map.setLayoutProperty("neighborhoods-3d", "visibility", "visible")
      } else {
        map.setLayoutProperty("neighborhoods-3d", "visibility", "none")
      }
    })

    map.on("load", () => { mapReady = true })
  }

  function renderPolys() {
    let stops = []
    let heights = []

    for (const key in $selectedData.m) {
      $breaks.every((el, idx) => {
        if (!isNumeric($selectedData.m[key][$yearIdx])) return false

        if ($selectedData.m[key][$yearIdx] <= el) {
          stops.push([key, $colors[idx]])
          heights.push([key, el * (3000 / $breaks[$breaks.length - 1])])
          return false
        }
        return true
      })
    }

    map.setPaintProperty(
      "neighborhoods",
      "fill-color",
      {
        "property": "id",
        "default": "rgba(242,243,240, 0)",
        "type": "categorical",
        "stops": stops
      }
    )

    map.setPaintProperty(
      "neighborhoods-3d",
      "fill-extrusion-color",
      {
        property: "id",
        "default": "rgb(242,243,240)",
        type: "categorical",
        stops: stops
      }
    )

    map.setPaintProperty(
      "neighborhoods-3d",
      "fill-extrusion-height",
      {
        property: "id",
        default: 0,
        type: "categorical",
        stops: heights
      }
    )

    let filter3d = []
    for (const key in $selectedData.m) {
      const val = $selectedData.m[key][$yearIdx]
      if (val !== null) filter3d.push(key)
    }
    map.setFilter("neighborhoods-3d", ["match", ["get", "id"], filter3d, true, false])
  }


  // full extent button
  class FullExtent {
    constructor({ center = [-80.84, 35.26], zoom = 9.3 }) {
      this._center = center
      this._zoom = zoom
    }
    onAdd(map) {
      this._map = map
      let _this = this
      this._btn = document.createElement("button")
      this._btn.className = "mapboxgl-ctrl-icon mapboxgl-ctrl-fullextent"
      this._btn.type = "button"
      this._btn.setAttribute("aria-label", "Zoom to full extent")
      this._btn.setAttribute("title", "Zoom to full extent")
      this._btn.onclick = function () {
        map.flyTo({ center: _this._center, zoom: _this._zoom, pitch: 0, bearing: 0 })
      }
      this._container = document.createElement("div")
      this._container.className = "mapboxgl-ctrl mapboxgl-ctrl-group"
      this._container.appendChild(this._btn)

      return this._container
    }
    onRemove() {
      this._container.parentNode.removeChild(this._container)
      this._map = undefined
    }
  }

</script>

<div id="map" use:init />
<button class="absolute bottom-2 right-2 bg-white shadow border-2 border-gray-200 rounded-md hover:bg-gray-100 p-1"
on:click={() => $selectedNeighborhoods = []}
>Clear</button>
<Legend />


<style>
  #map {
    width: 100%;
    height: 100%;
  }
  :global(.mapboxgl-ctrl-fullextent) {
    background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBkPSJNMTc2LjMgMTE4LjhoNjQuNVY0NC4xQzIxNS4zIDY1LjMgMTkyLjQgOTAuNSAxNzYuMyAxMTguOHoiLz48cGF0aCBkPSJNMTQxLjYgMjY5LjJjMS43IDMxLjQgOC43IDY1LjIgMjAuNSA5My41aDc4Ljd2LTkzLjVIMTQxLjZ6Ii8+PHBhdGggZD0iTTE3Ni43IDM5My4yYzE2LjEgMjguMyAzOC42IDUzLjUgNjQuMSA3NC43VjM5My4ySDE3Ni43eiIvPjxwYXRoIGQ9Ik00ODkuOSAxNDkuMkgzODIuM2MxMC41IDI4LjYgMTYuNSA1OC41IDE4IDg5LjZINTEyQzUxMC4xIDIwNi45IDUwMi41IDE3NyA0ODkuOSAxNDkuMnoiLz48cGF0aCBkPSJNMjcxLjIgNDQuNHY3NC40aDY0QzMxOS4yIDkwLjYgMjk2LjcgNjUuNiAyNzEuMiA0NC40eiIvPjxwYXRoIGQ9Ik0xNjIuMSAxNDkuMmMtMTEuOCAyOC4zLTE4LjggNTguMi0yMC41IDg5LjZoOTkuMnYtODkuNkgxNjIuMXoiLz48cGF0aCBkPSJNNDAwLjMgMjY5LjJjLTEuNSAzMS4xLTcuNSA2NS0xOCA5My41aDEwNy42YzEyLjYtMjcuNyAyMC4zLTYxLjYgMjIuMS05My41SDQwMC4zeiIvPjxwYXRoIGQ9Ik0yNzEuMiAwdjYuOGM0MS42IDI5LjQgNzUuOSA2Ny43IDk3LjkgMTEyaDEwNC42QzQzMS4xIDUwLjkgMzU2IDUgMjcxLjIgMHoiLz48cGF0aCBkPSJNMzguMyAxMTguOGgxMDQuNmMyMi00NC4zIDU2LjQtODIuNiA5OC0xMTJWMEMxNTYuMSA1IDgwLjkgNTAuOSAzOC4zIDExOC44eiIvPjxwYXRoIGQ9Ik0xNDIuOSAzOTMuMkgzOC4zQzgwLjkgNDYxLjEgMTU2LjEgNTA3IDI0MC44IDUxMnYtNi44QzE5OS4yIDQ3NS43IDE2NC45IDQzNy41IDE0Mi45IDM5My4yeiIvPjxwYXRoIGQ9Ik0yMi4xIDE0OS4yQzkuNSAxNzcgMS45IDIwNi45IDAgMjM4LjhoMTExLjdjMS41LTMxLjEgNy41LTYxIDE4LTg5LjZIMjIuMXoiLz48cGF0aCBkPSJNMzY5LjEgMzkzLjJjLTIyIDQ0LjMtNTYuMyA4Mi42LTk3LjkgMTEyVjUxMmM4NC43LTUgMTU5LjgtNTAuOSAyMDIuNS0xMTguOEgzNjkuMXoiLz48cGF0aCBkPSJNMTExLjcgMjY5LjJIMGMxLjkgMzEuOSA5LjUgNjUuOCAyMi4xIDkzLjVIMTI5LjhDMTE5LjIgMzM0LjIgMTEzLjMgMzAwLjQgMTExLjcgMjY5LjJ6Ii8+PHBhdGggZD0iTTI3MS4yIDI2OS4ydjkzLjVoNzguN2MxMS44LTI4LjMgMTguNi02Mi4yIDIwLjMtOTMuNUgyNzEuMnoiLz48cGF0aCBkPSJNMzUwIDE0OS4ySDI3MS4ydjg5LjZoOTlDMzY4LjYgMjA3LjUgMzYxLjcgMTc3LjUgMzUwIDE0OS4yeiIvPjxwYXRoIGQ9Ik0yNzEuMiAzOTMuMnY3NC40YzI1LjQtMjEuMiA0OC00Ni4yIDY0LTc0LjRIMjcxLjJ6Ii8+PC9zdmc+);
    background-size: 22px 22px;
    background-repeat: no-repeat;
    background-position: center center;
  }

</style>
