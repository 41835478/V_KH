let app = getApp(),
    utilCommon = require('../../../utils/utilCommon'),
    util = require('../../../utils/util.js'),
    ApiService = require('../../../utils/ApiService');
const appPage = {
    data: {
        text: 'page address',
        isShow: false,
        options: {},
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
        if (this.data.isShow) {
            this.loadData();
        }
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
        that.setData({
            isWaimai: options.isWaimai || 0
        });
        app.getLoginRequestPromise().then(
            (rsp) => {
                if (2000 == rsp.code && utilCommon.isEmptyValue(rsp.value)) {
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
    loadData() {//查询会员收货地址
        let that = this,
            objId = that.data.objId;
        ApiService.loadAddressList({userId: objId},
            (rsp) => {
                if (2000 == rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                    that.setData({
                        addressData: rsp.value
                    });
                }
            },
            (rsp) => {
                if (!rsp.status) {
                    // util.failToast(rsp.message);
                }
            }
        );
    },
};
const events = {
    /**
     * 删除地址
     */
    deleteAddress(e) {
        let that = this,
            addressId = e.currentTarget.dataset.id,
            data = {userId: that.data.objId, id: addressId};
        if (addressId && addressId.length > 0) {
            wx.showModal({
                content: '是否删除当前地址',
                confirmText: '是',
                cancelText: '否',
                cancelColor: '#f74b7b',
                success: function (res) {
                    if (res.confirm) {
                        ApiService.deleteConsigneeAddress(data,
                            (rsp) => {

                            },
                            (rsp) => {
                                if (rsp.code && 2000 == rsp.code) {
                                    util.showToast({
                                        title: '删除地址成功',
                                        success() {
                                            that.loadData();
                                        }
                                    });
                                } else {
                                    that.loadData();
                                }
                            }
                        )
                    } else if (res.cancel) {

                    }
                }
            });
        }
    },
    /**
     * 设置默认地址
     * @param e
     */
    changAddress(e) {
        let that = this,
            addressId = e.currentTarget.dataset.id,
            value = e.currentTarget.dataset.value;
        if (value && !value.defaultAddress) {
            let data = {userId: that.data.objId, id: addressId};
            ApiService.setDefaultAddress(data,
                function (rsp) {
                    if (2000 == rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                        if (1 == that.data.isWaimai) {
                            util.go(-1);
                        }
                    }
                },
                (rsp) => {
                    if (!rsp.status) {
                        util.failToast(rsp.message)
                    }
                    that.loadData();
                }
            );
        }
    },
    /**
     * 编辑地址
     * @param e
     */
    modify(e) {
        let that = this,
            address = e.currentTarget.dataset.modify,
            data = {
                isWaimai: that.data.isWaimai
            },
            type = '';
        if (utilCommon.isEmptyValue(address)) {
            data = Object.assign(data, {
                address: address.address,
                name: address.name,
                mobile: address.mobile,
                id: address.id,
                sex: address.sex,
                longitude: address.longitude,
                latitude: address.latitude,
                gaiAddress: 1
            })
        }
        if (1 == data.isWaimai) {
            type = 'blank';
        }
        util.go('/pages/vkahui/address-edit/address-edit', {
            type,
            data
        });
    }
};
Object.assign(appPage, methods, events);
Page(Object.assign(appPage));