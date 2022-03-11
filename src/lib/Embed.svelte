<script>
  import { selectedMetric, selectedNeighborhoods } from '../store/store'
  let embedCode = ""

  $: if ($selectedMetric || $selectedNeighborhoods) {
    embedCode = `<iframe src="https://mcmap.org/qol/embed.html${window.location.hash}" style="width: 500px; height: 500px; border: 1px solid #595959"></iframe>`
  }

</script>

<div class="bg-white shadow-md p-2">
  <label class="block text-gray-500 font-bold" for="report-title">
    Map Embed Code
  </label>
  <textarea rows="4" class="border-b-2 border-gray-200 w-full py-2 px-1 text-sm text-gray-700 leading-tight focus:outline-none focus:border-pink-600" id="report-title" bind:value={embedCode} onclick="this.select()"></textarea>

</div>
