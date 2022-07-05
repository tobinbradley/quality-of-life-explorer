<script>
  import {
    selectedData,
    selectedConfig,
    calcCounty,
    calcSelected,
    selectedNeighborhoods,
    yearIdx,
  } from "../store/store"
  import { formatNumber, isNumeric } from "./utils"
  import { equalIntervalBreaks } from 'simple-statistics'
  import { onMount } from "svelte"

  let tchart
  let dchart
  let ApexCharts
  let mounted = false

  onMount(async () => {
    const { default: apexcharts } = await import("apexcharts")
    ApexCharts = apexcharts
    mounted = true
  })

  // trend chart
  $: if (
    mounted &&
    $selectedData &&
    $selectedNeighborhoods &&
    $selectedData.years.length > 1
  ) {
    trendChart()
  } else {
    if (tchart) {
      tchart.destroy()
      tchart = null
    }
  }

  // histogram
  $: if (mounted && $selectedNeighborhoods && $selectedData && $yearIdx >= 0) {
    distributionChart()
  }

  function trendChart() {
    const countySeries = []
    $calcCounty.forEach((el, idx) => {
      countySeries.push({
        x: $selectedData.years[idx],
        y: el,
      })
    })

    // so we don't duplicate years
    const usedYears = []

    let options = {
      title: {
        text: $selectedConfig.title,
      },
      legend: {
        showForSingleSeries: true,
      },
      chart: {
        type: "line",
        height: "240px",
        zoom: {
          enabled: false,
        },
        toolbar: {
          export: {
            csv: {
              filename: $selectedConfig.title,
              headerCategory: "Year",
            },
            svg: {
              filename: $selectedConfig.title,
            },
            png: {
              filename: $selectedConfig.title,
            },
          },
        },
      },
      series: [
        {
          name: "County",
          data: countySeries,
        },
      ],
      xaxis: {
        type: "datetime",
        tooltip: {
          enabled: false,
        },
        labels: {
          datetimeFormatter: {
            year: "yyyy",
            month: "MMM yyyy",
            day: "dd MMM",
            hour: "HH:mm",
          },
        },
      },
      stroke: {
        curve: "smooth",
      },
      colors: ["#008FFB", "#DB2777"],
      yaxis: {
        min: 0,
        labels: {
          formatter: (value) =>
            formatNumber(value, $selectedConfig.format || null),
        },
      },
      tooltip: {
        x: {
          format: "yyyy",
        },
      },
    }

    if ($selectedNeighborhoods.length > 0) {
      const selectSeries = []
      $calcSelected.forEach((el, idx) => {
        if (el !== null) {
          selectSeries.push({
            x: $selectedData.years[idx],
            y: el,
          })
        }
      })
      options.series.push({
        name: "Selected",
        data: selectSeries,
      })
    }

    if ($selectedConfig.format && $selectedConfig.format === "percent") {
      options.yaxis.min = 0
      options.yaxis.max = 100
    }

    if (!tchart) {
      tchart = new ApexCharts(document.querySelector("#tchart"), options)
      tchart.render()
    } else {
      tchart.updateOptions(options)
    }
  }

  function distributionChart() {
    const binCount = 10
    const data = []

    const histDataArray = Object.values($selectedData.m).map(el => {
      if (el[$yearIdx] !== null) return el[$yearIdx]
    })

    const equalBreaks = equalIntervalBreaks(histDataArray, binCount)
    equalBreaks.shift()
    const equalBins= Array(binCount).fill(0)
    const equalSelectBins = Array(binCount).fill(0)

    for (const key in $selectedData.m) {
      equalBreaks.every((el, idx) => {
        if (!isNumeric($selectedData.m[key][$yearIdx])) return false

        if ($selectedData.m[key][$yearIdx] <= el) {
          equalBins[idx] += 1
          return false
        }
        return true
      })
    }

    $selectedNeighborhoods.forEach(n => {
      equalBreaks.every((el, idx) => {
        if (!$selectedData.m[n] || !isNumeric($selectedData.m[n][$yearIdx])) return false

        if ($selectedData.m[n][$yearIdx] <= el) {
          equalSelectBins[idx] += 1
          return false
        }
        return true
      })
    })

    equalBins.forEach((el, idx) => {
      const datum = {
        x: idx + 1,
        y: el,
      }

      if (equalSelectBins[idx] > 0) {
        datum.goals = [
          {
            name: "Selected",
            value: equalSelectBins[idx],
            strokeHeight: 3,
            strokeColor: "#DB2777",
          },
        ]
      }
      data.push(datum)
    })


    const options = {
      title: {
        text: `NPA Distribution, ${$selectedData.years[$yearIdx]}`,
        margin: 0,
        offsetY: 20,
      },
      series: [
        {
          name: "NPA Frequency",
          data: data,
        }
      ],
      chart: {
        height: 130,
        type: "bar",
        stacked: false,
        sparkline: {
          enabled: false,
        },
        toolbar: {
          offsetY: 20,
          tools: {
            download: true,
            selection: false,
            zoom: false,
            zoomin: false,
            zoomout: false,
            pan: false,
            reset: false,
          },
          export: {
            csv: {
              filename: $selectedConfig.title + " Histogram",
              headerCategory: "Year",
            },
            svg: {
              filename: $selectedConfig.title + " Histogram",
            },
            png: {
              filename: $selectedConfig.title + " Histogram",
            },
          },
        },
      },
      plotOptions: {
        bar: {
          columnWidth: "95%",
        },
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: false
      },
      yaxis: {
        show: false,
      },
      colors: ["#008FFB", "#DB2777"],
      xaxis: {
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          show: false
        }
      },
      grid: {
        show: false,
      },
      tooltip: {
        enabled: true,
        followCursor: true,
        marker: {
          show: false,
        },
        x: {
          show: false
        },

      },
    }

    if (!dchart) {
      dchart = new ApexCharts(document.querySelector("#dchart"), options)
      dchart.render()
    } else {
      dchart.updateOptions(options)
    }
  }
</script>


<div class="bg-white shadow-md p-2">
  <div id="tchart" class="pt-2" />
  <div id="dchart" class="pb-2" />
</div>
