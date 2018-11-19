// pages/user/user.js
var url = getApp().globalData.Url;
var openid = wx.getStorageSync('openid')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    'userInfo': {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getUserDetail(options.openid)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */

  getUserDetail: function (openid) {
    var that = this;
    wx.request({
      url: url + '/wx/getUserInfo',
      data:{
        openid:openid
      },
      success: function (rst) {
        var content = rst.data.data;
        var info = {};

        console.log(content.phone)
        info.tel = content.phone
        info.wx_id = content.wx_id
        info.address = content.address
        info.nickname = content.nickname
        info.avatar = content.avatar
        that.setData({ userInfo:info})
      }
    })

  }
})