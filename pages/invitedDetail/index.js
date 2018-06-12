var url = getApp().globalData.Url ////dd;/
var userInfo = wx.getStorageSync('userInfo')
var openid = wx.getStorageSync('openid')
var domainUrl = getApp().globalData.domainUrl;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    'showRuleState': false,
    'showRuleContent': false,
    'orderStatus': 2000,
    'commodityInfo': {},
    'orderNo': '',
    'userInfo': {},
    'address': {
      'prince': '',
      'city': '',
      'district': '',
      'street': '',
      'id': ''
    },
    'memberList': [],
    'com_id': '',
    'groupNumber': 0,
    'memberNumber': 0,
    'showShare': false,
    'shareImgUrl': '',
    'group_id':'',
    'group_member_id':'',
    'name': '',
    'mobile': '',
    'wx_id': '',
    'address_id': '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('invtedDetail')
    console.log(options)
    this.getCommodityInfo(options.com_id)
    this.setData({
      'com_id': options.com_id
    })
    if('order_no' in options){
      this.setData({ 'order_no': options.order_no })
      this.getOrderInfo(options.orderNo)
    }
    this.getUserInfo()
    if ('group_id' in options) {
      this.setData({ 'group_id': options.group_id })
      this.getGroupMember(options.group_id)
    
    }
    if('group_member_id' in options){
      this.setData({ 'group_id': options.group_id, 'group_member_id': options.group_member_id })
    }
    this.getAllGroupNumber(options.com_id)
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
    this.getUserInfo()

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
  onShareAppMessage: function (res) {
    console.log(res)
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    var shareImgUrl = this.data.shareImgUrl + "?v=3"
    var that = this;
    return {
      title: '一起开团吧',
      path: 'pages/invitedDetail/index?com_id=' + that.data.com_id+'&group_id='+that.data.group_id,
      imageUrl: shareImgUrl
    }
  },
  shareToFriend: function () {
    this.setData({ 'showShare': true })
  },
  hideShare: function () {
    this.setData({ 'showShare': false })
  },
  shareToApp: function () {
    wx.showShareMenu({
      withShareTicket: true
    })
  },
  shareToTimeLine: function () {

  },
  onChangeShowState: function () {
    var state = this.data.showRuleState;
    this.setData({
      'showRuleState': !state,
      'showRuleContent': !state
    })
  },
  getCommodityInfo: function (com_id) {
    var that = this;
    wx.request({
      url: url + '/wx/getOrderCommodity',
      data: {
        com_id: com_id
      },
      success: function (rst) {
        console.log('commodityInfo')
        console.log(rst.data)
        var content = rst.data;
        content.images = domainUrl + content.path;
        that.setData({ 'shareImgUrl': content.images })
        that.setData({
          'commodityInfo': rst.data
        })
      }
    })
  },
  getUserInfo: function () {
    var that = this;
    wx.request({
      url: url + '/wx/getUserDetail',
      data: {
        openid: openid
      },
      success: function (rst) {
        var content = rst.data;
        if (content.success == 1) {
          var userInfo = content.data.userInfo;
          var address = content.data.address;
          that.setData({
            userInfo: userInfo
          })
          if (userInfo) {
            that.setData({
              name: userInfo.name,
              mobile: userInfo.mobile,
              wx_id: userInfo.wx_id

            })
          }
          console.log('address')
          console.log(address)
          if (address.id) {
            console.log(11111111111)
            that.setData({
              address: address,
              address_id: address.id
            })
          }

        }
      }
    })

  },
  editAddress: function (e) {
    console.log(e)
    var address_id = e.target.dataset.id;
    console.log(address_id)
    wx.navigateTo({
      url: '/pages/address/address?openid=' + openid + '&address_id=' + address_id,
    })
  },
  getOrderInfo: function (orderNo) {
    var that = this;
    wx.request({
      url: url + '/wx/getOrderInfo',
      data: {
        openid: openid,
        orderNo: orderNo
      },
      success: function (rst) {
        var content = rst.data
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
  saveUserName: function (e) {
    var name = e.detail.value
    wx.request({
      url: url + '/wx/saveUserInfo',
      data: {
        openid: openid,
        name: name
      },
      success: function (rst) {
        console.log(rst)
      }
    })
  },
  saveUserMobile: function (e) {
    var mobile = e.detail.value
    wx.request({
      url: url + '/wx/saveUserInfo',
      data: {
        openid: openid,
        mobile: mobile
      },
      success: function (rst) {
        console.log(rst)
      }
    })
  },
  saveUserWxid: function (e) {
    var wx_id = e.detail.value
    wx.request({
      url: url + '/wx/saveUserInfo',
      data: {
        openid: openid,
        wx_id: wx_id
      },
      success: function (rst) {
        console.log(rst)
      }
    })
  },
  payment: function () {
    var that = this;
    wx.request({
      url: url + '/wx/payForOrder',
      data: {
        order_no: that.data.orderNo,
        openid: openid,
        com_id: that.data.com_id,
        utm: 'other'
      },
      success: function (rst) {
        console.log(rst.data);
        var data = rst.data.parameters
        console.log(data)
        wx.requestPayment({
          timeStamp: data.timeStamp,
          nonceStr: data.nonceStr,
          package: data.package,
          signType: data.signType,
          paySign: data.paySign,
          success: function (res) {
            that.setData({
              'orderStatus': 2003
            })
            wx.redirectTo({
              url: '/pages/payresult/payresult?order_no=' + that.data.orderNo + '&com_id=' + that.data.com_id + '&utm=other&group_id=' + that.data.group_id,
            })
          },
          fail: function (res) {
            that.setData({
              'orderStatus': '2002'
            })
          }
        })
      }
    })
  },
  getGroupMember: function (group_id) {
    var that = this;
    wx.request({
      url: url + '/wx/getGroupMember',
      data: {
        group_id: group_id
      },
      success: function (rst) {
        console.log(rst.data)
        that.setData({
          'memberList': rst.data
        })
      }
    })
  },
  getAllGroupNumber: function (com_id) {
    var that = this;
    wx.request({
      url: url + '/wx/getGroupNumber',
      data: {
        com_id: com_id
      },
      success: function (rst) {
        that.setData({ 'groupNumber': rst.data.number, 'memberNumber': rst.data.groupMemberNum })
      }
    })

  },
  joinIn: function () {
    console.log(1111)
    var that = this;
    wx.redirectTo({
      url: '/pages/invited/invited?com_id='+that.data.com_id+'&group_id='+that.data.group_id,
    })
  }
})