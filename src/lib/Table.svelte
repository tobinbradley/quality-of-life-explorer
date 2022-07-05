<script>
  import { selectedData, yearIdx, selectedConfig, selectedNeighborhoods, highlightNeighborhoods } from '../store/store'
  import { isNumeric, formatNumber } from "./utils"


  function trend(val1, val2, percent = null) {
    if (!isNumeric(val1) || !isNumeric(val2) || val2 === 0) return '--'

    let trend = val2 - val1
    if (percent) trend = (trend / val2) * 100

    if (Math.round(trend) > 0) {
      return `
      <svg class="inline h-6 w-6"><use xlink:href="#icon-trending_up"></use></svg>
      ${formatNumber(trend, percent)}
      `
    }
    if (Math.round(trend) < 0) {
      return `
      <svg class="inline h-6 w-6"><use xlink:href="#icon-trending_down"></use></svg>
      ${formatNumber(trend, percent)}
      `
    }
    return '<svg class="inline h-6 w-6"><use xlink:href="#icon-trending_neutral"></use></svg>'
  }

</script>

<div class="max-h-72 overflow-y-auto">
{#if $selectedData && $selectedNeighborhoods.length > 0}
<table class="w-full">
  <thead>
    <tr>
      <th class="text-center"><span class="text-pink-800 hover:cursor-pointer"
        title="Neighborhood Profile Areas (NPAs) are geographic areas used for the organization and presentation of data in the Quality of Life Study. The boundaries were developed with community input and are based on one or more Census block groups.">
        NPA</span>
      </th>
      <th class="text-right">{$selectedData.years[$yearIdx]}</th>
      {#if $selectedData.a}
      <th class="text-right">Accuracy</th>
      {/if}
      {#if $selectedData.years.length > 1}
      <th class="text-right">
        Trend<br>{$selectedData.years[0]}-{$selectedData.years[$selectedData.years.length - 1]}
      </th>
      {/if}
      {#if $selectedConfig.raw_label}
      <th class="text-right">Number</th>
        {#if $selectedData.years.length > 1}
        <th class="text-right">Trend<br>{$selectedData.years[0]}-{$selectedData.years[$selectedData.years.length - 1]}</th>
        {/if}
      {/if}
    </tr>
  </thead>
  <tbody>
    {#each $selectedNeighborhoods as neighborhood}
      {#if $selectedData.m[neighborhood]}
        <tr on:mouseleave={() => $highlightNeighborhoods = []} on:mouseenter={() => $highlightNeighborhoods = [neighborhood]} class="hover:bg-yellow-100 transition-colors">
          <td  class="text-center">
            {neighborhood}
          </td>
          <td class="text-right">
            { formatNumber($selectedData.m[neighborhood][$yearIdx], $selectedConfig.format || null) }
          </td>
          {#if $selectedData.a}
          <td class="text-right">
            ± { formatNumber($selectedData.a[neighborhood][$yearIdx], "percent") }
          </td>
          {/if}
          {#if $selectedData.years.length > 1}
          <td class="text-right">
            {@html trend($selectedData.m[neighborhood][0], $selectedData.m[neighborhood][$selectedData.years.length - 1], "percent")}
          </td>
          {/if}
          {#if $selectedConfig.raw_label}
          <td class="text-right">
            { formatNumber($selectedData.m[neighborhood][$yearIdx] * $selectedData.d[neighborhood][$yearIdx]) } {@html $selectedConfig.raw_label }
          </td>
            {#if $selectedData.years.length > 1}
            <td class="text-right">
              {@html
                trend(
                  $selectedData.m[neighborhood][0] * $selectedData.d[neighborhood][0],
                  $selectedData.m[neighborhood][$selectedData.years.length - 1] * $selectedData.d[neighborhood][$selectedData.years.length - 1]
                )
              }
            </td>
            {/if}
          {/if}
        </tr>
      {/if}
    {/each}
  </tbody>
</table>
{/if}
</div>
