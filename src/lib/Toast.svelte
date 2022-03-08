<!--
  // TO USE
  <script>
	// Follow @kevmodrome on Twitter for more fun Svelte things: https://twitter.com/kevmodrome
	import {notifications} from './notifications.js'
	import Toast from './Toast.svelte'

</script>
<button on:click={() => notifications.info('Wait a INFO...', 100)}>
	info!
</button>
<button on:click={() => notifications.warning('Wait a moment...', 5000)}>
	Warn!
</button> -->

<script>
  import { flip } from "svelte/animate";
  import { fly } from "svelte/transition";
  import { notifications } from "../store/notifications";

  export let themes = {
      danger: "#E26D69",
      success: "#84C991",
      warning: "#f0ad4e",
      info: "#5bc0de",
      default: "#aaaaaa",
  };
</script>

<div class="notifications">
  {#each $notifications as notification (notification.id)}
      <div
          animate:flip
          class="toast"
          style="background: {themes[notification.type]};"
          transition:fly={{ y: 30 }}
      >
          <div class="content">{notification.message}</div>
          {#if notification.icon}<i class={notification.icon} />{/if}
      </div>
  {/each}
</div>

<style>
  .notifications {
      @apply fixed left-0 right-0 m-auto z-50 flex flex-col justify-start items-center pointer-events-none bottom-5;

  }

  .toast {
      flex: 0 0 auto;
      margin-bottom: 10px;
  }

  .content {
    @apply block p-4 text-lg text-white font-bold;
  }
</style>
