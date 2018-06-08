var url = getApp().globalData.Url////dd;/
var userInfo = wx.getStorageSync('userInfo')
var openid = wx.getStorageSync('openid')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    'showRuleState':false,
    'showRuleContent':false,
    'orderStatus':2001,
    'commodityInfo':{},
    'orderNo':'',
    'userInfo':{},
    'address':{
      'prince':'',
      'city':'',
      'district':'',
      'street':'',
      'id':''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ orderStatus: options.status,orderNo:options.orderNo })
    this.getCommodityInfo(options.com_id)
    this.getOrderInfo(options.orderNo)
    this.getUserInfo()
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
  onShareAppMessage: function () {
  
  },
  onChangeShowState: function () {
    var state = this.data.showRuleState;
    this.setData({ 'showRuleState': !state, 'showRuleContent': !state })
  },
  getCommodityInfo:function(com_id){
    var that = this;
    wx.request({
      url: url +'/wx/getProductInfo',
      data:{
        com_id:com_id
      },
      success:function(rst){
        console.log(rst.data)
        var content = rst.data;
        content.images = url+content.images;
        that.setData({'commodityInfo':rst.data})
      }
    })
  },
  getUserInfo:function(){
    var that = this;
    wx.request({
      url: url +'/wx/getUserDetail',
      data:{
        openid:openid
      },
      success:function(rst){
        var content = rst.data;
        if(content.success == 1){
          var userInfo = content.data.userInfo;
          var address = content.data.address;
          that.setData({userInfo:userInfo})
          if(address){
            that.setData({ address: address })
          }

        }
      }
    })

  },
  editAddress:function(e){
    console.log(e)
    var address_id = e.target.dataset.id;
    console.log(address_id)
    wx.navigateTo({
      url: '/pages/address/address?openid='+openid+'&address_id='+address_id,
    })
  },
  getOrderInfo:function(orderNo){
    wx.request({
      url: url+'/wx/getOrderInfo',
      data:{
        openid:openid,
        orderNo:orderNo
      },
      success:function(rst){
        var content = rst.data
        console.log(content)
      }
    })


  }
})