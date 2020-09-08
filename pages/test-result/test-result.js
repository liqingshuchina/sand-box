//logs.js
const util = require('../../utils/util.js');
import * as echarts from '../../ec-canvas/echarts';
const app = getApp()
Page({
  data: {
    reportWords:'',
    ec: {
      // 将 lazyLoad 设为 true 后，需要手动初始化图表
      lazyLoad: true
    },
    chart: null,
  
     

  },
  
  onLoad: function (options) {
    var chartArr=JSON.parse(options.chartData);
    this.setData({
      reportWords:options.words
    })
     // 获取组件
     var _this=this;
     setTimeout(function(){
      _this.ecComponent = _this.selectComponent('#mychart-dom-radar');
      _this.renderChart(chartArr);

    },500)
     

     
  },
  onReady: function () {
    
  },
  //绘制图标
  renderChart: function (optionData) {
    this.ecComponent.init((canvas, width, height, dpr) => {
      // 获取组件的 canvas、width、height 后的回调函数
      // 在这里初始化图表
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr // new
      });
      //set options
      var option = {
        backgroundColor: "#ffffff",
        color: ["#37A2DA", "#FF9F7F"],
        xAxis: {
          show: false
        },
        yAxis: {
          show: false
        },
        radar: {
          // shape: 'circle',
          indicator: [
            {
              name: '稳定性',
              max: 100
            },
            {
              name: '力量',
              max: 100
            },
            {
              name: '灵活度',
              max: 100
            },
            {
              name: '组织力',
              max: 100
            },
            {
              name: '境界',
              max: 100
            }
          ]
        },
        series: [{
          name: '报告',
          type: 'radar',
          data: [{
            value: optionData,
           
            name: '报告'
          }]
        }]
      }
      chart.setOption(option);

      // 将图表实例绑定到 this 上，可以在其他成员函数（如 dispose）中访问
      this.chart = chart;

      this.setData({
        isLoaded: true,
        isDisposed: false
      });

      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return chart;
    });
  },
  restart(){
    wx.switchTab({url:'../sandbox/sandbox'})
  }
  
})
