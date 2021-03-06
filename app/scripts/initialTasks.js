(function (mifosX) {
  var defineHeaders = function (
    $httpProvider,
    $translateProvider,
    ResourceFactoryProvider,
    HttpServiceProvider,
    $idleProvider,
    $keepaliveProvider,
    IDLE_DURATION,
    WARN_DURATION,
    KEEPALIVE_INTERVAL
  ) {
    var mainLink = getLocation(window.location.href);
    var baseApiUrl = "https://demo.finflux.io";
    var host = "";
    var portNumber = "";
    var basePath = "";
    var hostNames = ["confluxcloud.com","finflux.io","finflux.local","tapstart.in","moneytap.com"]
    
    var hostValidForAutoTenantPickup = function(mainLink){
      var arrayLength = hostNames.length;
      if(mainLink){
        for (var i = 0; i < arrayLength; i++) {
          if(mainLink.hostname.indexOf(hostNames[i])>= 0){
            return true;
          }
        }
      }
        return false;
    };
    //accessing from finflux server
    if (hostValidForAutoTenantPickup(mainLink)) {
      var hostname = window.location.hostname;
      domains = hostname.split(".");
      // For multi tenant hosting
      if (domains[0] == "demo") {
        $httpProvider.defaults.headers.common["Fineract-Platform-TenantId"] =
          "default";
        ResourceFactoryProvider.setTenantIdenetifier("default");
      } else {
        $httpProvider.defaults.headers.common["Fineract-Platform-TenantId"] =
          domains[0];
        ResourceFactoryProvider.setTenantIdenetifier(domains[0]);
      }
      host = mainLink.protocol + "//" + mainLink.hostname;
    }
    //accessing from a file system or other servers
    else {
      if (mainLink.hostname != "") {
        baseApiUrl =
          mainLink.protocol +
          "//" +
          mainLink.hostname +
          (mainLink.port ? ":" + mainLink.port : "");
      }

      if (QueryParameters["baseApiUrl"]) {
        baseApiUrl = QueryParameters["baseApiUrl"];
      }
      var queryLink = getLocation(baseApiUrl);
      host =
        queryLink.protocol +
        "//" +
        queryLink.hostname +
        (queryLink.port ? ":" + queryLink.port : "");
      portNumber = queryLink.port;

      $httpProvider.defaults.headers.common["Fineract-Platform-TenantId"] =
        "default";
      ResourceFactoryProvider.setTenantIdenetifier("default");
      if (QueryParameters["tenantIdentifier"]) {
        $httpProvider.defaults.headers.common["Fineract-Platform-TenantId"] =
          QueryParameters["tenantIdentifier"];
        ResourceFactoryProvider.setTenantIdenetifier(
          QueryParameters["tenantIdentifier"]
        );
      }
    }

    //Introducing basePath if the fineract server is hosted not at root
    if (QueryParameters["basePath"]) {
      basePath = QueryParameters["basePath"];
    }

    ResourceFactoryProvider.setBaseUrl(host + basePath);
    HttpServiceProvider.addRequestInterceptor("demoUrl", function (config) {
      return _.extend(config, { url: host + basePath + config.url });
    });

    // Enable CORS! (see e.g. http://enable-cors.org/)
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common["X-Requested-With"];

    //Set headers
    $httpProvider.defaults.headers.common["Content-Type"] =
      "application/json; charset=utf-8";

    // Configure i18n and preffer language
    //$translateProvider.translations('en', translationsEN);
    //$translateProvider.translations('de', translationsDE);

    $translateProvider.useStaticFilesLoader({
      prefix: "global-translations/locale-",
      suffix: ".json",
    });

    $translateProvider.preferredLanguage("en");
    $translateProvider.fallbackLanguage("en");
    //configure the specified tenantId
    $translateProvider.preferredTenant(
      ResourceFactoryProvider.getTenantIdentifier()
    );

    //Timeout settings.
    $idleProvider.idleDuration(IDLE_DURATION); //Idle time
    $idleProvider.warningDuration(WARN_DURATION); //warning time(sec)
    $keepaliveProvider.interval(KEEPALIVE_INTERVAL); //keep-alive ping
  };
  mifosX.ng.application.config(defineHeaders).run(function ($log, $idle) {
    $log.info("Initial tasks are done!");
    $idle.watch();
  });
})(mifosX || {});

var getLocation = function (href) {
  var l = document.createElement("a");
  l.href = href;
  return l;
};

var QueryParameters = (function () {
  var result = {};
  if (window.location.search) {
    // split up the query string and store in an associative array
    var params = window.location.search.slice(1).split("&");
    for (var i = 0; i < params.length; i++) {
      var tmp = params[i].split("=");
      result[tmp[0]] = unescape(tmp[1]);
    }
  }
  return result;
})();
