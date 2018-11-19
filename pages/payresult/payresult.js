// pages/payresult/payresult.js
// pages/user/user.js
var url = getApp().globalData.Url;
var openid = null;
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
    onLoad: function(options) {
        console.log(options)
        openid = wx.getStorageSync('openid')

        _self = this;

        if ('order_no' in options) {
            var order_no = options.order_no;
        } else {
            var order_no = '';
        }
        var com_id = options.com_id;
        var utm = options.utm;

        this.setData({
            'orderNo': order_no,
            'com_id': com_id,
            'utm': utm
        })
        this.getCommodityInfo(com_id)
        if ('group_id' in options) {
            this.setData({
                'group_id': options.group_id
            })
        }


        //读取系统信息
        wx.getSystemInfo({
            success: function(res) {
                var ratio = res.windowWidth / 750;
                _self.setData({
                    ratio: ratio,
                    canvasWidth: 750 * ratio,
                    canvasHeight: 1270 * ratio
                });
            },
        })

        //下载海报背景图
        wx.downloadFile({
            url: getApp().globalData.domainUrl + '/wximg/poster-bg.png',
            success: function(ret) {
                _self.setData({
                    downloadCount: _self.data.downloadCount + 1,
                    posterBgFilePath: ret.tempFilePath
                });

                _self.checkDownloadCount();
            }
        })
        var that = this;
        wx.request({
            url: url + '/wx/getShareInfo',
            data: {
                com_id: that.data.com_id
            },
            success: function(rst) {
                that.setData({
                    'imageUrl': rst.data.path,
                    'title': rst.data.share_title
                })
            }
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

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
    onShareAppMessage: function(res) {
        console.log(res)
        if (res.from === 'button') {
            // 来自页面内转发按钮
            console.log(res.target)
        }
        var imageUrl = domainUrl + this.data.imageUrl + "?v=3"
        var title = this.data.title
        var that = this;
        return {
            title: title,
            path: 'pages/invitedDetail/index?com_id=' + that.data.com_id + '&group_id=' + that.data.group_id,
            imageUrl: imageUrl
        }
    },
    shareToFriend: function() {
        this.setData({
            'showShare': true
        })
    },
    hideShare: function() {
        this.setData({
            'showShare': false
        })
    },
    shareToApp: function() {
        wx.showShareMenu({
            withShareTicket: true
        })
    },

    //检查海报资源下载情况
    checkDownloadCount: function() {
        if (this.data.downloadCount == 3) { //背景图和二维码图
            var ctx = wx.createCanvasContext('firstCanvas', this);
            //先画背景
            ctx.drawImage(this.data.coverFilePath, 0, 0, this.data.canvasWidth, this.data.canvasHeight);
            //画二维码图
            ctx.drawImage(this.data.qrcodeFilePath, 495 * this.data.ratio, 1005 * this.data.ratio, 190 * this.data.ratio, 190 * this.data.ratio);

            ctx.draw();
        }
    },

    //开始画出海报图
    startDrawPoster: function(qrcodeUrl, productInfo) {
        //下载二维码
        wx.downloadFile({
            url: qrcodeUrl,
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

    shareToTimeLine: function() {
        var url = '/pages/poster/poster?com_id=' + this.data.com_id + '&type=other&group_id=' + this.data.group_id
        console.log(url);
        wx.navigateTo({
            url: url,
        })
    },
    getCommodityInfo: function(com_id) {
        var that = this;
        wx.request({
            url: url + '/wx/getOrderCommodity',
            data: {
                'com_id': com_id
            },
            success: function(rst) {
                that.setData({
                    'shareImgUrl': domainUrl + '/' + rst.data.path
                })
                that.setData({
                    'productInfo': rst.data
                })

            }
        })
    },
    getGroupDetail: function() {
        var utm = this.data.utm;
        var group_id = this.data.group_id;
        var com_id = this.data.com_id
        var order_no = this.data.orderNo
        if (utm == 'self') {
            wx.redirectTo({
                url: '/pages/inviteDetail/index?group_id=' + group_id + '&com_id=' + com_id + '&order_no=' + order_no,
            })
        } else {
            wx.redirectTo({
                url: '/pages/invitedDetail/index?group_id=' + group_id + '&com_id=' + com_id + '&order_no=' + order_no,
            })
        }

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
    closePoster: function() {
        this.setData({
            'showSharePoster': false,
            'downloadCount': 1
        })

    },
})