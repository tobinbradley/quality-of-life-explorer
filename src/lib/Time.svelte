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
    border-color: transparent;
    @apply border-l-highlight transition-all cursor-pointer;
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

  input[type=range] {
    -webkit-appearance: none;
      -moz-appearance: none;
            appearance: none;
    padding: 0;
    width: 100%;
    height: 22px;
    cursor: pointer;
    display: block;
  }
  input[type=range]:focus {
    outline: none;
  }
  input::-webkit-slider-runnable-track {
    box-sizing: border-box;
    width: 100%;
    height: 6px;
    @apply bg-highlight;
    border-radius: 100px;
    margin: 11px 0;
  }
  input::-moz-range-track {
    box-sizing: border-box;
    width: 100%;
    height: 6px;
    @apply bg-gray-400;
    border-radius: 100px;
    margin: 11px 0;
  }
  input[type="range"]::-moz-range-progress {
    @apply bg-highlight;
    height: 6px;
    border-radius: 12px;
}
  input::-webkit-slider-thumb {
    box-sizing: border-box;
    box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.5);
    border: 6px solid #fff;
    height: 24px;
    width: 24px;
    border-radius: 100px;
    background: #333940;
    cursor: pointer;
    -webkit-appearance: none;
            appearance: none;
    transform: translateY(-50%);
    margin-top: 2px;
  }
  input::-moz-range-thumb {
    box-sizing: border-box;
    box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.5);
    border: 6px solid #fff;
    height: 24px;
    width: 24px;
    border-radius: 100px;
    background: #333940;
    cursor: pointer;
  }
</style>
