<script>
  import { selectedMetric } from '../store/store'

  let meta = ''
  let about = ''

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

  // TODO: Change meta markdown to handle related variables
  window.setMetric = metric => {
    $selectedMetric = metric
  }



  // make global links

</script>

<div class="mt-4 grid md:grid-cols-3 gap-4 meta">
  <div class="md:col-span-2 p-4 shadow-md bg-white">{@html meta}</div>
  <div>
    <div class="p-4 shadow-md bg-white">{@html about}</div>
  </div>
</div>
