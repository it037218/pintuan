var url = getApp().globalData.Url ////dd;/
var userInfo = wx.getStorageSync('userInfo')
var openid = null;
var domainUrl = getApp().globalData.domainUrl;
var _self = null;

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
        'name': '',
        'mobile': '',
        'wx_id': '',
        'address_id': '',
        'memberList': [],
        'com_id': '',
        'groupNumber': 0,
        'memberNumber': 0,
        'showShare': false,
        'shareImgUrl': '',
        'group_id': '',
        'group_member_id': '',
        'name': '',
        'mobile': '',
        'wx_id': '',
        'address_id': '',
        downloadCount: 0,
        coverFilePath: '',
        posterBgFilePath: '',
        qrcodeFilePath: '',
        ratio: 1,
        canvasWidth: 0,
        canvasHeight: 0,
        joinInGroupStatus: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        openid = wx.getStorageSync('openid')
        if ('group_id' in options) {
            this.checkUserOwner(options.group_id)
            this.setData({
                'group_id': options.group_id
            })
            this.getGroupMember(options.group_id)
            this.checkGroupUserOrder()
        }
        _self = this;
        this.getCommodityInfo(options.com_id)
        this.setData({
            'com_id': options.com_id
        })
        if ('order_no' in options) {
            this.setData({
                'orderNo': options.order_no
            })
            this.getOrderInfo(options.order_no)
        }
        this.getUserInfo()

        if ('group_member_id' in options) {
            this.setData({
                'group_member_id': options.group_member_id
            })
        }
        if ('group_id' in options) {
            this.setData({
                'group_id': options.group_id
            })
        }
        this.getAllGroupNumber(options.com_id)
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
        this.setData({
            'showShare': true
        })
    },
    hideShare: function () {
        this.setData({
            'showShare': false
        })
    },
    shareToApp: function () {
        wx.showShareMenu({
            withShareTicket: true
        })
    },
    shareToTimeLine: function () {
        var that = this;
        this.setData({
            'showSharePoster': true
        })
        wx.request({
            url: url + '/wx/createShareImage',
            data: {
                group_id: that.data.group_id
            },
            success: function (rst) {
                var qrcode = domainUrl + rst.data
                var productInfo = that.data.commodityInfo
                _self.startDrawPoster(qrcode, productInfo);
            }
        })
    },
    //检查海报资源下载情况
    checkDownloadCount: function () {
        console.log('商品详情')
        console.log(this.data.commodityInfo)
        if (this.data.downloadCount == 3) { //背景图和二维码图
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
            ctx.fillText(this.data.commodityInfo.name, 400 * this.data.ratio, 325 * this.data.ratio);

            //拼团价
            ctx.setFillStyle('red');
            ctx.setFontSize(20);
            ctx.fillText('￥' + this.data.commodityInfo.tuan_price, 288 * this.data.ratio, 450 * this.data.ratio);

            //代理价
            ctx.setFontSize(16);
            ctx.setFillStyle('black');
            ctx.setTextAlign('left');
            ctx.fillText(this.data.commodityInfo.tuan_price, 422 * this.data.ratio, 325 * this.data.ratio);

            //几人团
            ctx.setFillStyle('white');
            ctx.setTextAlign('left');
            ctx.fillText(this.data.commodityInfo.full_number, 280 * this.data.ratio, 390 * this.data.ratio);

            //市场价
            ctx.setFontSize(10);
            ctx.setFillStyle('#a0a0a0');
            ctx.fillText('￥' + this.data.commodityInfo.market_price, 380 * this.data.ratio, 472 * this.data.ratio);

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
                var content = rst.data;
                content.images = domainUrl + content.path;
                that.setData({
                    'shareImgUrl': content.images
                })
                rst.data.detail = rst.data.detail.replace(/\<img/gi, '<img style="max-width:100%;height:auto"')
                that.setData({
                    'commodityInfo': rst.data,
                })
            }
        })
    },
    //查看用户是否已经开团
    checkUserJoinGroup: function () {
        var that = this;
        wx.request({
            url: url + '/wx/getUserGroupList',
            data: {
                openid: openid
            },
            success: function (rst) {
                var data = rst.data;
                console.log(data)
                if (data.self.length == 0) {
                    console.log('开团')
                    that.setData({ joinInGroupStatus: true })
                }
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
                    if (address.id) {
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
        var that = this;
        var name = this.data.name
        var mobile = this.data.mobile
        var wx_id = this.data.wx_id
        var address_id = this.data.address_id
        if (!name || !mobile || !wx_id) {
            wx.showToast({
                title: '请填写个人信息',
                icon: 'none',
                duration: 2000
            })
            return
        }
        if (!/^1([358][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}$/.test(mobile)) {
            wx.showToast({
                title: '手机号码不正确',
                icon: 'none'
            })
            return;
        }
        if (!address_id) {
            wx.showToast({
                title: '请填写收货地址',
                icon: 'none',

                duration: 2000
            })
            return
        }

        wx.request({
            url: url + '/wx/payForOrder',
            data: {
                order_no: that.data.orderNo,
                openid: openid,
                com_id: that.data.com_id,
                group_member_id: that.data.group_member_id,
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
                var memberNumber = 0;
                for (var i = 0; i < rst.data.length; i++) {
                    if (rst.data[i].openid) {
                        console.log(rst.data[i])
                        memberNumber++;
                    }
                }
                that.setData({
                    'memberList': rst.data,
                    'memberNumber': memberNumber

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
                console.log(rst)
                that.setData({
                    'groupNumber': rst.data.number,
                })
            }
        })
    },
    joinIn: function () {
        var that = this;
        wx.request({
            url: url + '/wx/createOrder',
            data: {
                'commodity_id': that.data.com_id,
                'openid': openid,
                'utm': 'other',
                'group_id': that.data.group_id
            },
            success: function (rst) {
                var content = rst.data;
                if (content.success == 1) {
                    wx.navigateTo({
                        url: '/pages/invitedDetail/index?com_id=' + that.data.com_id + '&status=1&order_no=' + content.orderNo + '&group_id=' + that.data.group_id + '&group_member_id=' + content.groupMemberId,
                    })
                } else {
                    wx.showToast({
                        title: '参团失败',
                        duration: 2000
                    })
                }
            }
        })
    },
    formSubmit: function (e) {
        var app = getApp();
        app.submitFormId(e.detail.formId);
    },
    //检查用户当前参团情况
    checkGroupUserOrder: function () {
        var that = this;
        wx.request({
            url: url + '/wx/checkGroupUserOrder',
            data: {
                openid: openid,
                group_id: that.data.group_id
            },
            success: function (rst) {
                console.log('checkGroupUser')
                console.log(that.data.group_id)
                console.log(openid)
                console.log(rst)
                if (rst.data.success == 1) {
                    that.setData({
                        'orderStatus': rst.data.result.pay_status
                    })
                }
            }
        })
    },
    closePoster: function () {
        this.setData({
            'showSharePoster': false,
            'downloadCount': 1
        })

    },
    saveSharePoster: function (e) {
        console.log('长按保存')

        wx.canvasToTempFilePath({
            canvasId: 'firstCanvas',
            success: function (res) {
                console.log(res.tempFilePath);
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
    //检查当前用户身份（团长/团员）
    checkUserOwner: function (group_id) {

        wx.request({
            url: url + '/wx/checkUserOwner',
            data: {
                group_id: group_id,
                openid: openid
            },
            success: function (rst) {
                if (rst.data.result == true) {
                    wx.redirectTo({
                        url: '/pages/orderList/index',
                    })
                }
            }
        })

    },
    createGroup: function () {
        wx.redirectTo({
            url: '/pages/invite/invite?op=create',
        })
    }
})