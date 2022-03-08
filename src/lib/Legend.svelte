<script>
  import { selectedConfig, selectedData, yearIdx, colors } from "../store/store"

  // TODO: selected value
  // TODO: county value
  // TODO: legend values
  // TODO: legend hover
</script>

<div
  class="bg-white inline-block absolute top-0 left-0 shadow-md"
  style="width: 260px;"
>
  <h2 class="border-b-2 border-stone-200 p-2">
    {$selectedConfig.title},
    {#if $selectedData}
      {$selectedData.years[$yearIdx]}
    {/if}
  </h2>
  <div class="text-center text-sm text-stone-600 p-2">
    {$selectedConfig.subtitle}
  </div>
  <div>
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
        />
        <rect
          width="50"
          height="25"
          x="28.9"
          y="865.9"
          style="fill: {$colors[1]}"
        />
        <rect
          width="50"
          height="25"
          x="78.5"
          y="865.9"
          style="fill: {$colors[2]}"
        />
        <rect
          y="865.9"
          x="128.1"
          height="25"
          width="50"
          style="fill: {$colors[3]}"
        />
        <rect
          width="50"
          height="25"
          x="177.6"
          y="865.9"
          style="fill: {$colors[4]}"
        />
        <text x="-19.5" y="864.3" class="legendText">
          <tspan x="-19.5" y="864.3">N1</tspan>
        </text>
        <text y="864.4" x="28.6" class="legendText">
          <tspan y="864.4" x="28.6">N2</tspan>
        </text>
        <text x="78.4" y="864.4" class="legendText">
          <tspan x="78.4" y="864.4">n3</tspan>
        </text>
        <text y="864.4" x="128" class="legendText">
          <tspan y="864.4" x="128">n4</tspan>
        </text>
        <text x="177.8" y="864.4" class="legendText">
          <tspan x="177.8" y="864.4">n5</tspan>
        </text>
        <text y="864.3" x="225.8" class="legendText">
          <tspan y="864.3" x="225.8">n6</tspan>
        </text>
      </g>
    </svg>
  </div>
</div>
