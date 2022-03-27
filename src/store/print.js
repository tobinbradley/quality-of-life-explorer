import { writable } from 'svelte/store'
import dataJSON from '../../data/data.json'

const categories = [...new Set(dataJSON.map(el => el.category))]
const cats = {}

categories.forEach(cat => {
  cats[cat] = true
})

export let printOptions = writable({
  cover: true,
  map: true,
  data: true,
  title: 'Summary Report',
  dataCats: cats
})
