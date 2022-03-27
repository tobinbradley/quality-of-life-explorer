<script>
  import { dataConfig, selectedNeighborhoods, dataCategories } from '../store/store'
  import { printOptions } from '../store/print'
  import { formatNumber, calcAggregate, calcRaw } from './utils'

  const categories = $dataCategories
  const maxYears = {}


  async function fetchData(metric, calc = "agg", county = false, selected = null) {
    if (selected && selected.length === 0) selected = null

    const response = await fetch(`./data/metric/${metric}.json`)
		const data = await response.json()

    maxYears[metric] = data.years[data.years.length - 1]

    const config = $dataConfig.filter(el => el.metric === metric)[0]

    let val

    if (calc === "agg") {
      return formatNumber(calcAggregate(data, config, county, selected)[data.years.length - 1], config.format || null)
    } else {
      return formatNumber(calcRaw(data, config, county, selected)[data.years.length - 1], null, config.decimals || null)
    }
  }



</script>


{#each categories as cat}
<div class="relative bg-white shadow-md print:shadow-none page p-2" class:hidden="{!$printOptions.data || !$printOptions.dataCats[cat]}">
  <h2 class="font-semibold my-2 text-2xl">{cat}</h2>
  <table>
    <thead>
      <tr>
        <th>Variable</th>
        <th class="bg-sky-200">Selected</th>
        <th class="bg-green-200">County</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {#each $dataConfig.filter(el => el.category === cat) as metric}
      <tr>
        <td>
          <span class="font-semibold">{@html metric.title} ({maxYears[metric.metric] || ''})</span><br>{@html metric.subtitle}
        </td>
        <td class="bg-sky-200">
          {#await fetchData(metric.metric, "agg", false, $selectedNeighborhoods)}
            &nbsp;
          {:then result}
            {result}
          {:catch error}
            {error.message}
          {/await}
          {#if metric.raw_label}
            <br>
            {#await fetchData(metric.metric, "raw", false, $selectedNeighborhoods)}
              &nbsp;
            {:then result}
              {result == 0 ? '--' : result}
            {:catch error}
              {error.message}
            {/await}
          {/if}
        </td>
        <td class="bg-green-200">
          {#await fetchData(metric.metric, "agg", true)}
            &nbsp;
          {:then result}
            {result}
          {:catch error}
            {error.message}
          {/await}
          {#if metric.raw_label}
            <br>
            {#await fetchData(metric.metric, "raw", true)}
              &nbsp;
            {:then result}
              {result}
            {:catch error}
              {error.message}
            {/await}
          {/if}
        </td>
        <td class="text-sm whitespace-nowrap">
          {#if metric.label}{@html metric.label}{/if}
          {#if metric.raw_label}<br>{@html metric.raw_label}{/if}
        </td>
      </tr>
      {/each}
    </tbody>
  </table>

</div>
{/each}
