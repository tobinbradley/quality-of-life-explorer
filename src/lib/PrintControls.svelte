<script>
  import { printOptions } from '../store/print'
  import { selectedMetric, dataConfig} from '../store/store'

  let title = $printOptions.title
  const categories = [...new Set($dataConfig.map(el => el.category))]

  $: {
    $printOptions.title = title
  }

</script>

<div class="bg-white shadow-md p-4 mt-6 print:hidden">
  <h1 class="text-center font-semibold text-xl">Charlotte/Mecklenburg Quality of Life Explorer</h1>
  <h2 class="text-center text-lg">Print Report</h2>

  <div>
    <label class="block text-gray-500 font-bold">
      <input class="mr-2 leading-tight" type="checkbox" bind:checked={$printOptions.cover} >
      <span>
        Show cover page
      </span>
    </label>
  </div>
  <div class="ml-9 mb-3" class:hidden="{$printOptions.cover === false}">
    <label class="block text-gray-500 font-bold" for="report-title">
      Cover Page Title
    </label>
    <input class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:border-purple-500" id="report-title" bind:value={title} >
  </div>

  <div>
    <label class="block text-gray-500 font-bold">
      <input class="mr-2 leading-tight" type="checkbox" bind:checked={$printOptions.map} >
      <span>
        Show map
      </span>
    </label>
  </div>
  <div class="ml-9 mb-3" class:hidden="{$printOptions.map === false}">
    <select bind:value={$selectedMetric} class="w-full py-3 px-1 rounded cursor-pointer bg-gray-200 focus:outline-none focus:border-purple-500">
      {#each categories as cat}
      <optgroup label={cat}>
        {#each $dataConfig.filter(el => el.category === cat) as metric}
          <option value={metric.metric}>{metric.title}</option>
        {/each}
      </optgroup>
      {/each}
    </select>
  </div>
  <div>
    <label class="md:w-2/3 block text-gray-500 font-bold">
      <input class="mr-2 leading-tight" type="checkbox" bind:checked={$printOptions.data} >
      <span>
        Show data tables
      </span>
    </label>
  </div>
  <div class="text-center my-6">
    <button class="bg-highlight text-white hover:shadow-lg transition-shadow uppercase fill-white px-8 py-4 rounded shadow-md" onclick="window.print()">
      <svg class="icon-printer h-10 w-10"><use xlink:href="#icon-printer"></use></svg>
      <span>Print</span>
    </button>
  </div>
</div>
