import { Image, Text, View } from 'react-native';

export function BadImageExample() {
  return (
    <View>
      <Text>프로필 이미지</Text>
      <Image
        accessibilityLabel="프로필 사진"
        source={{ uri: 'https://example.com/profile.png' }}
      />
    </View>
  );
}
