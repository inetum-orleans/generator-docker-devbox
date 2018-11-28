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
  version: Version = Version.v22

  buildConfiguration: (name: string) => BuildDefinition = (name: string) => {
    return {
      context: '.docker',
      dockerfile: `${name}/Dockerfile`
    }
  }
  imageName: (name: string) => string = (name: string) => `$\{DOCKER_DEVBOX_REGISTRY\}{{lowercase projectName}}/${name}`
  serviceDir: (name: string) => string = (name: string) => `${this.projectDir}/.docker/${name}`
}

export class DockerDevboxExt implements Extension {
  constructor (private builder: ServiceBuilder) {
  }

  nginxProxy (subdomain?: string): this {
    this.builder.network('nginx-proxy', { external: true })
    this.virtualHost(subdomain)
    return this
  }

  private virtualHost (subdomain?: string): this {
    let virtualHost = '${DOCKER_DEVBOX_DOMAIN_PREFIX}.${DOCKER_DEVBOX_DOMAIN}'
    if (subdomain) {
      virtualHost = subdomain + '.' + virtualHost
    }
    this.builder.environment('VIRTUAL_HOST', virtualHost)
    return this
  }

  xdebug (): this {
    this.builder.environment('XDEBUG_CONFIG', 'idekey={{projectName}} remote_host=${HOST_IP}')
    this.builder.environment('PHP_IDE_CONFIG', 'serverName={{projectName}}')
    return this
  }

  get service (): ServiceBuilder {
    return this.builder
  }

  get and (): ConfigBuilder {
    return this.builder.and
  }
}
