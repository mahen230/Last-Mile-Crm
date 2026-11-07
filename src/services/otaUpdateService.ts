import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

export interface VersionManifest {
  appName: string;
  appVersion: string;
  buildNumber: number;
  releaseDate: string;
  minSupportedVersion: string;
  otaChannel: string;
  otaLiveUrl: string;
  releaseNotes: string[];
}

export const CURRENT_CLIENT_BUILD: VersionManifest = {
  appName: 'Postman Book CRM (Dadabari S.O. 324009)',
  appVersion: '2.4.0',
  buildNumber: 240,
  releaseDate: '2026-10-31',
  minSupportedVersion: '2.0.0',
  otaChannel: 'production',
  otaLiveUrl: 'https://ais-dev-upa7hb7ebjsju3e7k63nqq-154904702900.asia-southeast1.run.app',
  releaseNotes: [
    'Native Android Capacitor APK/AAB wrapper setup with GPS & Camera permissions',
    'Unified real-time cloud data sync between Web Portal and Android Mobile App',
    'Instant OTA (Over-The-Air) update mechanism directly from AI Studio',
    'Postman OS Security Layer with mandatory Employee Authentication Gate'
  ]
};

const STORAGE_KEY_OTA_DISMISSED = 'postman_ota_dismissed_version';
const STORAGE_KEY_PREFER_LIVE_OTA = 'postman_prefer_live_ota_url';

class OTAUpdateService {
  private updateAvailable: boolean = false;
  private latestManifest: VersionManifest | null = null;
  private listeners: Set<(manifest: VersionManifest | null) => void> = new Set();

  constructor() {
    this.init();
  }

  private async init() {
    // Initial check on boot
    setTimeout(() => {
      this.checkForUpdates();
    }, 2000);
  }

  public subscribe(callback: (manifest: VersionManifest | null) => void) {
    this.listeners.add(callback);
    callback(this.updateAvailable ? this.latestManifest : null);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.updateAvailable ? this.latestManifest : null));
  }

  public isNativeAndroid(): boolean {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
  }

  public getPlatformName(): string {
    return Capacitor.getPlatform();
  }

  public getCurrentBuild(): VersionManifest {
    return CURRENT_CLIENT_BUILD;
  }

  public async checkForUpdates(): Promise<{ hasUpdate: boolean; manifest?: VersionManifest; error?: string }> {
    try {
      // Fetch version.json with cache busting
      const cacheBuster = `?t=${Date.now()}`;
      const res = await fetch(`/version.json${cacheBuster}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache'
        }
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} checking version`);
      }

      const remoteManifest: VersionManifest = await res.json();
      this.latestManifest = remoteManifest;

      // Compare build numbers or semver
      if (remoteManifest.buildNumber > CURRENT_CLIENT_BUILD.buildNumber) {
        this.updateAvailable = true;
        this.notify();
        return { hasUpdate: true, manifest: remoteManifest };
      }

      this.updateAvailable = false;
      this.notify();
      return { hasUpdate: false, manifest: remoteManifest };
    } catch (err: any) {
      console.warn('OTA update check notice:', err.message);
      return { hasUpdate: false, error: err.message };
    }
  }

  public async triggerOTAApply(targetUrl?: string): Promise<void> {
    try {
      // Clear service workers / cache to fetch freshest web bundles
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

      const urlToLoad = targetUrl || this.latestManifest?.otaLiveUrl || window.location.origin;

      if (this.isNativeAndroid()) {
        // If native, can refresh or navigate to live URL
        window.location.href = `${urlToLoad}?ota_reload=${Date.now()}`;
      } else {
        window.location.reload();
      }
    } catch (e) {
      window.location.reload();
    }
  }

  public dismissUpdate(version: string) {
    try {
      localStorage.setItem(STORAGE_KEY_OTA_DISMISSED, version);
    } catch {}
    this.updateAvailable = false;
    this.notify();
  }

  public async setPreferLiveSync(enabled: boolean) {
    try {
      await Preferences.set({ key: STORAGE_KEY_PREFER_LIVE_OTA, value: enabled ? 'true' : 'false' });
    } catch {
      localStorage.setItem(STORAGE_KEY_PREFER_LIVE_OTA, enabled ? 'true' : 'false');
    }
  }

  public async getPreferLiveSync(): Promise<boolean> {
    try {
      const { value } = await Preferences.get({ key: STORAGE_KEY_PREFER_LIVE_OTA });
      return value === 'true';
    } catch {
      return localStorage.getItem(STORAGE_KEY_PREFER_LIVE_OTA) === 'true';
    }
  }
}

export const otaUpdateService = new OTAUpdateService();
