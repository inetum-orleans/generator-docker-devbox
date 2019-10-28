import {
  BuildDefinition,
  ConfigBuilder,
  DefaultConfigBuilderOptions,
  Extension,
  ServiceBuilder,
  Version
} from '@gfi-centre-ouest/docker-compose-builder'

export class DockerDevboxConfigBuilderOptions extends DefaultConfigBuilderOptions {
  user: string = '${USER_ID}'
  restart: string = '${DOCKER_DEVBOX_RESTART_POLICY}'
  projectDir: string = '${COMPOSE_PROJECT_DIR}'
  portPrefix: string | null = '${DOCKER_DEVBOX_PORT_PREFIX}'
  version: Version = Version.v37

  buildConfiguration: (name: string) => BuildDefinition = (name: string) => {
    return {
      context: `.docker/${name}`,
      cache_from: [`$\{DOCKER_DEVBOX_REGISTRY\}$\{DOCKER_DEVBOX_REGISTRY_REPOSITORY\}/${name}`]
    }
  }
  imageName: (name: string) => string = (name: string) => `$\{DOCKER_DEVBOX_REGISTRY\}$\{DOCKER_DEVBOX_REGISTRY_REPOSITORY\}/${name}`
  serviceDir: (name: string) => string = (name: string) => `${this.projectDir}/.docker/${name}`
}

export class DockerDevboxExt implements Extension {
  constructor (private builder: ServiceBuilder) {
  }

  xdebug (): this {
    this.builder.environment('XDEBUG_CONFIG', 'remote_enable=on remote_autostart=off idekey={{projectName}} remote_host=${HOST_IP}')
    this.builder.environment('PHP_IDE_CONFIG', 'serverName={{projectName}}')
    return this
  }

  fixuid (): this {
    this.builder.user('${USER_ID}:${GROUP_ID}')
    return this
  }

  get service (): ServiceBuilder {
    return this.builder
  }

  get and (): ConfigBuilder {
    return this.builder.and
  }
}
