FROM node:carbon
MAINTAINER {{authorName}} <{{authorEmail}}>

COPY .ca-certificates/* /usr/local/share/ca-certificates/
RUN update-ca-certificates

ENV NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt

# Mise à jour de yarn basé sur le script de l'image officielle
ENV YARN_VERSION 1.7.0

RUN rm -Rf /opt/yarn \
  && rm /usr/local/bin/yarn && rm /usr/local/bin/yarnpkg \
  && set -ex \
  && for key in \
    6A010C5166006599AA17F08146C2130DFD2497F5 \
  ; do \
    gpg --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys "$key" || \
    gpg --keyserver hkp://ipv4.pool.sks-keyservers.net --recv-keys "$key" || \
    gpg --keyserver hkp://pgp.mit.edu:80 --recv-keys "$key" ; \
  done \
  && curl -fSLO --compressed "https://yarnpkg.com/downloads/$YARN_VERSION/yarn-v$YARN_VERSION.tar.gz" \
  && curl -fSLO --compressed "https://yarnpkg.com/downloads/$YARN_VERSION/yarn-v$YARN_VERSION.tar.gz.asc" \
  && gpg --batch --verify yarn-v$YARN_VERSION.tar.gz.asc yarn-v$YARN_VERSION.tar.gz \
  && mkdir -p /opt/yarn \
  && tar -xzf yarn-v$YARN_VERSION.tar.gz -C /opt/yarn --strip-components=1 \
  && ln -s /opt/yarn/bin/yarn /usr/local/bin/yarn \
  && ln -s /opt/yarn/bin/yarn /usr/local/bin/yarnpkg \
  && rm yarn-v$YARN_VERSION.tar.gz.asc yarn-v$YARN_VERSION.tar.gz

# Mise à jour de npm
RUN npm i --global npm

# Allow nodeJS to run server on port < 1024
RUN setcap 'cap_net_bind_service=+ep' $(which node)

# Fix permissions to match host user
RUN usermod -u ${HOST_UID:-1000} node && groupmod -g ${HOST_GID:-1000} node

RUN mkdir -p /home/node/.cache/yarn && chown -R $HOST_UID:$HOST_GID /home/node/.cache
VOLUME /home/node/.cache

RUN mkdir /app && chown -R $HOST_UID:$HOST_GID /app
VOLUME /app

WORKDIR /app

USER node

RUN yarn config set cafile ${NODE_EXTRA_CA_CERTS} --global
