// pages/invite/invite.js
var url = getApp().globalData.Url;
var domainUrl = getApp().globalData.domainUrl;
var userInfo = wx.getStorageSync('userInfo')
var openid = wx.getStorageSync('openid')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrls: '',
    productInfo: {},
    productStatus: 0,
    loginStatus: false,
    userStatus: userInfo.status,
    commodity_id: '',
    userOrderStatus:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({ 'productStatus': options.status })
    this.getProductDetail(options.com_id);
    this.setData({ commodity_id: options.com_id });
    this.checkUserOrder(options.com_id)
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
  onShareAppMessage: function () {

  },
  getProductDetail: function (id) {
    var that = this;
    wx.request({
      url: url + '/wx/getProductInfo',
      data: {
        com_id: id,
        openid: openid
      },
      success: function (rst) {
        var content = rst.data
        content.images = domainUrl + content.images
        that.setData({ productInfo: content })
      }
    })
  },

  onChangeShowState: function () {
    var state = this.data.showRuleState;
    this.setData({ 'showRuleState': !state, 'showRuleContent': !state })

  },
  bindGetUserInfo: function (e) {
    console.log(e.detail.userInfo)
  },
  payForOrder: function () {
    var that = this;
    wx.request({
      url: url + '/wx/createOrder',
      data: {
        'commodity_id': that.data.commodity_id,
        'openid': openid
      },
      success: function (rst) {
        var content = rst.data;
        wx.navigateTo({
          url: '/pages/inviteDetail/index?com_id='+that.data.commodity_id+'&status=1&orderNo=' + content.orderNo,
        })
      }
    })
  },
  checkUserOrder:function(com_id){
    console.log(com_id)
  }



})