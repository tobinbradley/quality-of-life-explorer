// return true if convertable to number
export function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n)
}

// format numbers
export function formatNumber(n, format = null, decimals = 0) {
  if (!isNumeric(n)) return "--"

  if (format === "money") {
    return Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n)
  }
  if (format === "percent") {
    return Intl.NumberFormat("en-US", {
      style: "percent",
      maximumFractionDigits: 1
    }).format(n / 100)
  }
  if (format === "short") {
    return Intl.NumberFormat('en-US', { notation: "compact",  maximumFractionDigits: 1}).format(n)
  }

  return Intl.NumberFormat("en-US", {
    maximumFractionDigits: decimals
  }).format(n)
}

// calc raw values
export function calcRaw(data, config, county = false, selected = null) {
  const raw = []

  data.years.forEach((year, yearIdx) => {
    // short circuit if override present
    if (county && config.raw_val && config.raw_val[`y_${data.years[yearIdx]}`]) {
      raw.push(config.raw_val[`y_${data.years[yearIdx]}`])
    } else {

      let total = 0
      for (const key in data.d) {
        const n = data.m[key][yearIdx]
        const d = data.d[key][yearIdx]
        if (isNumeric(n) && isNumeric(d) && ((selected && selected.indexOf(key) !== -1) || !selected)) total += n * d
      }
      raw.push(total)
    }
  })

  return raw
}

// calculate agg values
export function calcAggregate(data, config, county = false, selected = null) {
  const agg = []

  data.years.forEach((year, yearIdx) => {
    // short circuit if override present
    if (county && config.world_val && config.world_val[`y_${data.years[yearIdx]}`]) {
      agg.push(config.world_val[`y_${data.years[yearIdx]}`])
    }
    else if (config.sum) {
      // handle sum

      let total = 0
      for (const key in data.m) {
        const yearval = data.m[key][yearIdx]
        if (isNumeric(yearval) && ((selected && selected.indexOf(key) !== -1) || !selected)) total += yearval
      }
      agg.push(total === 0 ? null : total)
    } else {

      if (data.m && data.d) {
        let n = 0
        let d = 0
        for (const key in data.m) {
          const mval = data.m[key][yearIdx]
          const dval = data.d[key][yearIdx]
          if (isNumeric(mval) && isNumeric(dval) && ((selected && selected.indexOf(key) !== -1) || !selected)) {
            d = d + dval
            n = n + mval * dval
          }
        }
        agg.push(n / d)
      }
    }
  })
  return agg
}

// send download
export function sendDownload(payload, encoding = null, filename) {
  const downloadLink = document.createElement("a")

  if (encoding) {
    downloadLink.href = `${encoding}base64,${btoa(payload)}`
  } else {
    downloadLink.href = payload
  }
  downloadLink.download = `${filename}`
  document.body.appendChild(downloadLink)
  downloadLink.click()
  document.body.removeChild(downloadLink)
}
