<script>
  // Credit to @kevmodrome https://twitter.com/kevmodrome
  // Usage:
  // import {notifications} from './notifications.js'
  // notifications.warning('Wait a moment...', 5000)

  import { flip } from "svelte/animate";
  import { fly } from "svelte/transition";
  import { notifications } from "../store/notifications";

  export let themes = {
      danger: "#DC2626",
      success: "#16A34A",
      warning: "#CA8A04",
      info: "#0284C7",
      default: "#0284C7",
  };
</script>

<div class="fixed left-0 right-0 m-auto z-50 flex flex-col justify-start items-center pointer-events-none bottom-5">
  {#each $notifications as notification (notification.id)}
      <div
          animate:flip
          class="toast shadow-lg rounded"
          style="background: {themes[notification.type]};"
          transition:fly={{ y: 30 }}
      >
          <div class="block p-4 text-lg text-white font-semibold text-center">{@html notification.message}</div>
          {#if notification.icon}<i class={notification.icon} />{/if}
      </div>
  {/each}
</div>

<style>
  .toast {
      flex: 0 0 auto;
      margin-bottom: 10px;
  }

</style>
