<script>
  import { help } from '../store/store'
  let show = localStorage.getItem("prouser")

  function seen(node) {
    localStorage.setItem("prouser", "true")
  }
</script>

{#if !show}
<div class="bg-highlight text-white rounded p-5 shadow-md text-center relative" use:seen>
  <div class="absolute top-3 right-3">
  <button aria-label="Close" class="rounded-full p-1 transition-colors duration-300 ease-in-out hover:bg-pink-400" on:click={() => show = "false"} >
    <svg class="w-4 h-4 fill-current"
    ><use xlink:href="#icon-cancel" /></svg
  >
  </button>
</div>
  <p class="pb-1">
  <span class="font-semibold text-lg">Welcome to the Charlotte/Mecklenburg Quality of Life Explorer!</span><br> Exploring neighborhood character, economics, education, engagement, environment, health, housing, safety and transportation.
  </p>
  <p class="pb-1">
    Some Neighborhood (NPA) boundaries have changed. If you are looking at NPAs 211, 230, 232, 250 or 277, be advised that data cannot be compared over time.
  </p>
  <p>
    Need help getting started? Try our <button class="underline" on:click={() => $help = true}>video tutorial</button>.
  </p>
</div>
{/if}
