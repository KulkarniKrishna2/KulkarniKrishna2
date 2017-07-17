define(['underscore'], function () {
    var tenantIdentifier  ;
    var tenantConfig = {
        "ncc" : "laowebfont"
    } ;
    var mainLink = document.createElement("a");
    mainLink.href = window.location.href;
    if (mainLink.hostname.indexOf('confluxcloud.com') >= 0) {
        var hostname = window.location.hostname;
        var domains = hostname.split('.');
        if (domains[0] == "demo") {
            tenantIdentifier = 'default' ;
        } else {
            tenantIdentifier = domains[0] ;
        }
    }else {
        if (window.location.search) {
            var params = window.location.search.slice(1).split("&");
            for (var i = 0; i < params.length; i++) {
                var tmp = params[i].split("=");
                if(tmp[0] == "tenantIdentifier") {
                    tenantIdentifier = unescape(tmp[1]);
                }
            }
        }
    }

    var styles = {
        css: [
            'bootstrap.min.css',
            'bootstrap-ext.css',
            'bootswatch.css',
            'font-awesome.min.css',
            'app.css',
            'nv.d3.css',
            'style.css',
            'chosen.min.css',
            'loading-bar.css'
        ]
    };
    if(tenantConfig[tenantIdentifier]) {
        styles.css.splice(styles.css.length, 0, tenantConfig[tenantIdentifier]) ;
    }

    require(_.reduce(_.keys(styles), function (list, pluginName) {
        return list.concat(_.map(styles[pluginName], function (stylename) {
            return pluginName + '!styles/' + stylename;
        }));
    }, []));
});
