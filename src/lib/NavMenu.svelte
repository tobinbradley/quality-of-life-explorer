<script>
  import { help } from "../store/store"
</script>

<div class="dropdown relative inline-block h-full">
  <button
    class="dropbtn cursor-default inline-block h-full px-6 box-border border-y-4 transition-colors border-slate-800"
    >Help</button
  >
  <div class="dropdown-content absolute text-center min-w-full bg-white shadow-lg z-10 right-0">
    <button class="text-black w-full px-2 py-3 block hover:bg-slate-300" on:click={() => ($help = true)}>Tutorial</button>
    <a
      href="http://charlottenc.gov/HNS/CE/CommunityInfo/Pages/QOL.aspx"
      class="text-black px-2 py-3 block hover:bg-slate-300"
      target="_blank">About</a
    >
  </div>
</div>

<style>


  .dropdown-content {
    display: none;
  }

  .dropdown:hover .dropbtn {
    @apply border-b-pink-500;
  }

  .dropdown:hover .dropdown-content {
    display: block;
  }
</style>
