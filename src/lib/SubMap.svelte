<script>
  import Time from "./Time.svelte"
  import Table from "./Table.svelte"
  import groups from "../assets/neighborhod-groups.json"
  import {
    selectedNeighborhoods,
    selectedMetric,
    selectedData,
    selectedConfig,
    mapZoom,
  } from "../store/store"
  import { sendDownload, formatNumber } from "./utils"

  let download

  function doDownload() {
    const selectedFilter =
      download === "sgeojson" || download === "scsv" ? true : false

    if (download === "geojson" || download === "sgeojson") {
      const outJSON = {
        type: "FeatureCollection",
        features: [],
      }
      fetch("./public/data/geography/geography.geojson.json")
        .then((response) => {
          if (!response.ok) {
            throw new Error()
          }
          return response.json()
        })
        .then((json) => {
          json.features.forEach((elem, jsonidx) => {
            $selectedData.years.forEach((y, idx) => {
              elem.properties[y] = $selectedData.m[elem.properties.id][idx]
              if ($selectedConfig.raw_label) {
                elem.properties[`${y}-raw`] =
                  Math.round(
                    $selectedData.d[elem.properties.id][idx] *
                      $selectedData.m[elem.properties.id][idx] *
                      10
                  ) / 10
              }
            })
            if (
              !selectedFilter ||
              (selectedFilter &&
                $selectedNeighborhoods.indexOf(elem.properties.id) !== -1)
            ) {
              outJSON.features.push(elem)
            }
          })
          sendDownload(
            JSON.stringify(outJSON),
            "data:text/json;charset=utf-8;",
            `${$selectedConfig.title}.geojson`
          )
        })
        .catch((error) => {
          download = "default"
          console.error(
            "There has been a problem with your fetch operation:",
            error
          )
        })
    }
    if (download === "csv" || download === "scsv") {
      const header = []
      let body = ""

      header.push("NPA")
      header.push(...$selectedData.years)

      if ($selectedConfig.raw_label)
        header.push(...$selectedData.years.map((el) => `${el} Raw`))

      for (const key in $selectedData.m) {
        let row = [
          key,
          ...$selectedData.m[key].map((el) =>
            formatNumber(el, $selectedConfig.format || null)
          ),
        ]
        if ($selectedConfig.raw_label) {
          row.push(
            ...$selectedData.m[key].map(
              (el, idx) =>
                `"${formatNumber(el * $selectedData.d[key][idx], null)}"`
            )
          )
        }
        if (
          !selectedFilter ||
          (selectedFilter && $selectedNeighborhoods.indexOf(key) !== -1)
        ) {
          body += row.toString() + "\n"
        }
      }

      sendDownload(
        header.join(",") + "\n" + body,
        "data:text/csv;charset=utf-8;",
        `${$selectedConfig.title}.csv`
      )
    }
    if (download === "zip") {
      window.open("downloads/qol-data.zip")
    }
    if (download === "metadata") {
      window.open(`data/meta/${$selectedConfig.metric}.html`)
    }

    download = "default"
  }

  function selecGroup(group) {
    $selectedNeighborhoods = groups[group][download]
    download = "default"
    $mapZoom = true
  }

  function print() {
    window.open(
      `./report.html#${$selectedMetric.replace(
        "m",
        ""
      )}/${$selectedNeighborhoods.join(",")}`
    )
  }
</script>

<Time />

<div class="pt-3 text-right">
  Approximate:

  {#each Object.keys(groups) as group}
    <select
      class="my-2 md:my-0 ml-1 text-white bg-highlight shadow transition-shadow  hover:shadow-lg pl-3 py-1 rounded"
      bind:value={download}
      on:change={() => selecGroup(group)}
    >
      <option value="default">{group}</option>
      {#each Object.keys(groups[group]) as geounit}
        <option value={geounit}>{geounit}</option>
      {/each}
    </select>
  {/each}
</div>

<div class="py-3 text-right">
  <button
    class="text-white bg-highlight shadow transition-shadow  hover:shadow-lg px-3 py-1 rounded"
    on:click={print}>Print</button
  >
  <select
    class="ml-1 text-white bg-highlight shadow transition-shadow hover:shadow-lg px-3 py-1 rounded"
    bind:value={download}
    on:change={doDownload}
  >
    <option value="default">Download</option>
    <option value="csv">CSV</option>
    <option value="geojson">GeoJSON</option>
    <option
      value="scsv"
      class="disabled:text-gray-300"
      disabled={$selectedNeighborhoods.length === 0}>Selected CSV</option
    >
    <option
      value="sgeojson"
      class="disabled:text-gray-300"
      disabled={$selectedNeighborhoods.length === 0}>Selected GeoJSON</option
    >
    <option value="metadata">Metadata</option>
    <option value="zip">All Data (zip)</option>
  </select>
</div>

<Table />
