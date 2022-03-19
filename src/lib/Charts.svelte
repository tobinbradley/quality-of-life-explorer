<script>
  import {
    selectedData,
    selectedConfig,
    calcCounty,
    calcSelected,
    selectedNeighborhoods,
    breakCkmeans,
    yearIdx
  } from "../store/store"
  import { formatNumber } from "./utils"
  import { bin } from "d3-array"
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
    let options = {
      title: {
        text: $selectedConfig.title
      },
      legend: {
        showForSingleSeries: true
      },
      chart: {
        type: "line",
        height: "220px",
        toolbar: {
          tools: {
            download: true,
            selection: false,
            zoom: false,
            zoomin: false,
            zoomout: false,
            pan: false,
            reset: false
          },
          export: {
            csv: {
              filename: $selectedConfig.title,
              headerCategory: "Year"
            },
            svg: {
              filename: $selectedConfig.title
            },
            png: {
              filename: $selectedConfig.title
            }
          }
        }
      },
      series: [
        {
          name: "County",
          data: $calcCounty
        }
      ],
      xaxis: {
        categories: $selectedData.years,
        tooltip: {
          enabled: false
        }
      },
      stroke: {
        curve: "smooth"
      },
      colors: ["#008FFB", "#DB2777"],
      yaxis: {
        min: 0,
        labels: {
          formatter: (value) =>
            formatNumber(value, $selectedConfig.format || null)
        }
      }
    }

    if ($selectedNeighborhoods.length > 0) {
      options.series.push({
        name: "Selected",
        data: $calcSelected
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
    const data = []
    const sdata = []

    // bin the current year
    const histDataArray = []
    for (const key in $selectedData.m) {
      const val = $selectedData.m[key][$yearIdx]
      if (val !== null) histDataArray.push(val)
    }

    const histogram = bin().thresholds(10)
    const bins = histogram(histDataArray)

    // make array for selected values
    const selecteVals = []
    $selectedNeighborhoods.forEach((el) => {
      selecteVals.push($selectedData.m[el][$yearIdx])
    })

    bins.forEach((el, idx) => {
      const datum = {
        x: idx + 1,
        y: el.length + 1
      }

      if (el.some((r) => selecteVals.indexOf(r) >= 0)) {
        datum.goals = [
          {
            name: "Selected",
            value: 0,
            strokeHeight: 4,
            strokeColor: "#DB2777"
          }
        ]
      }

      data.push(datum)
    })

    const options = {
      title: {
        text: `NPA Distribution, ${$selectedData.years[$yearIdx]}`,
        margin: 0,
        offsetY: 20
      },
      series: [
        {
          name: "Frequency",
          data: data
        }
      ],
      chart: {
        height: 100,
        type: "bar",
        sparkline: {
          enabled: false
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
            reset: false
          },
          export: {
            csv: {
              filename: $selectedConfig.title + ' Histogram',
              headerCategory: "Year"
            },
            svg: {
              filename: $selectedConfig.title + ' Histogram'
            },
            png: {
              filename: $selectedConfig.title + ' Histogram'
            }
          }
        }
      },
      plotOptions: {
        bar: {
          columnWidth: "95%"
        }
      },
      dataLabels: {
        enabled: false
      },
      yaxis: {
        show: false
      },
      xaxis: {
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        },
        floating: true
      },
      grid: {
        show: false
      },
      tooltip: {
        enabled: false
      }
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
  <div id="dchart" class="px-3 pb-2" />
</div>
