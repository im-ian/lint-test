import { Text, View } from 'react-native';
import { AppImage } from './design-system/Image';

type Translator = (key: string) => string;

export function GoodImageExample({ t }: { t: Translator }) {
  return (
    <View>
      <Text>{t('profile.image.label')}</Text>
      <AppImage
        accessibilityLabel={t('profile.image.accessibilityLabel')}
        source={{ uri: 'https://example.com/profile.png' }}
      />
    </View>
  );
}
