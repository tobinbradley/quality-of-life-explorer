<script>
  import { selectedConfig, selectedData, breaks, minBreak, yearIdx, colors, calcCounty, calcCountyRaw, calcSelected, calcSelectedRaw, selectedNeighborhoods, highlightNeighborhoods } from "../store/store"
  import { formatNumber, isNumeric } from "./utils"

  // BUG: fonts jank on Linux - default font stack?

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

<div
  class="bg-white inline-block absolute top-0 left-0 shadow-md"
  style="width: 260px;"
>
  <h2 class="border-b-2 border-stone-200 p-1 font-semibold">
    {$selectedConfig.title},
    {#if $selectedData}
      {$selectedData.years[$yearIdx]}
    {/if}
  </h2>
  <div class="text-center text-sm text-stone-600 p-1 leading-tight">
    {@html $selectedConfig.subtitle}
  </div>

  {#if $selectedData}
  <div class="flex columns-2 p-1">
    {#if $selectedNeighborhoods.length > 0}
    <!-- selected -->
    <div class="flex-grow text-center">
      <div class="text-sm text-stone-600 font-semibold">SELECTED</div>      
      <div class="font-semibold">
        {formatNumber($calcSelected[$yearIdx], $selectedConfig.format || null)}
      </div>
      {#if $selectedConfig.label}
      <div class="lowercase text-sm leading-none text-stone-600">{@html $selectedConfig.label}</div>
      {/if}
      {#if $selectedConfig.raw_label}
      <div class="text">or</div>
      <div class="font-semibold text-sm">
        {formatNumber($calcSelectedRaw[$yearIdx])}
      </div>
      <div class="text-sm lowercase leading-none text-stone-600">
        {$selectedConfig.raw_label}
      </div>
      {/if}
    </div>
    {/if}

    <!-- county -->
    <div class="flex-grow text-center">
      <div class="text-sm">COUNTY</div>
      <div class="font-semibold">{formatNumber($calcCounty[$yearIdx], $selectedConfig.format || null)}</div>
      {#if $selectedConfig.label}
      <div class="lowercase text-sm leading-none text-stone-600">{$selectedConfig.label}</div>
      {/if}
      {#if $selectedConfig.raw_label}
      <div class="text">or</div>
      <div class="font-semibold text-sm">
        {formatNumber($calcCountyRaw[$yearIdx])}
      </div>
      <div class="text-sm lowercase leading-none text-stone-600">
        {$selectedConfig.raw_label}
      </div>
      {/if}
    </div>
  </div>
  {/if}

  {#if $breaks}
  <div class="pt-1">
    <svg
      class="block w-full h-11"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      viewBox="0 0 248.4 39.2"
      id="maplegend"
      role="img"
      aria-labelledby="svgTitle"
    >
      <title id="svgTitle">Choropleth legend</title>
      <g transform="translate(20.714293 -851.75475)">
        <rect
          y="865.9"
          x="-20.7"
          height="25"
          width="50"
          style="fill: {$colors[0]}"
          on:mouseenter={() => $highlightNeighborhoods = getIds(0)}
          on:click={() => $selectedNeighborhoods = getIds(0)}
          on:mouseleave={() => $highlightNeighborhoods = []}
        />
        <rect
          width="50"
          height="25"
          x="28.9"
          y="865.9"
          style="fill: {$colors[1]}"
          on:mouseenter={() => $highlightNeighborhoods = getIds(1)}
          on:click={() => $selectedNeighborhoods = getIds(1)}
          on:mouseleave={() => $highlightNeighborhoods = []}
        />
        <rect
          width="50"
          height="25"
          x="78.5"
          y="865.9"
          style="fill: {$colors[2]}"
          on:mouseenter={() => $highlightNeighborhoods = getIds(2)}
          on:click={() => $selectedNeighborhoods = getIds(2)}
          on:mouseleave={() => $highlightNeighborhoods = []}
        />
        <rect
          y="865.9"
          x="128.1"
          height="25"
          width="50"
          style="fill: {$colors[3]}"
          on:mouseenter={() => $highlightNeighborhoods = getIds(3)}
          on:click={() => $selectedNeighborhoods = getIds(3)}
          on:mouseleave={() => $highlightNeighborhoods = []}
        />
        <rect
          width="50"
          height="25"
          x="177.6"
          y="865.9"
          style="fill: {$colors[4]}"
          on:mouseenter={() => $highlightNeighborhoods = getIds(4)}
          on:click={() => $selectedNeighborhoods = getIds(4)}
          on:mouseleave={() => $highlightNeighborhoods = []}
        />
        <text x="-19.5" y="864.3" class="legendText">
          <tspan x="-19.5" y="864.3">{formatNumber($minBreak, "short")}</tspan>
        </text>
        <text y="864.4" x="28.6" class="legendText">
          <tspan y="864.4" x="28.6">{formatNumber($breaks[0], "short")}</tspan>
        </text>
        <text x="78.4" y="864.4" class="legendText">
          <tspan x="78.4" y="864.4">{formatNumber($breaks[1], "short")}</tspan>
        </text>
        <text y="864.4" x="128" class="legendText">
          <tspan y="864.4" x="128">{formatNumber($breaks[2], "short")}</tspan>
        </text>
        <text x="177.8" y="864.4" class="legendText">
          <tspan x="177.8" y="864.4">{formatNumber($breaks[3], "short")}</tspan>
        </text>
        <text y="864.3" x="225.8" class="legendText">
          <tspan y="864.3" x="225.8">{formatNumber($breaks[4], "short")}</tspan>
        </text>
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
