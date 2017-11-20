FROM node:carbon
MAINTAINER {{authorName}} <{{authorEmail}}>

ARG GROUP_ID=1000
ARG USER_ID=1000

# Fix permissions to match host user
RUN usermod -u ${USER_ID:-1000} node && groupmod -g ${GROUP_ID:-1000} node

RUN mkdir -p /home/node/.cache/yarn && chown -R $USER_ID:$GROUP_ID /home/node/.cache
VOLUME /home/node/.cache

RUN mkdir /app && chown -R $USER_ID:$GROUP_ID /app
VOLUME /app

WORKDIR /app

USER node

# Workaround for https://github.com/yarnpkg/yarn/issues/4877
RUN npm config set http-proxy ${http_proxy}
RUN npm config set https-proxy ${https_proxy}


