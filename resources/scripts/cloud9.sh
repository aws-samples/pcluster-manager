#!/bin/bash

# install nodejs
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
. ~/.nvm/nvm.sh
nvm install node
node -e "console.log('Running Node.js ' + process.version)"

# install cloud9
wget -O - https://raw.githubusercontent.com/c9/install/master/install.sh | bash
