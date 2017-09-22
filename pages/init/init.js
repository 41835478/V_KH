var appUtil = require('../../utils/appUtil.js');
var util = require('../../utils/util.js');
const apiService = require('../../utils/ApiService');
var app = getApp();
Page({
    data: {
        module: '',
        shouye: false,
        dingdan: false,
        wo: false,
        vkahuiData: null
    },
    onLoad: function (options) {
        //options = {};
        //options.resId = "000000005673d86e015677bbc51d0102";//简约派id
        //options.tableCode = "1c0302581b104623848d1e0acaddcc4f";
        //options.tableName = "A1";
        //options.resId = "0000000055dd15670155ddd056ef0121";//洪记01id
        //options.tableCode = "7cd5d5c6a57643ae9a9fb87a514c3ce9";
        //options.tableName = "A1";
        console.log(options, '-----------options');
        /**
         * 登入
         */
        this.login(options);
    },
    onShow: function (options) {
        console.log('进入界面');
        if (!app.globalData.rid) {
            app.globalData.resId = '';
            app.globalData.tableCode = '';
            app.globalData.tableName = '';
        }
        if (!this.data.hasHide) return;
        this.setData({hasHide: false});
        if (app.globalData.isBindPhone) {
            this.setData({
                module: 'module'
            });
        }
        this.loadCardList();
    },
    onHide: function () {
        console.log('离开界面');
        this.setData({hasHide: true});
    },
    /**
     * 分享页面
     */
    onShareAppMessage: function () {
        return {
            title: 'V卡汇',
            path: '/pages/init/init?resId=' + "000000005673d86e015677bbc51d0102",//简约派id
            success: function (res) {
                wx.showToast({
                    title: '分享成功',
                    icon: 'success',
                    duration: 2000
                })
            },
            fail: function (res) {
                wx.showToast({
                    title: '分享失败',
                    icon: 'success',
                    duration: 2000
                })
            }
        }
    },
    uploadWechatUser: function (options) {
        var that = this;
        var url = app.globalData.serverAddress + "microcode/bindMemberCard";
        var data = {
            openId: app.globalData.openId,
            resId: options.resId,
            type: 0
        };
        appUtil.httpRequest(url, data, function (rsp) {
            // console.log(rsp);
            that.loadCardList();
            if (rsp.returnStatus) {
            }
        });
    },
    login(options) {
        // //var openId = "oEewJ0Ug0Wfd0CCC1iL1mRq6_2kg";
        // app.globalData.openId = openId;
        // app.globalData.token = token;
        let _this = this,
            rid = app.globalData.rid || app.getQrcodeRid(options),
            flag = false,
            openId = app.globalData.openId;
        console.log(rid, "----------------rid", options);
        if (rid && rid.length > 0) {
            // let src = decodeURIComponent(options.q);
            // rid = src.match(/id=(\S*)/)[1];
            flag = true;
        } else if (options && !util.isEmptyObject(options)) {
            app.globalData.tableCode = options.tableCode;
            app.globalData.tableName = options.tableName;
            _this.setData(options);
        }
        if (!openId || openId.length === 0) {
            console.log('登入未完成');
            app.requestLogin(login);
        } else {
            login();
        }

        function login() {
            const globalData = app.globalData,
                openId = globalData.openId,
                token = globalData.token;
            // 获取用户信息
            if (app.globalData.userInfo && util.isEmptyObject(app.globalData.userInfo)) {
                app.getUserInfo(setUserInfo);
            } else {
                setUserInfo();
            }
            _this.loadCardList();//加载会员卡列表
        }

        function setUserInfo() {
            let resId = app.globalData.resId;
            if (flag) {
                console.log('获取二维码店铺ID登入');
                app.getResId(setResId);
            } else {
                console.log('非二维码店铺ID登入', resId);
            }
        }

        function setResId() {
            let resId = app.globalData.resId;
            if (!resId || resId.length === 0) return;
            let userVerification = app.globalData.userVerification;
            console.log('进入setResId', userVerification);
            if (userVerification && !util.isEmptyObject(userVerification)) {
                _this.setData(userVerification);
                _this.initiaLogin(userVerification.resId);
            } else {
                console.log('用户验证对象为空');
            }
        }
    },
    initiaLogin(resId) {
        let _this = this,
            data = {
                openId: app.globalData.openId,
                nikeName: app.globalData.userInfo.nickName,
                sex: app.globalData.userInfo.gender,
                headImgUrl: app.globalData.userInfo.avatarUrl,
                resId: resId
            };
        console.log('是否首次登录', resId);
        if (!resId || resId.length === 0) return;
        app.checkIsFirstUse(data, function (rsp) {
            let options = _this.data;
            app.globalData.rid = null;
            app.globalData.resId = null;
            console.log('是否首次登录__', rsp, options);
            if (rsp.returnStatus) {
                //首次登录
                _this.setData({
                    module: 'moduleActive'
                });
            } else {
                if (options.resId && options.type == 0) {
                    wx.navigateTo({
                        url: "/pages/canteen/index/index?resId=" + options.resId + "&tableCode=" + options.tableCode + "&tableName=" + options.tableName,
                    })
                } else if (options.resId && options.type == 1) {
                    wx.navigateTo({
                        url: "/pages/canteen/index/index?resId=" + _this.data.resId + "&tableCode=" + _this.data.tableCode + "&tableName=" + _this.data.tableName + "&currentTab=2",
                    })
                }
            }
        });
    },
    /**
     * 加载会员拉列表
     */
    loadCardList: function () {
        var that = this;
        app.globalData.resDetailData = JSON.parse(wx.getStorageSync('getMemberCardList') || '[]');
        if (app.globalData.resDetailData && app.globalData.resDetailData.length > 0)
            setMemberCardList(app.globalData.resDetailData);

        function setMemberCardList(value) {
            var vkahuiData = value;
            //折扣百分比转化
            vkahuiData.forEach(function (val, key) {
                //百分比
                if (val.memberTypeDiscount == undefined || val.memberTypeDiscount == 0 || val.memberTypeDiscount == null) {
                    vkahuiData[key].memberTypeDiscount = 0;
                } else {
                    vkahuiData[key].memberTypeDiscount = val.memberTypeDiscount / 10;
                }
                vkahuiData[key].memberBalance = parseFloat(vkahuiData[key].memberBalance).toFixed(2);
                //店铺Logo
                val.resLogo = app.globalData.serverAddressImg + val.resLogo;
                const ctx = wx.createCanvasContext(vkahuiData[key].resId);
                var i = 0;
                while (i < 375) {
                    ctx.arc(6 + i, 5, 3, 0, 2 * Math.PI);
                    ctx.setFillStyle('#ffffff');
                    ctx.fill();
                    i += 14;
                }
                ctx.draw();
                console.log("7--------------");
                if (val.resId == that.data.resId) {
                    val.tableCode = app.globalData.tableCode;
                    val.tableName = app.globalData.tableName;
                }
            });
            that.setData({
                vkahuiData
            });
        };

        apiService.getMemberCardList({openId: app.globalData.openId}, (rsp) => {
            if (rsp.returnStatus) {
                app.globalData.resDetailData = rsp.value;
                wx.setStorageSync('getMemberCardList', JSON.stringify(rsp.value));
                setMemberCardList(rsp.value)
            } else {
                that.setData({
                    vkahuiData: []
                });
            }
        })
    },
    tab: function (e) {
        var that = this;
        var id = e.currentTarget.dataset.id;
        if (id == "dingdan") {
            that.setData({
                shouye: true,
                dingdan: true,
                wo: false
            });
            wx.redirectTo({
                url: '/pages/order/index/index',
            });
        } else if (id == "wo") {
            that.setData({
                shouye: true,
                dingdan: false,
                wo: true
            });
            wx.redirectTo({
                url: '/pages/vkahui/me/me',
            });
        }
    },
    //提示绑定手机部分
    module: function (res) {
        var that = this;
        // console.log(res);
        that.setData({
            module: 'moduleActive'
        });
    },
    close: function (res) {
        //点击直接使用，跳转到点餐业
        var that = this;
        var options = that.data;
        // that.uploadWechatUser(options);
        that.loadCardList();
        that.setData({
            module: ''
        });
        if (that.data.resId) {
            wx.navigateTo({
                url: "/pages/canteen/index/index?resId=" + options.resId + "&tableCode=" + options.tableCode + "&tableName=" + options.tableName,
                success(res) {

                }
            })
        }
    },
    phone: function () {
        var that = this;
        var options = that.data,
            url = encodeURIComponent("/pages/canteen/index/index?resId=" + options.resId + "&tableCode=" + options.tableCode + "&tableName=" + options.tableName);
        wx.navigateTo({
            url: "/pages/vkahui/phone-add/phone-add?resId=" + options.resId + "&tableCode=" + options.tableCode + "&tableName=" + options.tableName + '&jumpUrl=' + url,
            success: function (res) {
                // console.log('跳转到绑定手机页面')
                that.setData({
                    module: ''
                });
            },
        });
    },
});