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
        joinInGroupStatus: false,
        'countSecond': 0,
        'countMin': 0,
        'countHour': 0,
        'countDay': 0,
        'fullAndCreate':false,
        'fullAndCreate1': false,
        'imageUrl': '',
        'showSharePoster': false,
        'hasExpired': false,
        'showExpired': true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        openid = wx.getStorageSync('openid')
        if ((!openid || openid.length == 0) && !getApp().openidReadyCallback) {
            getApp().openidReadyCallback = function (inOpenid) {
                openid = inOpenid;
                this.checkUserStatus(openid);
            }
        }

        if ('order_no' in options) {
            this.setData({
                'orderNo': options.order_no
            })
            // this.getOrderInfo(options.order_no)
        }
        if ('group_id' in options) {
            this.checkUserOwner(options.group_id)
            this.setData({
                'group_id': options.group_id
            })
            this.getGroupMember(options.group_id)
            this.checkGroupUserOrder()
        }
        _self = this;
        this.getCommodityInfo(options.com_id,options.group_id)
        this.setData({
            'com_id': options.com_id
        })
        
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
                    canvasWidth: 750 * ratio,
                    canvasHeight: 1270 * ratio
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
        var that = this;
        wx.request({
            url: url + '/wx/getShareInfo',
            data: {
                com_id: that.data.com_id
            },
            success: function (rst) {
                that.setData({ 'imageUrl': rst.data.path, 'title': rst.data.share_title })
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
        var imageUrl = domainUrl + this.data.imageUrl + "?v=3"
        var title = this.data.title
        var that = this;
        return {
            title: title,
            path: 'pages/invitedDetail/index?com_id=' + that.data.com_id + '&group_id=' + that.data.group_id,
            imageUrl: imageUrl
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
        wx.navigateTo({
            url: '/pages/poster/poster?com_id=' + this.data.com_id + '&type=other&group_id=' + this.data.group_id,
        })
    },
    //检查海报资源下载情况
    checkDownloadCount: function () {
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
            url: getApp().globalData.domainUrl + productInfo.poster,
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
    getCommodityInfo: function (com_id,group_id) {
        var that = this;
        wx.request({
            url: url + '/wx/getOrderCommodity',
            data: {
                com_id: com_id,
                'group_id':group_id
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
                    'hasExpired':content.expired
                })
                if(rst.data.pay_status == 2003){
                 
                }
                if (that.data.orderNo && that.data.orderNo.length > 0) {
                    that.getOrderInfo(that.data.orderNo)
                }

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
    // editAddress: function (e) {
    //     console.log(e)
    //     var address_id = e.target.dataset.id;
    //     console.log(address_id)
    //     wx.navigateTo({
    //         url: '/pages/address/address?openid=' + openid + '&address_id=' + address_id,
    //     })
    // },
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
                    console.log('订单状态')
                    console.log(orderStatus)
                    if(orderStatus == 2003){
                        console.log('截止时间');
                        var end_time = that.data.commodityInfo.end_time;
                        var endTime = new Date(Date.parse(end_time.replace(/-/g, '/')));

                        var difftime = Math.floor((endTime.getTime() - (new Date()).getTime()) / 1000);
                        var day = Math.floor(difftime / 3600 / 24);
                        var hour = Math.floor((difftime - day * 3600 * 24) / 3600);
                        var minute = Math.floor((difftime - day * 3600 * 24 - hour * 3600) / 60);
                        var second = difftime - day * 3600 * 24 - hour * 3600 - minute * 60;
                        that.setData({
                            'countDay': day,
                            'countHour': hour,
                            'countMin': minute,
                            'countSecond': second
                        })
                        setInterval(that.countdown, 1000)
                    }
                    if(orderStatus == 2003 || orderStatus == 2005){
                        that.checkUserJoinGroup()

                    }
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
                that.setData({
                    name: name
                })
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
                that.setData({
                    mobile: mobile
                })
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
                that.setData({
                    wx_id: wx_id
                })
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
        // if (!address_id) {
        //     wx.showToast({
        //         title: '请填写收货地址',
        //         icon: 'none',

        //         duration: 2000
        //     })
        //     return
        // }

        wx.request({
            url: url + '/wx/payForOrder',
            data: {
                order_no: that.data.orderNo,
                openid: openid,
                com_id: that.data.com_id,
                group_member_id: that.data.group_member_id,
                utm: 'other',
                group_id: that.data.group_id
            },
            success: function (rst) {
                console.log(rst)
                var data = rst.data.parameters
                if(rst.data.success == 0){
                    that.setData({
                        'orderStatus': 2004
                    })
                    return
                }
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
        app.submitFormId(openid,e.detail.formId);
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
                console.log('用户参团情况')
                console.log(rst)
                if (rst.data.success == 1) {
                    that.setData({
                        'orderStatus': rst.data.result.pay_status,
                        'orderNo':rst.data.result.order_no
                    })
                    if (rst.data.result.pay_status == 2003) {
                        that.checkUserJoinGroup()
                    }
                    if(rst.data.result.pay_status == 2005){
                        wx.request({
                            url: url + '/wx/checkGroupStatus',
                            data: {
                                group_id: that.data.group_id
                            },
                            success: function (rst) {
                                console.log('拼团状态')
                                console.log(rst)
                                if (rst.data.status == 10) {
                                    that.setData({ 'fullAndCreate1': true })
                                }
                            }
                        })
                    }
                }else{
                    wx.request({
                        url: url +'/wx/checkGroupStatus',
                        data:{
                            group_id:that.data.group_id
                        },
                        success:function(rst){
                            console.log('拼团状态')
                            console.log(rst)
                            if(rst.data.status == 10){
                                that.setData({'fullAndCreate':true})
                            }
                        }
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
    },
    countdown: function () {
        //是否已经开始
        if (this.data.countSecond < 1 &&
            this.data.countMin == 0 &&
            this.data.countHour == 0 &&
            this.data.countDay == 0) {
            clearInterval(this.intervalId);
        }
        else {
            if (this.data.countSecond < 1) {
                this.setData({
                    countSecond: 59
                });
                if (this.data.countMin < 1) {
                    this.setData({
                        countMin: 59
                    });
                    if (this.data.countHour < 1) {
                        this.setData({
                            countHour: 23
                        });
                        if(this.data.countDay>=1){
                            this.setData({
                                countDay:this.data.countDay-1
                            })
                        }else{
                            this.setData({
                                countDay: 0
                            })
                        }
                    }else{
                        this.setData({
                            countHour: this.data.coutHour-1
                        });
                    }
                }
                else {
                    this.setData({
                        countMin: this.data.countMin - 1
                    });
                }
            }
            else {
                this.setData({
                    countSecond: this.data.countSecond - 1
                });
            }
        }
    },
    createOrder: function () {
        var that = this;
        wx.request({
            url: url + '/wx/createOrder',
            data: {
                'commodity_id': that.data.com_id,
                'openid': openid,
                'utm': 'self',
            },
            success: function (rst) {
                var content = rst.data;
                console.log(content)
                wx.navigateTo({
                    url: '/pages/inviteDetail/index?com_id=' + that.data.com_id + '&status=1&order_no=' + content.orderNo + "&group_id=" + content.groupId,
                })
            }
        })
    },
    backToList:function(){
        wx.redirectTo({
            url: '/pages/orderList/index',
        })
    },
    backToOrderList: function () {
        wx.redirectTo({
            url: '/pages/invited/invited?com_id='+this.data.com_id+'&group_id='+this.data.group_id+'&utm=other',
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
        })
    },
    checkUserStatus: function (openid) {
        var that = this;
        wx.request({
            url: url + '/wx/checkUserStatus',
            data: {
                openid: openid
            },
            success: function (rst) {
                if (rst.data.status == 0) {
                    wx.navigateTo({
                        url: '/pages/authorize/index',
                        success: function (res) { },
                        fail: function (res) { },
                        complete: function (res) { },
                    })
                }
                // that.setData({
                //     'userStatus': rst.data.status
                // })
            }

        })

    },
    closeModel: function () {
        this.setData({ 'showExpired': false })
    },
    hideCancelModal:function(){
        this.setData({ fullAndCreate1:false})
        this.setData({ fullAndCreate:false})
        this.setData({ 'showExpired': false })

    }
})