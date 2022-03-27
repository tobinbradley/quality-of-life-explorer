import { get, writable } from 'svelte/store'
import { dataCategories } from './store'


const cats = {}
get(dataCategories).forEach(cat => {
  cats[cat] = true
})

export let printOptions = writable({
  cover: true,
  map: true,
  data: true,
  title: 'Summary Report',
  dataCats: cats
})
