import { writable } from 'svelte/store'

export let printOptions = writable({
  cover: true,
  map: true,
  data: true,
  title: 'Summary Report'
})
