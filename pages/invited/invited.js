// pages/invite/invite.js
var url = getApp().globalData.Url;
var domainUrl = getApp().globalData.domainUrl;
var userInfo = wx.getStorageSync('userInfo')
console.log(userInfo)
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
    userOrderStatus: '',
    utm: 'self',
    group_id:'',
    group_member_id:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("invited.js")
    console.log(options)
    if ('com_id' in options) {
      this.getProductDetail(options.com_id)
    } else {
      this.getProductDetail('')
    }
    if ('utm' in options) {
      this.setData({ 'utm': options.utm })
    }
    if('group_id' in options){
      this.setData({'group_id':options.group_id})
    }
    // this.getProductDetail(options.com_id);
    // this.setData({ commodity_id: options.com_id });
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
  // onShareAppMessage: function () {

  // },
  getProductDetail: function (id) {
    var that = this;
    wx.request({
      url: url + '/wx/getOrderCommodity',
      data: {
        com_id: id,
      },
      success: function (rst) {
        var content = rst.data
        console.log('detail')
        console.log(content)
        that.setData({ 'commodity_id': content.id })
        // that.checkUserGroup(content.id)

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
        'openid': openid,
        'utm': 'other',
        'group_id':that.data.group_id
      },
      success: function (rst) {
        var content = rst.data;
        console.log(content);
        wx.navigateTo({
          url: '/pages/inviteDetail/index?com_id=' + that.data.commodity_id + '&status=1&orderNo=' + content.orderNo+'&group_id='+that.data.group_id+'&group_member_id='+content.groupMemberId,
        })
      }
    })
  },
  checkUserOrder: function (com_id) {
    wx.request({
      url: url + '/wx/checkUserOrder',
      data: {
        openid: openid,
        com_id: com_id,
        identity: '1'
      },
      success: function (rst) {

      }
    })
  },
  checkUserGroup: function (com_id) {
    wx.request({
      url: url + '/wx/checkUserGroup',
      data: {
        com_id: com_id,
        openid: openid
      },
      success: function (rst) {
        var self = rst.data.self.length;
        var other = rst.data.other.length;
        console.log(self)
        console.log(other)

        if (self && !other) {
          console.log('self')
          wx.redirectTo({
            url: '/pages/orderList/index?utm=self',
          })
        } else if (!self && other) {
          console.log('other')

          wx.redirectTo({
            url: '/pages/orderList/index?utm=other',
          })
        }

      }
    })
  }



})