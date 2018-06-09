// pages/user/user.js
var url = getApp().globalData.Url;
var sliderWidth =89; // 需要设置slider的宽度，用于计算中间位置
var openid = wx.getStorageSync('openid')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    'userInfo': {},
    tabs: ["我发起的拼团", "我参与的拼团"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    selfGroup:[],
    ohterGroup:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if('utm' in options){
      if(options.utm == 'self'){
        this.setData({activeIndex: 0})
      }else{
        this.setData({ activeIndex: 1 })
      }

    }
    this.getUserDetail()
    var that = this;
    this.getUserGroupList();
    wx.getSystemInfo({
      success: function (res) {
        console.log(res)
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });
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
  getUserDetail: function () {
    var that = this;
    wx.request({
      url: url + '/wx/getUserInfo',
      success: function (rst) {
        var content = rst.data;
        var info = {};

        // console.log(content.phone)
        info.tel = content.phone
        info.wx_id = content.wx_id
        info.address = content.address
        info.nickname = content.nickname
        info.avatar = 'http://img5.imgtn.bdimg.com/it/u=1622118294,3955397871&fm=27&gp=0.jpg'
        console.log(info)
        that.setData({ userInfo:info})

      }
    })
  },
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },
  getUserGroupList:function(){
    var that = this;
    wx.request({
      url: url +'/wx/getUserGroupList',
      data:{
        openid:openid
      },
      success:function(rst){
        var data = rst.data;
        console.log(data)
        that.setData({'selfGroup':data.self,'otherGroup':data.other})
      }
    })

  }
})