var unixlib = require('unixlib'),
    passwd = require('passwd'),
    fs = require('fs'),
    posix = require('posix'),
    methods = {};

/**
 * action : 'add method'
 * name : function name (key of methods var)
 * fn : the actual function
 */
methods['init methods'] = function (data){
    methods = require(data.filepath).methods;
};

function jail(username, password){
    unixlib.pamauth('system-auth', username, password, function(result) {
        if (result) {
            console.log('User %s logged !', username);
            passwd.get(username, function(user){
                process.title = 'node-xplorer-jailed-'+username;
                try {
                    process.chdir(user.homedir);
                    posix.chroot(user.homedir);
                    process.setgid(parseInt(user.groupId, 10));
                    process.setuid(parseInt(user.userId, 10));
                    console.log('Subprocess successfully jailed by ' + username + ' ('+process.getuid()+':'+process.getgid()+')');
                    user.homedir = '/';
                    process.send({success: true, args:{user: user}});
                } catch (err) {
                    console.log(err);
                    process.send({success: false, eror: err});
                }
            });
        }else{
            process.send({success: false, error: 'Wrong credentials'});
        }
    });
}

process.on('message', function(m){
    if (!!m.action){
        if (methods[m.action]){
            methods[m.action].call(this, m.data);
        }else{
            console.log('jail.js: Method ' + m.action + ' does not exist');
        }
    }else{
        jail(m.username, m.password);
    }
});
