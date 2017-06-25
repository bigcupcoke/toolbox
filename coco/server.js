const net = require('net')
const Request = require('./request.js')
const routeMapper = require('./routes.js')
const log = require('./utils.js')

// 处理错误的函数
const error = (code=404) => {
    // 404对应的内容其实是一个完整的响应格式了, header + body
    const e = {
        404: 'HTTP/1.1 200 OK\r\n\r\n<h1>404 NOT FOUND</h1>'
    }
    const r = e[code] || ''
    return r
}

// 解析 path 的函数
// path 可能的取值
// /home
// /message?content=hello&author=gua
// 返回包含 path 和 query 的 object

const pathParsed = (pathname) => {
    const index = pathname.indexOf('?')
    if (index === -1) {
        return {
            path: pathname,
            query: {},
        }
    } else {
        let [path, search] = pathname.split('?')
        let args = search.split('&')
        const query = {}
        args.forEach((item) => {
            let [k, v] = item.split('=')
            query[k] = v
        })
        return {
            path: path,
            query: query,
        }
    }
}


// 响应函数
// 生成 request 对应的响应函数
/*
 GET /login?foo=bar&name=gua HTTP/1.1
 Host: 127.0.0.1:5000
 Connection: keep-alive
 Upgrade-Insecure-Requests: 1
 User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36
 Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp
 Referer: http://127.0.0.1:5000/
 Accept-Encoding: gzip, deflate, sdch, br
 Accept-Language: zh-CN,zh;q=0.8
 */
const responseFor = (r, request) => {
    // raw 是原始编码的意思,就是未处理的信息
    const raw = r
    const raws = raw.split(' ')

    request.raw = r
    request.method = raws[0]
    let pathname = raws[1]
    log('pathname ***', pathname)
    let { path, query } = pathParsed(pathname)
    request.path = path
    request.query = query

    log('path and query', path, query)
    request.body = raw.split('\r\n\r\n')[1]
    // 这上面的代码都是解析请求的原始信息(raw) 并存入request 对象中

    // 下面的代码是根据路径生成响应
    const route = {}

    const routes = Object.assign(route, routeMapper)
    const response = routes[path] || error
    // log(routes[path], response, 'routes ***')
    const resp = response(request)
    // log(resp, 'resp **')
    return resp
}


//应该是把new 一个server 对象开始实行一个服务端全部封装成一个函数
const run = (host='', port='2000') => {
    const server = new net.Server()
    server.listen(port, host, () => {
        const address = server.address()
        log(address.address)
        log(`listening server at http://${address.address}:${address.port}`)
    })

    server.on('connection', (s) => {
       s.on('data', (data) => {
           const r = data.toString('utf8')
           const request = new Request()
           const ip = s.localAddress
           const response = responseFor(r, request)
           // log(response)
           s.write(response)
           s.destroy()
       })
    })

    server.on('error', (error) => {
        log('server error', error)
    })

    server.on('close', () => {
        log('server close')
    })
}

const __main = () => {
    run('127.0.0.1')
}

__main()