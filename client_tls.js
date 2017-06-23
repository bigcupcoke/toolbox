// 引入一个模块, 会在下面用到
// 引入 tls 模块, 这个模块可以处理 https 的 socket
const tls = require('tls')

// 设置连接服务器的信息, 也就是指定服务器的地址和端口
// 实际上这个是服务器告诉给客户端的信息
// 0.0.0.0 在 windows 下面会报错, 所以换成 127.0.0.1
// mac 上面可以使用 0.0.0.0

// host 只能填写 ip, 而不能填写网址
const host = 'movie.douban.com'
const port = 443

// 创建一个客户端, 可以连接到服务器
const client = new tls.TLSSocket()

// 客户端根据给出的配置参数打开一个连接, 这样可以连接到服务器
client.connect(port, host, () => {
    console.log('connect to: ', host, port)

    // 向服务器发送一个消息
    const request = 'GET / HTTP/1.1\r\nHost: movie.douban.com\r\n\r\n'
    console.log(request, 'request')
    client.write(request)

    // 如果 server destroy 之后, 再调用下面的代码会报错
    // setInterval(() => {
    //     client.write('hello in interval')
    // }, 100)
})

// 当接收服务器的响应数据时触发 data 事件
// 其实这里就是接收服务器的数据
client.on('data', (d) => {
    // 参数是 d, 默认情况下是 buffer 类型
    // 可以用 d.toString() 将 buffer 转成字符串
    console.log('data:', d.toString())

    // 完全关闭 client 的连接, 套路写法
    client.destroy()
})

// client 关闭的时候触发这个事件
client.on('close', function() {
    console.log('connection closed')
})
