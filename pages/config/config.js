//logs.js
const util = require('../../utils/util.js')

Page({
  data: {
    logs: [],
    currentTabIndex:0,
    tabs:[
      "沙盘配置",
      "修改密码",
      "关于"
    ],
    list: [
      {
        "text": "沙盘",
        // "iconPath": "../../images/tabbar_icon_chat_default.png",
        // "selectedIconPath": "../../images/tabbar_icon_chat_active.png"
      },
      {
        "text": "设置",
        // "iconPath": "../../images/tabbar_icon_setting_default.png",
        // "selectedIconPath": "../../images/tabbar_icon_setting_active.png"
      }
    ]
  },
  // tab栏变动
  handleTabClick(e){
    // const index = e.detail.index
    var currentIndex = e.target.dataset.index;
    if(currentIndex === undefined){
      return;
    }
    this.setData({
      currentTabIndex:currentIndex
    })

  },
  // 底部导航栏改动
//   tabChange(e) {
//     console.log('tab change', e)
//     var text = e.detail.item.text;
//     var url = "/pages/sandbox/sandbox"
//     if(text === '设置'){
//         url = "/pages/config/config"
//     }
//     wx.redirectTo({
//       url:url,
//     })
// },
  onLoad: function () {
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map(log => {
        return util.formatTime(new Date(log))
      })
    })
  }
})
