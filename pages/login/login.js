//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    // motto: 'Hello World',
    // hasUserInfo: false,
    // canIUse: wx.canIUse('button.open-type.getUserInfo'),
    loading:true,
    user: app.globalData.user ,
    showMsg:false,
    msgContent:"用户名或密码不能为空！",
    msgBtns: [{text: '确定'}],
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  formSubmit(e){
    //非空验证
    if(!e.detail.value.name || !e.detail.value.password){
      this.setData({
        showMsg:true
      })
      return
    }
    //后端验证
    let user = e.detail.value;
    this.validateUser(user).then(res=>{
      if(res === true){
        //登录成功,本地存储
        if(user.remember.length > 0){
          //记录正确的账户名和密码
          wx.setStorageSync('user', e.detail.value)
        }else{
          //清除记录
          wx.setStorageSync('user', '')
        }
        //跳转页面
        wx.switchTab({
          url: '../sandbox/sandbox'
        })
      }else{
        this.setData({
          showMsg:true,
          msgContent:'登录失败'
        })
      }
    })
  },
  tapDialogButton(){
    this.setData({
      showMsg:false
    })
  },
  loginWithSocket(user){
    let data = JSON.stringify({
      "CMD": "LOGIN",
      "PARM":{
        user
      }
    })
    return new Promise((res,rej)=>{
      const socketTask = wx.connectSocket({
        url: "wss://sandbox.condata.cn:1234/ws",
      })
      socketTask.onOpen(e=>{
        socketTask.send({
          data
        });
      })
      socketTask.onMessage(e=>{
        res({
          data:JSON.parse(e.data),
          socket:socketTask
        });
      })
    })
  },
  validateUser(user){
    return this.loginWithSocket({
      'username':user.name,
      'password':user.password
    }).then(options=>{
      let socket = options.socket;
      let data = options.data;
      if(data.STATUS === 0){
        //登录成功，记录用户信息、连接信息到全局
        app.globalData.user = user
        app.globalData.socket = socket
        app.globalData.sandboxIndex = data.PARM
 
        return true
      }else{
        return false;
      }
    })
  },
  onLoad: function () {
    let user = app.globalData.user;
    //本地存储有之前登录信息直接跳转
    if(user != null){
      this.validateUser(user).then(res=>{
        //去除加载效果
        this.setData({
          loading:false
        })
        if(res === true){
          wx.switchTab({
            url: '../sandbox/sandbox'
          })
        }else{
          //清除记录
          wx.setStorageSync('user', '')
          this.setData({
            showMsg:true,
            msgContent:'登录信息失效，请重新登录！'
          })
        }
      })
    }else{
      this.setData({
        loading:false
      })
    }
  }
})
