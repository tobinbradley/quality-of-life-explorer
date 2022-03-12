<script>
  import Map from './Map.svelte'
  import { printOptions } from '../store/print'
</script>

<div class="relative shadow-md print:shadow-none page" class:hidden="{!$printOptions.map}">
  <Map />
</div>
