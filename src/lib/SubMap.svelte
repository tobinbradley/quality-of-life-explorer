<script>
  import Time from "./Time.svelte"
  import Table from './Table.svelte'
  import groups from "../assets/neighborhod-groups.json"
  import { selectedNeighborhoods, selectedMetric } from '../store/store'
import Tabs from "./Tabs.svelte"

  let download

  function doDownload() {
    console.log("downloading", download)
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

  // TODO: Download operations. Will need map to send geojson to store variable
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
