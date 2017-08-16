
var utilMd5 = require('../utils/md5.js');
var app = getApp();
function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatTime1(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('') + [hour, minute, second].map(formatNumber).join('')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

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



function requestParametersMerge(params) {
  if (!params) return null;
  try {
    var sb = "";
    var position = 0;
    for (var key in params) {
      var value = params[key];
      var flag = false;
      if (value != "" ) {
        flag=true;
      }
      if (parseInt(value) == 0){
        flag=true;
      }
      if (flag){
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
      sb += key;
      sb += params[key];
    }
  }
  return utilMd5.hexMD5(secretKey + sb).toUpperCase();
  
}
// var b = 'kjdfsdfsdj';
// var c = 'jjjjjjjjjjj';
// var j = { b, c }
// var a=sign('11111111111111111dfs1d1fsd1fsd1f1dfdfs',j);
// console.log('111111111111111111');
// console.log(a);
function initPay(params) {
  var a = "261ad12f08f13811298e2b50f803deab";
  if (!params) return null;
  params["signtime"] = Date.parse(new Date()) / 1000;
  params["appId"] = "eb86f42f6504bfefe069e85a204c9734";
  var signNum = sign(a, params);
  params["signature"] = signNum;
  params["token"] = app.globalData.token;
  return requestParametersMerge(params);
}


module.exports = {
  formatTime: formatTime,
  formatTime1: formatTime1,
  initPay: initPay,
  requestUrlMerge:requestUrlMerge
}
