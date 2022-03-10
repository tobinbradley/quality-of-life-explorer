<script>
  import { selectedData, selectedConfig, calcCounty, calcSelected, selectedNeighborhoods } from '../store/store'
  import { isNumeric, formatNumber } from "./utils"
  import ApexCharts from 'apexcharts'

  let chart

  // TODO: chart line colors

  $: {
    if (chart && $selectedNeighborhoods && $selectedData && $selectedData.years.length > 1) {
      renderChart()
    } else {
      if (chart) {
        chart.destroy()
        chart = null
      }
    }
  }

  
  function renderChart() {
    let options = {
      title: {
        text: $selectedConfig.title
      },
      legend: {
        showForSingleSeries: true
      },
      chart: {
        type: 'line',
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
              headerCategory: 'Year'
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
          name: 'County',
          data: $calcCounty
        }
      ],
      xaxis: {       
        categories: $selectedData.years
      },
      stroke: {
        curve: 'smooth'
      },
      yaxis: {
        labels: {
          formatter: value => formatNumber(value, $selectedConfig.format || null)
        }
      }
    }

    if ($selectedNeighborhoods.length > 0) {
      options.series.push(
        {
          name: 'Selected',
          data: $calcSelected
        }
      )
    }

    if ($selectedConfig.format && $selectedConfig.format === "percent") {
      options.yaxis.min = 0
      options.yaxis.max = 100
    }

    if (!chart) { 
    chart = new ApexCharts(document.querySelector("#tchart"), options);
    chart.render();
    } else {
      chart.updateOptions(options)
    }
  }

  function initChart(node) {
    if ($selectedData && $selectedData.years.length > 1) renderChart()
  }
    
</script>

{#if $selectedData && $selectedData.years.length > 1}
<div class="bg-white shadow-md p-2">
  <div id="tchart" use:initChart></div>
</div>
{/if}