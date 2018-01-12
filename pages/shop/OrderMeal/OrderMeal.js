// pages/shop/OrderMeal/OrderMeal.js
const app = getApp(),
    config = require('../../../utils/config'),
    pageConfig = require('./config'),
    util = require('../../../utils/util'),
    utilCommon = require('../../../utils/utilCommon'),
    ApiService = require('../../../utils/ApiService');

const appPage = {
    /**
     * 页面的初始数据
     */
    data: {
        text: "Page orderMeal",
        pageConfig,
        isShow: false,//进入初始是否刷新数据
        hasMoreData: false,//是否有更多
        isAnimated: false,
        options: {},
        orderType: 0,
        isShareCurrentPage: 1,//是否分享首页
        imageServer: config.imageUrl,//图片服务器地址
        nickname: '',
        shopInfo: null,
        orderMealData: {},
        business_rule_info: {}
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        new app.ToastPannel();//初始自定义toast
        new app.ModulePopup();//初始自定义弹窗
        new app.PickerView();//初始pickerView
        let that = this;
        try {
            if (options) {
                Object.assign(that.data.options, options);
                console.warn(`初始化${that.data.text}`, options);
            } else {
                throw {message: '初始化options为空'};
            }
        } catch (e) {
            console.warn(e, options);
        }
        that.loadCb();
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        this.setData({
            isShow: true
        });
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        console.warn(`${this.data.text}页面显示`);
        this.isShow && this.loadData()
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        console.warn(`${this.data.text}页面隐藏`);
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        console.warn(`${this.data.text}页面卸载`);
    },

    // /**
    //  * 页面相关事件处理函数--监听用户下拉动作
    //  */
    // onPullDownRefresh: function () {
    //
    // },
    //
    // /**
    //  * 页面上拉触底事件的处理函数
    //  */
    // onReachBottom: function () {
    //
    // },
    //
    // /**
    //  * 用户点击右上角分享
    //  */
    // onShareAppMessage: function () {
    //
    // }
};
const methods = {
    loadCb() {
        let that = this;
        app.getLoginRequestPromise().then(
            (rsp) => {
                if (2000 == rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                    that.data.objId = rsp.value.objId;
                    that.data.token = rsp.value.token;
                    that.data.userInfo = app.globalData.userInfo;
                    app.globalData.orderMealData = {
                        source: 1,
                        reserveTime: null,
                        tableCode: null,
                        tableName: null,
                        name: null,
                        mobile: null,
                        orderFoodJson: null,
                        areaName: null,
                        areaCode: null,
                    };
                    ApiService.token = rsp.value.token;
                    that.loadData();
                } else {
                    console.warn('获取objId失败');
                    util.failToast('用户登录失败');
                }
            },
            (err) => {

            }
        );
    },
    loadData() {
        let that = this,
            options = that.options,
            resId = options.resId,
            orderType = options.orderType,
            data = {
                resId,
                orderType,
                orderMealData: app.globalData.orderMealData
            };

        // 获取店铺信息
        that.utilPage_getResDetail(options.resId)
            .then(
                () => {
                    let shopInfo = that.data.shopInfo;
                },
                (err) => {
                    if (1 === err.code)
                        that.showToast('获取店铺信息失败,请重试');
                }
            );
        ApiService.getReserveBusinessRules({resId}).then(
            (res) => {
                if (2000 === res.code && utilCommon.isEmptyValue(res.value)) {
                    data.business_rule_info = res.value
                }
            }
        ).finally(() => {
            that.setData(data);
        })
        // that.azm_pickerView_show({
        //     title: '预约日期选择',
        //     type: 'calendar',
        //     isAnimated: true,
        //     data: {
        //         value: ''
        //     },
        //     success(res) {
        //
        //     },
        //     fail(rsp) {
        //         console.log(rsp);
        //     },
        //     complete(rsp) {
        //         if (rsp.cancel) {
        //
        //         }
        //     }
        // });
    },
    routerGo(e) {
        console.log(e);
        let that = this,
            resId = that.data.resId,
            orderType = that.data.orderType,
            dataset = e.currentTarget.dataset,
            componentId = dataset.componentId,
            value = dataset.value;
        try {
            componentId && that.setData({[componentId]: value});
            if (util.regExpUtil.isDateTime(value)) {
                value = +new Date(value)
            }
            util.go(dataset.link, {
                data: {
                    value,
                    resId, orderType
                }
            })
        } catch (err) {
            console.log('调用routerGo函数错误');
        }
    },
}
const events = {}
Object.assign(appPage, methods, events);
Page(Object.assign(appPage, app.utilPage));