<script>
  import {
    selectedData,
    selectedConfig,
    calcCounty,
    calcSelected,
    selectedNeighborhoods,
    breakCkmeans,
    yearIdx,
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
      // .then(e => {
      //   const lastXlabel = document.querySelector('#tchart .apexcharts-xaxis-label:last-child tspan')
      //   if (lastXlabel) {
      //     lastXlabel.innerHTML = $selectedData.years[$selectedData.years.length - 1]
      //   }
      // })
    } else {
      tchart.updateOptions(options)
      // .then(e => {
      //   const lastXlabel = document.querySelector('#tchart .apexcharts-xaxis-label:last-child tspan')
      //   if (lastXlabel) {
      //     lastXlabel.innerHTML = $selectedData.years[$selectedData.years.length - 1]
      //   }
      // })
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
        y: el.length + 1,
      }

      if (el.some((r) => selecteVals.indexOf(r) >= 0)) {
        datum.goals = [
          {
            name: "Expected",
            value: 0,
            strokeHeight: 4,
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
          name: "Actual",
          data: data,
        },
      ],
      chart: {
        height: 100,
        type: "bar",
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
      yaxis: {
        show: false,
      },
      xaxis: {
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        floating: true,
      },
      grid: {
        show: false,
      },
      tooltip: {
        enabled: false,
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
  <div id="dchart" class="px-3 pb-2" />
</div>
