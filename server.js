// 引入两个模块, 会在下面用到
const net = require('net')
const fs = require('fs')

// 因为 console.log 非常常用, 所以封装下, 方便之后扩展
// 需要注意的是箭头函数没有绑定 arguments, 所以直接使用 arguments 会报错
// 因此使用的是 es6 中的剩余参数(rest parameter), args 是一个数组
const log = (...args) => {
    // 上面提到了 args 是一个数组, 所以这里直接用 apply
    console.log.apply(console, args)
}

// e(selector).hide()

// 我们之前的写法都是下面这种
// var log = function() {
//     // 如果换成箭头函数, 因为没有绑定 arguments, 所以会报错
//     // arguments is not defined
//     console.log.apply(console, arguments)
// }

// 主页的处理函数, 返回主页的响应
const routeIndex = () => {
    // 提前写好符合 http 响应格式的字符串
    // HTTP 响应的格式
    // 响应行 HTTP/1.1 200 OK
    // Header
    // \r\n\r\n
    // Body
    const header = 'HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n'
    // body 中有一个 img 元素, 浏览器会发一个请求来获取 doge.gif
    const body = '<h1>Hello World</h1><img src="doge.gif">'
    // const header = `HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nContent-Length: ${body.length}\r\n`

    // 拼接响应信息并返回, r 是字符串类型
    const r = header + '\r\n' + body
    return r
}

const routeHello = () => {
    // 提前写好符合 http 响应格式的字符串
    // HTTP 响应的格式
    // 响应行 HTTP/1.1 200 OK
    // Header
    // \r\n\r\n
    // Body
    const header = 'HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf8\r\n'
    // body 中有一个 img 元素, 浏览器会发一个请求来获取 doge.gif
    const body = '<head></head><body><h3>这个是对应 /hello 路由的 body</h3></body>'

    // 拼接响应信息并返回, r 是字符串类型
    const r = header + '\r\n' + body
    return r
}

// 图片的响应函数, 读取图片并生成响应返回
const routeImage = () => {
    // 图片的响应头部中 Content-Type 会指定返回的响应内容的类型
    // 实际上只需要指定是 image 就可以了, 具体的类型是没有关系的
    // 一般是下载的 zip 文件
    const header = 'HTTP/1.1 200 OK\r\nContent-Type: image/gif\r\n\r\n'
    const file = 'doge.gif'
    // 这里使用的 readFileSync 函数可以直接读取文件的内容,
    // 返回的是一个 buffer 类型, 所以 body 是 buffer
    // 上节课提到了 buffer 类型, 如果不记得, 可以看下板书
    // readFileSync 有第二个参数 encoding
    const body = fs.readFileSync(file)
    // const header = `HTTP/1.1 200 OK\r\nContent-Type: image/gif\r\nContent-Length: 3000\r\n\r\n`
    log(body, body.toString())

    // 这里我们需要完成的事情是把 string 和 buffer 拼接起来
    // 其中 header 是 string, body 是 buffer
    // 将 header 转成 buffer 类型
    // 然后与 body 拼接在一起
    // 这样 r 就是 buffer 类型了
    const h = Buffer.from(header)
    const r = Buffer.concat([h, body])
    return r
}

// 错误请求的响应函数
// 这里使用了 es6 的默认参数, 即如果没有传 code, 那 code 取值 404
const error = (code=404) => {
    // 将错误响应的信息放在一个 object(字典) 中, 方便处理
    // 这个是表驱动法, 如果不这么处理会比较麻烦

    // 404 对应的 value 也是一个 http 响应
    // 只不过这个响应没有 header
    const e = {
        404: 'HTTP/1.1 404 NOT FOUND\r\n\r\n<h1>NOT FOUND</h1>',
    }
    // 如果 code 不在 e 这个 object 中, 就把响应设置成空字符串 ''
    // 下面的代码不提倡, 但是业界的主流做法就是这样的, 我们要观察 模仿 学习 融入
    // const r = e[code] ? e[code] : ''
    const r = e[code] || ''
    // 上面的代码相当于下面的代码
    // 把 5 行代码变成了 1 行, 因此会说比较简洁
    // if (e[code]) {
    //     r = e[code]
    // } else {
    //     r = ''
    // }
    return r
}

// 根据 path 返回 response 的函数
// 因为这部分会一直用得上, 所以单独提取出来
const responseForPath = (path) => {
    // 把多个 path 放在一个 object, 同样是表驱动法
    // 不同的地方是 object 的 value 是一个函数
    const r = {
        '/': routeIndex,
        '/doge.gif': routeImage,
        '/hello': routeHello,
    }
    // response 是一个函数, 直接在下面调用, 返回相应的响应
    // path 是 '/' 的话
    // r[path] 在这里是 routeIndex
    // r['/hello'] 是一个 undefined, 所以 resp 就是 error
    const resp = r[path] || error
    const response = resp()
    return response
}

// 把逻辑放在单独的函数中, 这样可以方便地调用
// 指定了默认的 host 和 port, 因为用的是默认参数, 当然可以在调用的时候传其他的值
const run = (host='', port=3000) => {
    // 创建一个服务器, 这个是套路写法
    const server = new net.Server()

    // 开启一个服务器监听连接
    server.listen(port, host, () => {
        const address = server.address()
        console.log('listening.', address)
    })

    // 当有新连接建立时, 就会触发 connection 事件
    // 可以想象网页里一个元素点击的时候, 就会触发 click 事件
    // element.on('click', () => {
    //
    // })
    // 这次的参数名字是 s
    server.on('connection', (s) => {
        // 当 socket(也就是这次的参数 s) 接收到数据的时候, 会触发 data 事件
        s.on('data', (data) => {
            // data 是 buffer 类型, 使用 toString 把 data 转成 utf8 编码的字符串
            // 现在 request 是一个符合 http 请求格式的字符串
            const request = data.toString()
            const ip = s.localAddress
            log(`ip and request, ip 的值: ${ip}\nrequest 的内容\n${request}`)

            // GET / HTTP/1.1
            // Host: localhost:4000
            // Connection: keep-alive
            // Upgrade-Insecure-Requests: 1
            // User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36
            // Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8
            // Accept-Encoding: gzip, deflate, sdch, br
            // Accept-Language: zh-CN,zh;q=0.8
            //

            // 把 request 转成字符串之后, 就可以很方便地解析了
            // 先解析出 path
            const method = request.split(' ')[0]
            log('method', method)
            const path = request.split(' ')[1]
            log('path', path)
            // 然后调用 responseForPath, 根据 path 生成响应内容
            // 第一个请求的 path 是 /
            // 第二个请求的 path 是 /doge.gif
            const response = responseForPath(path)

            log('debug response', response)

            // 将 response 发送给客户端, 这里的客户端就是浏览器
            // socket.write 可以接收 buffer 类型的参数
            // 也就是说可以发送文本, 也可以发送像图片这样的二进制信息
            s.write(response)

            // 这里是一个套路, 如果不这么做, 浏览器不知道当前请求是否已经结束
            // 会出现一直等待的情况, 也就是会一直 loading
            // 上节课提到了除了调用 destroy 这种方式
            // 还可以直接在 header 中指定 Content-Length
            s.destroy()
        })
    })

    // 服务器出错的时候会触发这个事件, 但是具体什么出错是未知的, 套路写法
    server.on('error', (error) => {
        log('server error', error)
    })

    // 当服务器关闭时被触发
    server.on('close', () => {
        log('server closed')
    })
}

// 程序的入口
const __main = () => {
    // 在 webstorm 中, 按住 Ctrl 之后, 点击函数名, 就会跳转到函数定义的地方
    run('127.0.0.1', 4000)
    // run()
}

// 调用 main 函数
__main()