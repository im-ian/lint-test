import noDiscouragedCopy from './rules/no-discouraged-copy.js';
import noReactNativeImage from './rules/no-react-native-image.js';

const plugin = {
  meta: {
    name: '@lint-test/eslint-plugin-product-rules',
    version: '0.1.0'
  },
  rules: {
    'no-discouraged-copy': noDiscouragedCopy,
    'no-react-native-image': noReactNativeImage
  }
};

export default plugin;
