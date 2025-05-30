import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ThemedViewProps {
  style?: object;
  lightColor?: string;
  darkColor?: string;
  [key: string]: any;
}

export function ThemedView({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) {
  const backgroundColor = "#112D4E";

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor }, style]}
      {...otherProps}
    >
      {otherProps.children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
