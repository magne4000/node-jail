var cp = require('child_process');

/**
 * args: credentials sent to child in order to create the chrooted subprocess.
 *       args.username and args.password must exists.
 * options: optional map argument. It can contain the following keys:
 *   - 'onsuccesslogin': callback function used by this process (not child) when a user
 *                       successfully login.
 *   - 'onfailedlogin': callback function used by this process (not child) when a user failed to login.
 *   - 'jailedsuccessloginargs': jailed args run by child on a successful login.
 *   - 'onbeforekill': callback called when kill functio begins.
 *   - 'cb': callback function used when child process send messages. Takes as arguments
 *           data sent by child process.
 *   - 'methodsfile': File containing methods.
 */
jail = function(args, options){
    var self = this, isLogged = false;
    this.child = cp.fork(__dirname + '/jail.js');
    this.options = options || {};
    if (this.options['methodsfile']){ //init methods
        this.child.send({
            action: 'init methods',
            data: {
                'filepath': this.options['methodsfile']
            }
        });
    }
    this.child.send(args);
    this.child.on('message', function(m){
        if (isLogged){
            if (self.options['cb']){
                self.options['cb'].call(self, m);
            }
        }else{
            if (!!m.success){
                if (self.options['onsuccesslogin']){
                    self.options['onsuccesslogin'].call(self, m);
                }
                isLogged = true;
                if (self.options['jailedsuccessloginargs']){
                    self.jailed(self.options['jailedsuccessloginargs']);
                }
            }else{
                if (self.options['onfailedlogin']){
                    sef.options['onfailedlogin'].call(self, m);
                }
                isLogged = false;
            }
        }
    });

    return this;
};

jail.prototype.kill = function(){
    if (this.options['onbeforekill']){
        this.options['onbeforekill'].apply(this);
    }
    this.child.kill('SIGTERM');
};

// Execute a jailed action
jail.prototype.jailed = function(data){
    this.child.send({
        action: data.action,
        data: data
    });
};

exports.jail = jail;

