// pages/payresult/payresult.js
// pages/user/user.js
var url = getApp().globalData.Url;
var openid = wx.getStorageSync('openid')
var domainUrl = getApp().globalData.domainUrl;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    'orderNo':'',
    'com_id':'',
    'utm':'',
    'showShare':false,
    'shareImgUrl':'',
    'shareQrcodeImage':'',
    'group_id':'',
    'productInfo':{},
    'showSharePoster':false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('payment')
    console.log(options)
    var order_no = options.order_no;
    var com_id = options.com_id;
    var utm = options.utm;
    this.setData({'orderNo':order_no,'com_id':com_id,'utm':utm})
    this.getCommodityInfo(com_id)
    if('group_id' in options){
      this.setData({'group_id':options.group_id})
    }
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
  onShareAppMessage: function (res) {
    console.log(res)
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    var shareImgUrl = this.data.shareImgUrl+"?v=3"
    var that = this;
    return {
      title: '一起开团吧',
      path: 'pages/invitedDetail/index?com_id='+that.data.com_id+'&group_id='+that.data.group_id,
      imageUrl: shareImgUrl
    }
  },
  shareToFriend:function(){
    this.setData({'showShare':true})
  },
  hideShare: function () {
    this.setData({ 'showShare': false })
  },
  shareToApp:function(){
    wx.showShareMenu({
      withShareTicket: true
    })
  },
  shareToTimeLine:function(){
    var that = this;
    this.setData({'showSharePoster':true})
    wx.request({
      url: url +'/wx/createShareImage',
      data:{
        group_id:that.data.group_id
      },
      success:function(rst){
        var qrcode = domainUrl+rst.data
        var productInfo = that.data.productInfo

      }
    })
  },
  getCommodityInfo:function(com_id){
    var that = this;
    wx.request({
      url: url+'/wx/getProductInfo',
      data:{
        'com_id':com_id
      },
      success:function(rst){
        that.setData({'shareImgUrl': domainUrl +'/' +rst.data.images})
        that.setData({ 'productInfo': rst.data})

      }
    })
  }
})