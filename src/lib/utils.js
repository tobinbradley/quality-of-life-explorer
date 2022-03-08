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

  return Intl.NumberFormat("en-US", {
    maximumFractionDigits: decimals
  }).format(n)
}

// send download
export function download(payload, encoding = null, filename) {
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
