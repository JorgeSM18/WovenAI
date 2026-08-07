import type { CanvasItem } from '@woven/store';
import { Image } from 'expo-image';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

// Free-form canvas sizes are pixel-based, not design tokens.
const ITEM_W = 110;
const ITEM_H = 150;

type Props = {
  item: CanvasItem;
  isSelected: boolean;
  onMove: (garmentId: string, posX: number, posY: number) => void;
  onScale: (garmentId: string, scale: number) => void;
  onRotate: (garmentId: string, rotation: number) => void;
  onSelect: (garmentId: string) => void;
  onRemove: (garmentId: string) => void;
};

/** A garment on the Studio canvas: drag to move, pinch to scale, rotate with two
 *  fingers, tap to select (then use the accessible controls), long press to
 *  remove. Live transform lives in reanimated shared values; committed to the
 *  draft store on gesture end. */
export function DraggableItem({
  item,
  isSelected,
  onMove,
  onScale,
  onRotate,
  onSelect,
  onRemove,
}: Props) {
  const x = useSharedValue(item.posX);
  const y = useSharedValue(item.posY);
  const scale = useSharedValue(item.scale);
  const savedScale = useSharedValue(item.scale);
  const rotation = useSharedValue(item.rotation);
  const savedRotation = useSharedValue(item.rotation);

  const pan = Gesture.Pan()
    .onChange((event) => {
      x.value += event.changeX;
      y.value += event.changeY;
    })
    .onEnd(() => {
      runOnJS(onMove)(item.garmentId, x.value, y.value);
    });

  const pinch = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      runOnJS(onScale)(item.garmentId, scale.value);
    });

  const rotate = Gesture.Rotation()
    .onUpdate((event) => {
      rotation.value = savedRotation.value + event.rotation;
    })
    .onEnd(() => {
      savedRotation.value = rotation.value;
      runOnJS(onRotate)(item.garmentId, rotation.value);
    });

  const tap = Gesture.Tap().onEnd(() => {
    runOnJS(onSelect)(item.garmentId);
  });

  const longPress = Gesture.LongPress().onStart(() => {
    runOnJS(onRemove)(item.garmentId);
  });

  const gesture = Gesture.Race(Gesture.Simultaneous(pan, pinch, rotate), longPress, tap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { scale: scale.value },
      { rotate: `${rotation.value}rad` },
    ],
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
          className={`overflow-hidden rounded-lg bg-surface-container ${
            isSelected ? 'border-2 border-primary' : ''
          }`}
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
