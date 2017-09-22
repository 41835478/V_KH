var appUtil = require('../../../utils/appUtil.js');
var util = require('../../../utils/util.js');
var app = getApp();
Page({
    data: {
        usersubarea: 0,
        usersubareaCon: 0,
        fancyboxActive: '',
        consumerId: '',
        consumerData: '',
        amount: '',
        count: '',
        diningNumber: 1,
        youhui: '',
        serviceChange: 0,
        serviceChangeName: "茶位费",
        hasTableCode: false,
        tableDetail: {},
        note: ""
        // isEat: true//是堂食
    },
    onLoad: function (options) {
        var that = this;
        that.setData(options);
        that.data.tableDetail.name = "请选择桌台";
        //判断有桌子就显示桌子，没桌子就手动填入桌子号
        if (that.data.consumerId && that.data.consumerId != "undefined") {
            that.setData({hasConsumerId: true})
        } else {
            that.setData({hasConsumerId: false})
        }
        if (that.data.tableCode && that.data.tableCode != "undefined") {
            that.setData({hasTable: true});
        } else {

        }
        that.setData({tableDetail: that.data.tableDetail});
        wx.getSystemInfo({
            success: function (res) {
                that.setData({
                    winWidth: res.windowWidth,
                    winHeight: res.windowHeight
                });
            }
        });
        var url = app.globalData.serverAddress + "microcode/getResDetail";
        var data = {resId: app.globalData.resId};
        appUtil.httpRequest(url, data, function (rsp) {
            if (rsp.returnStatus) {
                let resOperation = rsp.value.resOperation;
                resOperation = 0;
                if (resOperation == 1) {//判断是堂食还是快餐
                    that.setData({
                        type: 1,
                        serviceChange: 0,
                        payType: 0//0:餐前付款
                    });
                } else if (resOperation == 0) {
                    that.setData({
                        type: 0,
                        hasTableCode: true,
                        serviceChange: rsp.value.restaurantBusinessRules.serviceChange,
                        payType: rsp.value.restaurantBusinessRules.payType//0:餐前付款  1:餐后付款
                    });
                }
                that.setData({
                    serviceChangeName: rsp.value.restaurantBusinessRules.serviceChangeName,
                });
                // if (that.data.consumerId != undefined || that.data.consumerId != "" || that.data.consumerId != 'undefined') {//加菜时，茶位费为0
                //     that.setData({
                //         serviceChange: 0
                //     });
                // }
            } else {
            }
        })

        var url = app.globalData.serverAddress + "table/findTableDtoList";
        var data = {
            resId: app.globalData.resId
        };
        appUtil.httpRequest(url, data, function (rsp) {
            if (rsp.returnStatus) {
                var subarea = rsp.value;
                that.setData({
                    subarea: subarea,
                    subareaItem: subarea[0].tableList, //初始状态
                    selectTable: subarea[0].tableList[0].tableCode  //初始桌子
                });
            } else {
            }
        });

        // 全局数据获取  购物车 购物车总价、总数
        that.setData({
            consumerData: app.globalData.hallCarts,
            amount: app.globalData.hallAmount,
            count: app.globalData.hallCount,
            tableName: that.data.tableName//二维码带的餐桌名称
        });
        app.globalData.resDetailData.forEach(function (val, key) {
            if (val.resId == app.globalData.resId) {
                that.setData({discount: val.memberTypeDiscount})
            }
        });

        //计算总价
        var newAmout = 0;
        var consumerArr = that.data.consumerData;
        for (let val of consumerArr) {
            val.singleProductTotal = parseFloat(val.price * val.foodCount).toFixed(2);
            if (val.isdiscount == 0) {
                newAmout += val.price * val.foodCount;
            } else if (val.isdiscount == 1) {
                if (parseFloat(that.data.discount) == 0) {
                    newAmout += val.price * val.foodCount;
                } else {
                    newAmout += val.price * val.foodCount * (that.data.discount / 10);
                }
            } else {
                app.globalData.resDetailData.forEach(function (ival, ikey) {
                    if (ival.resId == app.globalData.resId) {
                        if (ival.memberType) {
                            val.foodRuleMemberPrice.forEach(function (jval, jkey) {
                                if (ival.memberType == jval.memberType) {
                                    newAmout += jval.memberPrice * val.foodCount;
                                }
                            });
                        } else {
                            newAmout += val.price * val.foodCount;
                        }
                    }
                });
            }
            that.setData({newAmout: newAmout});
        }

        function money(num) {
            return parseFloat(num).toFixed(2);
        }

        let _newAmout = money(that.data.newAmout) || 0,
            _amount = money(that.data.amount) || 0,
            _diningNumber = money(that.data.diningNumber) || 0,
            _serviceChange = money(that.data.serviceChange) || 0;
        that.setData({
            youhui: parseFloat(_amount - _newAmout).toFixed(2),
            amount: _amount,
            zongjing: money(newAmout + _diningNumber * _serviceChange),
            consumerData: consumerArr
        });
    },
    toString(str) {
        return str.toString(2);
    },
    numberAdd: function (res) {
        var diningNumber = res.currentTarget.dataset.number;
        diningNumber++;
        this.setData({
            diningNumber: diningNumber
        });
    },
    numberReduce: function (res) {
        var that = this;
        var diningNumber = res.currentTarget.dataset.number;
        if (diningNumber >= 2) {
            diningNumber--;
        }
        if (diningNumber < 0) {
            diningNumber = 1;
        }
        that.setData({
            diningNumber: diningNumber
        });
    },
    tagChoose: function (e) {//做法选择
        var that = this
        var type = e.target.dataset.practies;
    },
    bindChange: function (e) {
        var that = this;
        that.setData({note: e.detail.value})
        //inputContent[e.currentTarget.id] = e.detail.value;
    },
    submitOrder: function (res) {
        var that = this;
        var url = app.globalData.serverAddress + "microcode/commitOrder";
        if (!that.data.tableCode || that.data.tableCode == "undefind") {
            wx.showToast({
                title: '请选择桌台',
                icon: 'success',
                duration: 2000
            })
            return;
        }
        var data = {
            resId: app.globalData.resId,
            openId: app.globalData.openId,
            type: that.data.type,//"0堂食1快餐2外卖
            fNumber: that.data.diningNumber,
            consumerId: that.data.consumerId,//消费者ID（可选，存在即为加菜）
            tableCode: that.data.tableCode, //"（可选，堂食需要传递）"
            orderFoodVosJson: JSON.stringify(that.data.consumerData),
            note: that.data.note
        };
        appUtil.httpRequest(url, data, function (rsp) {
            var consumerId = rsp.value.id;

            function redirctToUrl(text) {
                return "/pages/order/" + text + "/" + text + "?" +
                    "consumerId=" + consumerId +
                    "&resId=" + app.globalData.resId +
                    "&tableCode=" + that.data.tableCode;
            }

            if (that.data.payType == 1) {//餐后支付
                wx.navigateTo({
                    url: redirctToUrl('order-detail'),
                    success: function (res) {
                    }
                })
            } else {//餐前支付
                wx.navigateTo({
                    url: redirctToUrl('order-pay'),
                    success: function (res) {
                    }
                })
            }
        })

    },
    tableBox: function () {
        var that = this;
        that.setData({tableNo: 'tableNo'});
    },
    subarea: function (e) {
        var that = this;
        var subareaItem = e.target.dataset.subarea;
        that.setData({subareaItem: subareaItem});
        that.setData({
            usersubarea: e.target.dataset.index
        });
    },
    subareaItem: function (e) {
        var that = this;
        var tableDetail = e.target.dataset;
        that.setData({tableDetail: tableDetail});
        that.setData({
            usersubareaCon: tableDetail.index,
            selectTable: tableDetail.tablecode
        });
    },
    queren: function () {
        var that = this;
        if (that.data.tableDetail.name == "请选择桌台") {
            that.data.tableDetail.name = that.data.subareaItem[0].name;
            that.data.tableDetail.code = that.data.subareaItem[0].tableCode;
            that.setData({selectTable: that.data.tableDetail.code});
            that.setData({tableDetail: that.data.tableDetail});
        }
        that.setData({tableCode: that.data.selectTable});
        that.setData({tableNo: 'tableBox'});
    },
})
