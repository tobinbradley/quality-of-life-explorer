<script>
  import { help } from '../store/store'

</script>

{#if ($help)}
<div
  on:click={() => $help = false}
  on:keypress={() => $help = false}
  class='fixed top-0 bottom-0 left-0 right-0 bg-gray-700 opacity-70 flex justify-center items-center'>
</div>

  <div class="modal rounded p-2 shadow-lg bg-white relative z-100 overflow-y-auto bg-transparent">
    <div class="text-right mb-1">
      <button aria-label="Close" class="rounded-full p-1 transition-colors duration-300 ease-in-out hover:bg-gray-300" on:click={() => $help = false} >
        <svg class="w-4 h-4 fill-current"
        ><use xlink:href="#icon-cancel" /></svg
      >
      </button>
    </div>
    <iframe src="https://www.youtube.com/embed/73Eu1H_-iVk?autoplay=1" class="w-full h-full" frameborder="0" title="video tutorial" />
  </div>

{/if}

<style>
  .modal {
    position: fixed;
    z-index: 2;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #fff;
    filter: drop-shadow(0 0 20px #333);
  }
  iframe {
    width: 800px;
    max-width: 90vw;
    aspect-ratio: 16 / 9;
  }
</style>
