<script>
  import { selectedData, yearIdx } from "../store/store"

  let play = true
  let playToggle

  function playYears() {
    if (play) {
      $yearIdx === $selectedData.years.length - 1 ? $yearIdx = 0 : $yearIdx = $yearIdx + 1
      playToggle = setInterval(() => {
        $yearIdx === $selectedData.years.length - 1 ? $yearIdx = 0 : $yearIdx = $yearIdx + 1
      }, 1500);
    } else {
      if (playToggle) clearInterval(playToggle)
    }
  }
</script>


  <div class="pt-3 flex items-center justify-center columns-3">
    <div class="playpause">
      {#if $selectedData && $selectedData.years.length > 1}
      <input
        type="checkbox"
        value="None"
        id="playpause"
        name="check"
        on:change={playYears}
        bind:checked={play}
      />
      <label for="playpause" />
      {/if}
    </div>
    <div class="flex-grow px-2">
      {#if $selectedData && $selectedData.years.length > 1}
      <input
        type="range"
        aria-label="Select Year"
        min="0"
        bind:value={$yearIdx}
        max={$selectedData.years.length - 1}
        step="1"
        class="w-full print:hidden block"
      />
      {/if}
    </div>
    <div class="text-xl font-semibold text-slate-500">
      {#if $selectedData}
      {$selectedData.years[$yearIdx]}
      {/if}
    </div>
  </div>

<style>
  .playpause label {
    display: block;
    box-sizing: border-box;
    width: 0;
    height: 34px;
    border-color: transparent transparent transparent rgb(158, 158, 158);
    transition: 180ms all ease;
    cursor: pointer;
    border-style: double;
    border-width: 0px 0 0px 25px;
  }
  .playpause label:hover {
    border-color: transparent transparent transparent #ff4081;
  }
  .playpause input[type="checkbox"] {
    display: none;
  }
  .playpause input[type="checkbox"]:checked + label {
    border-style: solid;
    border-width: 17px 0 17px 25px;
  }
</style>
