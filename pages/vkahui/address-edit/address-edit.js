var appUtil = require('../../../utils/appUtil.js');
var util = require('../../../utils/util.js');
var utilCommon = require('../../../utils/utilCommon');
var authorize = require('../../../utils/authorize');
var ApiService = require('../../../utils/ApiService');
var app = getApp();
Page({
    data: {
        focus: 0,
        nikeName: '',
        mobile: '',
        sex: 0,
        location: {
            address: '',
            name: ''
        },
        isAddress: 0,
        isWaimai: false,
        gaiAddress: false,//新增地址
    },
    onLoad: function (options) {
        new app.ToastPannel();//初始自定义toast
        var that = this;
        let location = {}, address = [], nickName;
        if (utilCommon.isFalse(options.address)) {
            address = decodeURIComponent(options.address).split(',');
            if (address.length > 1) {
                location.address = address[0];
                location.name = address[1];
            } else {
                location.name = address[0];
            }

        }
        if (utilCommon.isFalse(options.name)) {
            nickName = decodeURIComponent(options.name);
        }
        that.setData({
            location: location,
            nikeName: nickName,
            mobile: utilCommon.isFalse(options.mobile),
            id: utilCommon.isFalse(options.id),
            sex: utilCommon.isFalse(options.sex),
            gaiAddress: utilCommon.isFalse(options.gaiAddress),
            isWaimai: utilCommon.isFalse(options.isWaimai)
        });
        if (that.data.gaiAddress) {
            that.setData({
                nikeName: that.data.name,
                sex: that.data.sex,
                mobile: that.data.mobile,
                address: that.data.address,
            });
            if (that.data.sex == 1) {
                that.setData({check: true});
            }
        }
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
        let _this = this;
        authorize.userLocation().then(function () {
            util.chooseLocation().then(function (res) {
                console.log('成功', res);
                _this.setData({
                    location: res,
                    focus: 2
                });
            }, function (res) {
                console.log('取消', res);
            })
        });
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
        let _this = this,
            location = _this.data.location;
        console.log(this.data, 'submit');
        let locationAddress = '';
        if (location.address && location.name.length > 0) {
            locationAddress = location.address + ',' + (location.name || '')
        } else {
            _this.showToast('请重新定位');
            return;
        }
        let address = {
            sex: _this.data.sex,
            mobile: _this.data.mobile,
            address: locationAddress
        };
        if (!_this.data.nikeName || _this.data.nikeName.length === 0) {
            _this.showToast('姓名不能为空');
            return;
        }
        if (!utilCommon.isNumberOfNaN(_this.data.sex)) {
            _this.showToast('请选择性别');
            return;
        }
        if (!_this.data.mobile || !(/^1[34578]\d{9}$/.test(_this.data.mobile))) {
            _this.showToast('输入的手机号码格式有误，请重新输入');
            return;
        }
        if (_this.data.gaiAddress) {//修改地址
            address.id = _this.data.id;
            address.name = _this.data.nikeName;
            ApiService.updateConsigneeAddress(address, () => {
                util.showToast({
                    title: "修改收获地址成功",
                    success: function () {
                        if (_this.data.isWaimai) {
                            let addressId = _this.data.id;
                            setDefaultAddress({openId: app.globalData.openId, addressId});
                        } else {
                            goAddress();
                        }
                    }
                })
            })
        }
        else {//新增地址
            address.openId = app.globalData.openId;
            address.nikeName = _this.data.nikeName;
            ApiService.addAddress(address,
                () => {
                    util.showToast({
                        title: "添加收获地址成功",
                        success: function (rsp) {
                            if (_this.data.isWaimai != undefined) {
                                let addressId = rsp.value;
                                setDefaultAddress({openId: app.globalData.openId, addressId});
                            } else {
                                goAddress();
                            }
                        }
                    });
                })
        }

        let setDefaultAddress = (data) => {
            ApiService.setDefaultAddress(data, function () {
                util.go(-1);
            });
        };

        let goAddress = () => {
            util.go('/pages/vkahui/address/address', {
                type: 'blank'
            });
        };
    }
});