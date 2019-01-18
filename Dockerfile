FROM node:10-alpine
COPY . /contracts
WORKDIR /contracts

RUN npm install -g truffle@4.1.15
RUN npm install -g ganache-cli@~6.1.8
RUN npm install -g concurrently
# Some packages need python and git to be installed with npm install
RUN apk --no-cache add --virtual native-deps \
    g++ gcc libgcc libstdc++ linux-headers libexecinfo-dev git openssh make python && \
    npm install --quiet node-gyp -g &&\
    npm install --quiet && \
    apk del native-deps

ENTRYPOINT ["sh", "./scripts/deploy.sh"]

EXPOSE 8545
