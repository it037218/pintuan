// pages/invite/invite.js
var url = getApp().globalData.Url;
var domainUrl = getApp().globalData.domainUrl;
var userInfo = wx.getStorageSync('userInfo')
console.log(userInfo)
var openid = null

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrls: '',
    productInfo: {},
    productStatus: 0,
    loginStatus: false,
    userStatus: 0,
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
      openid = wx.getStorageSync('openid')
      if ((!openid || openid.length == 0) && !getApp().openidReadyCallback) {
          getApp().openidReadyCallback = function (inOpenid) {
              openid = inOpenid;
          }
      }
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
      this.getOrderInfoByGroupId(options.group_id)

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
      var that = this;
      wx.request({
          url: 'https://pintuan.guangxing.club/pintuan/guangxing/wx/login_confirm',
          data: {
              avatarUrl: e.detail.userInfo.avatarUrl,
              nickname: e.detail.userInfo.nickName,
              openid: openid
          },
          success: function () {
              that.setData({
                  'userStatus': '1'
              })
              that.payForOrder();
          }
      })
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      if (this.userInfoReadyCallback) {
          this.userInfoReadyCallback(res)
      }
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
        if(content.success == 1){
        wx.navigateTo({
          url: '/pages/invitedDetail/index?com_id=' + that.data.commodity_id + '&status=1&orderNo=' + content.orderNo+'&group_id='+that.data.group_id+'&group_member_id='+content.groupMemberId,
        })
        }else{
            wx.showToast({
                title: '参团失败',
                duration:2000
            })
        }
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
  },
  formSubmit: function (e) {
    var app = getApp();
    app.submitFormId(e.detail.formId);
  },
  getOrderInfoByGroupId: function (group_id) {

    var that = this;
    wx.request({
      url: url + '/wx/getOrderInfoByGroupId',
      data: {
        openid: openid,
        group_id: group_id
      },
      success: function (rst) {
        var content = rst.data
        console.log('orderInfoByGroupId')
        console.log(content)
        if (content.data != null) {
          var orderStatus = content.data.pay_status
          that.setData({
            'orderStatus': orderStatus
          })
        }
      }
    })
  },
  chckUserStatus: function (openid) {
      var that = this;
      wx.request({
          url: url + '/wx/checkUserStatus',
          data: {
              openid: openid
          },
          success: function (rst) {
              that.setData({
                  'userStatus': rst.data.status
              })
          }

      })

  }
})