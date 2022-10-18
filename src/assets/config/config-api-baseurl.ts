export class GlobalEndpointsConfiguration {
  // 24 hours in minutes
  static refreshTokenExpireMinutes = 1440;

  // API URL
  static getBaseAPIUrl(): string {
    let url = '';
    if (localStorage.getItem('apiTestUrl')) {
      url = String(localStorage.getItem('apiTestUrl'));
    } else {
      localStorage.removeItem('apiTestUrl');
      const currentUrl = location.href;
      let baseUrl;
      if (currentUrl.includes('localhost')) {
        baseUrl = 'dev';
      } else if (currentUrl.includes('auratest.')) {
        baseUrl = 'auratest';
      } else if (currentUrl.includes('auraprod.')) {
        baseUrl = 'auraprod';
      } else if (currentUrl.includes('dev.')) {
        baseUrl = 'dev';
      } else if (currentUrl.includes('aura.')) {
        baseUrl = 'aura';
      }
      url = `https://${baseUrl}.antra.com/aura/api`;
    }
    return url;
  }

  // HOST URL
  static getHostUrl(): string {
    const currentUrl = location.href;
    let baseUrl;
    if (currentUrl.includes('localhost')) {
      baseUrl = 'dev';
    } else if (currentUrl.includes('auratest')) {
      baseUrl = 'auratest';
    } else if (currentUrl.includes('dev')) {
      baseUrl = 'dev';
    } else if (currentUrl.includes('aura')) {
      baseUrl = 'aura';
    }
    return `https://${baseUrl}.antra.com/`;
  }
}
