import { writable, readable, derived } from 'svelte/store'
import dataJSON from '../../data/data.json'
import { ckmeans } from 'simple-statistics'
import { isNumeric, calcAggregate, calcRaw } from '../lib/utils'

// BUG: how do I verify the passed NPA's are solid?

// read URL params on load
let metric = dataJSON[Math.floor(Math.random() * dataJSON.length)].metric
let selected = []
const args = window.location.hash.replace('#', '').split('/')
if (args.length === 2) {
  const met = dataJSON.filter(el => el.metric === 'm' + args[0])
  if (met.length === 1) metric = met[0].metric
  if (args[1].length > 0) selected = args[1].split(',')
}

// readable data config
export const dataConfig = readable(dataJSON.sort((a, b) => {
  return a.category - b.category || a.title - b.title
}))

export const whatsnew = readable([
  "m80", "m23", "m57", "m54", "m55", "m56", "m44", "m11", "m19", "m21", "m22", "m24", "m25", "m27", "m32", "m34", "m35", "m4", "m45", "m46", "m51", "m52", "m53", "m58", "m59", "m60", "m61", "m72", "m73", "m78", "m8", "m83", "m9"
 ])



export let selectedMetric = writable(metric)

// derived selected data config
export let selectedConfig = derived([dataConfig, selectedMetric], $values => {
  return $values[0].filter(el => el.metric === $values[1])[0]
})

// writable selected metric data
export let selectedData = writable(null)
selectedMetric.subscribe(value => {
  fetch(`./data/metric/${value}.json`)
    .then(response => response.json())
    .then(json => {
      selectedData.set(json)
    })
    .catch(error => {
      console.error('There has been a problem with your fetch operation:', error);
    })
})


// breaks
export let breakCkmeans = derived(selectedData, value => {
  if (!value) return null
  let breakSet = []
  for (const key in value.m) {
    breakSet = breakSet.concat(value.m[key])
  }
  return ckmeans(breakSet.filter(el => el !== null), 5)
})
export let breaks = derived(breakCkmeans, value => {
  if (!value) return null
  return value.map(el => Math.max(...el))
})
export let minBreak = derived(breakCkmeans, value => {
  if (!value) return null
  return Math.min(...value[0])
})


// year info
export let yearIdx = writable(null)
selectedData.subscribe(value => {
  if (!value) return null
  yearIdx.set(value.years.length - 1)
})

// selected NPA
export let selectedNeighborhoods = writable(selected)

// highlight NPA's
export let highlightNeighborhoods = writable([])

// colors
export const colors = readable(["rgb(238,250,227)", "rgb(186,228,188)", "rgb(123,204,196)", "rgb(67,162,202)", "rgb(8,104,172)"])

const hash = derived([selectedMetric, selectedNeighborhoods], ([v1, v2]) => {
  return `#${v1.replace('m', '')}/${v2.join(',')}`
})

hash.subscribe(value => {
  window.history.replaceState( {} , '', value )
})

// Aggregate county value
export let calcCounty = derived([selectedData, selectedConfig], ([data, config]) => {
  if (!data) return null
  return calcAggregate(data, config, true)
})

// Aggregate selected value
export let calcSelected = derived([selectedData, selectedNeighborhoods, selectedConfig], ([data, neighborhoods, config]) => {
  if (!data || neighborhoods.length === 0) return null
  return calcAggregate(data, config, false, neighborhoods)
})

// Aggregate selected value
export let calcSelectedRaw = derived([selectedData, selectedNeighborhoods, selectedConfig], ([data, neighborhoods, config]) => {
  if (!data || !config.raw_label || neighborhoods.length === 0) return null
  return calcRaw(data, config, false, neighborhoods)
})

// Aggregate selected value
export let calcCountyRaw = derived([selectedData, selectedConfig], ([data, config]) => {
  if (!data || !config.raw_label) return null
  return calcRaw(data, config, true)
})
