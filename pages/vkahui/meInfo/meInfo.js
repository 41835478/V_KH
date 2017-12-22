const app = getApp(),
    config = require('../../../utils/config'),
    util = require('../../../utils/util'),
    utilCommon = require('../../../utils/utilCommon'),
    ApiService = require('../../../utils/ApiService');
const appPage = {
    data: {
        text: "memberApplication",
        currentDate: new Date(),
        isShow: false,//进入初始是否刷新数据
        hasMoreData: false,//是否有更多
        options: {},
        imageServer: config.imageUrl,//图片服务器地址
        $userInfo: {},
        userInfo: {
            name: '',
            birthday: '',
            sex: 0,
            provinceId: '',
            cityId: '',
            nickName: '',
            id: ''
        },//用户资料
        isBindMobile: 0,//是否绑定手机
        arraySex: [
            {
                id: 1,
                name: '男'
            },
            {
                id: 2,
                name: '女'
            }
        ],
        customItem: '全部',
        addAddress: {
            range: [
                [
                    {
                        id: 0,
                        name: '全部'
                    }
                ],
                [
                    {
                        id: 0,
                        name: '全部'
                    }
                ]
            ],
            value: [0, 0],
            region: [],
            _range: {}
        }
    },
    /**
     * 页面初始化
     * @param options 为页面跳转所带来的参数
     */
    onLoad: function (options) {
        new app.ToastPannel();//初始自定义toast
        new app.ModulePopup();//初始自定义弹窗
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
     * 页面渲染完成
     */
    onReady: function () {
        this.setData({
            isShow: true
        });
    },
    /**
     * 页面显示
     * @param options 为页面跳转所带来的参数
     */
    onShow: function (options) {
        let that = this;
        console.warn(`${this.data.text}页面显示`);
        if (that.data.isShow && that.data.hasMoreData) {
            that.loadData();
        }
    },
    onHide: function () {
        // 页面隐藏
    },
    onUnload: function () {
        // 页面关闭
        this.setData({
            shopCart: []
        });
    }
};
/**
 * 方法类
 */
const methods = {
    loadCb() {
        let that = this;
        app.getLoginRequestPromise().then(
            (rsp) => {
                if (2000 == rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                    that.data.objId = rsp.value.objId;
                    that.data.token = rsp.value.token;
                    that.data.userInfo = app.globalData.userInfo;
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
    /**
     * 加载数据
     */
    loadData() {
        let that = this,
            objId = that.data.objId;
        that.setData({
            hasMoreData: false,
            currentDate: util.dateFormate.format(new Date(), 'YYYY-MM-DD')
        });
        ApiService.getCommonUserInfo(
            {objId},
            (rsp) => {
                if (2000 == rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                    let commonUser = rsp.value.commonUser,
                        region = [rsp.value.province, rsp.value.city],
                        mobile = commonUser.mobile ? commonUser.mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '';
                    let birthday = '';
                    if (commonUser.birthday) {
                        birthday = util.dateFormate.format(commonUser.birthday, 'YYYY-MM-DD');
                    }
                    that.setData({
                        userInfo: Object.assign(
                            that.data.userInfo,
                            {
                                name: commonUser.name,
                                birthday,
                                sex: commonUser.sex,
                                provinceId: commonUser.provinceId,
                                cityId: commonUser.cityId,
                                nickName: commonUser.nickName,
                                id: commonUser.id,
                                mobile
                            }
                        ),
                        [`addAddress.region`]: region,
                        isBindMobile: mobile ? 1 : 0
                    });
                }
            },
            true,
            (rsp) => {

            }
        );
    }
};
const events = {
    /**
     * 返回按钮
     */
    bindGoBack() {
        util.go(-1);
    },
    /**
     * 绑定手机按钮
     */
    bindPhoneNumber() {
        util.go('/pages/vkahui/phone-add/phone-add');
    },
    /**
     * 点击生日Picker控件
     * @param e
     */
    bindDateChange(e) {
        console.log(e);
        let that = this,
            value = e.detail.value,
            objId = that.data.objId,
            userInfo = that.data.userInfo;
        if (value && userInfo.id) {
            ApiService.updateCommonUserInfo({
                    objId,
                    id: userInfo.id,
                    birthday: `${value} 00:00:00`
                },
                (rsp) => {
                    if (2000 == rsp.code) {
                        that.setData({
                            [`userInfo.birthday`]: value
                        });
                        that.showToast(rsp.message);
                    }
                }
            )
        }
    },
    /**
     * 点击性别Picker控件
     * @param e
     */
    bindSexChange(e) {
        console.log(e);
        let that = this,
            value = e.detail.value,
            objId = that.data.objId,
            userInfo = that.data.userInfo,
            arraySex = that.data.arraySex;
        if (value && userInfo.id) {
            ApiService.updateCommonUserInfo({
                    objId,
                    id: userInfo.id,
                    sex: arraySex[value].id
                },
                (rsp) => {
                    if (2000 == rsp.code) {
                        that.setData({
                            [`userInfo.sex`]: arraySex[value].id
                        });
                        that.showToast(rsp.message);
                    }
                }
            )
        }
    },
    /**
     * 点击地区Picker控件
     */
    bindRegionTap() {
        let that = this;
        ApiService.getAllProvince({},
            (rsp) => {
                if (2000 == rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                    let addAddress = [{
                        id: 0,
                        name: '全部'
                    }];
                    that.setData({
                        [`addAddress.range[0]`]: addAddress.concat(rsp.value)
                    })
                }
            },
            () => {

            }
        );
    },
    /**
     * 点击地区Picker修改值触发事件
     * @param e
     */
    bindRegionChange(e) {
        let that = this,
            value = e.detail.value,
            objId = that.data.objId,
            userInfo = that.data.userInfo,
            addAddress = that.data.addAddress;
        if (value && value[0] && value[1] && userInfo.id) {
            let cityId = addAddress.range[1][value[1]].id,
                provinceId = addAddress.range[0][value[0]].id,
                region = [addAddress.range[0][value[0]], addAddress.range[1][value[1]]];
            if (!cityId || !provinceId) return;
            ApiService.updateCommonUserInfo({
                    objId,
                    id: userInfo.id,
                    cityId,
                    provinceId
                },
                (rsp) => {
                    if (2000 == rsp.code) {
                        that.setData({
                            [`userInfo.provinceId`]: provinceId,
                            [`userInfo.cityId`]: cityId,
                            [`addAddress.region`]: region,
                            [`addAddress.value`]: value
                        });
                        that.showToast(rsp.message);
                    }
                }
            )
        }
    },
    /**
     * 点击地区Picker单列滑动改变触发事件
     * @param e
     */
    bindRegionColumnChange(e) {
        let that = this,
            addAddress = that.data.addAddress,
            value = e.detail.value,
            column = e.detail.column;
        let _addAddress = [{
            id: 0,
            name: '全部'
        }];
        if (value) {
            let pid = addAddress.range[column][value].id;
            if (pid && column != addAddress.range.length - 1) {
                if (addAddress._range[pid] && addAddress._range[pid].length > 0) {
                    that.setData(
                        {
                            [`addAddress.range[${column + 1}]`]: _addAddress.concat(addAddress.range[pid])
                        }
                    );
                } else {
                    ApiService.getRegionByPid({pid},
                        (rsp) => {
                            if (2000 == rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                                addAddress._range[pid] = rsp.value;
                                that.setData(
                                    {
                                        [`addAddress.range[${column + 1}]`]: _addAddress.concat(rsp.value)
                                    }
                                );
                            }
                        },
                        () => {

                        });
                }
            }
        }
    },
    bindAzmCloseMask(e) {
        let that = this;
        that.utilPage_closeModule('moduleName');//关闭规格弹框
    },
    bindNickName(e) {
        let that = this,
            objId = that.data.objId,
            userInfo = that.data.userInfo,
            value = e.currentTarget.dataset.value;
        that.azm_modulePopup_show({
            title: '编辑昵称',
            type: 'moduleName',
            confirmText: '完成',
            isAnimated: true,
            data: {
                value
            },
            success(res) {
                if (res.confirm) {
                    if (utilCommon.isEmptyValue(res.value) && util.trim(res.value.name) && userInfo.name !== res.value.name) {
                        ApiService.updateCommonUserInfo({
                                objId,
                                id: userInfo.id,
                                name: res.value.name
                            },
                            (rsp) => {
                                if (2000 == rsp.code) {
                                    that.setData({
                                        [`userInfo.name`]: res.value.name,
                                    });
                                    that.showToast(rsp.message);
                                }
                            }
                        )
                    }

                }
            }
        });
    }
};
Object.assign(appPage, methods, events);
Page(Object.assign(appPage, app.utilPage));