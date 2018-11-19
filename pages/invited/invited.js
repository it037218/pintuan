// pages/invite/invite.js
var url = getApp().globalData.Url;
var domainUrl = getApp().globalData.domainUrl;
var userInfo = wx.getStorageSync('userInfo')
console.log(userInfo)
var openid = null

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
        group_id: '',
        group_member_id: '',
        'hasExpired': false,
        'showExpired': true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        openid = wx.getStorageSync('openid')
        if ((!openid || openid.length == 0) && !getApp().openidReadyCallback) {
            getApp().openidReadyCallback = function(inOpenid) {
                openid = inOpenid;
            }
        }
        if ('com_id' in options) {
            this.getProductDetail(options.com_id)
            this.setData({
                'com_id': options.com_id
            })
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
            // this.getOrderInfoByGroupId(options.group_id)
        }
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
    getProductDetail: function(id) {
        var that = this;
        wx.request({
            url: url + '/wx/getOrderCommodity',
            data: {
                com_id: id,
            },
            success: function(rst) {
                var content = rst.data
                that.setData({
                    'commodity_id': content.id
                })
                // var createGroup = that.data.createGroup
                // console.log('createGroup' + createGroup)

                // if (!createGroup) {
                //     that.checkUserGroup(content.id)
                // }
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

    formSubmit: function(e) {
        var app = getApp();
        app.submitFormId(openid, e.detail.formId);
    },
    
    joinIn: function () {
        console.log('joinUrl')
        console.log(url+'/wx/createOrder')
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
                console.log('参团回调')
                console.log(content)
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
    backToOrderList: function () {
        wx.redirectTo({
            url: '/pages/orderList/index',
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
        })
    },
    closeModel: function () {
        this.setData({ 'showExpired': false })
    }
})