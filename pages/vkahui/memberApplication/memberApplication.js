const app = getApp(),
    config = require('../../../utils/config'),
    util = require('../../../utils/util'),
    RegExpUtil = require('../../../utils/RegExpUtil'),
    utilCommon = require('../../../utils/utilCommon'),
    ApiService = require('../../../utils/ApiService');
const appPage = {
    data: {
        text: "memberApplication",
        currentDate: new Date(),
        isShow: false,//进入初始是否刷新数据
        hasMoreData: false,//是否有更多
        options: {},
        isShareCurrentPage: 1,//是否分享首页
        imageServer: config.imageUrl,//图片服务器地址
        resLogo: null,//店铺头像
        resName: null,//店铺名字
        memberCardDto: {
            name: '',
            birthday: '',
            sex: 0,
            provinceId: '',
            cityId: ''
        },//会员卡资料
        isMemberCardDto: false,//是否会员
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
        region: [0, 0],
        customItem: '全部',
        objectMultiArray: [
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
        _objectMultiArray: {},
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
        },
        mobile: null,//手机号码
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
                if (2000 === rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                    that.data.objId = rsp.value.objId;
                    that.data.token = rsp.value.token;
                    that.data.userInfo = app.globalData.userInfo;
                    ApiService.token = rsp.value.token;
                    that.loadData(true);
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
    loadData(bol) {
        let that = this,
            options = that.data.options,
            objId = that.data.objId,
            data = {};
        if (!options.resId) util.go(-1);
        data.resId = options.resId;
        if (options.resLogo) {
            data.resLogo = decodeURIComponent(options.resLogo);
        }
        if (options.resName) {
            data.resName = decodeURIComponent(options.resName);
        }
        that.setData({hasMoreData: false});
        ApiService.checkMember(
            {objId, resId: options.resId},
            (rsp) => {
                if (2000 === rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                    data.isMemberCardDto = utilCommon.isEmptyValue(rsp.value.member);
                    data.isBindMobile = rsp.value.isBindMobile;
                }
            },
            () => {
                if (!data.isBindMobile && bol) {
                    that.bindPhoneNumber();
                }
                data.hasMoreData = true;
                that.setData(data);
            }
        );
        ApiService.getCommonUserInfo(
            {objId},
            (rsp) => {
                if (2000 === rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                    let commonUser = rsp.value.commonUser,
                        region = [rsp.value.province, rsp.value.city],
                        mobile = commonUser.mobile ? commonUser.mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '';
                    let birthday = '';
                    if (commonUser.birthday) {
                        birthday = util.dateFormate.format(commonUser.birthday, 'YYYY-MM-DD');
                    }
                    that.setData({
                        memberCardDto: Object.assign(
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
    },
    /**
     * 会员资料提交
     */
    formInfoSubmit(e) {
        let that = this,
            value = e.detail.value,
            formId = e.detail.formId,//"the formId is a mock one"
            memberCardDto = that.data.memberCardDto,
            resId = that.data.resId,
            objId = that.data.objId;
        if (!value && !resId && !objId) return;
        if (!util.trim(value.name)) {
            that.showToast('请填写姓名');
        } else if (!value.birthday) {
            that.showToast('请选择生日');
        } else if (1 != value.sex && 2 != value.sex) {
            that.showToast('请设置性别');
        } else if (!memberCardDto.provinceId || !memberCardDto.cityId) {
            that.showToast('请设置地区');
        } else {
            value.provinceId = memberCardDto.provinceId;
            value.cityId = memberCardDto.cityId;
            value.birthday += ' 00:00:00';
            delete value.address;
            ApiService.applyMember(
                Object.assign(value, {objId, resId}),
                (rsp) => {
                    if (2000 === rsp.code && utilCommon.isEmptyValue(rsp.value)) {

                    }
                },
                () => {
                    that.loadData();
                });
        }
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
        // util.go('/pages/vkahui/phone-add/phone-add');
        let that = this;
        that.azm_modulePopup_show({
            title: '绑定手机',
            type: 'modulePhone',
            confirmText: '确定',
            isAnimated: true,
            data: {
                mobile: that.data.mobile,
                focus_mobile: 1
            },
            success(res) {
                if (res.confirm) {
                    let value = res.value;
                    if (value && utilCommon.isEmptyValue(value)) {
                        let code = value.code,
                            mobile = value.mobile;
                        mobile = util.trim(mobile);
                        that.data.mobile = mobile;
                        if (!code || util.trim(code).length === 0) {
                            util.failToast('验证码为空');
                            return;
                        } else if (code.length !== 6) {
                            util.failToast('验证码位数不足');
                            return;
                        } else if (!mobile) {
                            util.failToast('手机号码为空');
                            return;
                        } else if (!RegExpUtil.isPhone(mobile)) {
                            util.failToast('手机格式错误');
                            return;
                        }
                        let data = {
                            "objId": that.data.objId,
                            "mobile": mobile,
                            "code": code,
                            config: {
                                isLoading: true
                            }
                        };
                        ApiService.bindMobile(data,
                            (rsp) => {
                                if (2000 === rsp.code) {
                                    that.showToast('绑定手机成功')
                                }
                            },
                            (rsp) => {
                                if (!rsp.status) {

                                }
                                that.loadData()
                            }
                        );
                    }
                }
            },
            verify(value) {
                let code = value.code,
                    mobile = value.mobile;
                mobile = util.trim(mobile);
                if (!mobile) {
                    util.failToast('手机号码为空');
                    return;
                } else if (!RegExpUtil.isPhone(mobile)) {
                    util.failToast('手机格式错误');
                    return;
                } else if (!code || util.trim(code).length === 0) {
                    util.failToast('验证码为空');
                    return;
                } else if (code.length !== 6) {
                    util.failToast('验证码位数不足');
                    return;
                } else {
                    return true;
                }
            }
        });
    },
    /**
     * 点击生日Picker控件
     * @param e
     */
    bindDateChange(e) {
        console.log(e);
        let that = this,
            value = e.detail.value;
        if (value) {
            that.setData({
                [`memberCardDto.birthday`]: value
            })
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
            arraySex = that.data.arraySex;
        if (value) {
            that.setData({
                [`memberCardDto.sex`]: arraySex[value].id
            })
        }
    },
    /**
     * 点击地区Picker控件
     */
    bindRegionTap() {
        let that = this;
        ApiService.getAllProvince({},
            (rsp) => {
                if (2000 === rsp.code && utilCommon.isEmptyValue(rsp.value)) {
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
        console.log(e);
        let that = this,
            value = e.detail.value,
            addAddress = that.data.addAddress;
        console.log(value);
        if (value && value[0] && value[1]) {
            let cityId = addAddress.range[1][value[1]].id,
                provinceId = addAddress.range[0][value[0]].id,
                region = [addAddress.range[0][value[0]], addAddress.range[1][value[1]]];
            that.setData({
                [`memberCardDto.provinceId`]: provinceId,
                [`memberCardDto.cityId`]: cityId,
                [`addAddress.region`]: region,
                [`addAddress.value`]: value
            });
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
                            if (2000 === rsp.code && utilCommon.isEmptyValue(rsp.value)) {
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
};
Object.assign(appPage, methods, events);
Page(Object.assign(appPage, app.utilPage));