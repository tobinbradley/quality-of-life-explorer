<script>
  import Legend from "./Legend.svelte"
  import {
    selectedData,
    breaks,
    yearIdx,
    colors,
    selectedNeighborhoods,
    selectedConfig,
    highlightNeighborhoods,
    mapZoom,
    mapFullExtent,
    minBreak,
  } from "../store/store"
  import { isNumeric, formatNumber, sendDownload } from "./utils"
  import "maplibre-gl/dist/maplibre-gl.css"
  // import mapStyle from "../assets/gl-style.json"

  export let interactive = true
  export let flyto

  const apiKey = "AAPK47243148443e45dbbafdc12899934519XllUJyQWQ7aZCKvAnVoh_KLNXdG8F5gj2PPlGaHdLk_HmMrkzZDbuykgCFlHVELl"
  const basemapEnum = "arcgis/light-gray"

  let map
  let mapReady
  let maplibre
  let geoJSON

  // let map take flyto arg from parent
  // useful for "story telling" iframe
  window.addEventListener("message", (event) => {
    if (event.data.pitch || event.data.center || event.data.bearing || event.data.zoom) {
      map.flyTo(event.data)
    } else {
      map.setPitch(0)
      map.setBearing(0)
      map.fitBounds($mapFullExtent, {
        padding: 10
      })
    }
  }, false)

  // get GeoJSON for zooming
  fetch("data/geography/geography.geojson.json")
    .then((response) => response.json())
    .then((json) => (geoJSON = json))
    .catch((error) => {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      )
    })

  function init(node) {
    ;(async () => {
      const { default: gl } = await import("maplibre-gl")
      maplibre = gl
      createMap(gl)
    })()
  }

  // shade in things
  $: if (mapReady && $breaks && $selectedData && $yearIdx >= 0) {
    renderPolys()
  }

  // zoom to selected on page load or on search result
  $: if (mapReady && geoJSON && $mapZoom && $selectedNeighborhoods.length > 0) {
    $mapZoom = false
    let bounds = new maplibre.LngLatBounds()

    geoJSON.features.forEach((el) => {
      if ($selectedNeighborhoods.indexOf(el.properties.id) !== -1) {
        el.geometry.coordinates.forEach((coords) => {
          coords.forEach((coord) => {
            bounds.extend(coord)
          })
        })
      }
    })

    if (bounds.lng) map.fitBounds(bounds, { padding: 100 })
  }

  // show selected
  $: if (mapReady && $selectedNeighborhoods) {
    if ($selectedNeighborhoods.length > 0) {
      map.setFilter("neighborhoods-outline", [
        "match",
        ["get", "id"],
        $selectedNeighborhoods,
        true,
        false,
      ])
    } else {
      map.setFilter("neighborhoods-outline", [
        "match",
        ["get", "id"],
        ["-1"],
        true,
        false,
      ])
    }
  }

  function createMap(gl) {
    let mapOptions = {
      container: "map",
      style: `https://basemapstyles-api.arcgis.com/arcgis/rest/services/styles/v2/styles/${basemapEnum}?token=${apiKey}`,
      attributionControl: false,
      minZoom: 8,
      bounds: $mapFullExtent,
      maxBounds: [
        [$mapFullExtent[0][0] - 1, $mapFullExtent[0][1] - 1],
        [$mapFullExtent[1][0] + 1, $mapFullExtent[1][1] + 1],
      ],
      fitBoundsOptions: {
        padding: 10,
      },
      preserveDrawingBuffer: true,
      interactive: interactive
    }

    map = new gl.Map(mapOptions)

    if (flyto) {
      map.flyTo(flyto)
    }

    // map controls
    map.addControl(new gl.NavigationControl(), "top-right")
    map.addControl(new FullExtent(), "top-right")
    map.addControl(new gl.FullscreenControl(), "top-right")
    map.addControl(new GLImage(), "top-right")
    map.addControl(new gl.AttributionControl(), "bottom-left")

    let popup = new gl.Popup({
      closeButton: false,
      closeOnClick: false,
    })

    // map click select/deselect
    map.on("click", "neighborhoods", (e) => {
      const id = e.features[0].properties.id
      const idx = $selectedNeighborhoods.indexOf(id)
      if (idx === -1) {
        $selectedNeighborhoods.push(id)
      } else {
        $selectedNeighborhoods.splice(idx, 1)
      }
      $selectedNeighborhoods = $selectedNeighborhoods
    })

    map.on("mousemove", "neighborhoods", (e) => {
      map.getCanvas().style.cursor = "pointer"
      const id = e.features[0].properties.id

      if ($selectedData.m[id] && $selectedData.m[id][$yearIdx]) {
        popup
          .setLngLat(e.lngLat)
          .setHTML(
            `<div style="text-align: center; margin: 0; padding: 0;"><h3 style="font-size: 1.2em; margin: 0; padding: 0; line-height: 1em; font-weight: bold;">NPA ${id}</h3>${formatNumber(
              $selectedData.m[id][$yearIdx],
              $selectedConfig.format || null,
              $selectedConfig.decimals || null
            )}</div>`
          )
          .addTo(map)
      } else {
        popup.remove()
      }
    })

    map.on("mouseleave", "neighborhoods", (e) => {
      popup.remove()
      map.getCanvas().style.cursor = ""
    })

    map.on("rotate", (e) => {
      if (map.getPitch() >= 15) {
        map.setLayoutProperty("neighborhoods-3d", "visibility", "visible")
      } else {
        map.setLayoutProperty("neighborhoods-3d", "visibility", "none")
      }
    })

    map.on("load", () => {

      const layers = map.getStyle().layers;
        // Find the index of the first line layer in the map style
        let firstSymbolId;
        for (let i = 0; i < layers.length; i++) {
            if (layers[i].type === 'line') {
                firstSymbolId = layers[i].id;
                break;
            }
        }

      // add layers
      map.addSource("neighborhoods", {
        "type": "geojson",
        "attribution": "<a href='https://mcmap.org/qol' target='_blank'>Quality of Life Explorer</a>",
        "data": "data/geography/geography.geojson.json"
      })
      map.addLayer({
        "id": "neighborhoods",
        "type": "fill",
        "source": "neighborhoods",
        "paint": {
          "fill-color": "rgba(0,0,0,0)",
          "fill-outline-color": "white"
        }
      }, firstSymbolId)
      map.addLayer({
        "id": "neighborhoods-default-outline",
        "type": "line",
        "source": "neighborhoods",
        "layout": {},
        "paint": {
          "line-color": "rgba(0,0,0,1)",
          "line-width": 0.4,
          "line-opacity": 0.4
        }
      })
      map.addLayer({
        "id": "neighborhoods-outline",
        "type": "line",
        "source": "neighborhoods",
        "layout": {},
        "filter": ["match", ["get", "id"], ["-1"], true, false],
        "paint": {
          "line-color": "#DB2777",
          "line-width": 3.5
        }
      })
      map.addLayer({
        "id": "neighborhoods-3d",
        "type": "fill-extrusion",
        "source": "neighborhoods",
        "layout": {
          "visibility": "none"
        }
      })
      mapReady = true
    })
  }

  function renderPolys() {
    let stops = []
    let heights = []

    for (const key in $selectedData.m) {
      $breaks.every((el, idx) => {
        if (!$selectedData.m[key] || !isNumeric($selectedData.m[key][$yearIdx])) return false

        if ($selectedData.m[key][$yearIdx] <= el) {
          stops.push([key, $colors[idx]])
          let height = el * (3000 / $breaks[$breaks.length - 1])
          if (isNumeric(height)) heights.push([key, height])
          return false
        }
        return true
      })
    }

    map.setPaintProperty("neighborhoods", "fill-color", {
      property: "id",
      default: "rgba(242,243,240, 0)",
      type: "categorical",
      stops: stops,
    })

    map.setPaintProperty("neighborhoods-3d", "fill-extrusion-color", {
      property: "id",
      default: "rgb(242,243,240)",
      type: "categorical",
      stops: stops,
    })

    map.setPaintProperty("neighborhoods-3d", "fill-extrusion-height", {
      property: "id",
      default: 0,
      type: "categorical",
      stops: heights,
    })

    let filter3d = []
    for (const key in $selectedData.m) {
      const val = $selectedData.m[key][$yearIdx]
      if (val !== null) filter3d.push(key)
    }
    map.setFilter("neighborhoods-3d", [
      "match",
      ["get", "id"],
      filter3d,
      true,
      false,
    ])
  }

  // full extent button
  class FullExtent {
    onAdd(map) {
      this._map = map
      let _this = this
      this._btn = document.createElement("button")
      this._btn.className = "mapboxgl-ctrl-icon mapboxgl-ctrl-fullextent"
      this._btn.type = "button"
      this._btn.setAttribute("aria-label", "Zoom to full extent")
      this._btn.setAttribute("title", "Zoom to full extent")
      this._btn.onclick = function () {
        map.setPitch(0)
        map.setBearing(0)
        map.fitBounds($mapFullExtent, {
          padding: 10,
        })
      }
      this._container = document.createElement("div")
      this._container.className = "maplibregl-ctrl maplibregl-ctrl-group"
      this._container.appendChild(this._btn)

      return this._container
    }
    onRemove() {
      this._container.parentNode.removeChild(this._container)
      this._map = undefined
    }
  }

  // export map button
  class GLImage {
    onAdd(map) {
      this._map = map
      let _this = this
      this._btn = document.createElement("button")
      this._btn.className = "mapbox-ctrl-icon mapboxgl-ctrl-gl-image"
      this._btn.type = "button"
      this._btn.setAttribute("aria-label", "Download map image")
      this._btn.setAttribute("title", "Download map image")

      this._btn.onclick = function () {
        const mapCanvas = map.getCanvas()

        // create legend canvas
        const legendCanvas = document.createElement("canvas")
        legendCanvas.height = 25
        legendCanvas.width = mapCanvas.width
        const legendCtx = legendCanvas.getContext("2d")
        legendCtx.fillStyle = "rgba(255,255,255,0.4)"
        legendCtx.fillRect(0, 0, legendCanvas.width, legendCanvas.height)

        // set legend and breaks
        $colors.forEach((c, i) => {
          const start = (mapCanvas.width / $colors.length) * i
          const textStart = (mapCanvas.width / $colors.length) * (i + 1)
          const width = mapCanvas.width / $colors.length
          legendCtx.fillStyle = c
          legendCtx.fillRect(start, 15, width, 25)

          legendCtx.font = "14px"
          legendCtx.fillStyle = "black"
          i < $colors.length - 1
            ? (legendCtx.textAlign = "center")
            : (legendCtx.textAlign = "end")
          legendCtx.fillText(formatNumber($breaks[i], "short"), textStart, 12)
        })

        // min break number
        legendCtx.textAlign = "start"
        legendCtx.fillText(formatNumber($minBreak, "short"), 0, 12)

        // merge into new canvas
        const mergeCanvas = document.createElement("canvas")
        mergeCanvas.width = mapCanvas.width
        mergeCanvas.height = mapCanvas.height + 15
        const mergeCtx = mergeCanvas.getContext("2d")
        mergeCtx.drawImage(mapCanvas, 0, 0)
        mergeCtx.drawImage(legendCanvas, 0, mapCanvas.height - 15)

        // send plain map export until I get the whole legend properly recreated in canvas
        sendDownload(
          map.getCanvas().toDataURL("image/png"),
          null,
          `${$selectedConfig.title}, ${$selectedData.years[$yearIdx]}.png`
        )
      }

      this._container = document.createElement("div")
      this._container.className = "maplibregl-ctrl maplibregl-ctrl-group"
      this._container.appendChild(this._btn)

      return this._container
    }

    onRemove() {
      this._container.parentNode.removeChild(this._container)
      this._map = undefined
    }
  }
</script>

<div id="map" use:init class="w-full h-full" />
{#if interactive}
<button
  class="absolute bottom-2 right-2 bg-white shadow border-2 text-sm border-gray-200 rounded-md hover:bg-gray-100 p-1"
  on:click={() => ($selectedNeighborhoods = [])}>Clear</button
>
{/if}
<Legend />

<style>
  :global(.mapboxgl-ctrl-fullextent) {
    background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBkPSJNMTc2LjMgMTE4LjhoNjQuNVY0NC4xQzIxNS4zIDY1LjMgMTkyLjQgOTAuNSAxNzYuMyAxMTguOHoiLz48cGF0aCBkPSJNMTQxLjYgMjY5LjJjMS43IDMxLjQgOC43IDY1LjIgMjAuNSA5My41aDc4Ljd2LTkzLjVIMTQxLjZ6Ii8+PHBhdGggZD0iTTE3Ni43IDM5My4yYzE2LjEgMjguMyAzOC42IDUzLjUgNjQuMSA3NC43VjM5My4ySDE3Ni43eiIvPjxwYXRoIGQ9Ik00ODkuOSAxNDkuMkgzODIuM2MxMC41IDI4LjYgMTYuNSA1OC41IDE4IDg5LjZINTEyQzUxMC4xIDIwNi45IDUwMi41IDE3NyA0ODkuOSAxNDkuMnoiLz48cGF0aCBkPSJNMjcxLjIgNDQuNHY3NC40aDY0QzMxOS4yIDkwLjYgMjk2LjcgNjUuNiAyNzEuMiA0NC40eiIvPjxwYXRoIGQ9Ik0xNjIuMSAxNDkuMmMtMTEuOCAyOC4zLTE4LjggNTguMi0yMC41IDg5LjZoOTkuMnYtODkuNkgxNjIuMXoiLz48cGF0aCBkPSJNNDAwLjMgMjY5LjJjLTEuNSAzMS4xLTcuNSA2NS0xOCA5My41aDEwNy42YzEyLjYtMjcuNyAyMC4zLTYxLjYgMjIuMS05My41SDQwMC4zeiIvPjxwYXRoIGQ9Ik0yNzEuMiAwdjYuOGM0MS42IDI5LjQgNzUuOSA2Ny43IDk3LjkgMTEyaDEwNC42QzQzMS4xIDUwLjkgMzU2IDUgMjcxLjIgMHoiLz48cGF0aCBkPSJNMzguMyAxMTguOGgxMDQuNmMyMi00NC4zIDU2LjQtODIuNiA5OC0xMTJWMEMxNTYuMSA1IDgwLjkgNTAuOSAzOC4zIDExOC44eiIvPjxwYXRoIGQ9Ik0xNDIuOSAzOTMuMkgzOC4zQzgwLjkgNDYxLjEgMTU2LjEgNTA3IDI0MC44IDUxMnYtNi44QzE5OS4yIDQ3NS43IDE2NC45IDQzNy41IDE0Mi45IDM5My4yeiIvPjxwYXRoIGQ9Ik0yMi4xIDE0OS4yQzkuNSAxNzcgMS45IDIwNi45IDAgMjM4LjhoMTExLjdjMS41LTMxLjEgNy41LTYxIDE4LTg5LjZIMjIuMXoiLz48cGF0aCBkPSJNMzY5LjEgMzkzLjJjLTIyIDQ0LjMtNTYuMyA4Mi42LTk3LjkgMTEyVjUxMmM4NC43LTUgMTU5LjgtNTAuOSAyMDIuNS0xMTguOEgzNjkuMXoiLz48cGF0aCBkPSJNMTExLjcgMjY5LjJIMGMxLjkgMzEuOSA5LjUgNjUuOCAyMi4xIDkzLjVIMTI5LjhDMTE5LjIgMzM0LjIgMTEzLjMgMzAwLjQgMTExLjcgMjY5LjJ6Ii8+PHBhdGggZD0iTTI3MS4yIDI2OS4ydjkzLjVoNzguN2MxMS44LTI4LjMgMTguNi02Mi4yIDIwLjMtOTMuNUgyNzEuMnoiLz48cGF0aCBkPSJNMzUwIDE0OS4ySDI3MS4ydjg5LjZoOTlDMzY4LjYgMjA3LjUgMzYxLjcgMTc3LjUgMzUwIDE0OS4yeiIvPjxwYXRoIGQ9Ik0yNzEuMiAzOTMuMnY3NC40YzI1LjQtMjEuMiA0OC00Ni4yIDY0LTc0LjRIMjcxLjJ6Ii8+PC9zdmc+);
    background-size: 22px 22px;
    background-repeat: no-repeat;
    background-position: center center;
  }
  :global(.mapboxgl-ctrl-gl-image) {
    background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgdmlld0JveD0iMCAwIDMyIDMyIj4NCjxwYXRoIGQ9Ik0yNy42MjQgMjAuOTU1bC0wLjk1OCA1LjA3MmgtMjEuMzMybC0wLjk1OC01LjA3MmgtMi4zODV2OC4wNjJoMjguMDE4di04LjA2MmgtMi4zODV6TTI3LjAyMCAxMS45NDZoLTcuMDIydi0yLjkzaC03Ljk5NHYyLjkzaC02Ljk1NWwxMC45MTQgMTEuNDEyIDExLjA1Ny0xMS40MTJ6TTE5Ljk5NyAzLjk4MmgtNy45OTR2MS4wNjZoNy45OTR2LTEuMDY2ek0xOS45OTcgNS45NzNoLTcuOTk0djIuMDM4aDcuOTk0di0yLjAzOHoiLz4NCjwvc3ZnPg==);
    background-size: 22px 22px;
    background-repeat: no-repeat;
    background-position: center center;
  }
</style>
