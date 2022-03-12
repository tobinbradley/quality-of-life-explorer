<script>
  let email = ''
  let message = ''
  let sent = false

  function sendMail() {
    fetch('https://mcmap.org/utilities/mail-qol.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: [
        `encodeURIComponent('email')=encodeURIComponent(${email})`,
        `encodeURIComponent('website')=encodeURIComponent('')`,
        `encodeURIComponent('message')=encodeURIComponent(${message})`
      ].join("&")
    })
      .then(res => res.text())
      .then(res => console.log(res))
      .catch(err => console.log("Error sending request", err))

    sent = true
  }
</script>

<div class="bg-white shadow-md p-2">
  <h3 class="text-gray-500 font-bold">Contact Us</h3>

  <div class="mb-3" >
    <input placeholder="Email address" aria-label="email address" class="border-b-2 border-gray-200 w-full py-2 px-1 text-gray-700 leading-tight focus:outline-none focus:border-purple-500" bind:value={email} onclick="this.select()" name="email">
  </div>

  <div class="mb-3" >
    <textarea aria-label="message" placeholder="Message..." cols="4" class="border-b-2 border-gray-200 w-full py-2 px-1 text-gray-700 leading-tight focus:outline-none focus:border-purple-500" bind:value={message} onclick="this.select()" name="message"></textarea>
  </div>


    <div class="text-right">
      {#if !sent}
      <button class="bg-pink-600 text-white shadow-md py-1 px-2 rounded" on:click={sendMail}>Send</button>
      {:else}
      Thanks!
      {/if}
    </div>
</div>
