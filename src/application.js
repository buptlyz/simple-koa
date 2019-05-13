// application.js
const EventEmitter = require('events');
const http = require('http');
const context = require('./context');
const request = require('./request');
const response = require('./response');

class Application extends EventEmitter {
  constructor() {
    super();
    this.middlewares = [];
    this.context = context;
    this.request = request;
    this.response = response;
  }

  listen(...args) {
    const server = http.createServer(this.callback());
    server.listen(...args);
  }

  use(middleware) {
    this.middlewares.push(middleware);
  }

  compose() {
    // 将middleware合并为一个函数，该函数接收一个ctx对象
    return async ctx => {
      function createNext(middleware, oldNext) {
        return async () => {
          await middleware(ctx, oldNext);
        };
      }

      const len = this.middlewares.length;
      let next = async () => {
        return Promise.resolve();
      };
      for (let i = len - 1; i >= 0; i--) {
        const currentMiddleware = this.middlewares[i];
        next = createNext(currentMiddleware, next);
      }

      await next();
    };
  }

  callback() {
    return (req, res) => {
      const ctx = this.createContext(req, res);
      const respond = () => this.responseBody(ctx);
      const onerror = err => this.onerror(err, ctx);
      const fn = this.compose();
      return fn(ctx).then(respond).catch(onerror);
    };
  }

  onerror(err, ctx) {
    if (err.code === 'ENOENT') {
      ctx.status = 404;
    }
    else {
      ctx.status = 500;
    }
    const msg = err.message || 'Internal error';
    ctx.res.end(msg);
    this.emit('error', err);
  }

  createContext(req, res) {
    // 针对每个请求都要创建ctx对象
    const ctx = Object.create(this.context);
    ctx.request = Object.create(this.request);
    ctx.response = Object.create(this.response);
    ctx.req = ctx.request.req = req;
    ctx.res = ctx.response.res = res;
    return ctx;
  }

  responseBody(ctx) {
    const content = ctx.body;
    if (typeof content === 'string') {
      ctx.res.end(content);
    }
    else if (typeof content === 'object') {
      ctx.res.end(JSON.stringify(content));
    }
  }
}

module.exports = Application;
