import { writable, readable, derived } from 'svelte/store'
import dataJSON from '../../data/data.json'
import { ckmeans } from 'simple-statistics'
import { isNumeric } from '../lib/utils'

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
export let calcCounty = derived([selectedData, selectedConfig, yearIdx], ([data, config, yearIdx]) => {
  if (!data) return null
  // short circuit if override present
  if (config.world_val && config.world_val[`y_${data.years[yearIdx]}`]) {
    return config.world_val[`y_${data.years[yearIdx]}`]
  }

  // handle sum
  if (config.sum) {
    let total = 0
    for (const key in data.m) {
      const yearval = data.m[key][yearIdx]
      if (isNumeric(yearval)) total += yearval
    }
    return total
  }

  if (data.m && data.d) {
    let n = 0
    let d = 0
    for (const key in data.m) {
      const mval = data.m[key][yearIdx]
      const dval = data.d[key][yearIdx]
      if (isNumeric(mval) && isNumeric(dval)) {
        d = d + dval
        n = n + mval * dval
      }
    }
    return n / d
  }
})

// Aggregate selected value
export let calcSelected = derived([selectedData, selectedNeighborhoods, selectedConfig, yearIdx], ([data, neighborhoods, config, yearIdx]) => {
  if (!data) return null
  // handle sum
  if (config.sum) {
    let total = 0
    for (const key in data.m) {
      const yearval = data.m[key][yearIdx]
      if (isNumeric(yearval) && neighborhoods.indexOf(key) !== -1) total += yearval
    }
    return total
  }

  if (data.m && data.d) {
    let n = 0
    let d = 0
    for (const key in data.m) {
      const mval = data.m[key][yearIdx]
      const dval = data.d[key][yearIdx]
      if (isNumeric(mval) && isNumeric(dval) && neighborhoods.indexOf(key) !== -1) {
        d = d + dval
        n = n + mval * dval
      }
    }
    return n / d
  }
})

// Aggregate selected value
export let calcSelectedRaw = derived([selectedData, selectedNeighborhoods, selectedConfig, yearIdx], ([data, neighborhoods, config, yearIdx]) => {
  if (!data) return null
  if (config.raw_label) {
    let total = 0
    for (const key in data.d) {
      const n = data.m[key][yearIdx]
      const d = data.d[key][yearIdx]
      if (isNumeric(n) && isNumeric(d) && neighborhoods.indexOf(key) !== -1) total += n * d
    }
    return total
  }
  return null
})

// Aggregate selected value
export let calcCountyRaw = derived([selectedData, selectedConfig, yearIdx], ([data, config, yearIdx]) => {
  if (!data) return null
  // short circuit if override present
  if (config.raw_val && config.raw_val[`y_${data.years[yearIdx]}`]) {
    return config.raw_val[`y_${data.years[yearIdx]}`]
  }

  if (config.raw_label) {
    let total = 0
    for (const key in data.d) {
      const n = data.m[key][yearIdx]
      const d = data.d[key][yearIdx]
      if (isNumeric(n) && isNumeric(d)) total += n * d
    }
    return total
  }
  return null
})
