module.exports = {
    User: function(name, kimlikno, password, ip, mac) {
        this.name = name;
        this.kimlikno = kimlikno;
        this.password = password;
        this.ip = ip;
        this.mac = mac
    }
}
