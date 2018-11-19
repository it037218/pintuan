// pages/invite/invite.js
var url = getApp().globalData.Url;
var domainUrl = getApp().globalData.domainUrl;
var userInfo = wx.getStorageSync('userInfo')
var openid = null;
var _self = '';
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
        'name': '',
        'mobile': '',
        'wx_id': '',
        'address_id': '',
        'group_id': '',
        'createGroup': false,
        'createNew': false,
        'downloadCount': 0,
        'showSharePoster': false,
        'showCreatePerson': false,
        'WXID': '',
        'hasExpired':false,
        'showExpired':true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        _self = this;
        openid = wx.getStorageSync('openid')
        if ((!openid || openid.length == 0) && !getApp().openidReadyCallback) {
            getApp().openidReadyCallback = function(inOpenid) {
                openid = inOpenid;
            }
        }

        if ('scene' in options) {
            var scene = decodeURIComponent(options.scene)
            if (scene != 'undefined') {
                wx.request({
                    url: url + '/wx/saveUserRecommender',
                    data: {
                        'openid': openid,
                        'scene': scene
                    },
                    success: function(res) {

                    },
                    fail: function(res) {},
                    complete: function(res) {},
                })
            }
        }

        if ('com_id' in options) {
            this.setData({
                'com_id': options.com_id
            })
            this.getProductDetail(options.com_id)
        } else {
            this.getProductDetail('')
        }
        if ('utm' in options) {
            this.setData({
                'utm': options.utm
            })
        }
        if ('group_id' in options) {
            this.setData({
                'group_id': options.group_id
            })
        }
        if ('op' in options && options.op == 'create') {
            this.setData({
                'createGroup': true
            })
        }
        if('order_no' in options){
            this.setData({
                'order_no':options.order_no,
                'productStatus':'10000'
            })
            


        }
        this.checkUserStatus(openid)
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
    //检查海报资源下载情况
    checkDownloadCount: function() {
        if (this.data.downloadCount == 2) { //背景图和二维码图
            console.log(1111);
            var ctx = wx.createCanvasContext('firstCanvas', this);
            //先画背景
            ctx.drawImage(this.data.qrcodeFilePath, 0, 0, this.data.canvasWidth, this.data.canvasHeight);
            //画二维码图
            ctx.drawImage(this.data.posterImage, 495 * this.data.ratio, 1005 * this.data.ratio, 190 * this.data.ratio, 190 * this.data.ratio);

            ctx.setFontSize(28 * this.data.ratio)
            ctx.fillText(this.data.WXID, 150 * this.data.ratio, 1163 * this.data.ratio)
            ctx.draw();
        }
        this.setData({
            'showSharePoster': true
        })
    },
    //开始画出海报图
    startDrawPoster: function(qrcodeUrl) {
        console.log(this.data.productInfo)
        //下载二维码
        wx.downloadFile({
            url: domainUrl + this.data.productInfo.shareposter,
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
            url: domainUrl + this.data.personQrcode,
            success: function(ret) {
                _self.setData({
                    downloadCount: _self.data.downloadCount + 1,
                    posterImage: ret.tempFilePath
                });
                _self.checkDownloadCount();
            }
        })
    },
    getProductDetail: function(id) {
        var that = this;
        wx.request({
            url: url + '/wx/getOrderCommodity',
            data: {
                com_id: id,
            },
            success: function(rst) {
                console.log('商品详情');
                var content = rst.data
                that.setData({
                    'commodity_id': content.id
                })
                var createGroup = that.data.createGroup

                if (!createGroup) {
                    // that.checkUserGroup(content.id)
                }

                content.images = domainUrl + content.path

                content.detail = content.detail.replace(/\<img/gi, '<img style="max-width:100%;height:auto"')

                that.setData({
                    productInfo: content,
                    'hasExpired':content.expired
                })
            }
        })
    },

    onChangeShowState: function() {
        var state = this.data.showRuleState;
        this.setData({
            'showRuleState': !state,
            'showRuleContent': !state
        })

    },
    createOrder: function() {
        var that = this;
        wx.request({
            url: url + '/wx/createOrder',
            data: {
                'commodity_id': that.data.commodity_id,
                'openid': openid,
                'utm': 'self',
                'createNew': that.data.createGroup
            },
            success: function(rst) {
                var content = rst.data;
                console.log(content)

                wx.navigateTo({
                    url: '/pages/inviteDetail/index?com_id=' + that.data.commodity_id + '&status=1&order_no=' + content.orderNo + "&group_id=" + content.groupId,
                })
            }
        })
    },
    checkUserOrder: function(com_id) {
        wx.request({
            url: url + '/wx/checkUserOrder',
            data: {
                openid: openid,
                com_id: com_id,
                identity: '1'
            },
            success: function(rst) {

            }
        })
    },
    checkUserGroup: function(com_id) {
        wx.request({
            url: url + '/wx/checkUserGroup',
            data: {
                com_id: com_id,
                openid: openid
            },
            success: function(rst) {
                console.log(rst)
                var self = rst.data.self.length;
                var other = rst.data.other.length;
                if (self && !other) {
                    wx.redirectTo({
                        url: '/pages/orderList/index?utm=self',
                    })
                } else if (!self && other) {
                    wx.redirectTo({
                        url: '/pages/orderList/index?utm=other',
                    })
                } else if (self && other) {
                    wx.redirectTo({
                        url: '/pages/orderList/index?utm=self',
                    })
                }

            }
        })
    },
    formSubmit: function(e) {
        var app = getApp();
        console.log(e)
        app.submitFormId(openid, e.detail.formId);
    },
    bindGetUserInfo: function(e) {
        var that = this;
        wx.request({
            url: 'https://pintuan.guangxing.club/pintuan/guangxing/wx/login_confirm',
            data: {
                avatarUrl: e.detail.userInfo.avatarUrl,
                nickname: e.detail.userInfo.nickName,
                openid: openid
            },
            success: function() {
                that.setData({
                    'userStatus': '1'
                })
                that.createOrder();
            }
        })
        // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
        // 所以此处加入 callback 以防止这种情况
        if (this.userInfoReadyCallback) {
            this.userInfoReadyCallback(res)
        }
    },
    checkUserStatus: function(openid) {
        var that = this;
        wx.request({
            url: url + '/wx/checkUserStatus',
            data: {
                openid: openid
            },
            success: function(rst) {
                if(rst.data.status == 0){
                    wx.navigateTo({
                        url: '/pages/authorize/index',
                        success: function(res) {},
                        fail: function(res) {},
                        complete: function(res) {},
                    })
                }
                // that.setData({
                //     'userStatus': rst.data.status
                // })
            }

        })

    },
    //分享给好友
    shareToTimeLine: function() {
        var wxid = this.data.WXID;
        if (!wxid) {
            wx.showToast({
                icon: 'none',
                title: '请输入个人微信号',
            })
            return;

        }
        var that = this;
        wx.request({
            url: url + '/wx/createPersonQrCode',
            data: {
                openid: openid,
                'wx_id': wxid
            },
            success: function(res) {
                that.setData({
                    showCreatePerson: false
                })

                wx.navigateTo({
                    url: '/pages/poster/poster?com_id=' + that.data.commodity_id+'&type=person&wx_id=' + wxid,
                })

            },
            fail: function(res) {},
            complete: function(res) {},
        })


    },
    createPersonPoster: function() {
        var that = this;
        wx.request({
            url: url + '/wx/getUserInfo',
            data: {
                openid: openid
            },
            success: function(res) {
                if (res.data.data.wx_id) {
                    that.setData({
                        'WXID': res.data.data.wx_id
                    })
                    that.shareToTimeLine()
                } else {
                    that.setData({
                        showCreatePerson: true
                    })
                }
            },
            fail: function(res) {},
            complete: function(res) {},
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
    closePoster: function() {
        wx.setNavigationBarTitle({
            title: '商品详情',
            success: function(res) {},
            fail: function(res) {},
            complete: function(res) {},
        })
        this.setData({
            'showSharePoster': false
        })
    },
    saveWXID: function(e) {
        console.log(e)
        this.setData({
            WXID: e.detail.value
        })

    },
    backToOrderList: function () {
        wx.redirectTo({
            url: '/pages/orderList/index',
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
        })
    },
    payContinue:function(){
        wx.redirectTo({
            url: '/pages/inviteDetail/index?com_id='+this.data.com_id+'&group_id='+this.data.group_id+'&order_no='+this.data.order_no,
        })

    },
    closeModel:function(){
        this.setData({'showExpired':false})
    }
})