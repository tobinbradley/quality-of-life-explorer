<script>
  import {
    selectedData,
    selectedConfig,
    calcCounty,
    calcSelected,
    selectedNeighborhoods,
    breakCkmeans,
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
  $: if (mounted && $breakCkmeans) {
    distributionChart()
  }

  function trendChart() {
    let options = {
      title: {
        text: $selectedConfig.title,
      },
      legend: {
        showForSingleSeries: true,
      },
      chart: {
        type: "line",
        toolbar: {
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
          data: $calcCounty,
        },
      ],
      xaxis: {
        categories: $selectedData.years,
      },
      stroke: {
        curve: "smooth",
      },
      yaxis: {
        min: 0,
        labels: {
          formatter: (value) =>
            formatNumber(value, $selectedConfig.format || null),
        },
      },
    }

    if ($selectedNeighborhoods.length > 0) {
      options.series.push({
        name: "Selected",
        data: $calcSelected,
      })
    }

    if ($selectedConfig.format && $selectedConfig.format === "percent") {
      //options.yaxis.min = 0
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
    const histGenerator = bin()
    const histData = histGenerator($breakCkmeans.flat())
    const data = []

    histData.forEach((el) => {
      data.push(el.length)
    })

    var options = {
      title: {
        text: "Distribution",
      },
      series: [
        {
          name: "Frequency",
          data: data,
        },
      ],
      chart: {
        type: "bar",
        height: 60,
        sparkline: {
          enabled: true,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "90%",
          endingShape: "rounded",
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"],
      },
      xaxis: {
        categories: [""],
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        // y: {
        //   formatter: function (val) {
        //     return "$ " + val + " thousands"
        //   }
        // }
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
  <div id="tchart" />
  <div id="dchart" class="px-3 pb-2" />
</div>
