const config = require('./config'),
    utilCommon = require('./utilCommon'),
    api = require('./configPath');
import {HttpRequest} from './httpRequest';

const $http = new HttpRequest();
module.exports = {
    url: config.host,
    token: null,
    api: api,
    getToken() {
        const app = getApp();
        if (this.token && this.token.length > 0) {
            return this.token;
        } else {
            return app.getToken();
        }
    },
    /**
     * 添加会员卡
     * @param data
     * @param cb
     * @returns {*}
     */
    checkIsFirstUse(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.checkIsFirstUse.path;
        data.token = this.getToken();
        data.sex = data.sex || 0;
        data.nikeName = data.nikeName || '微信用戶';
        // console.log('checkIsFirstUse接口调用', data, url);
        const http = $http.post(url, data, (res) => {

            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    checkBindMobile(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.checkBindMobile.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {

            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    checkMemberBindMobile(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.checkMemberBindMobile.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {

            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 是否绑定会员卡
     * @param data
     * @param cb
     * @param reject
     * @returns {*}
     */
    checkMember(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.checkMember.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 检查是否存在未结账的消费者
     */
    checkHasWaitPayConsumer(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.checkHasWaitPayConsumer.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 验证会员卡支付验证码
     */
    checkSmsCodeByOpenId(data, cb, isReturnStatus, reject) {
        let query = this.api.checkSmsCodeByOpenId.query;
        const url = this.url + this.api.checkSmsCodeByOpenId.path;
        data.token = this.getToken();
        Object.assign(query, data);
        const http = $http.get(url, query, (res) => {
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 判断时候为首次使用获取openid  API
     * @param data
     * @param cb
     */
    getOpenId(data, cb, isReturnStatus, reject) {
        const url = `${this.url}${this.api.getOpenId.path}`;
        const http = $http.post(url, data, (res) => {
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 获取平台用户信息  API
     * @param data
     * @param cb
     */
    getCommonUserInfo(data, cb, isReturnStatus, reject) {
        const url = `${this.url}${this.api.getCommonUserInfo.path}`;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            if (utilCommon.isJsonObject(res.value)) {
                res.value = JSON.parse(res.value);
            }
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 更新平台用户信息  API
     * @param data
     * @param cb
     */
    updateCommonUserInfo(data, cb, isReturnStatus, reject) {
        const url = `${this.url}${this.api.updateCommonUserInfo.path}`;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            if (utilCommon.isJsonObject(res.value)) {
                res.value = JSON.parse(res.value);
            }
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 判断时候为首次使用获取openid  API
     * @param data
     * @param cb
     */
    applyMember(data, cb, isReturnStatus, reject) {
        const url = `${this.url}${this.api.applyMember.path}`;
        let query = this.api.applyMember.query;
        data.token = this.getToken();
        Object.assign(query, data);
        const http = $http.post(url, query, (res) => {
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 获取openid
     * @param data
     * @param cb
     */
    newCheckIsFirstUse(data, cb, isReturnStatus, reject) {
        const url = `${this.url}${this.api.newCheckIsFirstUse.path}`;
        if (!data.nikeName) {
            let str = null;
            if (data.objId) {
                str = data.objId.substring(data.objId.length - 5);
            } else if (data.jsCode) {
                str = data.jsCode.substring(data.jsCode.length - 5);
            }
            data.nikeName = `微信用户${str}`;
        }
        if (!data.sex) {
            data.sex = 0;
        }
        const http = $http.post(url, data, (res) => {
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 获取会员拉列表
     * @param data
     * @param cb
     */
    getMemberCardList(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.getMemberCardList.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 查询二维码
     * @param data
     * @param cb
     * @returns {*}
     */
    getQRcodeTable(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.getQRcodeTable.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 获取菜品列表
     * @param data
     * @param cb
     * @returns {*}
     */
    getFoodList(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.getFoodList.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {

            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 获取菜品tab分类
     * @param data
     * @param cb
     * @returns {*}
     */
    findFoodCatalogList(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.findFoodCatalogList.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 获取规格列表
     */
    getFoodRuleList(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.getFoodRuleList.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {

            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 获取套餐子菜列表
     */
    findFoodPackage(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.findFoodPackage.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {

            if (utilCommon.isJsonObject(res.value)) {
                res.value = JSON.parse(res.value);
            }
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 获取口味与做法列表
     */
    getFoodPracticesList(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.getFoodPracticesList.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {

            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 获取点餐店铺列表
     */
    getResDetail(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.getResDetail.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 绑定手机号码
     */
    bindWechatUser(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.bindWechatUser.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {

            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 绑定手机号码
     */
    bindMobile(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.bindMobile.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {

            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 获取店铺首页信息
     */
    getMainInfo(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.getMainInfo.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {

            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 获取店铺banner
     */
    getCommonBannerList(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.getCommonBannerList.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {

            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 获取桌位列表
     */
    findTableDtoList(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.findTableDtoList.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 提交订单
     */
    commitOrder(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.commitOrder.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 获取订单详情
     */
    getOrderDetail(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.getOrderDetail.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {

            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 会员卡支付
     */
    memberCardPay(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.memberCardPay.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {

            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 获取验证码
     */
    getSmsCode(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.getSmsCode.path;
        data.token = this.getToken();
        const http = $http.get(url, data, (res) => {
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 支付获取验证码
     */
    getSmsCodeByConn(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.getSmsCodeByConn.path;
        data.token = this.getToken();
        const http = $http.get(url, data, (res) => {
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 获取订单列表
     */
    getOrderList(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.getOrderList.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 微信支付
     */
    finishPay(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.finishPay.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 微信支付接口
     */
    wxPayForH5(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.wxPayForH5.path;
        data.token = this.getToken();
        const http = $http.get(url, data, (res) => {
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 修改收货地址
     */
    updateConsigneeAddress(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.updateConsigneeAddress.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 新增地址
     */
    addAddress(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.addAddress.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 设置默认地址
     */
    setDefaultAddress(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.setDefaultAddress.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 删除收货地址
     */
    deleteConsigneeAddress(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.deleteConsigneeAddress.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 获取收货地址(默认)
     */
    loadDefaultAddress(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.loadDefaultAddress.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 获取收货地址
     */
    loadAddressList(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.loadAddressList.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {

            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 买单叫号
     */
    callAttendant(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.callAttendant.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {

            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 消息模板通知
     */
    sendMiniWxTemplateMsg(data, isReturnStatus, cb, reject) {
        const url = this.url + this.api.sendMiniWxTemplateMsg.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 三级联动 - 省
     * @param data
     *
     * @param cb
     * @param isReturnStatus
     * @param reject
     * @returns {*}
     */
    getAllProvince(data = {}, cb, isReturnStatus, reject) {
        const url = this.url + this.api.getAllProvince.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 三级联动 - 市/区
     * @param data
     *      pid:
     * @param cb
     * @param isReturnStatus
     * @param reject
     * @returns {*}
     * private Integer isDeposit;//预定押金（0，不需要  1，需要）
     * private Double depositAmount;//押金金额
     * private Integer leadTime;//提前时间
     * private Integer isPreOrder;//预点菜（0，不可以  1，可以）
     * private Integer isBusiness;//非包房是否营业（0，休业  1 营业）
     * private Integer isPrivateRoom;//包房是否营业（0，休业  1 营业）
     * private Integer status;//状态 0关闭 1开启
     */
    getRegionByPid(data = {}, cb, isReturnStatus, reject) {
        const url = this.url + this.api.getRegionByPid.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 订单跟踪
     * @param data
     *      String resId ，String consumerId
     * @param cb
     * @param isReturnStatus
     * @param reject
     * @returns {*}
     *      private String id;
     *      private String resId;//餐厅id
     *      private String consumerId;//消费者id
     *      private String orderId;//订单id
     *      private Integer status;//状态  1订单提交 2已支付 3已接单 4已拒单 5已完成 6超时取消 7用户取消
     *      private Date createTime;//创建时间
     *      private Date lastUpdateTime;//更新时间
     */
    getOrderProcessList(data = {}, cb, isReturnStatus, reject) {
        const url = this.url + this.api.getOrderProcessList.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 预定营业规则信息
     * @param data
     *      String resId ，String consumerId
     * @param cb
     * @param isReturnStatus
     * @param reject
     * @returns {*}
     *  private Integer isDeposit;//预定押金（0，不需要  1，需要）
     *  private Double depositAmount;//押金金额
     *  private Integer leadTime;//提前时间
     *  private Integer isPreOrder;//预点菜（0，不可以  1，可以）
     *  private Integer isBusiness;//非包房是否营业（0，休业  1 营业）
     *  private Integer isPrivateRoom;//包房是否营业（0，休业  1 营业）
     *  private Integer status;//状态 0关闭 1开启
     */
    getReserveBusinessRules(data = {}, cb, isReturnStatus, reject) {
        const url = this.url + this.api.getReserveBusinessRules.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 提交预定订单
     * @param data
     * @param data.resId(*) 餐厅id
     * @param data.source(*)来源 0安卓端 1小程序
     * @param data.reserveTime(*)预定时间 Long类型
     * @param data.objId(*)如果source为 1 则这个参数必传
     * private Integer numOfConsumer;// 人数
     * @param data.tableCode 桌台code
     * @param data.mobile(*)手机号
     * @param data.name(*)姓名
     * @param data.sex 性别
     * @param data.orderFoodJson 预点菜orderFood json串
     * @param data.areaCode 分区code
     * @param data.note 备注
     *  private Integer preOrder;// 预点菜 0 不点菜 1 点菜
     *  private Integer payDeposit;// 支付定金 0 不支付 1支付
     * @param cb
     * @param isReturnStatus
     * @param reject
     * @returns {*}
     */
    insertReserve(data = {}, cb, isReturnStatus, reject) {
        const url = this.url + this.api.insertReserve.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 根据手机号获取验证码
     * @param data
     * @param data.mobile(*)手机号
     * @param cb
     * @param isReturnStatus
     * @param reject
     * @returns {*}
     */
    getSmsCodeByMobile(data = {}, cb, isReturnStatus, reject) {
        const url = this.url + this.api.getSmsCodeByMobile.path;
        data.msgTemp = "SMS_XIAOFEICODE_CONTENT";
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 预定订单支付
     * @param data
     * @param id(*)预订单id
     * @param resId(*)餐厅id
     * @param objId(*)小程序唯一标识id
     * @param cb
     * @param isReturnStatus
     * @param reject
     * @returns {*}
     */
    memberPayReserve(data = {}, cb, isReturnStatus, reject) {
        const url = this.url + this.api.memberPayReserve.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 预订订单详情
     * @param data
     * @param id(*)预订单id
     * @param cb
     * @param isReturnStatus
     * @param reject
     * @returns {*}
     */
    getReserveDetail(data = {}, cb, isReturnStatus, reject) {
        const url = this.url + this.api.getReserveDetail.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 更新订单状态
     * @param data
     * @param reserveid(*)预定id
     * @param status(*) 更改的状态。// 0未处理，1接受，2拒绝 ，3用户取消,4已完成(代表已开台)
     * @param cb
     * @param isReturnStatus
     * @param reject
     * @returns {*}
     */
    updateReserve(data = {}, cb, isReturnStatus, reject) {
        const url = this.url + this.api.updateReserve.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 预订订单微信支付
     * @param data
     * @param reserveid(*)预定id
     * @param status(*) 更改的状态。// 0未处理，1接受，2拒绝 ，3用户取消,4已完成(代表已开台)
     * @param cb
     * @param isReturnStatus
     * @param reject
     * @returns {*}
     */
    wxPayForReserve(data = {}, cb, isReturnStatus, reject) {
        const url = this.url + this.api.wxPayForReserve.path;
        data.token = this.getToken();
        const http = $http.get(url, data, (res) => {
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 预订订单列表
     * @param data
     * @param objId
     * @param pageNum
     * @param pageSize
     * @param cb
     * @param isReturnStatus
     * @param reject
     * @returns {*}
     */
    getReserveList(data = {}, cb, isReturnStatus, reject) {
        const url = this.url + this.api.getReserveList.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 预订订单跟踪列表
     * @param data
     * @param reserveId(*)预定id
     * @param ResId(*) 餐厅id
     * @param cb
     * @param isReturnStatus
     * @param reject
     * @returns {*}
     */
    getReserveProcessList(data = {}, cb, isReturnStatus, reject) {
        const url = this.url + this.api.getReserveProcessList.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
};