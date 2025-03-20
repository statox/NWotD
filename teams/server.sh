#!/usr/bin/env bash

# When I start the server process nvm hasn't run already so npx is not in the path
# TODO Replace the server with a bash process?
NPX="/home/afabre/.config/nvm/versions/node/v22.14.0/bin/npx"
$NPX http-server -p 65432 --cors "*" -g
