<script>
  import { selectedConfig, selectedData, breaks, minBreak, yearIdx, colors, calcCounty, calcCountyRaw, calcSelected, calcSelectedRaw, selectedNeighborhoods, highlightNeighborhoods } from "../store/store"
  import { formatNumber, isNumeric } from "./utils"

  // filter id's by break range for hover and select
  function getIds(rIdx) {
    const range = [...$breaks]
    range.unshift(-1)
    const ids = []
    rIdx += 1
    for (const key in $selectedData.m) {
      const yearval = $selectedData.m[key][$yearIdx]
      if (isNumeric(yearval) && yearval > range[rIdx - 1] && yearval <= range[rIdx])  {
        ids.push(key)
      }
    }
    return ids
  }
</script>

<div>
<div class="bg-white flex gap-4 px-2 pt-2 items-center justify-center" style="min-height: 70px;">
  <div class="flex-grow">
    <h2 class="text-lg font-bold leading-none">
      {$selectedConfig.title},
      {#if $selectedData}
        {$selectedData.years[$yearIdx]}
      {/if}
    </h2>
    {#if $selectedConfig.subtitle}
    <div class="text-sm text-stone-600 leading-tight">
      {@html $selectedConfig.subtitle}
      {#if $selectedConfig.label}
      <br>(<span class="italic text-xs">{@html $selectedConfig.label}</span>)
      {/if}
    </div>
    {/if}
  </div>
  

  {#if $selectedData}
    {#if $selectedNeighborhoods.length > 0}
    <!-- selected -->
    <div class="text-center text-pink-600">
      <div class="font-semibold leading-none">SELECTED</div>
      <div class="font-bold text-2xl leading-7">
        {formatNumber($calcSelected[$yearIdx], $selectedConfig.format || null)}
      </div>
      {#if $selectedConfig.raw_label}
      <div class="text-xs">
        {formatNumber($calcSelectedRaw[$yearIdx])} <span class="whitespace-nowrap">{@html $selectedConfig.raw_label}</span>
      </div>
      {/if}
    </div>
    {/if}

    <!-- county -->
    <div class="text-center text-sky-600">
      <div class="font-semibold leading-none">COUNTY</div>
      <div class="font-bold text-2xl leading-7">
        {formatNumber($calcCounty[$yearIdx], $selectedConfig.format || null)}
      </div>
      {#if $selectedConfig.raw_label}
      <div class="text-xs">
        {formatNumber($calcCountyRaw[$yearIdx])} <span class="whitespace-nowrap">{@html $selectedConfig.raw_label}</span>
      </div>
      {/if}
    </div>

  {/if}
  </div>

  {#if $breaks}
  <div class="bg-white">
    <svg width='100%' height='30px' role="img" aria-label="choropleth legend">
      <g class='bars'>
        {#each $colors as color, idx}
        <rect fill="{color}" x="{(100 / $colors.length) * idx}%" y="15" width='{100 / $colors.length}%' height='20'
          on:mouseenter={() => $highlightNeighborhoods = getIds(idx)}
          on:click={() => $selectedNeighborhoods = getIds(idx)}
          on:mouseleave={() => $highlightNeighborhoods = []}
        ></rect>
        {/each}
      </g>
      <g class="labels">
        <text class="legendText" x='0' y='19'>{formatNumber($minBreak, "short")}</text>
        {#each $breaks as brake, idx}
        <text class="legendText" x='{(idx + 1) * (100 / $colors.length)}%' y='14'>{formatNumber(brake, "short")}</text>
        {/each}
      </g>
    </svg>
  </div>
  {/if}
</div>



<style>
  .legendText {
  font-family: Roboto,sans-serif;
  font-size: 10px;
  letter-spacing: 0;
  line-height: 100%;
  stroke-width: 1px;
  text-align: center;
  text-anchor: middle;
  word-spacing: 0;
}
.legendText:last-of-type {
  text-anchor: end;
}
.legendText:first-of-type {
  text-anchor: start;
}
rect {
  cursor: pointer;
}
</style>
