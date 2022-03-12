<script>
import { dataConfig, selectedNeighborhoods } from '../store/store'
import { printOptions } from '../store/print'
import { formatNumber, calcAggregate, calcRaw } from './utils'

async function fetchData(metric, calc = "agg", county = false, selected = null) {
  const response = await fetch(`./data/metric/${metric}.json`)
  const data = await response.json()

  const config = $dataConfig.filter(el => el.metric === metric)[0]

  let val

  if (calc === "agg") {
    return formatNumber(calcAggregate(data, config, county, selected)[data.years.length - 1], config.format || null)
  } else {
    return formatNumber(calcRaw(data, config, county, selected)[data.years.length - 1], null, config.decimals || null)
  }
}

</script>


<div class="relative bg-white shadow-md print:shadow-none p-2 page" class:hidden="{!$printOptions.cover}">
  <div class="text-center">
    <img src="img/report-logo.jpg" alt="">
  </div>
  <h1 class="font-bold text-3xl text-center mb-8">
    {$printOptions.title}
  </h1>
  <div class="columns-2 gap-2">
    <p>
      The <a href="https://mcmap.org/qol">Quality of Life Explorer</a>>a is an interactive online tool to help neighborhoods, government leaders and staff, businesses, community organizations, new residents and others learn more about our county and the diverse neighborhoods within it. The Explorer features over 80 variables that reflect you, the places you live and work, and collectively, our community.
    </p>
    <p>
      On these pages, you'll find information about the selected area's social, housing, economic and environmental conditions. Check out the Explorer online to learn more about what's happening, see trends over time, and connect to resources to take action on the issues that matter to you.

      Learn More. Take Action. Create Change.
    </p>
  </div>
  <div>
    <div class="grid grid-cols-3 items-center justify-center mt-8">
      <div class="grid place-items-center border-b-2 border-r-2 border-slate-300 p-2">
        <h3 class="text-lg font-semibold uppercase">Character</h3>
        <h2 class="text-3xl font-semibold pt-3 pb-2">
          {#await fetchData("m47", "agg", false, $selectedNeighborhoods)}
            &nbsp;
          {:then result}
            {result}
          {:catch error}
            {error.message}
          {/await}
        </h2>
        <h4 class="lowercase">people per acre</h4>
      </div>
      <div class="grid place-items-center border-b-2 border-r-2 border-slate-300 p-2">
        <h3 class="text-lg font-semibold uppercase">Education</h3>
        <h2 class="text-3xl font-semibold pt-3 pb-2">
          {#await fetchData("m20", "agg", false, $selectedNeighborhoods)}
            &nbsp;
          {:then result}
            {result}
          {:catch error}
            {error.message}
          {/await}
        </h2>
        <h4 class="lowercase">bachelor's degree</h4>
      </div>
      <div class="grid place-items-center border-b-2 border-slate-300 p-2">
        <h3 class="text-lg font-semibold uppercase">Economy</h3>
        <h2 class="text-3xl font-semibold pt-3 pb-2">
          {#await fetchData("m37", "agg", false, $selectedNeighborhoods)}
            &nbsp;
          {:then result}
            {result}
          {:catch error}
            {error.message}
          {/await}
        </h2>
        <h4 class="lowercase">household income</h4>
      </div>
      <div class="grid place-items-center border-b-2 border-r-2 border-slate-300 p-2">
        <h3 class="text-lg font-semibold uppercase">Engagement</h3>
        <h2 class="text-3xl font-semibold pt-3 pb-2">
          {#await fetchData("m48", "agg", false, $selectedNeighborhoods)}
            &nbsp;
          {:then result}
            {result}
          {:catch error}
            {error.message}
          {/await}
        </h2>
        <h4 class="lowercase">voter participation</h4>
      </div>
      <div class="grid place-items-center border-b-2 border-r-2 border-slate-300 p-2">
        <h3 class="text-lg font-semibold uppercase">Transportation</h3>
        <h2 class="text-3xl font-semibold pt-3 pb-2">
          {#await fetchData("m70", "agg", false, $selectedNeighborhoods)}
            &nbsp;
          {:then result}
            {result}
          {:catch error}
            {error.message}
          {/await}
        </h2>
        <h4 class="lowercase">streets with sidewalks</h4>
      </div>
      <div class="grid place-items-center border-b-2 border-slate-300 p-2">
        <h3 class="text-lg font-semibold uppercase">Housing</h3>
        <h2 class="text-3xl font-semibold pt-3 pb-2">
          {#await fetchData("m29", "agg", false, $selectedNeighborhoods)}
            &nbsp;
          {:then result}
            {result}
          {:catch error}
            {error.message}
          {/await}
        </h2>
        <h4 class="lowercase">housing units</h4>
      </div>
      <div class="grid place-items-center border-r-2 border-slate-300 p-2">
        <h3 class="text-lg font-semibold uppercase">Safety</h3>
        <h2 class="text-3xl font-semibold pt-3 pb-2">
          {#await fetchData("m59", "agg", false, $selectedNeighborhoods)}
            &nbsp;
          {:then result}
            {result}
          {:catch error}
            {error.message}
          {/await}
        </h2>
        <h4 class="lowercase">property crime rate</h4>
      </div>
      <div class="grid place-items-center border-r-2 border-slate-300 p-2">
        <h3 class="text-lg font-semibold uppercase">Environment</h3>
        <h2 class="text-3xl font-semibold pt-3 pb-2">
          {#await fetchData("m3", "agg", false, $selectedNeighborhoods)}
            &nbsp;
          {:then result}
            {result}
          {:catch error}
            {error.message}
          {/await}
        </h2>
        <h4 class="lowercase">tree canopy</h4>
      </div>
      <div class="grid place-items-center  p-2">
        <h3 class="text-lg font-semibold uppercase">Character</h3>
        <h2 class="text-3xl font-semibold pt-3 pb-2">
          {#await fetchData("m45", "agg", false, $selectedNeighborhoods)}
            &nbsp;
          {:then result}
            {result}
          {:catch error}
            {error.message}
          {/await}
        </h2>
        <h4 class="lowercase">grocery store proximity</h4>
      </div>


    </div>
  </div>
</div>
