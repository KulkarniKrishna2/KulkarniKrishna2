angular.module('configurations', [])
    .constant('API_VERSION', '/fineract-provider/api/v1')
    .constant('API_VERSION_V2', '/fineract-provider/api/v2')
    .constant('IDLE_DURATION', 30 * 60)
    .constant('WARN_DURATION', 2)
    .constant('KEEPALIVE_INTERVAL', 15 * 60)
    .constant('SECURITY', 'oauth');
// Use SECURITY constant as 'oauth' or 'basicauth' to enable either Oauth2 or Basic authentication on community app
