// pages/poster.js
var url = getApp().globalData.Url;
var openid = null;
var domainUrl = getApp().globalData.domainUrl;
var _self = null;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        'type': '',
        'group_id': '',
        'com_id': '',
        'productInfo':'',
        'downloadCount':1,
        'wx_id':''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        console.log(options)
        openid = wx.getStorageSync('openid')

        _self = this
        var commId = options.com_id;
        this.setData({
            'com_id': commId,
            'type':options.type,
            'openid': openid
        })
        this.getCommodityInfo(commId)
        if ('group_id' in options) {
            this.setData({
                'group_id': options.group_id
            })
        }
        if('wx_id' in options){
            this.setData({'wx_id':options.wx_id})
        }
        //读取系统信息
        wx.getSystemInfo({
            success: function (res) {
                var ratio = res.windowWidth / 750;
                _self.setData({
                    ratio: ratio,
                    canvasWidth: 750 * ratio,
                    canvasHeight: 1270 * ratio
                });
            },
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    //开团分享海报
    checkDownloadCount: function() {
        console.log('start')
        console.log(this.data.downloadCount);
        console.log(this.data.coverFilePath)
        console.log('end')
        if (this.data.downloadCount == 3) { //背景图和二维码图
            var ctx = wx.createCanvasContext('firstCanvas', this);
            //先画背景
            ctx.drawImage(this.data.coverFilePath, 0, 0, this.data.canvasWidth, this.data.canvasHeight);
            //画二维码图
            ctx.drawImage(this.data.qrcodeFilePath, 495 * this.data.ratio, 1005 * this.data.ratio, 190 * this.data.ratio, 190 * this.data.ratio);

            ctx.draw();
        }
    },

    //个人分享海报
    checkDownloadCount1: function() {
        if (this.data.downloadCount == 3) { //背景图和二维码图
            var ctx = wx.createCanvasContext('firstCanvas', this);
            //先画背景
            ctx.drawImage(this.data.coverFilePath, 0, 0, this.data.canvasWidth, this.data.canvasHeight);
            //画二维码图
            ctx.drawImage(this.data.qrcodeFilePath, 495 * this.data.ratio, 1005 * this.data.ratio, 190 * this.data.ratio, 190 * this.data.ratio);
            ctx.setFontSize(28 * this.data.ratio)
            ctx.fillText(this.data.wx_id, 150 * this.data.ratio, 1163 * this.data.ratio)

            ctx.draw();
        }
    },

    //开团分享
    shareToTimeLine: function() {
        var that = this;
        wx.request({
            url: url + '/wx/createShareImage',
            data: {
                group_id: that.data.group_id,
                com_id: that.data.com_id,
                
            },
            success: function(rst) {
                console.log(rst)
                var qrcode = domainUrl + rst.data
                console.log(qrcode)
                var productInfo = that.data.productInfo
                _self.startDrawPoster(qrcode, productInfo);
            }
        })
    },
    //个人专属海报
    shareToFriend: function () {
        console.log('shareToFriend')
        var that = this;
        console.log(that.data.openid)
        wx.request({
            url: url + '/wx/createPersonQrCode',
            data: {
                openid: that.data.openid,
                wx_id: that.data.wx_id,
                com_id: that.data.com_id
            },
            success: function (rst) {
                console.log(rst.data)
                var qrcode = domainUrl + rst.data
                var productInfo = that.data.productInfo
                _self.startDrawPoster1(qrcode, productInfo);
            }
        })
    },


    //开始画出开团海报图
    startDrawPoster: function(qrcodeUrl, productInfo) {
        console.log(qrcodeUrl)
        //下载二维码
        wx.downloadFile({
            url:  qrcodeUrl,
            success: function(ret) {
                _self.setData({
                    downloadCount: _self.data.downloadCount + 1,
                    qrcodeFilePath: ret.tempFilePath
                });
                _self.checkDownloadCount();
            }
        })

        //下载产品封面图
        wx.downloadFile({
            url: getApp().globalData.domainUrl + productInfo.poster,
            success: function(ret) {
                _self.setData({
                    downloadCount: _self.data.downloadCount + 1,
                    coverFilePath: ret.tempFilePath
                });
                _self.checkDownloadCount();
            }
        })
    },
    //开始画出个人海报图
    startDrawPoster1: function (qrcodeUrl, productInfo) {
        //下载二维码
        wx.downloadFile({
            url: qrcodeUrl,
            success: function (ret) {
                _self.setData({
                    downloadCount: _self.data.downloadCount + 1,
                    qrcodeFilePath: ret.tempFilePath
                });
                _self.checkDownloadCount1();
            }
        })

        console.log(getApp().globalData.domainUrl + productInfo.shareposter)
        //下载产品封面图
        wx.downloadFile({
            url: getApp().globalData.domainUrl + productInfo.shareposter,
            success: function (ret) {
                _self.setData({
                    downloadCount: _self.data.downloadCount + 1,
                    coverFilePath: ret.tempFilePath
                });
                console.log(_self.data.downloadCount)
                _self.checkDownloadCount1();
            }
        })
    },

    //画出个人邀请海报
    getCommodityInfo: function(com_id) {
        var that = this;
        wx.request({
            url: url + '/wx/getOrderCommodity',
            data: {
                'com_id': com_id
            },
            success: function(rst) {
                that.setData({
                    'productInfo': rst.data
                })

                if (_self.data.type == 'person') {
                    // 显示个人海报
                    wx.setNavigationBarTitle({
                        title: '专属海报',
                    })
                    _self.shareToFriend()
                } else {
                    //开团分享海报
                    wx.setNavigationBarTitle({
                        title: '拼团海报',
                    })
                    _self.shareToTimeLine()
                }

            }
        })
    },
    saveSharePoster: function(e) {
        wx.canvasToTempFilePath({
            canvasId: 'firstCanvas',
            success: function(res) {
                wx.saveImageToPhotosAlbum({
                    filePath: res.tempFilePath,
                    success(res) {
                        wx.showToast({
                            title: '保存成功',
                        })
                    }
                })
            }
        })
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */

})