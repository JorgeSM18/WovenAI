import NetInfo from '@react-native-community/netinfo';
import { useUploadImage } from '@woven/data';
import { useImportQueue } from '@woven/store';
import {
  Button,
  EmptyStateTemplate,
  Fab,
  FullScreenFlowTemplate,
  Icon,
  IconButton,
  Text,
} from '@woven/ui';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Image, Linking, View } from 'react-native';

import { processForUpload } from '../src/features/capture/processImage';
import { readImageBytes } from '../src/features/capture/readImageBytes';
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
          title="Necesitamos acceso a la cámara"
          description="Woven usa tu cámara para capturar prendas. Tus fotos quedan privadas en tu armario."
          action={
            permission.canAskAgain ? (
              <Button
                label="Permitir cámara"
                onPress={() => {
                  void requestPermission();
                }}
              />
            ) : (
              <Button
                label="Abrir ajustes"
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
    setError(null);
    try {
      const result = await cameraRef.current.takePictureAsync();
      if (result) setPhoto({ uri: result.uri, width: result.width, height: result.height });
    } catch (err) {
      console.error('[capture] takePhoto failed', err);
      setError(
        `No se pudo hacer la foto: ${err instanceof Error ? err.message : 'error desconocido'}`,
      );
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
      const net = await NetInfo.fetch();
      if (net.isConnected) {
        const bytes = await readImageBytes(processed.uri);
        const uploaded = await upload.mutateAsync({
          userId,
          bytes,
          type: 'original',
          mime: processed.mime,
          width: processed.width,
          height: processed.height,
        });
        router.replace({
          pathname: '/garment-review',
          params: { imageId: uploaded.id, uri: processed.uri },
        });
      } else {
        // Offline (T-0405): create the garment now; the upload is deferred and
        // linked to it when connectivity returns (see UploadQueueDrain).
        router.replace({
          pathname: '/garment-review',
          params: {
            uri: processed.uri,
            offline: '1',
            width: String(processed.width),
            height: String(processed.height),
          },
        });
      }
    } catch (err) {
      console.error('[capture] usePhoto failed', err);
      setError(
        `No se pudo subir la foto: ${err instanceof Error ? err.message : 'error desconocido'}`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  const importFromGallery = async () => {
    if (!userId) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 1,
    });
    if (result.canceled) return;
    setIsSaving(true);
    setError(null);
    try {
      const items = [];
      for (const asset of result.assets) {
        const processed = await processForUpload({
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
        });
        const bytes = await readImageBytes(processed.uri);
        const uploaded = await upload.mutateAsync({
          userId,
          bytes,
          type: 'original',
          mime: processed.mime,
          width: processed.width,
          height: processed.height,
        });
        items.push({ imageId: uploaded.id, uri: processed.uri });
      }
      useImportQueue.getState().enqueue(items);
      router.replace('/garment-review');
    } catch (err) {
      console.error('[capture] importFromGallery failed', err);
      setError(`No se pudo importar: ${err instanceof Error ? err.message : 'error desconocido'}`);
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
            accessibilityLabel="Foto de la prenda capturada"
          />
          <View className="gap-sm p-md">
            {error ? (
              <Text variant="body-md" className="text-error">
                {error}
              </Text>
            ) : null}
            <View className="flex-row gap-md">
              <Button
                label="Repetir"
                variant="secondary"
                className="flex-1"
                disabled={isSaving}
                onPress={() => setPhoto(null)}
              />
              <Button
                label={isSaving ? 'Guardando…' : 'Usar foto'}
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
        <View className="absolute inset-x-0 top-0 gap-sm p-md">
          <View className="flex-row items-center justify-between">
            <IconButton
              icon={<Icon name="close" />}
              accessibilityLabel="Cerrar cámara"
              onPress={() => router.back()}
            />
            <Button
              label="Importar"
              variant="secondary"
              disabled={isSaving}
              onPress={() => {
                void importFromGallery();
              }}
            />
          </View>
          {error ? (
            <View className="self-center rounded-lg bg-error px-md py-sm">
              <Text variant="body-md" className="text-on-error">
                {error}
              </Text>
            </View>
          ) : null}
        </View>
        <View className="absolute inset-x-0 bottom-lg items-center">
          <Fab
            className="h-[72px] w-[72px] border-4 border-surface bg-transparent"
            icon={<View className="h-14 w-14 rounded-full bg-surface" />}
            accessibilityLabel="Hacer foto"
            onPress={() => {
              void takePhoto();
            }}
          />
        </View>
        {isSaving ? (
          <View
            className="absolute inset-0 items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
          >
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        ) : null}
      </View>
    </FullScreenFlowTemplate>
  );
}
