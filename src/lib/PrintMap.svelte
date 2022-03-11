<script>
import Map from './Map.svelte'
import { printOptions } from '../store/print'
</script>


{#if $printOptions.map}
<div class="relative shadow-md print:shadow-none page">
  <Map />
</div>
{/if}
