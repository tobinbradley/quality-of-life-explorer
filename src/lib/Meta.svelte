<script>
  import { selectedConfig, selectedMetric, dataConfig } from '../store/store'

  let meta = ''
  let about = ''

  console.log($selectedConfig)

  $:{
    fetch(`./data/meta/${$selectedMetric}.html`)
      .then(response => response.text())
      .then(html => {
        meta = html.substring(getPosition(html, '<h3', 1), getPosition(html, '<h3', 2)) + html.substring(getPosition(html, '<h3', 3), html.length - 1)
        about = html.substring(getPosition(html, '<h3', 2), getPosition(html, '<h3', 3))
      })
  }

  function getPosition(string, subString, index) {
    return string.split(subString, index).join(subString).length;
  }

  function relatedVariable(metric) {
    $selectedMetric = metric
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

</script>

<div class="mt-4 grid md:grid-cols-3 gap-4 meta">
  <div class="md:col-span-2 p-4 shadow-md bg-white">{@html meta}</div>
  <div>
    <div class="p-4 shadow-md bg-white">{@html about}</div>
    {#if $selectedConfig.related}
    <div class="p-4 shadow-md bg-white mt-4">
      <h2>Related Variables</h2>
      <ul class="ml-2">
        {#each $selectedConfig.related as metric}
          {#if $dataConfig.filter(el => el.metric === metric).length > 0}
            <li><button class="text-highlight underline" on:click={() => relatedVariable(metric)}>{ $dataConfig.filter(el => el.metric === metric)[0].title}</button></li>
          {/if}
        {/each}
      </ul>
    </div>
    {/if}
  </div>
</div>
