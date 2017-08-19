module.exports = {
    location: {},
    parse(url) {
        if (!this.queryString(url))
            return;
        const reg = /([^\?\=\&]+)\=([^\?\=\&]*)/g;
        let obj = {};
        while (reg.exec(this.location.search)) {
            obj[RegExp.$1] = RegExp.$2;
        }
        this.location.query = obj;
        return obj;
    },
    queryString(href) {
        href = decodeURIComponent(href);
        if (!href || href.length === 0) {
            if (!location)
                return;
            href = location.href;
        }
        const url = href.split('#'),
            href_search = url[0].split('?'),
            protocol_host_pathname = href_search[0].split('://'),
            host_pathname = protocol_host_pathname[1].split('/'),
            hostname_post = host_pathname[0].split(':');
        this.location = {
            href: href,
            hash: url[1] ? '#' + url[1] : '',
            host: host_pathname[0] || '',
            hostname: hostname_post[0] || '',
            origin: host_pathname[0] ? (protocol_host_pathname[0] + '://' + host_pathname[0]) : '',
            pathname: host_pathname[1] ? ('/' + host_pathname.slice(1).join('/')) : '',
            port: hostname_post[1] || '',
            protocol: protocol_host_pathname[0] || '',
            search: href_search[1] ? ('?' + href_search[1]) : ''
        };
        return this.location;
    }
};