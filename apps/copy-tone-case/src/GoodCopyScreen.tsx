import { Text } from 'react-native';

type Translator = (key: string) => string;

export function GoodCopyScreen({ t }: { t: Translator }) {
  return <Text>{t('retry.message')}</Text>;
}
