<script>
  import Time from "./Time.svelte"
  import Table from './Table.svelte'
  import groups from "../assets/neighborhod-groups.json"
  import { selectedNeighborhoods, selectedMetric, selectedData, selectedConfig, dataConfig, yearIdx } from '../store/store'
  import { sendDownload, formatNumber } from './utils'

  let download

  function doDownload() {
    if (download === "geojson") {
      fetch('./public/data/geography/geography.geojson.json')
        .then(response => response.json())
        .then(json => {
          json.features.forEach(elem => {
            $selectedData.years.forEach((y, idx) => {
              elem.properties[y] = $selectedData.m[elem.properties.id][idx]
            })
          })
          sendDownload(JSON.stringify(json), 'data:text/json;charset=utf-8;', `${$selectedConfig.title}.geojson`)
        })
        .catch(error => {
          console.error('There has been a problem with your fetch operation:', error);
        })
    }
    if (download === "csv") {
      const header = []

      let body = ""

      header.push("NPA")
      header.push(...$selectedData.years)

      // TODO: add raw value to CSV

      for (const key in $selectedData.m) {
        let row = [key, ...$selectedData.m[key].map(el => formatNumber(el, $selectedConfig.format || null))]
        body += row.join(",") + "\n"
        // if ($selectedConfig.raw_label) {
        //   let row = [key, ...$selectedData.d[key].map(el => `${formatNumber(el)} ${$selectedConfig.raw_label}`)]
        // body += row.join(",") + "\n"
        // }
      }

      sendDownload(
        header.join(",") + "\n" + body,
        "data:text/csv;charset=utf-8;",
        `${$selectedConfig.title}.csv`
      )
    }
    if (download === "zip") {
      window.open('downloads/qol-data.zip')
    }
    if (download === "metadata") {
      window.open(`data/meta/${$selectedConfig.metric}.html`)
    }
    download = "default"
  }

  function selecGroup(group) {
    console.log(group, download)
    $selectedNeighborhoods = groups[group][download]
    download = "default"
  }

  function print() {
    window.open(`./report.html#${$selectedMetric.replace('m','')}/${$selectedNeighborhoods.join(',')}`)
  }

</script>

<Time />
<div class="pt-3 text-right">
  <button
    class="text-white bg-pink-600 shadow transition-shadow  hover:shadow-lg px-3 py-1 rounded"
    on:click={print}
    >Print</button
  >
  <select
    class="ml-1 text-white bg-pink-600 shadow transition-shadow  hover:shadow-lg px-3 py-1 rounded"
    bind:value={download}
    on:change={doDownload}
  >
    <option value="default">Download</option>
    <option value="csv">CSV</option>
    <option value="geojson">GeoJSON</option>
    <option value="metadata">Metadata</option>
    <option value="zip">All Data (zip)</option>
  </select>
</div>
<div class="py-3 text-right">
  Approximate:

  {#each Object.keys(groups) as group}
  <select
    class="ml-1 text-white bg-pink-600 shadow transition-shadow  hover:shadow-lg pl-3 py-1 rounded"
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

<Table />
