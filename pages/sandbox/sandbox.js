//logs.js
import * as echarts from '../../ec-canvas/echarts';
const util = require('../../utils/util.js')
function getReportWords(countMap){
  var reportMap = [
    // 1
       [
         { minVal:5,report:'绿色是健康的象征，你的生活充满了健康的颜色；'},
         { minVal:1,report:'少数的绿色是你的选择，你的生活比较健康向上'},
         { minVal:0,report:'你可能处于一种亚健康状态，适量的调节自己的心情格外的重要；'},
       ],
       // 2
       [
         { minVal:5,report:'你是一个向往自由的人，对远方的世界充满了好奇；'},
         { minVal:1,report:'你是一个喜欢自由的人，人生对你而言充满了惊喜；'},
         { minVal:0,report:'你不喜欢充满变数的世界，对你而言，安稳才是最重要的；'},
       ],
       // 3
       [
         { minVal:10,report:'你的心理防备意识比较强，对陌生人抱有一定的抵触心理；'},
         { minVal:3,report:'你有一定的心理防备意识，对待陌生人能比较友好的相处；'},
         { minVal:0,report:'你的内心深处基本上没有对他人的防备，总是热心积极的帮助每一个需要帮助的人；'},
       ],
       // 4
       [
         
         { minVal:10,report:'你的性格稍微有些内向，适当的结交新的朋友对你或许是不错的选择；'},
         { minVal:1,report:'你是一个友善的人，总能跟朋友相处的比较愉快；'},
         { minVal:0,report:'你的性格稍微有些内向，适当的结交新的朋友对你或许是不错的选择；'},
       ],
       // 5
       [
         { minVal:5,report:'生活中的你拥有较强的动手能力，你是一个很不错的实践者；'},
         { minVal:1,report:'你的动手能力比较强，对一切未知事物保持着充分的好奇心理；'},
         { minVal:0,report:'你是一个喜欢动脑的人，你喜欢观察生活中的一切事物，并且拥有较强的求知欲；'}
       ]
       ]
       var reportWords = "";


       for(let key in countMap){
         let currentCount = countMap[key];
         var firstnumber=key.substr(0, 1);
          for(let i=0,len=reportMap[firstnumber*1-1].length;i<len;i++){
             if(currentCount >= reportMap[firstnumber*1-1][i].minVal){
             reportWords +=reportMap[firstnumber*1-1][i].report
           }
          }
     }
  return reportWords
}
function getRadarData(radarMap){
  return [
    radarMap['stability'],
    radarMap['power'],
    radarMap['flexibility'],
    radarMap['organizational_power'],
    radarMap['realm'],
  ]
}
const app = getApp()
Page({
  data: {
    end:false,
    currentIndex:0,

    roundOver:false,
    durationTime:1200,
    //持续时间
    durationTimeText:"",

    //各类棋子数量统计
    boxItemCounts:[],
    boxData:[],//初始化的棋盘数据用来绘制棋盘
    //报告页面显示控制
    dialogOpen:false,
    dialogDisplay:'none',
    //报告数据
    
    reportWords:"",
    reportRadaData:[]
  
  },
  handleRefresh(){
    let socket = app.globalData.socket;
    let PARM = app.globalData.sandboxIndex;
    socket.send({
      data:JSON.stringify({"CMD": "REFRESH", "PARM": PARM})
    })
  },
  getSandItemByPositionAndCode(position,imgCode){
    let index = this.getIndexPositionFromColRow(36,18,position);
    let item = {
      src:"../../images/qizi/"+ imgCode +".png",
      placed:true
    }
    //棋子拔掉，从棋盘上将其删除
    if(imgCode == 0){
      item.placed = false;
      item.src = ""
    } 
    
    return {
      index:index,
      item:item
    }
  },
  
  listenMessage(){
    let socket = app.globalData.socket;
    socket.onMessage(e=>{
      let data = JSON.parse(e.data);
      if(data.CMD === 'MOVE'){
        //棋子移动
        let params = data.PARM.split(',');
        let pos = [params[1],params[2]]
        let imgCode = params[3]

        let result = this.getSandItemByPositionAndCode(pos,imgCode)

        let boxDataCopy = this.data.boxData;
        boxDataCopy[result.index] = result.item;
        this.setData({
          boxData:boxDataCopy
        })
        //棋子汇总信息
        let boxItemCounts = [];
        for(let imgCode in data.PROPS){
          //过滤掉code为0的棋子，code为0归类为被拔掉的棋子
          if( imgCode == 0 ){
            continue;
          }
          boxItemCounts.push({
            src:"../../images/qizi/"+ imgCode +".png",
            count: data.PROPS[imgCode]
          })
        }
        this.setData({
          boxItemCounts:boxItemCounts
        })
      }else if(data.CMD == 'REFRESH' && data.STATUS == 0){
        //刷新棋盘信息
        this.initBoxData();//清空棋盘信息
        let itemArr = data.PARM;
        let boxDataCopy = this.data.boxData;
        itemArr.forEach(item=>{
          let position = [item[0],item[1]];
          let imgCode = item[2]
          let currentItem = this.getSandItemByPositionAndCode(position,imgCode)
          boxDataCopy[currentItem.index] = currentItem.item
        })
        this.setData({
          boxData:boxDataCopy
        })
      }else if(data.CMD == 'CLEAR'){
        var objData=data.NUMBER;
var chartData=[];
for(let key in objData){
	chartData.push(objData[key]);
}
        this.setData({
          roundOver:true,
          reportWords:getReportWords(data.FUZZY_COUNT),
          reportRadaData:chartData
          
        })
      }
    })
  },

  // restart(){
  //   this.setData({
  //     dialogDisplay:'none',
  //     dialogOpen:false
  //   })
  // },
  //导航到测试结果页面
  openReportPage(){
    var that = this;
    let chrdata=JSON.stringify(that.data.reportRadaData);
    wx.navigateTo({
      url: '../test-result/test-result?words='+that.data.reportWords+'&chartData='+chrdata
    })
    // this.setData({
    //   dialogDisplay:'block',
    //   dialogOpen:true
    // })
    // this.renderChart(this.data.reportRadaData)
  },

  getTimeTextFromSeconds(seconds){
    var timeText = "";
  
    //小时部分
    var hour = Math.floor(seconds / 3600)

    if(hour > 9){
      timeText += (hour +":")
    }else{
      timeText += ("0"+hour+":")
    }

    seconds = seconds % 3600

    //分钟
    var minute = Math.floor(seconds / 60)
    if(minute > 9){
      timeText += (minute +":")
    }else{
      timeText += ("0"+minute+":")
    }

    seconds = seconds % 60

    //秒
    if(seconds > 9){
      timeText += seconds 
    }else{
      timeText += ("0"+seconds)
    }
    return timeText
  },
  // 初始化棋盘方法
  initBoxData(){
    //36*18 = 648
    let result = [];
    for(let i = 0;i<648;i++){
      result.push({
        placed:false,
        src:""
      })
    }
    //设置到data
    this.setData({
      boxData:result
    })
  },
  getIndexPositionFromColRow(Maxx,Maxy,pos){
    let currentX = pos[0]
    let currentY = pos[1]
    return (currentY-1)*Maxx + (currentX-1)
  },
  onResize:function(res) {
    if(res.deviceOrientation=='landscape'){
      wx.hideTabBar()
    }else{
      wx.showTabBar()
    }
  },
  

  onLoad: function () {
 
    this.initBoxData()
    this.listenMessage()
    this.handleRefresh()
  }
})
