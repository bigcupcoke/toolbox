const fs = require('fs')
const log = require('./utils.js')

const ensureExists = (path) => {
    if (!fs.existsSync(path)) {
        let  data = '[]'
        fs.writeFileSync(path, data)
    }
}

const save = (data, path) => {
    const s = JSON.stringify(data, null, 2)
    fs.writeFileSync(path, s)
}

const load = (path) => {
    // 先保证路径所在文件一定存在
    ensureExists(path)
    const options = {
        encoding: 'utf8',
    }
    let s = fs.readFileSync(path, options)
    s = JSON.parse(s)
    // log(s)
    return s
}

// 原型类
class Model {
    // 返回db文件的路径
    static dbPath() {
        const classname = this.name.toLowerCase()
        const path = `${classname}.txt`
        return path
    }

    // 获取一个类的所有实例， 在这里是根据一个类的数据库中所有的 form类型生成实例
    static all() {
        // 静态方法中的this始终是指向class的
        const path = this.dbPath()
        const models = load(path)
        const ms = models.map((item) => {
            // 每一项其实都一个表单生成的数据
            return this.create(item)
        })
        log(ms, '***ms')
        return ms
    }

    // 根据表单数据 生成新的实例
    static create(form={}) {
        const cls = this
        const instance = new cls(form)
        return instance
    }

    // 通过key,value找实例,如果有就生成实例并且返回， 没有就返回null
    static findBy (key, value) {
        const us = this.all()
        let u = null
        us.forEach((item) => {
            if (item[key] === value) {
                u = item
                //终止循环
                return false
            }
        })
        return u
    }

    save() {
        // 实例方法中的this指向的是实例,也就是new 出来的对象
        const cls = this.constructor
        const models = cls.all()
        models.forEach((model, i) => {
            if (model.id === undefined) {
                model.id = 1
            }
        })
        // log(models, 'models save func')
        models.push(this)
        const path = cls.dbPath()
        save(models, path)
    }

    toString() {
        const s = JSON.stringify(this, null, 2)
        return s
    }
}

// 下面两个实例用来处理实际的数据

class User extends Model {

    constructor(form={}) {
        //super 是个继承的套路。 这样才能使用 this
        super()
        // 定义user类的两个属性
        this.username = form.username || ''
        this.password = form.password || ''
        this.note = form.note || ''
    }

    // 登录的验证
    validateLogin() {
        // log(this, this.username, this.password)
        const cls = this.constructor
        let valid = false
        const us = cls.all()
        for (let i = 0; i < us.length; i++) {
            const u = us[i]
            log('u **', u, 'this**', this)
            if (u.username === this.username && u.password === this.password) {
                log('u **', u, 'this**', this)
                valid = true
                break
            }
        }
        return valid
    }
    // 注册的验证
    validateRegister() {
        const us = User.all()
        let exist = false
        us.forEach((item) => {
            if (item.username === this.username) {
                exist = true
                return false
            }
        })
        return exist
    }
}

class Message extends Model {
    constructor(form={}) {
        super()
        this.author = form.author || ''
        this.content = form.content || ''
    }
}

module.exports = {
    User: User,
    Message: Message,
}
