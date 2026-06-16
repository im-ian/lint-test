import noDiscouragedCopy from './rules/no-discouraged-copy.js';
import noHardcodedI18nText from './rules/no-hardcoded-i18n-text.js';
import noReactNativeImage from './rules/no-react-native-image.js';
import noTailwindBorder from './rules/no-tailwind-border.js';

const plugin = {
  meta: {
    name: '@lint-test/eslint-plugin-product-rules',
    version: '0.1.0'
  },
  rules: {
    'no-discouraged-copy': noDiscouragedCopy,
    'no-hardcoded-i18n-text': noHardcodedI18nText,
    'no-react-native-image': noReactNativeImage,
    'no-tailwind-border': noTailwindBorder
  }
};

export default plugin;
