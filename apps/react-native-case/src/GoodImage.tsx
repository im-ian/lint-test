import { Text, View } from 'react-native';
import { AppImage } from './design-system/Image';

export function GoodImageExample() {
  return (
    <View>
      <Text>프로필 이미지</Text>
      <AppImage
        accessibilityLabel="프로필 사진"
        source={{ uri: 'https://example.com/profile.png' }}
      />
    </View>
  );
}
