//app.js
App({
  onLaunch: function () {
    var that = this;
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (res.code) {
          //发起网络请求
          wx.request({
            url: 'https://pintuan.guangxing.club/pintuan/guangxing/wx/login',
            data: {
              code: res.code
            },
            success : function(rst){
              var content = rst.data;
              if(content.success == 1){
                var user_openid = content.content.openid;
                wx.setStorageSync('userInfo', content.content)
                wx.setStorageSync('openid', user_openid)
              }
            }
          })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              wx.request({
                url: 'https://pintuan.guangxing.club/pintuan/guangxing/wx/login_confirm',
                data:{
                  avatarUrl:res.userInfo.avatarUrl,
                  nickname:res.userInfo.nickName,
                  openid:wx.getStorageSync('openid')
                },
                success:function(){

                }
              })
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
              
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null,
    Url:'https://pintuan.guangxing.club/pintuan/guangxing',
    domainUrl:'https://pintuan.guangxing.club',
    openid:wx.getStorageSync('openid')
  }
})