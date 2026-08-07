import { Image } from 'expo-image';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

export type CanvasItem = {
  garmentId: string;
  thumbnailUrl: string | null;
  posX: number;
  posY: number;
  zIndex: number;
};

// Free-form canvas sizes are pixel-based, not design tokens.
const ITEM_W = 110;
const ITEM_H = 150;

type Props = {
  item: CanvasItem;
  onMove: (garmentId: string, posX: number, posY: number) => void;
  onBringToFront: (garmentId: string) => void;
  onRemove: (garmentId: string) => void;
};

/** A garment on the Studio canvas: drag to move, tap to bring to front, long
 *  press to remove. Position lives in reanimated shared values; committed to
 *  React state on gesture end. */
export function DraggableItem({ item, onMove, onBringToFront, onRemove }: Props) {
  const x = useSharedValue(item.posX);
  const y = useSharedValue(item.posY);

  const pan = Gesture.Pan()
    .onChange((event) => {
      x.value += event.changeX;
      y.value += event.changeY;
    })
    .onEnd(() => {
      runOnJS(onMove)(item.garmentId, x.value, y.value);
    });

  const tap = Gesture.Tap().onEnd(() => {
    runOnJS(onBringToFront)(item.garmentId);
  });

  const longPress = Gesture.LongPress().onStart(() => {
    runOnJS(onRemove)(item.garmentId);
  });

  const gesture = Gesture.Race(pan, longPress, tap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        accessibilityLabel={`${item.garmentId} on canvas`}
        style={[
          { position: 'absolute', width: ITEM_W, height: ITEM_H, zIndex: item.zIndex },
          animatedStyle,
        ]}
      >
        <View
          className="overflow-hidden rounded-lg bg-surface-container"
          style={{ width: '100%', height: '100%' }}
        >
          {item.thumbnailUrl ? (
            <Image
              source={{ uri: item.thumbnailUrl }}
              contentFit="cover"
              cachePolicy="memory-disk"
              style={{ width: '100%', height: '100%' }}
            />
          ) : null}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}
