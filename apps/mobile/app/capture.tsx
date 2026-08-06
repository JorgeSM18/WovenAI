import { useUploadImage } from '@woven/data';
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

import { processForUpload } from '../src/features/capture/processImage';
import { useAuth } from '../src/providers/AuthProvider';

type CapturedPhoto = { uri: string; width: number; height: number };

/**
 * Photo capture (T-0401/T-0402/T-0403). Handles camera permission states, takes
 * and reviews a photo, then processes it (resize + EXIF strip) and uploads it to
 * Storage, recording an image_asset. "Use Photo" hands off to the review/create
 * garment flow (T-0406/T-0407) — for now it returns after a successful upload.
 */
export default function CaptureScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [photo, setPhoto] = useState<CapturedPhoto | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const upload = useUploadImage();

  if (!permission) {
    return (
      <FullScreenFlowTemplate>
        <View className="flex-1 bg-background" />
      </FullScreenFlowTemplate>
    );
  }

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
      const result = await cameraRef.current.takePictureAsync();
      if (result) setPhoto({ uri: result.uri, width: result.width, height: result.height });
    } finally {
      setIsCapturing(false);
    }
  };

  const usePhoto = async () => {
    if (!photo || !userId) return;
    setIsSaving(true);
    setError(null);
    try {
      const processed = await processForUpload(photo);
      await upload.mutateAsync({
        userId,
        uri: processed.uri,
        type: 'original',
        mime: processed.mime,
        width: processed.width,
        height: processed.height,
      });
      router.back();
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (photo) {
    return (
      <FullScreenFlowTemplate>
        <View className="flex-1 bg-background">
          <Image
            source={{ uri: photo.uri }}
            resizeMode="contain"
            className="flex-1"
            accessibilityLabel="Captured garment photo"
          />
          <View className="gap-sm p-md">
            {error ? (
              <Text variant="body-md" className="text-error">
                {error}
              </Text>
            ) : null}
            <View className="flex-row gap-md">
              <Button
                label="Retake"
                variant="secondary"
                className="flex-1"
                disabled={isSaving}
                onPress={() => setPhoto(null)}
              />
              <Button
                label={isSaving ? 'Saving…' : 'Use Photo'}
                className="flex-1"
                disabled={isSaving}
                onPress={() => {
                  void usePhoto();
                }}
              />
            </View>
          </View>
        </View>
      </FullScreenFlowTemplate>
    );
  }

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
