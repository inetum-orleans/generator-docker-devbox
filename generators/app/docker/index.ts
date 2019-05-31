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

  reverseProxy (subdomain?: string, port?: number): this {
    this.builder.network('reverse-proxy', { name: '${DOCKER_DEVBOX_REVERSE_PROXY_NETWORK}', external: true })
    this.builder.label('traefik.enable=true')

    this.virtualHost(subdomain)
    this.virtualPort(port)

    return this
  }

  private virtualHost (subdomain?: string) {
    let virtualHost = '${DOCKER_DEVBOX_DOMAIN_PREFIX}.${DOCKER_DEVBOX_DOMAIN}'
    if (subdomain) {
      virtualHost = subdomain + '.' + virtualHost
    }
    this.builder.environment('VIRTUAL_HOST', virtualHost)
    this.builder.label('traefik.frontend.rule=Host:' + virtualHost)
  }

  private virtualPort (port?: number) {
    const virtualPort = (port ? port : '80')

    this.builder.environment('VIRTUAL_PORT', virtualPort)
    this.builder.label('traefik.port=' + virtualPort)
  }

  xdebug (): this {
    this.builder.environment('XDEBUG_CONFIG', 'idekey={{projectName}} remote_host=${HOST_IP}')
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
