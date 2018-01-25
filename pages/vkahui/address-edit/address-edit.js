const app = getApp(),
    util = require('../../../utils/util.js'),
    utilCommon = require('../../../utils/utilCommon'),
    authorize = require('../../../utils/authorize'),
    ApiService = require('../../../utils/ApiService');
const appPage = {
    data: {
        text: 'page address-edit',
        isShow: false,
        options: {},
        focus: 0,
        nikeName: '',
        mobile: '',
        sex: 0,
        location: {
            address: '',
            name: '',
            longitude: '',
            latitude: ''
        },
        isAddress: 0,
        isWaimai: 0,
        gaiAddress: false,//新增地址
    },
    onLoad(options) {
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
     * 页面渲染完成
     */
    onReady() {
        this.setData({
            isShow: true
        });
    },
    /**
     * 页面显示
     * @param options 为页面跳转所带来的参数
     */
    onShow(options) {
        console.warn(`${this.data.text}页面显示`);
    },
    onHide() {
        // 页面隐藏
    },
    onUnload() {
        // 页面关闭
    }
};
const methods = {
    loadCb() {
        let that = this,
            options = that.data.options;
        try {
            let location = {}, address = [], nickName;
            if (options && utilCommon.isFalse(options.address)) {
                address = decodeURIComponent(options.address).split(',');
                if (address.length > 1) {
                    location.address = address[0];
                    location.name = address[1];
                    location.longitude = options.longitude;
                    location.latitude = options.latitude;
                } else {
                    location.name = address[0];
                }
            }
            if (options && utilCommon.isFalse(options.name)) {
                nickName = decodeURIComponent(options.name);
            }
            that.setData({
                location: location,
                nikeName: nickName,
                mobile: utilCommon.isFalse(options.mobile),
                id: utilCommon.isFalse(options.id),
                sex: utilCommon.isFalse(options.sex),
                gaiAddress: options.gaiAddress || 0,
                isWaimai: options.isWaimai || 0
            });
            if (1 == that.data.gaiAddress) {
                that.setData({
                    nikeName: that.data.name,
                    sex: that.data.sex,
                    mobile: that.data.mobile,
                    address: that.data.address
                });
            }
        } catch (e) {
            console.log('编辑配送地址初始化失败,pages/vkahui/address-edit/address-edit');
        }
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

            }
        );
    },
    loadData() {

    },
    formSubmit(e) {
        var value = e.detail.value,
            location = this.data.location;
        var address = {
            nikeName: value.nikeName,
            sex: value.sex,
            mobile: value.mobile,
            location: {
                name: value.addressName,
                address: value.address
            }
        };
        Object.assign(this.data, address);
        this.data.location = Object.assign(location, address.location);
        this.submit();
    },
    chooseLocation() {
        let that = this;
        authorize.userLocation(true).then(
            function () {
                util.chooseLocation().then(function (res) {
                    that.setData({
                        location: res,
                        focus: 2
                    });
                })
            },
            () => {
                wx.showModal({
                    content: '请打开微信定位权限，避免无法获取用户定位导致配送问题',
                    showCancel: false,
                    confirmText: '知道了'
                });
            }
        );
    },
    bindChange(e) {
        let value = e.detail.value,
            name = e.currentTarget.dataset.name;
        this.data[name] = value;
    },
    next(e) {
        let focus = e.currentTarget.dataset.focus;
        focus++;
        this.setData({
            focus
        });
    },
    submit() {
        let that = this,
            location = that.data.location;
        console.log(this.data, 'submit');
        let locationAddress = '';
        if (location.address && location.name.length > 0 && location.latitude && location.longitude) {
            locationAddress = location.address + ',' + (location.name || '')
        } else {
            that.showToast('获取位置失败，为了你的餐品能及时送达请允许定位权限申请');
            return;
        }
        let address = {
            sex: that.data.sex,
            mobile: that.data.mobile,
            address: locationAddress,
            latitude: location.latitude,
            longitude: location.longitude
        };
        if (!that.data.nikeName || that.data.nikeName.length === 0) {
            that.showToast('姓名不能为空');
            return;
        }
        if (!utilCommon.isNumberOfNaN(that.data.sex)) {
            that.showToast('请选择性别');
            return;
        }
        if (!that.data.mobile || !(/^1[34578]\d{9}$/.test(that.data.mobile))) {
            that.showToast('输入的手机号码格式有误，请重新输入');
            return;
        }
        if (that.data.gaiAddress) {//更新地址
            address.id = that.data.id;
            address.name = that.data.nikeName;
            ApiService.updateConsigneeAddress(address,
                (rsp) => {
                    if (2000 === rsp.code) {
                        util.showToast({
                            title: "更新地址成功",
                            success: function () {
                                let addressId = that.data.id;
                                if (1 == that.data.isWaimai) {
                                    setDefaultAddress({userId: that.data.objId, id: addressId});
                                } else {
                                    util.go(-1);
                                }
                            }
                        })
                    }
                },
                (rsp) => {
                    if (!rsp.status) {
                        util.failToast('更新地址失败')
                    }
                }
            )
        } else {//新增地址
            address.userId = that.data.objId;
            address.name = that.data.nikeName;
            ApiService.addAddress(address,
                (rsp) => {
                    if (2000 === rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                        util.showToast({
                            title: "添加地址成功",
                            success: function () {
                                let addressId = rsp.value;
                                if (1 == that.data.isWaimai) {
                                    setDefaultAddress({userId: that.data.objId, id: addressId});
                                } else {
                                    util.go(-1);
                                }
                            }
                        });
                    }
                },
                (rsp) => {
                    if (!rsp.status) {
                        util.failToast('添加地址失败')
                    }
                }
            )
        }

        let setDefaultAddress = (data) => {
            ApiService.setDefaultAddress(data,
                () => {

                },
                () => {
                    util.go(-1);
                }
            );
        };
    }
};

const events = {};

Object.assign(appPage, methods, events);
Page(Object.assign(appPage));