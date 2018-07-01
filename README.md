## 前端地址
https://github.com/st4rlight/BS-frontend

## 运行环境
node.js 8.0.0+

mysql 5.5 ~ 5.7 （8及以上版本存在部分函数不存在的问题）

### 1. 修改数据库配置
修改`utils`目录下的`dbTools.js`文件
将以下的用户名和密码修改为你的mysql数据库的用户名和密码
```javascript
var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'YOUR USER NAME',
    password: 'YOUR PASSWORD',
    database: 'BS',
    timezone: "+08:00"
});
```

### 2. 导入数据库文件
运行根目录下的bs.sql，建立表以及导入初始数据

### 3. 安装依赖并运行
```bash
npm i
npm run start -- proxy
```

### 4.运行前端
此时已经成功运行了后端，接着请查看前端的说明
