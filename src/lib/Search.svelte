<script>
  import { selectedNeighborhoods, selectedData, mapZoom } from "../store/store"
  import { notifications } from "../store/notifications.js"
  import { isNumeric } from "./utils"

  let searchString = ""
  let searchResults = []

  function search() {
    searchResults = []
    const str = searchString.trim()

    // if numeric look for NPA or zip
    if (isNumeric(str)) {
      // NPA
      const keys = Object.keys($selectedData.m)
      if (keys.indexOf(str) !== -1)
        searchResults = searchResults.concat({
          cat: "NPA",
          id: str,
          label: str,
        })

      // zipcode
      if (str.length === 5) {
        fetch(
          `https://api.mcmap.org/v1/query/zipcodes?columns=gid as id, zip as label, 'ZIP' as cat&limit=10&filter=zip='${str}'`
        )
          .then((response) => {
            if (!response.ok) {
              throw new Error()
            }
            return response.json()
          })
          .then((json) => {
            searchResults = searchResults.concat(json)
          })
          .catch((error) => {
            console.error(
              "There has been a problem with your fetch operation:",
              error
            )
            notifications.danger(
              "Search encountered a problem. Are you offline?",
              5000
            )
          })
      }
    }

    // if string and larger than 4 chars
    if (!isNumeric(str) && str.length >= 4) {
      // Address
      const filter = encodeURIComponent(
        `ts @@ to_tsquery('addressing_en', '${
          str.toUpperCase().replace(/ /g, "&") + ":*"
        }')`
      )
      fetch(
        `https://api.mcmap.org/v1/query/master_address_table?columns=objectid as id, full_address as label, 'ADDRESS' as cat&limit=10&filter=${filter}`
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error()
          }
          return response.json()
        })
        .then((json) => {
          searchResults = searchResults.concat(json)
        })
        .catch((error) => {
          console.error(
            "There has been a problem with your fetch operation:",
            error
          )
          notifications.danger(
            "Search encountered a problem. Are you offline?",
            5000
          )
        })

      // NSA
      fetch(
        `https://api.mcmap.org/v1/query/neighborhood_statistical_areas?columns=gid as id, nsa_name as label, 'NSA' as cat&limit=10&filter=nsa_name ilike '${str}%'`
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error()
          }
          return response.json()
        })
        .then((json) => {
          searchResults = searchResults.concat(json)
        })
        .catch((error) => {
          console.error(
            "There has been a problem with your fetch operation:",
            error
          )
          notifications.danger(
            "Search encountered a problem. Are you offline?",
            5000
          )
        })
    }
  }

  function selectResults(cat, id) {
    if (cat === "NPA") {
      $selectedNeighborhoods = [id]
      $mapZoom = true
    }
    if (cat === "NSA") {
      fetch(
        `https://api.mcmap.org/v1/intersect_feature/neighborhood_statistical_areas/neighborhoods?geom_column_from=the_geom&geom_column_to=the_geom&columns=neighborhoods.id&filter=neighborhood_statistical_areas.gid=${id}`
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error()
          }
          return response.json()
        })
        .then((json) => {
          $selectedNeighborhoods = json.map((el) => el.id.toString())
          $mapZoom = true
        })
        .catch((error) => {
          console.error(
            "There has been a problem with your fetch operation:",
            error
          )
          notifications.danger(
            "Search encountered a problem. Are you offline?",
            5000
          )
        })
    }
    if (cat === "ZIP") {
      fetch(
        `https://api.mcmap.org/v1/intersect_feature/zipcodes/neighborhoods?geom_column_from=the_geom&geom_column_to=the_geom&columns=neighborhoods.id&filter=zipcodes.gid=${id}`
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error()
          }
          return response.json()
        })
        .then((json) => {
          $selectedNeighborhoods = json.map((el) => el.id.toString())
          $mapZoom = true
        })
        .catch((error) => {
          console.error(
            "There has been a problem with your fetch operation:",
            error
          )
          notifications.danger(
            "Search encountered a problem. Are you offline?",
            5000
          )
        })
    }
    if (cat === "ADDRESS") {
      fetch(
        `https://api.mcmap.org/v1/intersect_feature/master_address_table/neighborhoods?geom_column_from=the_geom&geom_column_to=the_geom&columns=neighborhoods.id&filter=master_address_table.objectid=${id}`
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error()
          }
          return response.json()
        })
        .then((json) => {
          $selectedNeighborhoods = json.map((el) => el.id.toString())
          $mapZoom = true
        })
        .catch((error) => {
          console.error(
            "There has been a problem with your fetch operation:",
            error
          )
          notifications.danger(
            "Search encountered a problem. Are you offline?",
            5000
          )
        })
    }
  }
</script>

<div class="relative">
  <div class="mb-2">
    <input
      class="border-b-stone-200 border-b-2 w-full focus:border-b-pink-600"
      bind:value={searchString}
      on:input={search}
      on:focus={search}
      on:blur={() => setTimeout(() => (searchResults = []), 250)}
      placeholder="Search..."
    />
  </div>

  {#if searchResults.length > 0}
    <div
      class="absolute w-full bg-white overflow-y-auto overflow-x-hidden z-50"
      style="max-height: 200px;"
    >
      {#each searchResults as result}
        <div
          class="cursor-pointer whitespace-nowrap text-sm rounded text-blue-700 py-2 px-1 hover:bg-blue-500 hover:text-white transition-colors"
          on:click={() => selectResults(result.cat, result.id)}
        >
          <span class="bg-blue-500 text-white mr-2 p-1 font-semibold"
            >{result.cat.substring(0, 3)}</span
          >
          {result.label}
        </div>
      {/each}
    </div>
  {/if}

  <p class="text-sm text-stone-600">
    Enter a <span
      class="text-pink-800 hover:cursor-pointer"
      title="Neighborhood Profile Areas (NPAs) are geographic areas used for the organization and presentation of data in the Quality of Life Study. The boundaries were developed with community input and are based on one or more Census block groups."
    >
      NPA</span
    >, address, NSA or zip code.
  </p>
</div>

<style>
  input:focus {
    outline: none;
  }
</style>
