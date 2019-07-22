account        mail
host           mail.{{COMPOSE_NETWORK_NAME}}
port           25
from           postmaster@{{DOCKER_DEVBOX_DOMAIN_PREFIX}}.{{DOCKER_DEVBOX_DOMAIN}}
account default : mail
