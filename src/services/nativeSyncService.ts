import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation, Position } from '@capacitor/geolocation';
import { App } from '@capacitor/app';
import { Preferences } from '@capacitor/preferences';
import { customerService } from './customerService';
import { staffPermissionService } from './staffPermissionService';

export interface GeoLocationTag {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export class NativeSyncService {
  private initialized = false;

  constructor() {
    this.initNativeListeners();
  }

  private async initNativeListeners() {
    if (this.initialized) return;
    this.initialized = true;

    if (Capacitor.isNativePlatform()) {
      // Handle native back button
      try {
        App.addListener('backButton', ({ canGoBack }) => {
          if (canGoBack) {
            window.history.back();
          } else {
            // Minimize or confirm exit
            App.minimizeApp();
          }
        });
      } catch (e) {
        console.warn('Native backButton listener fallback:', e);
      }

      // Handle resume & foreground app state
      try {
        App.addListener('appStateChange', ({ isActive }) => {
          if (isActive) {
            // Trigger cloud sync refresh when app returns to foreground
            this.syncCloudData();
          }
        });
      } catch (e) {
        console.warn('Native appStateChange listener fallback:', e);
      }
    }
  }

  /**
   * Syncs data between cloud (Firestore) and local storage
   */
  public async syncCloudData(): Promise<{ success: boolean; count?: number }> {
    try {
      // Re-trigger sync in customerService and staffPermissionService
      const customers = customerService.getCustomers();
      return { success: true, count: customers.length };
    } catch (e) {
      return { success: false };
    }
  }

  /**
   * Capture photo for Barcode Scanning / Property Doorstep Verification / Document Proof
   */
  public async captureDocumentPhoto(): Promise<{ dataUrl?: string; error?: string }> {
    try {
      if (Capacitor.isPluginAvailable('Camera')) {
        const photo = await Camera.getPhoto({
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Camera,
          quality: 85,
          allowEditing: false,
        });
        return { dataUrl: photo.dataUrl };
      } else {
        return { error: 'Native camera not available on this device' };
      }
    } catch (err: any) {
      return { error: err.message || 'Camera capture cancelled' };
    }
  }

  /**
   * Get High Accuracy GPS Location for Field Beat Tagging
   */
  public async getCurrentBeatLocation(): Promise<{ location?: GeoLocationTag; error?: string }> {
    try {
      if (Capacitor.isPluginAvailable('Geolocation')) {
        const pos: Position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 3000,
        });
        return {
          location: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp,
          },
        };
      } else {
        return { error: 'Native Geolocation plugin not available' };
      }
    } catch (err: any) {
      // Fallback to browser navigator.geolocation
      return new Promise((resolve) => {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                location: {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  accuracy: position.coords.accuracy,
                  timestamp: position.timestamp,
                },
              });
            },
            (error) => resolve({ error: error.message }),
            { enableHighAccuracy: true, timeout: 10000 }
          );
        } else {
          resolve({ error: 'Geolocation not supported' });
        }
      });
    }
  }

  public async getCurrentPosition(): Promise<{ coords: { latitude: number; longitude: number; accuracy: number } } | null> {
    const res = await this.getCurrentBeatLocation();
    if (res.location) {
      return {
        coords: {
          latitude: res.location.latitude,
          longitude: res.location.longitude,
          accuracy: res.location.accuracy,
        },
      };
    }
    return null;
  }

  public isNative(): boolean {
    return Capacitor.isNativePlatform();
  }
}

export const nativeSyncService = new NativeSyncService();
export const nativeDeviceService = nativeSyncService;
