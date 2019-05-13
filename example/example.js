const simpleKoa = require('../src/application');

const app = new simpleKoa();

// 对ctx进行扩展
// app.context.echoData = function(errno = 0, data = null, errmsg = '') {
//   this.res.setHeader('Content-Type', 'application/json;charset=utf-8');
//   this.body = {
//     errno,
//     data,
//     errmsg
//   };
// };

// app.use(async ctx => {
//   const data = {
//     name: 'lee',
//     age: 18,
//     sex: 'male'
//   };
//   ctx.echoData(0, data, 'success');
// });

const responseData = {};

app.use(async (ctx, next) => {
  responseData.name = 'lee';
  await next();
  ctx.body = responseData;
});

app.use(async (_, next) => {
  responseData.age = 18;
  await next();
});

app.use(async (_, next) => {
  responseData.sex = 'male';
  await next();
});

app.on('error', err => {
  console.error(err.stack);
});

app.listen(10000, () => {
  console.log('server running at http://localhost:10000');
});
