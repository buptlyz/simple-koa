// context.js
// module.exports = {

//   get query() {
//     return this.request.query;
//   },

//   get body() {
//     return this.request.body;
//   },

//   set body(data) {
//     this.response.body = data;
//   },

//   get status() {
//     return this.response.status;
//   },

//   set status(statusCode) {
//     this.response.status = statusCode;
//   }
// };

// 使用__defineSetter__和__defineGetter__的实现
const proto = {};

// 为proto名为property的属性设置setter
function delegateSet(property, name) {
  proto.__defineSetter__(name, function (val) {
    this[property][name] = val;
  });
}

// 为proto名为property的属性设置setter
function delegateGet(property, name) {
  proto.__defineGetter__(name, function () {
    return this[property][name];
  });
}

// 定义request中要代理的setter和getter
const requestSet = [];
const requestGet = ['query'];

// 定义response中要代理的setter和getter
const responseSet = ['body', 'status'];
const responseGet = responseSet;

requestSet.forEach(ele => {
  delegateSet('request', ele);
});

requestGet.forEach(ele => {
  delegateGet('request', ele);
});

responseSet.forEach(ele => {
  delegateSet('response', ele);
});

responseGet.forEach(ele => {
  delegateGet('response', ele);
});

module.exports = proto;
