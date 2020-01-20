(function (module) {
  mifosX.controllers = _.extend(module, {
    CenterGeoLocationController: function (scope, resourceFactory) {
      scope.centerId = scope.center;
      scope.isCenterGeoDefined = true;
      scope.init = function () {
        scope.getGoogleApiKey();
      }

      scope.getGoogleApiKey = function () {
        resourceFactory.externalServicesResource.get({ id: 'Google_Map' }, {},
          function (data) {
            var googleMapScriptTag = document.createElement("script");
            googleMapScriptTag.setAttribute("data-button", "buynow");
            googleMapScriptTag.src = "https://maps.googleapis.com/maps/api/js?key="+data[0].value;
            document.head.appendChild(googleMapScriptTag);

            var googleMapLibraryScriptTag = document.createElement("script");
            googleMapLibraryScriptTag.setAttribute("data-button", "buynow");
            googleMapLibraryScriptTag.src = "http://maps.googleapis.com/maps/api/js?libraries=geometry&sensor=false";
            document.head.appendChild(googleMapLibraryScriptTag);

            scope.getDeceasedDetails();
          });
      }

      scope.getDeceasedDetails = function () {
        resourceFactory.getCenterGeoDetailsResource.getGeoDetails({ centerId: scope.centerId }, {},
          function (data) {
            scope.memberData = [];
            for (var i = 0; i < data.length; i++) {
              if (data[i].type.value == 'Center') {
                scope.centerData = data[i];
              } else {
                scope.memberData.push(data[i]);
              }
            }

            if (scope.centerData) {
              scope.isCenterGeoDefined = true;
              scope.showmap(scope.centerData, scope.memberData);
            } else {
              scope.isCenterGeoDefined = false;
            }
          });
      }

      setTimeout(function () {
        scope.init();
      }, 10);

      scope.showmap = function (centerData, memberData) {
        var myLatlng = new google.maps.LatLng(centerData.latitude, centerData.longitude);
        var mapOptions = {
          zoom: 13,
          center: myLatlng,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        // Attach a map to the DOM Element, with the defined settings

        scope.outsideCount = 0;
        scope.insideCompound = 0;
        scope.highlighters = [];
        var winInfo = new google.maps.InfoWindow();
        var map = new google.maps.Map(document.getElementById("googleMap"), mapOptions);
        document.getElementById("googleMap").style.overflow = "visible";
        var centerMarker = new google.maps.Marker({
          map: map,
          position: myLatlng,
          icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          fillColor: "#0000ff"
        });
        google.maps.event.addListener(centerMarker, 'click', function () {
          winInfo.setContent('<h3>' + centerData.name + '</h3>');
          winInfo.open(map, centerMarker);
        });
        var circle = new google.maps.Circle({
          map: map,
          radius: parseInt(scope.googleMapGeoFencingRadiusLimit),
          fillColor: "#E4E4F2",
          strokeColor: "#C2C2E3",
          fillOpacity: 0.35,
          strokeOpacity: 0.8,
          strokeWeight: 1,
          position: myLatlng
        });
        circle.bindTo('center', centerMarker, 'position');

        var circleBounds = circle.getBounds();
        for (var i = 0; i < memberData.length; i++) {
          var marker = generateMarkerInBoundries(circleBounds, memberData[i]);
          marker.setMap(map);
        }

        function generateMarkerInBoundries(boundries, memberGeoData) {
          var marker = null;
          var
            ne = boundries.getNorthEast(),
            sw = boundries.getSouthWest(),
            lat = memberGeoData.latitude,
            lng = memberGeoData.longitude;
          loc2 = new google.maps.LatLng(lat, lng);
          var diff = (google.maps.geometry.spherical.computeDistanceBetween(myLatlng, loc2));
          if (diff > circle.getRadius()) {
            marker = new google.maps.Marker({
              map: map,
              position: loc2,
              icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
            });
            scope.outsideCount = scope.outsideCount + 1;
          } else {
            marker = new google.maps.Marker({
              map: map,
              position: loc2,
              icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
            });
            scope.insideCompound = scope.insideCompound + 1;
          }
          marker.setPosition(new google.maps.LatLng(lat, lng))
          google.maps.event.addListener(marker, 'click', function () {
            winInfo.setContent('<h3>' + memberGeoData.name + '</h3>' + memberGeoData.address);
            winInfo.open(map, marker);
          });
          scope.highlighters.push(marker);
          return marker;
        }
      };



    }
  });
  mifosX.ng.application.controller('CenterGeoLocationController', ['$scope', 'ResourceFactory', mifosX.controllers.CenterGeoLocationController]).run(function ($log) {
    $log.info("CenterGeoLocationController initialized");
  });
}(mifosX.controllers || {}));
