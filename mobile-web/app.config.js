module.exports = ({ config }) => {
  const webOnly = process.env.EXPO_WEB_ONLY === '1';

  return {
    ...config,
    platforms: webOnly ? ['web'] : config.platforms,
    extra: {
      ...config.extra,
      apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api',
    },
    android: {
      ...config.android,
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY || '',
        },
      },
    },
  };
};
