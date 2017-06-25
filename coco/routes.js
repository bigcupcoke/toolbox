const fs = require('fs')
const log = require('./utils.js')
const model = require('./model.js')

const User = model.User
const Message = model.Message
// 用于读取html文件的函数
const template = (name) => {
    const path = '../templates/' + name
    const options = {
        encoding: 'utf8',
    }
    const content = fs.readFileSync(path, options)
    return content
}

const index = () => {
    const header = 'HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n'
    const body = template('index.html')
    // log(body, 'body')
    const r = header + '\r\n' + body
    // log('r in index route', r)
    return r
}

const login = (request) => {
    let result
    if (request.method === 'POST') {
        const form = request.form()
        const u = User.create(form)
        log(' u login', u)
        if (u.validateLogin()) {
           result = '登录成功'
        } else {
            result = '用户名或者密码错误'
        }
    } else {
        result = ''
    }
    const header = 'HTTP/1.1 200 Ok\r\nContent-Type: text/html\r\n'
    let body = template('login.html')
    // log('result***', result)
    body = body.replace('{{result}}', result)
    const r = header + '\r\n' + body
    // log('login in route', r)
    return r
}

const register = (request) => {
    let result = ''
    if (request.method === "POST") {
        const form = request.form()
        const u = User.create(form)
        if (!u.validateRegister()) {
            const us = User.all()
            u.save()
            result = '注册成功'
        } else {
            result = '用户名已存在'
        }
    }
    const header = 'HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n'
    let body = template('register.html')
    body = body.replace('{{result}}', result)
    const r = header + '\r\n' + body
    return r
}

const static = (request) => {
    const filename = request.query.file || 'doge.gif'
    const path = `../static/${filename}`
    const body = fs.readFileSync(path)
    const header = 'HTTP/1.1 200 OK\r\nContent-Type: image/gif\r\n\r\n'
    const h = Buffer.from(header)
    const r = Buffer.concat([h, body])
    log('static ***', static)
    return r
}

const message = (request) => {
    let result = ''
    const header = 'HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n'
    if (request.method === "POST") {
        const form = request.form()
        const m = Message.create(form)
        m.save()
        const ms = Message.all()
        result = ms
        log('m', m)
    }
    let body = template('message.html')
    body = body.replace('{{messages}}', result)
    log('body', body)
    const r = header + '\r\n' + body
    return r
}

const routeMapper = {
    '/': index,
    '/static': static,
    '/login': login,
    '/register': register,
    '/message': message,
}

module.exports = routeMapper