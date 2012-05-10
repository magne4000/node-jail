node-jail
=========
This node.js module provides a way to creates secure subprocesses.
The subprocesses are own by an existing user (unix only for the moment) with setuid/setgid. The subprocess is also chrooted in the user home directory.

Usage
-----
Creation of a subprocess:
```javascript
var jail = require('jail');
var oJail = new jail.jail(
   {
       username: 'username', //unix user
       password: 'password'  //unix password of the user
   },
   { //Optionnal arguments
       'cb': function(args) { //Callback function triggered when child process send message.
           //args contains all elements sent by child (so it is user defined).
           //It is recommended to have a args.action which indicates which operation
           //must be handled by this function. eg:
           // if (args.action == 'log str'){
           //   console.log(args.str);
           // }else ...
       },
       'jailedsuccessloginargs': //These argument will make the subprocess to run a specific function.
           {
             action: ''
           // eg.
           // { action: 'file read',
           // filepath: '/' }
           // This will cause the subprocess to run the 'file read' function.
           // The subprocess function will receive this map as is only argument.
       },
       'onsuccesslogin': function(args){
           // callback function triggered when a user successfully login.
       },
       'onfailedlogin': function(){
           // callback function triggered when a user fail to login.
       },
       'onbeforekill': function(){
           // callback triggered just before the subprocess is killed.
       },
       'methodsfile': __dirname + '/methods.js' // Path to the file containing subprocess methods
   }
);
```

Let's focus on _'methodsfile'_ parameter. This file contains functions that can be used by a subprocess.
The methods.js file looks like this:

```javascript
var fs = require('fs');
var methods = {
  'file stat': function(data){
    fs.stat(data.filepath, function(err, stats){
      process.send({
        action: data.action,
        data: stats,
      });
    });
  },
  //etc 
}

exports.methods = methods; //Always end with this line !
```
In this example, we have a unique function `file stat`.
This function is called by the parent process with the following code:
```javascript
jail.jailed({
  action: 'file stat',
  filepath: 'path/to/my/file'
});
```
It is important to note that the jailed function always need the _'action'_ parameter in order to know which function the subprocess must use.
When the function has finished, in this example, it sends a message to its parent. This message will be handled by the callback function defined by the _'cb'_ parameter.
