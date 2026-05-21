const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withPlayGames(config, props) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const mainApplication = androidManifest.manifest.application[0];
    
    mainApplication['meta-data'] = mainApplication['meta-data'] || [];
    
    // Add com.google.android.gms.games.APP_ID if provided
    if (props && props.appId) {
      const hasAppId = mainApplication['meta-data'].some(
        (item) => item.$['android:name'] === 'com.google.android.gms.games.APP_ID'
      );
      if (!hasAppId) {
        mainApplication['meta-data'].push({
          $: {
            'android:name': 'com.google.android.gms.games.APP_ID',
            'android:value': String(props.appId),
          }
        });
      }
    }
    
    // Add com.google.android.gms.games.SUPPRESS_GAME_PROFILE_CREATION to stop automatic popup on launch
    const hasSuppress = mainApplication['meta-data'].some(
      (item) => item.$['android:name'] === 'com.google.android.gms.games.SUPPRESS_GAME_PROFILE_CREATION'
    );
    if (!hasSuppress) {
      mainApplication['meta-data'].push({
        $: {
          'android:name': 'com.google.android.gms.games.SUPPRESS_GAME_PROFILE_CREATION',
          'android:value': 'true',
        }
      });
    }
    
    return config;
  });
};
