const app = getApp(),    config = require('../../../utils/config'),    util = require('../../../utils/util'),    utilCommon = require('../../../utils/utilCommon'),    ApiService = require('../../../utils/ApiService'),    {Tab} = require('../../../lib/zanui/index');const appPage = {    /**     * 页面的初始数据     */    data: {        text: "Page reservationDesk",        isShow: false,//进入初始是否刷新数据        hasMoreData: false,//是否有更多        isAnimated: false,        options: {},        orderType: 0,        isShareCurrentPage: 1,//是否分享首页        imageServer: config.imageUrl,//图片服务器地址        tab: {            list: [                {                    id: '0',                    title: '模糊选位'                },                {                    id: '1',                    title: '精准选位'                },            ],            selectedId: 0,            height: 45        },        tableDtoList: null,        tableSelect: {}    },    /**     * 生命周期函数--监听页面加载     */    onLoad: function (options) {        new app.ToastPannel();//初始自定义toast        new app.ModulePopup();//初始自定义弹窗        let that = this;        try {            if (options) {                Object.assign(that.data.options, options);                console.warn(`初始化${that.data.text}`, options);            } else {                throw {message: '初始化options为空'};            }        } catch (e) {            console.warn(e, options);        }        that.loadCb();    },    /**     * 生命周期函数--监听页面初次渲染完成     */    onReady: function () {        this.setData({            isShow: true        });    },    /**     * 生命周期函数--监听页面显示     */    onShow: function () {        console.warn(`${this.data.text}页面显示`);    },    /**     * 生命周期函数--监听页面隐藏     */    onHide: function () {        console.warn(`${this.data.text}页面隐藏`);    },    /**     * 生命周期函数--监听页面卸载     */    onUnload: function () {        console.warn(`${this.data.text}页面卸载`);    },    // /**    //  * 页面相关事件处理函数--监听用户下拉动作    //  */    // onPullDownRefresh: function () {    //    // },    // /**    //  * 页面上拉触底事件的处理函数    //  */    // onReachBottom: function () {    //    // },    // /**    //  * 用户点击右上角分享    //  */    // onShareAppMessage: function () {    //    // }};const methods = {    loadCb() {        let that = this;        app.getLoginRequestPromise().then(            (rsp) => {                if (2000 == rsp.code && utilCommon.isEmptyValue(rsp.value)) {                    that.data.objId = rsp.value.objId;                    that.data.token = rsp.value.token;                    that.data.userInfo = app.globalData.userInfo;                    ApiService.token = rsp.value.token;                    that.loadData();                } else {                    console.warn('获取objId失败');                    util.failToast('用户登录失败');                }            },            (err) => {            }        );    },    loadData() {        let that = this,            options = that.options        that.setData({            resId: options.resId,            orderType: options.orderType,        })        // 获取店铺信息        that.utilPage_getResDetail(options.resId)            .then(                () => {                    let shopInfo = that.data.shopInfo;                },                (err) => {                    if (1 === err.code)                        that.showToast('获取店铺信息失败,请重试');                }            );        that.getTableDtoList()    },    routerGo(e) {        console.log(e);        let dataset = e.currentTarget.dataset        try {            util.go(dataset.link)        } catch (err) {        }    },    getTableDtoList() {        let that = this, resId = that.data.resId;        ApiService.findTableDtoList(            {resId},            (rsp) => {                if (2000 == rsp.code && utilCommon.isEmptyValue(rsp.value)) {                    let tableDtoList = rsp.value;                    that.setData({                        tableDtoList,                        tableSelect: {                            subareaName: tableDtoList[0].subareaName,                            subareaId: tableDtoList[0].subareaId                        }                    })                }            }        );    },}const events = {    bindTimeChange(e) {        console.log(e);        let dataset = e.currentTarget.dataset,            value = dataset.value,            data = {};        if (utilCommon.isEmptyObject(value)) {            data.selectDate = value.dateTime        } else {            data.selectDate = e.detail.value        }        var index = this.data.dateList.findIndex(function (value, index, arr) {            if (data.selectDate === value.dateTime) {                return true            }        });        data.selectDateIndex = index        if (index === -1) {            data.selectDateIndex = 3        }        this.setData(data)    },    bindSelectDate(e) {        let dataset = e.currentTarget.dataset,            value = dataset.value;        this.setData({            selectDateTime: value.time        })    },    handleZanTabChange(e) {        var componentId = e.componentId;        var selectedId = e.selectedId;        this.setData({            [`${componentId}.selectedId`]: selectedId        });    },    bindSwiperChange(e) {        // console.log(e);        let current = e.detail.current,            dataset = e.currentTarget.dataset,            componentId = dataset.componentId;        console.log(componentId);        this.setData({            [`${componentId}.selectedId`]: current        })    },    bindTableSelect(e) {        // console.log(e);        let dataset = e.currentTarget.dataset,            subareaName = dataset.subareaName,            subareaId = dataset.subareaId,            tableCode = dataset.tableCode,            tableName = dataset.tableName;        this.setData({            tableSelect: {                tableCode, tableName, subareaName, subareaId            }        })    },    bindMoreSelect(e) {        let dataset = e.currentTarget.dataset,            componentId = dataset.componentId;        this.setData({            [`${componentId}.moreSelect`]: true        })    }};Object.assign(appPage, methods, events, Tab);Page(Object.assign(appPage, app.utilPage));