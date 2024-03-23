<template>
  <v-chart class="chart" :option="option" :autoresize="true" />
</template>

<script setup>
import { use } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { LegendComponent, ToolboxComponent } from 'echarts/components'
import { SVGRenderer } from 'echarts/renderers'
import VChart, { THEME_KEY } from 'vue-echarts'
import { ref, provide } from 'vue'
// import colorInsightData from '@/views/collection/mockData.js/colorInsight'

use([LegendComponent, ToolboxComponent, PieChart, SVGRenderer])

provide(THEME_KEY, 'default')

const props = defineProps({
  colorInsightData: {
    type: Object,
    required: true
  }
})

const option = ref({
  legend: {
    top: 'bottom'
  },
  toolbox: {
    show: true,
    feature: {
      mark: { show: true },
      saveAsImage: { show: true }
    }
  },
  series: [
    {
      name: 'Nightingale Chart',
      type: 'pie',
      radius: [20, 85],
      center: ['50%', '50%'],
      roseType: 'area',
      itemStyle: {
        borderRadius: 8
      },
      labelLine: {
        show: true,
        length: 5,
        length2: 15,
        smooth: true
      },
      data: props.colorInsightData.insights
        .filter((insight) => insight.hue !== 'White')
        .map((insight) => ({
          value: insight.frequency,
          name: insight.hue
        })),
      color: props.colorInsightData.insights
        .filter((insight) => insight.hue !== 'White')
        .map((insight) => {
          const colors = insight.hex_colors
          return {
            type: 'linear',
            x: 0,
            y: 0.8,
            r: 0.2,
            colorStops: colors.map((color, index) => ({
              offset: colors.length > 1 ? index / (colors.length - 1) : 0,
              color: color
            })),
            global: false
          }
        })
    }
  ]
})
</script>

<style scoped>
.chart {
  width: 600px;
  height: 400px;
  padding: 10px;
}
</style>
