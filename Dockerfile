FROM node:10-alpine
COPY . /contracts
WORKDIR /contracts

RUN npm install -g truffle
RUN npm install -g ganache-cli@~6.1.8
RUN npm install -g concurrently
# Some packages need python and git to be installed with npm install
RUN apk --no-cache add --virtual native-deps \
    g++ gcc libgcc libstdc++ linux-headers libexecinfo-dev git openssh make python && \
    npm install --quiet node-gyp -g &&\
    npm install --quiet && \
    apk del native-deps

EXPOSE 8545

RUN sh -c "concurrently 'npm run watch' 'ganache-cli --networkId 15 --gasLimit=50000000 -h=0.0.0.0 -p 8545 -m candy maple cake sugar pudding cream honey rich smooth crumble sweet treat'"
