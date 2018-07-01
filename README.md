# 教务管理系统

这是一个Node + Express.js的REST后端解决方案。如果你的电脑上没有安装Node，请访问官网安装，Linux下可以：

```
$ sudo apt install node
$ sudo apt install npm
```

会分别安装Node.js和npm（Node包管理器）。

项目需要Webpack dev server，安装：

```
$ sudo npm install -g webpack
$ sudo npm install -g webpack-cli
$ sudo npm install -g webpack-dev-server
```

开发环境：

Visual Studio Code编辑器，或JetBrains WebStorm IDE。

## 关于JS的杂谈

如果你没有接触过JavaScript，特别是ES6，可能需要知道以下几点要注意的地方（坑）：

* 数字没有类型，不分整数和浮点
* JavaScript中的函数是对象
* JavaScript的对象是精髓设计，它的本质是一个散列表，里面储存着键值对。下面是一个例子：

```javascript
var a = {
    apple: 1,
    pear: 2
};
console.log(a.apple);   // 1
console.log(a['pear']); // 2
a.orange = 3;
console.log(a.orange);  // 3
console.log(a.banana);  // undefined
a.pineapple = (a, b) => a * b;
a.palm = function(a, b) {return a * b;};
a.pineapple(1, 2);      // 返回 2
a.palm(3, 4);           // 返回 12
```

  比较有趣的是下面一些例子，可以说明lambda和函数对象的区别：

```javascript
a.pineapple = () => this;
a.palm = function () {return this;}
a.pineapple();          // 返回 Window，如果在浏览器中；
a.palm();               // 返回 a
```

* 创建一个新对象除了可以直接写成对象外，还可以使用构造器。构造器是一个普通函数，没什么特别的，只是有`this`这样的指针用来赋值从这个构造器创建的新对象的
```javascript
function Fruit(name, color) {
    this.name   = name;
    this.color  = color;
    this.getName    = function () {return this.name;}
    function getColor() {return this.color;}
    var temp = getColor;
    this.getColor = temp;
    return 'I love ' + color + ' ' + name;
}
var redApple = new Fruit('apple', 'red');   // 创建一个 redApple 对象
Fruit('banana', 'yellow');                  // 当普通函数用，返回一个字符串
                                            // 但是此时的 this 指向全局作用域（窗口）
console.log(name);                          // 是的，你上一步调用中 this.name = name 中的 this 是 window，
                                            // 所以这句话会打印 banana
```

* 表达二者全等的时候使用`===`，而不要用`==`。JavaScript的`==`是一个很神奇的设计缺陷。
* `var`声明变量的作用域是整个函数，而不是块作用域。这点非常坑。块作用域请用`let`。

  举例来说：

```javascript
// 随便开一个浏览器窗口，或用Node.js，测试以下代码：
function a(arg) {
    if(arg) {
        var b = 1;
    }
    if(arg) {
        console.log(b);
    }
}
a(true);

// 对比下面的行为：
function a(arg) {
    if(arg) {
        let b = 1;
    }
    if(arg) {
        console.log(b);
    }
}
a(true);
```

  结果就是上面的没报错，下面报错了。原因就是`var`是函数作用域声明，`let`是块作用域声明。

## 初始化项目

项目初始化需要安装依赖，只需要在项目根目录下执行：

```
$ npm install
```

## 运行项目

### 只运行后端

你可以选择只运行后端，这时候可以用Postman做API测试：

```
$ npm start
```

### 运行整个项目

如果需要测试前端页面，你需要先在另一个终端让前端的静态页面跑在`localhost:8080`，对这个项目来说，即在前端目录`acmanager-vue`下执行：

```
$ cd ../acmanager-vue
$ npm install            # 如果前端目录下已经跑过这句话，就可以不用跑了
$ npm run dev
```

然后切换回后端目录执行：

```
$ npm run proxy
```

这个命令可以代理`/api/`路径下的内容到`8889`端口下的服务，其他内容仍然会路由到`8080`端口下的前端内容服务。最终用户访问的端口是`8888`。

## 配置项目

你可以改变API部署的路径、运行的端口、假设前端所在的端口等。更改文件`config/config.js`即可做到。

```javascript
// Server configurations
module.exports = {
    accessPort          : 8888,
    portWhenProxy       : 8889,
    frontendPort        : 8080,
    hostname            : 'localhost',
    // Session time limit in seconds
    sessionTimeLimit    : 30,
    // Key for encrypting app token
    accessKey           : 'SEtakers2018AccessKey',
    getStaticPath       : path => ('/#/' + path).replace('//', '/'),
    apiPathPattern      : /\/api/,
    getApiPath          : path => ('/api/' + path).replace('//', '/'),
};
```

这里面`accessPort`是用户访问的端口；`portWhenProxy`是当代理模式（即前后端同时跑）的时候，API服务（即后端，即该项目）运行端口；`frontendPort`是假设前端跑在的端口。

`hostname`是主机名，`getStaticPath`是将一个相对路径变换到静态资源路径的函数，服务器可以自己在`public`目录下放一些想要放的静态资源，可以直接被访问到（通过`app.js`中的`app.use(config.getStaticPath(''), express.static('public'));`实现）。

`sessionTimeLimit`是登录超时时间，access token签字时间过后，经过该超时时间，token就会失效，需要重新登录。

`accessKey`是用来加密access token的密钥，保存在服务器端，客户端无需知道这一密钥。

例如，我可以在`public`目录下放一个文件`hello.txt`，在`getStaticPath`配置为`path => ('' + path).replace('//', '/')`时，我可以通过：

```
http://localhost:8888/hello.txt
```

访问到这个文本文件。

如果`getStaticPath`一项配置为`path => ('/foo/' + path).replace('//', '/')`，访问这个文件就要用如下URL：

```
http://localhost:8888/foo/hello.txt
```

目前应该用不到在`public`目录下面放东西，且这个只有在未代理的时候工作。

`apiPathPattern`中是匹配API路径的字符串模式，所有匹配到这个模式的都会在代理模式下被路由到后端服务（而其他路径将被路由到前端服务）。

`getApiPath`是将一个相对路径转换为API路径，请务必保证这个函数和`apiPathPattern`的一致性。

例如，`app.js`中的代码片段`app.use(config.getApiPath('hello'), route.hello);`中，`config.getApiPath('hello')`将会被映射到 `/api/hello`

## 项目结构

* `config` 配置脚本
* `dataModels` 数据模型，后面实现数据库的时候，相关驱动放在这里
    * 如果是MySQL，麻烦一点，需要自己把记录转成相应格式的JSON
    * MongoDB的形式要方便一些，可以直接存取结构化数据

    `dataModels`里面要做到正确访问数据库，做相应的抽象，允许外界可以通过方法调用将数据库查询结果以JSON的格式拿到用于处理

* `modules` 模块，包含逻辑部分，介于`routes`和`dataModels`之间的东西往这里放，处理主要的逻辑
* `node_modules` node模块依赖
* `public` 静态资源
* `routes` 路由，处理请求和响应
* `.gitignore` git忽略配置，这里面写的文件将会被git忽略
* `app.js` 服务器程序代码，按URL分流，把访问分流到`routes`中的模块做处理
* `package.json` 项目配置，需要安装新的库可以直接在这里的依赖里面写新项，然后跑一下`npm install`就可以了

目前只有一个用于测试的路由，还没有加入后端逻辑的模型。