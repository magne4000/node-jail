node-jail
=========
This node.js module provides a way to creates secure subprocesses.
The subprocesses are own by an existing user (unix only for the moment) with setuid/setgid. The subprocess is also chrooted in the user home directory.

Usage
-----

