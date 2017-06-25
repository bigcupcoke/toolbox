// Request 用来暂时存储请求的信息
const log = require('./utils.js')

// 请求的原始信息
/*
 GET /login HTTP/1.1
 Host: 127.0.0.1:5000
 Connection: keep-alive
 Upgrade-Insecure-Requests: 1
 User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36
 Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp
 Referer: http://127.0.0.1:5000/
 Accept-Encoding: gzip, deflate, sdch, br
 Accept-Language: zh-CN,zh;q=0.8
 */

class Request {
    constructor() {
        this.raw = ''
        this.path = ''
        this.query = ''
        this.headers = ''
        this.body = ''
    }


    // 一般使用 post 方法提交的数据会放在 request body 中
    // 使用 get 方法提交的数据会放在 path 中
    // 比如 GET /top250?start=25&filter= HTTP/1.1
    // 封装一个 form 方法, 直接获取解析之后的数据(以 object 的形式)
    form() {
        // 浏览器在发送 form 表单的数据时, 会自动使用 encodeURIComponent 编码
        // 所以拿到 body 的数据之后先解码
        // 得到的是下面这种格式的数据: a=b&c=d&e=f
        // 解析成 object 的形式
        const body = decodeURIComponent(this.body)
        log(body, '来自request的 body')
        const pairs = body.split('&')
        const d = {}
        pairs.forEach((item) => {
            let [k, v] = item.split('=')
            d[k] = v
        })
        return  d
    }
}

module.exports = Request