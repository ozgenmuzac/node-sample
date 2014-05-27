module.exports = {
    User: function(uid, name, kimlikno, password, ip, mac, phonenumber, token) {
        this.uid = uid;
        this.name = name;
        this.kimlikno = kimlikno;
        this.password = password;
        this.ip = ip;
        this.mac = mac;
        this.phonenumber = phonenumber;
        this.token = token
    }
}
