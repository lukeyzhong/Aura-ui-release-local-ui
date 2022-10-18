import { GlobalEndpointsConfiguration } from '../assets/config/config-api-baseurl';
export const environment = {
  production: true,
  apiBaseUrl: GlobalEndpointsConfiguration.getBaseAPIUrl(),
  hostUrl: GlobalEndpointsConfiguration.getHostUrl(),
};
