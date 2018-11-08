FROM newtmitch/sonar-scanner:3.2.0-alpine
LABEL maintainer="Rémi Alvergnat <remi.alvergnat@gfi.fr>"

{{#DOCKER_DEVBOX_CA_CERTIFICATES}}
COPY .ca-certificates/* /usr/local/share/ca-certificates/
RUN apk add --update ca-certificates
RUN update-ca-certificates
{{/DOCKER_DEVBOX_CA_CERTIFICATES}}

ENTRYPOINT ["sonar-scanner", "-Dsonar.projectBaseDir=/root/src"]
CMD []
