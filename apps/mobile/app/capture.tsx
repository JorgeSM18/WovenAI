import {
  Button,
  EmptyStateTemplate,
  Fab,
  FullScreenFlowTemplate,
  IconButton,
  Text,
} from '@woven/ui';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Image, Linking, View } from 'react-native';

/**
 * Photo capture (T-0401). Handles the camera permission states explicitly and
 * lets the user take, review and retake a photo. "Use Photo" is the handoff to
 * the compression + signed-upload pipeline (T-0402/T-0403), stubbed for now.
 */
export default function CaptureScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Permission state still loading.
  if (!permission) {
    return (
      <FullScreenFlowTemplate>
        <View className="flex-1 bg-background" />
      </FullScreenFlowTemplate>
    );
  }

  // Permission denied — explain why and offer the right recovery action.
  if (!permission.granted) {
    return (
      <FullScreenFlowTemplate>
        <EmptyStateTemplate
          title="Camera access needed"
          description="Woven uses your camera to capture garments. Photos stay private to your wardrobe."
          action={
            permission.canAskAgain ? (
              <Button
                label="Allow camera"
                onPress={() => {
                  void requestPermission();
                }}
              />
            ) : (
              <Button
                label="Open settings"
                onPress={() => {
                  void Linking.openSettings();
                }}
              />
            )
          }
        />
      </FullScreenFlowTemplate>
    );
  }

  const takePhoto = async () => {
    if (!cameraRef.current || isCapturing) return;
    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync();
      if (photo) setPhotoUri(photo.uri);
    } finally {
      setIsCapturing(false);
    }
  };

  // Review the captured photo.
  if (photoUri) {
    return (
      <FullScreenFlowTemplate>
        <View className="flex-1 bg-background">
          <Image
            source={{ uri: photoUri }}
            resizeMode="contain"
            className="flex-1"
            accessibilityLabel="Captured garment photo"
          />
          <View className="flex-row gap-md p-md">
            <Button
              label="Retake"
              variant="secondary"
              className="flex-1"
              onPress={() => setPhotoUri(null)}
            />
            {/* T-0402/T-0403: compress + EXIF cleanup → signed upload → review. */}
            <Button label="Use Photo" className="flex-1" onPress={() => router.back()} />
          </View>
        </View>
      </FullScreenFlowTemplate>
    );
  }

  // Live camera.
  return (
    <FullScreenFlowTemplate>
      <View className="flex-1 bg-background">
        <CameraView ref={cameraRef} facing="back" style={{ flex: 1 }} />
        <View className="absolute inset-x-0 top-0 flex-row p-md">
          <IconButton
            icon={
              <Text variant="headline-md" className="text-on-surface">
                ‹
              </Text>
            }
            accessibilityLabel="Close camera"
            onPress={() => router.back()}
          />
        </View>
        <View className="absolute inset-x-0 bottom-lg items-center">
          <Fab
            icon={<View className="h-md w-md rounded-full bg-surface" />}
            accessibilityLabel="Take photo"
            onPress={() => {
              void takePhoto();
            }}
          />
        </View>
      </View>
    </FullScreenFlowTemplate>
  );
}
