"use strict";
const utilMd5 = require('../utils/md5.js'),
    utilCommon = require('../utils/utilCommon'),
    regExpUtil = require('../utils/RegExpUtil'),
    queryString = require('../utils/queryString');

function getToken() {
    const app = getApp();
    if (app && app.globalData && app.globalData.token) {
        return app.globalData.token;
    } else {
        return wx.getStorageSync('token');
    }
}

module.exports.getToken = getToken;

function formatTime(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()

    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()


    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

module.exports.formatTime = formatTime;

function formatTime1(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()

    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()
    return [year, month, day].map(formatNumber).join('') + [hour, minute, second].map(formatNumber).join('')
}

module.exports.formatTime1 = formatTime1;

function formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
}

module.exports.formatNumber = formatNumber;

var AND = "&";
var EQUAL = "=";
var QUESTION = "?";

function mergeKeyValue(sb, key, value, format) {
    //if (!key || !value) return "";
    sb += key;
    sb += EQUAL;
    if (format) {
        sb += encodeURI(value);
    } else {
        sb += value;
    }
    return sb;
}

module.exports.mergeKeyValue = mergeKeyValue;

function requestUrlMerge(url, params) {
    if (!params) return url;
    try {
        var sb = url;
        var position = 0;
        for (var key in params) {
            var value = params[key];
            if (value) {
                sb += position == 0 ? QUESTION : AND;
                sb = mergeKeyValue(sb, key, value);
                position++;
            }
        }
        return sb;
    } catch (e) {
    }
    return null;
}

module.exports.requestUrlMerge = requestUrlMerge;

function requestParametersMerge(params) {
    if (!params) return null;
    try {
        var sb = "";
        var position = 0;
        for (var key in params) {
            var value = params[key];
            var flag = true;
            if (!value && value !== 0) {
                value = '';
            }
            if (parseInt(value) == 0) {
                flag = true;
            }
            if (flag) {
                if (position > 0) {
                    sb += AND;
                }
                sb = mergeKeyValue(sb, key, value);
                position++;
            }
        }
        return sb;
    } catch (e) {
    }
    return null;
}

module.exports.requestParametersMerge = requestParametersMerge;

function sign(secretKey, params) {
    if (!params) return null;
    var keys = new Array();
    for (var key in params) {
        keys.push(key);
    }
    keys.sort();
    var sb = "";
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key != "token" && key != "signature") {
            if (!params[key] && !utilCommon.isNumberOfNaN(params[key])) {
                params[key] = '';
            }
            sb += key;
            sb += params[key];
        }
    }
    return utilMd5.hexMD5(secretKey + sb).toUpperCase();
}

module.exports.sign = sign;

function initPay(params) {
    var a = "261ad12f08f13811298e2b50f803deab",
        app = getApp();
    if (!params) return null;
    params["signtime"] = Date.parse(new Date()) / 1000;
    params["appId"] = "eb86f42f6504bfefe069e85a204c9734";
    var signNum = sign(a, params);
    params["signature"] = signNum || '';
    // console.log('initPay', app);
    params["token"] = app.getToken() || '';
    return requestParametersMerge(params);
}

module.exports.initPay = initPay;

function getSignature(params) {
    var a = "261ad12f08f13811298e2b50f803deab";
    if (!params) return;
    params["signtime"] = Date.parse(new Date()) / 1000;
    params["appId"] = "eb86f42f6504bfefe069e85a204c9734";
    return sign(a, params);
}

module.exports.getSignature = getSignature;

function money(num) {
    if (!num) {
        return 0;
    }
    return parseFloat(num).toFixed(2);
}

module.exports.money = money;

/**
 * 提示框（微信内置）
 * @param text
 */
function showToast(option) {
    let data = {
        title: option,
        icon: 'success',
        mask: true,
        duration: 2000
    };
    if (utilCommon.isObject(option)) {
        data.title = option.title;
        data.icon = option.icon || 'success';
        data.image = option.image;
        data.mask = option.mask || true;
        data.duration = option.duration || 2000;
        data.success = option.success;
        data.fail = option.fail;
        data.complete = option.complete;
    }
    wx.hideLoading();
    wx.showToast(data);
}

module.exports.showToast = showToast;

/**
 * 判断是否为非空对象
 * @param obj
 * @returns {boolean}
 */
function isEmptyObject(obj) {
    try {
        var name;
        for (name in obj) {
            return false;
        }
        return true;
    } catch (e) {
        return false;
        console.log('非对象');
    }
}

module.exports.isEmptyObject = isEmptyObject;

/**
 * 对象与数组的复制 第一个值为Boolean并为true时为深度复制
 * @returns {*|{}}
 */
function extend() {
    var options, name, src, copy, copyIsArray, clone,
        target = arguments[0] || {},
        i = 1,
        length = arguments.length,
        deep = false;
    //如果第一个值为bool值，那么就将第二个参数作为目标参数，同时目标参数从2开始计数
    if (typeof target === "boolean") {
        deep = target;
        target = arguments[1] || {};
        // skip the boolean and the target
        i = 2;
    }
    // 当目标参数不是object 或者不是函数的时候，设置成object类型的
    if (typeof target !== "object" && !utilCommon.isFunction(target)) {
        target = {};
    }
    // //如果extend只有一个函数的时候，那么将跳出后面的操作
    // if (length === i) {
    //     target = this;
    //     --i;
    // }
    for (; i < length; i++) {
        // 仅处理不是 null/undefined values
        if ((options = arguments[i]) != null) {
            // 扩展options对象
            for (name in options) {
                src = target[name];
                copy = options[name];
                // 如果目标对象和要拷贝的对象是恒相等的话，那就执行下一个循环。
                if (target === copy) {
                    continue;
                }
                // 如果我们拷贝的对象是一个对象或者数组的话
                if (deep && copy && ( utilCommon.isPlainObject(copy) || (copyIsArray = utilCommon.isArray(copy)) )) {
                    if (copyIsArray) {
                        copyIsArray = false;
                        clone = src && utilCommon.isArray(src) ? src : [];
                    } else {
                        clone = src && utilCommon.isPlainObject(src) ? src : {};
                    }
                    //不删除目标对象，将目标对象和原对象重新拷贝一份出来。
                    target[name] = extend(deep, clone, copy);
                    // 如果options[name]的不为空，那么将拷贝到目标对象上去。
                } else if (copy !== undefined) {
                    target[name] = copy;
                }
            }
        }
    }
    // 返回修改的目标对象
    return target;
}

module.exports.extend = extend;

/**
 * 当前页面路径
 * @returns {*}
 */
function getCurrentPages() {
    let urlArr = getCurrentPages();
    return urlArr[urlArr.length - 1].route;
}

module.exports.getCurrentPages = getCurrentPages;

/**
 * 跳转路径
 * @param a{String|Number} 页面路径地址
 * @param options{Object} type{String}:跳转类型 （blank：关闭当前页面跳转；tab:关闭其他tabBar页面，跳转到tabBar页面；blankAll：关闭所有页面跳转）；data{Object}：跳转携带参数对象
 */
function go(a, options) {
    let stringify = '';
    if (!options) options = {};
    if (options.data) {
        stringify = queryString.stringify(options.data);
    }
    if (utilCommon.isNumberOfNaN(a)) {
        if (a < 0) {
            wx.navigateBack({
                delta: -a
            })
        }
    } else if (utilCommon.isString(a) && regExpUtil.isPath(a)) {
        if (/\?/.test(a)) {
            a = a + '&';
        } else {
            a = a + '?';
        }
        let url = a + stringify;
        if (options.type === 'blank') {
            wx.redirectTo({
                url: url
            })
        } else if (options.type === 'tab') {
            wx.switchTab({
                url: url
            })
        } else if (options.type === 'blankAll') {
            wx.reLaunch({
                url: url
            })
        } else {
            wx.navigateTo({
                url: url
            })
        }
    }
}

module.exports.go = go;