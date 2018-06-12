// pages/address.js
var tcity = require("../../utils/citys.js");
var url = getApp().globalData.Url////dd;/
var userInfo = wx.getStorageSync('userInfo')
var openid = wx.getStorageSync('openid')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    prince: "上海市",
    city: "上海市",
    district: '黄浦区',
    address:'',
    street:'',
    address_id:'',
    region: ['上海市', '上海市', '黄浦区'],
    defaultSet: true,
    // customItem: '全部'
  },
  bindRegionChange: function (e) {
    var reginValue = e.detail.value
  
    this.setData({
      region: reginValue,
      prince: reginValue[0],
      city: reginValue[1],
      district: reginValue[2],
      address: reginValue[0] + ' ' + reginValue[1] + ' ' + reginValue[2]+' '+this.data.street
    })
  },
  changeAddress:function(e){
    var reginValue = this.data.region;
    this.setData({
      street:e.detail.value,
      address: reginValue[0] + ' ' + reginValue[1] + ' ' + reginValue[2] + ' ' + e.detail.value
    })

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var address_id = options.address_id;
    this.setData({'address_id':address_id})
    if(address_id){
      this.getUserAddress(address_id);
    }else{
      this.setData({ 'address': this.data.prince + this.data.city + this.data.district})
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
  onShareAppMessage: function () {

  },
  saveAddress: function () {

  },
  cancelAddress: function () {
    console.log('cancel')
    wx.navigateBack({
      delta: 1
    })
  },
  formSubmit: function (e) {
    var content = e.detail.value;
    console.log(content)
    var that = this;
    if (!content.street) {
      wx.showModal({
        content: '请输入街道地址',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            wx.request({
              url: url + '/wx/saveAddress',
              data: {
                'prince': that.data.prince,
                'city': that.data.city,
                'district': that.data.district,
                'street': that.data.street,
                'default': that.data.defaultSet,
                'openid':openid,
                'address_id':that.data.address_id
              },
              success: function (rst) {
                console.log(rst)
                if (rst.data.success == 1) {
                  wx.showToast({
                    title: '修改成功',
                    icon: 'success',
                    duration: 2000
                  })
                }
              }
            })
          }
        }
      });
    }else{
      wx.request({
        url: url + '/wx/saveAddress',
        data: {
          'prince': that.data.prince,
          'city': that.data.city,
          'district': that.data.district,
          'street': that.data.street,
          'default': that.data.defaultSet,
          'openid': openid,
          'address_id': that.data.address_id
        },
        success: function (rst) {
          console.log(rst)
          if (rst.data.success == 1) {
            wx.showToast({
              title: '修改成功',
              icon: 'success',
              duration: 2000
            })
            wx.navigateBack({
              delta: 1
            })
          }
        }
      })
    }
  },
  getUserAddress:function(address_id){
    console.log(address_id)
    var that = this;
    wx.request({
      url: url+'/wx/getUserAddress',
      data:{
        openid:openid,
        address_id:address_id
      },
      success:function(rst){
        console.log(rst)
        if(rst.data.success == 1){
          var content = rst.data.content;
          console.log(content)
          that.setData({ 'prince': content.prince, 'city': content.city, 'defaultSet': content.default, 'district': content.district, 'street': content.street, 'address': content.prince + content.city + content.district + content.street})
        }
      }
    })
  },
  formSubmit: function (e) {
    var app = getApp();
    app.submitFormId(e.detail.formId);
  }
})