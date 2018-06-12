// pages/payresult/payresult.js
// pages/user/user.js
var url = getApp().globalData.Url;
var openid = wx.getStorageSync('openid')
var domainUrl = getApp().globalData.domainUrl;
var _self = null;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    downloadCount: 0,
    coverFilePath: '',
    posterBgFilePath: '',
    qrcodeFilePath: '',
    ratio: 1,
    canvasWidth: 0,
    canvasHeight: 0,
    'orderNo': '',
    'com_id': '',
    'utm': '',
    'showShare': false,
    'shareImgUrl': '',
    'shareQrcodeImage': '',
    'group_id': '',
    'productInfo': {},
    'showSharePoster': false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    _self = this;

    console.log('payment')
    console.log(options)
    var order_no = options.order_no;
    var com_id = options.com_id;
    var utm = options.utm;
    this.setData({ 'orderNo': order_no, 'com_id': com_id, 'utm': utm })
    this.getCommodityInfo(com_id)
    if ('group_id' in options) {
      this.setData({ 'group_id': options.group_id })
    }

    //读取系统信息
    wx.getSystemInfo({
      success: function (res) {
        var ratio = res.windowWidth / 750;
        _self.setData({
          ratio: ratio,
          canvasWidth: 660 * ratio,
          canvasHeight: 900 * ratio
        });
      },
    })

    //下载海报背景图
    wx.downloadFile({
      url: getApp().globalData.domainUrl + '/wximg/poster-bg.png',
      success: function (ret) {
        _self.setData({
          downloadCount: _self.data.downloadCount + 1,
          posterBgFilePath: ret.tempFilePath
        });

        _self.checkDownloadCount();
      }
    })
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
    var shareImgUrl = this.data.shareImgUrl + "?v=3"
    var that = this;
    return {
      title: '一起开团吧',
      path: 'pages/invitedDetail/index?com_id=' + that.data.com_id + '&group_id=' + that.data.group_id,
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

  //检查海报资源下载情况
  checkDownloadCount: function () {
    if (this.data.downloadCount == 3) {//背景图和二维码图
      var ctx = wx.createCanvasContext('firstCanvas', this);

      //先画背景
      ctx.drawImage(this.data.posterBgFilePath, 0, 0, this.data.canvasWidth, this.data.canvasHeight);

      //画封面图
      ctx.drawImage(this.data.coverFilePath, 5 * this.data.ratio, 5 * this.data.ratio, 650 * this.data.ratio, 300 * this.data.ratio);

      //画二维码图
      ctx.drawImage(this.data.qrcodeFilePath, 258 * this.data.ratio, 594 * this.data.ratio, 143 * this.data.ratio, 143 * this.data.ratio);

      //画商品名
      ctx.setFontSize(16);
      ctx.setTextBaseline('top');
      ctx.setTextAlign('right');
      ctx.fillText(this.data.productInfo.name, 400 * this.data.ratio, 320 * this.data.ratio);

      //拼团价
      ctx.setFillStyle('red');
      ctx.setFontSize(20);
      ctx.fillText('￥' + this.data.productInfo.tuan_price, 288 * this.data.ratio, 450 * this.data.ratio);

      //代理价
      ctx.setFontSize(16);
      ctx.setFillStyle('black');
      ctx.setTextAlign('left');
      ctx.fillText(this.data.productInfo.tuan_price, 420 * this.data.ratio, 320 * this.data.ratio);

      //几人团
      ctx.setFillStyle('white');
      ctx.setTextAlign('left');
      ctx.fillText(this.data.productInfo.full_number, 280 * this.data.ratio, 390 * this.data.ratio);

      //市场价
      ctx.setFontSize(10);
      ctx.setFillStyle = '#a0a0a0';
      ctx.fillText('￥' + this.data.productInfo.market_price, 400 * this.data.ratio, 472 * this.data.ratio);

      ctx.draw();
    }
  },

  //开始画出海报图
  startDrawPoster: function (qrcodeUrl, productInfo) {
    //下载二维码
    wx.downloadFile({
      url: qrcodeUrl,
      success: function (ret) {
        _self.setData({
          downloadCount: _self.data.downloadCount + 1,
          qrcodeFilePath: ret.tempFilePath
        });

        _self.checkDownloadCount();
      }
    })

    //下载产品封面图
    wx.downloadFile({
      url: getApp().globalData.domainUrl + productInfo.path,
      success: function (ret) {
        _self.setData({
          downloadCount: _self.data.downloadCount + 1,
          coverFilePath: ret.tempFilePath
        });

        _self.checkDownloadCount();
      }
    })
  },

  shareToTimeLine: function () {
    var that = this;
    this.setData({ 'showSharePoster': true })
    wx.request({
      url: url + '/wx/createShareImage',
      data: {
        group_id: that.data.group_id
      },
      success: function (rst) {
        var qrcode = domainUrl + rst.data
        var productInfo = that.data.productInfo

        _self.startDrawPoster(qrcode, productInfo);
      }
    })
  },
  getCommodityInfo: function (com_id) {
    var that = this;
    wx.request({
      url: url + '/wx/getOrderCommodity',
      data: {
        'com_id': com_id
      },
      success: function (rst) {
        that.setData({ 'shareImgUrl': domainUrl + '/' + rst.data.path })
        that.setData({ 'productInfo': rst.data })

      }
    })
  },
  getGeoupDetail: function () {
    var utm = this.data.utm;
    var group_id = this.data.group_id;
    var com_id = this.data.com_id
    if (utm == 'self') {
      wx.redirectTo({
        url: '/pages/inviteDetail/index?group_id' + group_id + '&com_id=' + com_id,
      })
    } else {
      wx.redirectTo({
        url: '/pages/invitedDetail/index?group_id' + group_id + '&com_id=' + com_id,
      })
    }

  }
})