const dns = require('dns')

const host = 'movie.douban.com'

dns.lookup(host, (error, address, family) => {
    console.log('address and family', address, family)
})