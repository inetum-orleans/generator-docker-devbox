import axios, { AxiosError, AxiosInstance } from 'axios'

export function setAuthenticationInterceptor (axios: AxiosInstance) {
  axios.interceptors.response.use((response) => response, async (error: AxiosError) => {
    if (error.response &&
      error.response.status === 401 && error.response.headers['www-authenticate'] &&
      !(error.config as any)._retry) {
      const authenticate = error.response.headers['www-authenticate']

      const realmMatch = /realm="(.*?)"/.exec(authenticate)
      const serviceMatch = /service="(.*?)"/.exec(authenticate)
      const scopeMatch = /scope="(.*?)"/.exec(authenticate)

      if (realmMatch && serviceMatch && scopeMatch) {
        const realm = realmMatch[1]
        const service = serviceMatch[1]
        const scope = scopeMatch[1]

        const authResponse = await axios.get(realm + `?service=${service}&scope=${scope}`)
        if (authResponse.status !== 200) {
          throw error
        }

        const token = authResponse.data.token
        if (!token) {
          throw error
        }

        error.config.headers['Authorization'] = `Bearer ${token}`;
        (error.config as any)._retry = true
        const response = await axios.request(error.config)
        return response
      }
    }

    throw error
  })
}

export class RegistryClient {
  private axios: AxiosInstance

  constructor (baseURL: string = 'https://registry.hub.docker.com/v2') {
    this.axios = axios.create({ baseURL })
    setAuthenticationInterceptor(this.axios)
  }

  async tagsList (image: string, namespace?: string): Promise<string[]> {
    if (!namespace && image.indexOf('/') > -1) {
      const splitted = image.split('/', 2)
      namespace = splitted[0]
      image = splitted[1]
    }

    if (!namespace) {
      namespace = 'library'
    }

    const response = await this.axios.get(`${namespace}/${image}/tags/list`)
    return response.data.tags
  }
}
