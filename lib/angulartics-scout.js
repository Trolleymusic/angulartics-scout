(function(window, angular, undefined) {
  "use strict";

  /**
   * @ngdoc overview
   * @name angulartics.scout
   * Enables analytics support for Scout Analytics
   */
  angular.module("angulartics.scout", ["angulartics"])
    .config(["$analyticsProvider", "$windowProvider", function ($analyticsProvider, $windowProvider) {

      /** Give access to the $window object */
      var $window = $windowProvider.$get();

      /** Track relative path */
      $analyticsProvider.settings.pageTracking.trackRelativePath = true;

      /** Scout-specific settings */
      $analyticsProvider.settings.scout = {
        "debugMode": false,
        "disableEventTracking": false,
        "disablePageTracking": false,
        "language": "",
        "sectionName": "",
        "siteName": "",
        "userId": ""
      };

      /**
       * Returns if Scout is ready to collect
       * @returns {Boolean}
       */
      function scoutIsReady () {
        if (!$window.$AOC || !$window.$AOC.recordPageHit) {
          return false;
        }

        if (!$window.$SAT || !$window.$SAT.clearContent) {
          return false;
        }

        return true;
      }

      /**
       * Tracks a page view
       * @param {String} path
       */
      function pageTrack (path) {

        if (!scoutIsReady()) {
          outputDebug("Scout not ready");
          return;
        }

        // Do nothing if page tracking is disabled
        if ($analyticsProvider.settings.scout.disablePageTracking) {
          outputDebug("Page tracking disabled");
          return;
        }

        $window.$SAT.clearContent();

        $window.$SAT.push(
          ["setUser", $analyticsProvider.settings.scout.userId],
          ["setContent", "siteName", $analyticsProvider.settings.scout.siteName],
          ["setContent", "language", $analyticsProvider.settings.scout.language],
          ["setContent", "pageName", path]
        );

        outputDebug("Page track", $window.$SAT.getContent());

        // Send data
        $window.$AOC.recordPageHit();
      }

      /**
       * Tracks an event
       * @param {String} action The event action type
       * @param {Object} properties The properties associated with the action
       */
      function eventTrack (action, properties) {

        var scoutProperties;

        if (!scoutIsReady()) {
          outputDebug("Scout not ready");
          return;
        }

        // Do nothing if event tracking is disabled
        if ($analyticsProvider.settings.scout.disableEventTracking) {
          outputDebug("Event tracking disabled");
          return;
        }

        $window.$SAT.clearContent();

        $window.$SAT.push(
          ["setUser", $analyticsProvider.settings.scout.userId],
          ["setContent", "siteName", $analyticsProvider.settings.scout.siteName],
          ["setContent", "language", $analyticsProvider.settings.scout.language],
          ["setContent", "action", action]
        );

        scoutProperties = Object.getOwnPropertyNames(properties).map(function (key) {
          return ["setContent", key, properties[key]];
        });

        scoutProperties.forEach(function (contentItem) {
          $window.$SAT.push(contentItem);
        });

        outputDebug("Event track", $window.$SAT.getContent());

        // Send data
        $window.$AOC.recordPageHit();
      }

      /**
       * Sets the current user
       * @param {String} userId The user id
       */
      function setUsername (userId) {
        outputDebug("Scout: setUsername:", userId);

        $analyticsProvider.settings.scout.userId = userId;
      }

      function outputDebug() {
        if (!$analyticsProvider.settings.scout.debugMode) {
          return;
        }

        console.log.apply($window, arguments);
      }

      $analyticsProvider.registerSetUsername(setUsername);

      /** Let Angulartics buffer calls to $window.$SAT before it's loaded */
      $window.angulartics.waitForVendorApi("$SAT", 1000, function () {
        outputDebug("$SAT OK", $window.$SAT);
        $analyticsProvider.registerPageTrack(pageTrack);
        $analyticsProvider.registerEventTrack(eventTrack);
      });

  }]);
})(window, window.angular);
