const path = require('path');

module.exports = {
  resolve: {
    extensions: ['.ts', '.tsx', '.web.js', '.js', '.json', '.web.jsx', '.jsx'],
    alias: {
      // Support React Native Web
      // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
      // 'react-dom': '@hot-loader/react-dom',
      'react-native': 'react-native-web',
      '+components': path.resolve(__dirname, '../src/shared/components'),
      '+utils': path.resolve(__dirname, '../src/shared/utils'),
      '+hooks': path.resolve(__dirname, '../src/shared/hooks'),
      "+theme": path.resolve(__dirname, '../src/shared/theme'),
      '@': path.resolve(__dirname, '../src'),
    },
  },
};
