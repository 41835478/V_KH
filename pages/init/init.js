const app = getApp(),
    config = require('../../utils/config'),
    util = require('../../utils/util'),
    utilCommon = require('../../utils/utilCommon'),
    ApiService = require('../../utils/ApiService');

const appPage = {
    data: {
        text: "Page init",
        isShow: false,//进入初始是否刷新数据
        hasMoreData: false,//是否有更多
        imageServer: config.imageUrl,//图片服务器地址
        options: {},
        memberCardList: [],//会员卡列表
    },
    onLoad: function (options) {
        new app.ToastPannel();//初始自定义toast
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
     * 进入页面
     */
    onShow: function (options) {
        console.warn(`进入${this.data.text}`, options);
        if (this.data.isShow) {
            this.loadCb();
        }
    },
    /**
     * 离开页面
     */
    onHide: function () {
        console.warn(`离开${this.data.text}`);
        let that = this;
        that.setData({
            isShow: true
        })
    },
    /**
     * 页面渲染完成
     */
    onReady: function () {
        let that = this;
        that.setData({
            isShow: true
        });
        console.warn(`渲染完成${this.data.text}`);
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        let that = this;
        that.getMemberCardList().then(() => {
            setTimeout(() => {
                wx.stopPullDownRefresh();
            }, 500);
        });
    },
};
/**
 * 方法类
 */
const methods = {
    loadCb(cb) {
        let that = this;
        app.getLoginRequestPromise().then(
            (rsp) => {
                if (2000 === rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                    that.data.objId = rsp.value.objId;
                    that.data.token = rsp.value.token;
                    ApiService.token = rsp.value.token;
                    that.loadData();
                } else {
                    console.warn('获取objId失败');
                    util.failToast('用户登录失败');
                }
            },
            (err) => {
                cb && cb()
            }
        )
    },
    loadData() {
        this.getMemberCardList();//加载会员卡列表
    },
    getMemberCardList() {
        let that = this;
        return new Promise((resolve, reject) => {
            ApiService.getMemberCardList(
                {
                    objId: that.data.objId
                },
                (rsp) => {
                    if (2000 === rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                        that.setData({memberCardList: rsp.value});
                    } else {
                        // that.showToast(rsp.message);
                    }
                },
                (err) => {
                    if (err.status) {

                    }
                    that.setData({hasMoreData: true});
                    resolve();
                }
            )
        })
    }
};

const events = {
    dd() {

    }
};

Object.assign(appPage, methods, events);
Page(Object.assign(appPage, app.utilPage));