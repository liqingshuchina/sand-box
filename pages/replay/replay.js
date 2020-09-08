//logs.js
const util = require('../../utils/util.js')

Page({
  data: {
    receivedData:[],
    sandImages:[],
    currentData:[],
    status:'active',
    currentIndex:0,//即将播放的棋子在receiveData中的位置
    sandMaxHorizontal:5,
    timer:null,
    //回放速率
    speedArr:['1X', '2X', '3X'],
    speedIndex: 0,
    speed:1,//1,2,3
  },
  bindPickerChange(e){
    var speedIndex = e.detail.value;
    //更新速率
    this.setData({
      speedIndex,
      speed:speedIndex+1
    })
    this.beginReplay();
  },
  beginReplay(){
    clearInterval(this.data.timer);
    var duration = Math.floor(4000/this.data.speed) 
    var timer = setInterval(()=>{
      console.log(this.data.receivedData,this.data.currentIndex)
      var currentItem = this.data.receivedData[this.data.currentIndex]

      var placedIndex = ( currentItem.position[0]-1 ) * this.data.sandMaxHorizontal + currentItem.position[1]-1;

      var currentDataCopy = this.data.currentData

      //更新 棋子信息
      currentDataCopy[placedIndex].placed = true;
      currentDataCopy[placedIndex].type = currentItem.type;
      currentDataCopy[placedIndex].imgUrl = currentItem.src;

      this.setData({
        currentData:currentDataCopy
      })

      //更新到下一个
      if(this.data.currentIndex < this.data.receivedData.length-1){
        this.setData({
          currentIndex:++this.data.currentIndex
        })
      }else{
        //清楚timer
        clearInterval(this.data.timer)
      }
      
    },duration)
    this.setData({
      timer:timer
    })
  },
  pausePlay(){
    var status = ''
    if(this.data.status === 'active'){
      status = 'pause';
      clearInterval(this.data.timer);
    }else{
      status = 'active'
      this.beginReplay();
    }
    this.setData({
      status:status
    })
    console.log(this.data.status)
  },
  onLoad: function () {
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('sandReplayData', (data)=>{
      console.log(data)
      this.setData({
        currentData:data.initData,
        sandImages:data.sandImages,
        receivedData:data.pieceData
      })
      console.log(data.initData.map(item =>{ return {name:'xx'} }))
      this.beginReplay()
    })
  }
})
