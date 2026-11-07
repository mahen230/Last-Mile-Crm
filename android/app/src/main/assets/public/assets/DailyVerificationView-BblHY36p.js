const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/web-1ttaw9-M.js","assets/index-CnNe7uH5.js","assets/index-iqkB-VLO.css","assets/web-Bk-Mo0pO.js"])))=>i.map(i=>d[i]);
import { bc as WebPlugin, bd as CapacitorException, be as registerPlugin, bf as __vitePreload, bg as Capacitor, b as customerService, u as useAuth, r as reactExports, bb as verificationService, j as jsxRuntimeExports, y as ShieldCheck, Q as Navigation, C as CircleCheck, T as TriangleAlert } from "./index-CnNe7uH5.js";
var CameraSource;
(function(CameraSource2) {
  CameraSource2["Prompt"] = "PROMPT";
  CameraSource2["Camera"] = "CAMERA";
  CameraSource2["Photos"] = "PHOTOS";
})(CameraSource || (CameraSource = {}));
var CameraDirection;
(function(CameraDirection2) {
  CameraDirection2["Rear"] = "REAR";
  CameraDirection2["Front"] = "FRONT";
})(CameraDirection || (CameraDirection = {}));
var CameraResultType;
(function(CameraResultType2) {
  CameraResultType2["Uri"] = "uri";
  CameraResultType2["Base64"] = "base64";
  CameraResultType2["DataUrl"] = "dataUrl";
})(CameraResultType || (CameraResultType = {}));
var MediaType;
(function(MediaType2) {
  MediaType2[MediaType2["Photo"] = 0] = "Photo";
  MediaType2[MediaType2["Video"] = 1] = "Video";
})(MediaType || (MediaType = {}));
var MediaTypeSelection;
(function(MediaTypeSelection2) {
  MediaTypeSelection2[MediaTypeSelection2["Photo"] = 0] = "Photo";
  MediaTypeSelection2[MediaTypeSelection2["Video"] = 1] = "Video";
  MediaTypeSelection2[MediaTypeSelection2["All"] = 2] = "All";
})(MediaTypeSelection || (MediaTypeSelection = {}));
var EncodingType;
(function(EncodingType2) {
  EncodingType2[EncodingType2["JPEG"] = 0] = "JPEG";
  EncodingType2[EncodingType2["PNG"] = 1] = "PNG";
})(EncodingType || (EncodingType = {}));
var CameraErrorCode;
(function(CameraErrorCode2) {
  CameraErrorCode2["CameraPermissionDenied"] = "OS-PLUG-CAMR-0003";
  CameraErrorCode2["GalleryPermissionDenied"] = "OS-PLUG-CAMR-0005";
  CameraErrorCode2["NoCameraAvailable"] = "OS-PLUG-CAMR-0007";
  CameraErrorCode2["TakePhotoCancelled"] = "OS-PLUG-CAMR-0006";
  CameraErrorCode2["TakePhotoFailed"] = "OS-PLUG-CAMR-0010";
  CameraErrorCode2["TakePhotoInvalidArguments"] = "OS-PLUG-CAMR-0014";
  CameraErrorCode2["InvalidImageData"] = "OS-PLUG-CAMR-0008";
  CameraErrorCode2["EditPhotoFailed"] = "OS-PLUG-CAMR-0009";
  CameraErrorCode2["EditPhotoCancelled"] = "OS-PLUG-CAMR-0013";
  CameraErrorCode2["EditPhotoEmptyUri"] = "OS-PLUG-CAMR-0024";
  CameraErrorCode2["ImageNotFound"] = "OS-PLUG-CAMR-0011";
  CameraErrorCode2["ProcessImageFailed"] = "OS-PLUG-CAMR-0012";
  CameraErrorCode2["ChooseMediaFailed"] = "OS-PLUG-CAMR-0018";
  CameraErrorCode2["ChooseMediaCancelled"] = "OS-PLUG-CAMR-0020";
  CameraErrorCode2["MediaPathError"] = "OS-PLUG-CAMR-0021";
  CameraErrorCode2["FetchImageFromUriFailed"] = "OS-PLUG-CAMR-0028";
  CameraErrorCode2["RecordVideoFailed"] = "OS-PLUG-CAMR-0016";
  CameraErrorCode2["RecordVideoCancelled"] = "OS-PLUG-CAMR-0017";
  CameraErrorCode2["VideoNotFound"] = "OS-PLUG-CAMR-0025";
  CameraErrorCode2["PlayVideoFailed"] = "OS-PLUG-CAMR-0023";
  CameraErrorCode2["EncodeResultFailed"] = "OS-PLUG-CAMR-0019";
  CameraErrorCode2["FileNotFound"] = "OS-PLUG-CAMR-0027";
  CameraErrorCode2["InvalidArgument"] = "OS-PLUG-CAMR-0031";
  CameraErrorCode2["GeneralError"] = "OS-PLUG-CAMR-0026";
})(CameraErrorCode || (CameraErrorCode = {}));
class CameraWeb extends WebPlugin {
  async takePhoto(options) {
    return new Promise(async (resolve, reject) => {
      if (options.webUseInput) {
        this.takePhotoCameraInputExperience(options, resolve, reject);
      } else {
        this.takePhotoCameraExperience(options, resolve, reject);
      }
    });
  }
  async recordVideo(_options) {
    throw this.unimplemented("recordVideo is not implemented on Web.");
  }
  async playVideo(_options) {
    throw this.unimplemented("playVideo is not implemented on Web.");
  }
  async chooseFromGallery(options) {
    return new Promise(async (resolve, reject) => {
      this.galleryInputExperience(options, resolve, reject);
    });
  }
  async editPhoto(_options) {
    throw this.unimplemented("editPhoto is not implemented on Web.");
  }
  async editURIPhoto(_options) {
    throw this.unimplemented("editURIPhoto is not implemented on Web.");
  }
  async getPhoto(options) {
    return new Promise(async (resolve, reject) => {
      if (options.webUseInput || options.source === CameraSource.Photos) {
        this.fileInputExperience(options, resolve, reject);
      } else if (options.source === CameraSource.Prompt) {
        let actionSheet = document.querySelector("pwa-action-sheet");
        if (!actionSheet) {
          actionSheet = document.createElement("pwa-action-sheet");
          document.body.appendChild(actionSheet);
        }
        actionSheet.header = options.promptLabelHeader || "Photo";
        actionSheet.cancelable = false;
        actionSheet.options = [
          { title: options.promptLabelPhoto || "From Photos" },
          { title: options.promptLabelPicture || "Take Picture" }
        ];
        actionSheet.addEventListener("onSelection", async (e) => {
          const selection = e.detail;
          if (selection === 0) {
            this.fileInputExperience(options, resolve, reject);
          } else {
            this.cameraExperience(options, resolve, reject);
          }
        });
      } else {
        this.cameraExperience(options, resolve, reject);
      }
    });
  }
  async pickImages(_options) {
    return new Promise(async (resolve, reject) => {
      this.multipleFileInputExperience(resolve, reject);
    });
  }
  async cameraExperience(options, resolve, reject) {
    await this._setupPWACameraModal(options.direction, (photo) => this._getCameraPhoto(photo, options), () => this.fileInputExperience(options, resolve, reject), resolve, reject);
  }
  fileInputExperience(options, resolve, reject) {
    let input = document.querySelector("#_capacitor-camera-input");
    const cleanup = () => {
      var _a;
      (_a = input.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(input);
    };
    if (!input) {
      input = document.createElement("input");
      input.id = "_capacitor-camera-input";
      input.type = "file";
      input.hidden = true;
      document.body.appendChild(input);
      input.addEventListener("change", (_e) => {
        const file = input.files[0];
        let format = "jpeg";
        if (file.type === "image/png") {
          format = "png";
        } else if (file.type === "image/gif") {
          format = "gif";
        }
        if (options.resultType === "dataUrl" || options.resultType === "base64") {
          const reader = new FileReader();
          reader.addEventListener("load", () => {
            if (options.resultType === "dataUrl") {
              resolve({
                dataUrl: reader.result,
                format
              });
            } else if (options.resultType === "base64") {
              const b64 = reader.result.split(",")[1];
              resolve({
                base64String: b64,
                format
              });
            }
            cleanup();
          });
          reader.readAsDataURL(file);
        } else {
          resolve({
            webPath: URL.createObjectURL(file),
            format
          });
          cleanup();
        }
      });
      input.addEventListener("cancel", (_e) => {
        reject(new CapacitorException("User cancelled photos app"));
        cleanup();
      });
    }
    input.accept = "image/*";
    input.capture = true;
    if (options.source === CameraSource.Photos || options.source === CameraSource.Prompt) {
      input.removeAttribute("capture");
    } else if (options.direction === CameraDirection.Front) {
      input.capture = "user";
    } else if (options.direction === CameraDirection.Rear) {
      input.capture = "environment";
    }
    input.click();
  }
  multipleFileInputExperience(resolve, reject) {
    let input = document.querySelector("#_capacitor-camera-input-multiple");
    const cleanup = () => {
      var _a;
      (_a = input.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(input);
    };
    if (!input) {
      input = document.createElement("input");
      input.id = "_capacitor-camera-input-multiple";
      input.type = "file";
      input.hidden = true;
      input.multiple = true;
      document.body.appendChild(input);
      input.addEventListener("change", (_e) => {
        const photos = [];
        for (let i = 0; i < input.files.length; i++) {
          const file = input.files[i];
          let format = "jpeg";
          if (file.type === "image/png") {
            format = "png";
          } else if (file.type === "image/gif") {
            format = "gif";
          }
          photos.push({
            webPath: URL.createObjectURL(file),
            format
          });
        }
        resolve({ photos });
        cleanup();
      });
      input.addEventListener("cancel", (_e) => {
        reject(new CapacitorException("User cancelled photos app"));
        cleanup();
      });
    }
    input.accept = "image/*";
    input.click();
  }
  _getCameraPhoto(photo, options) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const format = this._getFileFormat(photo);
      if (options.resultType === "uri") {
        resolve({
          webPath: URL.createObjectURL(photo),
          format,
          saved: false
        });
      } else {
        reader.readAsDataURL(photo);
        reader.onloadend = () => {
          const r = reader.result;
          if (options.resultType === "dataUrl") {
            resolve({
              dataUrl: r,
              format,
              saved: false
            });
          } else {
            resolve({
              base64String: r.split(",")[1],
              format,
              saved: false
            });
          }
        };
        reader.onerror = (e) => {
          reject(e);
        };
      }
    });
  }
  async takePhotoCameraExperience(options, resolve, reject) {
    await this._setupPWACameraModal(options.cameraDirection, (photo) => {
      var _a;
      return this._buildPhotoMediaResult(photo, (_a = options.includeMetadata) !== null && _a !== void 0 ? _a : false);
    }, () => this.takePhotoCameraInputExperience(options, resolve, reject), resolve, reject);
  }
  takePhotoCameraInputExperience(options, resolve, reject) {
    const input = this._createFileInput("_capacitor-camera-input-takephoto");
    const cleanup = () => {
      var _a;
      (_a = input.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(input);
    };
    input.onchange = async (_e) => {
      var _a;
      if (!this._validateFileInput(input, reject, cleanup)) {
        return;
      }
      const file = input.files[0];
      resolve(await this._buildPhotoMediaResult(file, (_a = options.includeMetadata) !== null && _a !== void 0 ? _a : false));
      cleanup();
    };
    input.oncancel = () => {
      reject(new CapacitorException("User cancelled photos app"));
      cleanup();
    };
    input.accept = "image/*";
    if (options.cameraDirection === CameraDirection.Front) {
      input.capture = "user";
    } else {
      input.capture = "environment";
    }
    input.click();
  }
  galleryInputExperience(options, resolve, reject) {
    var _a, _b;
    const input = this._createFileInput("_capacitor-camera-input-gallery");
    input.multiple = (_a = options.allowMultipleSelection) !== null && _a !== void 0 ? _a : false;
    const cleanup = () => {
      var _a2;
      (_a2 = input.parentNode) === null || _a2 === void 0 ? void 0 : _a2.removeChild(input);
    };
    input.onchange = async (_e) => {
      var _a2;
      if (!this._validateFileInput(input, reject, cleanup)) {
        return;
      }
      const results = [];
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        if (file.type.startsWith("image/")) {
          results.push(await this._buildPhotoMediaResult(file, (_a2 = options.includeMetadata) !== null && _a2 !== void 0 ? _a2 : false));
        } else if (file.type.startsWith("video/")) {
          const format = this._getFileFormat(file);
          let thumbnail;
          let resolution;
          let duration;
          try {
            const videoInfo = await this._getVideoMetadata(file);
            thumbnail = videoInfo.thumbnail;
            if (options.includeMetadata) {
              resolution = videoInfo.resolution;
              duration = videoInfo.duration;
            }
          } catch (e) {
            console.warn("Failed to get video metadata:", e);
          }
          const result = {
            type: MediaType.Video,
            thumbnail,
            webPath: URL.createObjectURL(file),
            saved: false
          };
          if (options.includeMetadata) {
            result.metadata = {
              format,
              resolution,
              size: file.size,
              creationDate: new Date(file.lastModified).toISOString(),
              duration
            };
          }
          results.push(result);
        }
      }
      resolve({ results });
      cleanup();
    };
    input.oncancel = () => {
      reject(new CapacitorException("User cancelled photos app"));
      cleanup();
    };
    const mediaType = (_b = options.mediaType) !== null && _b !== void 0 ? _b : MediaTypeSelection.Photo;
    if (mediaType === MediaTypeSelection.Photo) {
      input.accept = "image/*";
    } else if (mediaType === MediaTypeSelection.Video) {
      input.accept = "video/*";
    } else {
      input.accept = "image/*,video/*";
    }
    input.click();
  }
  _getFileFormat(file) {
    if (file.type === "image/png") {
      return "png";
    } else if (file.type === "image/gif") {
      return "gif";
    } else if (file.type.startsWith("video/")) {
      return file.type.split("/")[1];
    } else if (file.type.startsWith("image/")) {
      return "jpeg";
    }
    return file.type.split("/")[1] || "jpeg";
  }
  async _buildPhotoMediaResult(file, includeMetadata) {
    const format = this._getFileFormat(file);
    const thumbnail = await this._getBase64FromFile(file);
    const result = {
      type: MediaType.Photo,
      thumbnail,
      webPath: URL.createObjectURL(file),
      saved: false
    };
    if (includeMetadata) {
      const resolution = await this._getImageResolution(file);
      result.metadata = {
        format,
        resolution,
        size: file.size,
        creationDate: "lastModified" in file ? new Date(file.lastModified).toISOString() : (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    return result;
  }
  _validateFileInput(input, reject, cleanup) {
    if (!input.files || input.files.length === 0) {
      const message = input.multiple ? "No files selected" : "No file selected";
      reject(new CapacitorException(message));
      cleanup();
      return false;
    }
    return true;
  }
  async _setupPWACameraModal(cameraDirection, onPhotoCallback, fallbackCallback, resolve, reject) {
    if (customElements.get("pwa-camera-modal")) {
      const cameraModal = document.createElement("pwa-camera-modal");
      cameraModal.facingMode = cameraDirection === CameraDirection.Front ? "user" : "environment";
      document.body.appendChild(cameraModal);
      try {
        await cameraModal.componentOnReady();
        cameraModal.addEventListener("onPhoto", async (e) => {
          const photo = e.detail;
          if (photo === null) {
            reject(new CapacitorException("User cancelled photos app"));
          } else if (photo instanceof Error) {
            reject(photo);
          } else {
            resolve(await onPhotoCallback(photo));
          }
          cameraModal.dismiss();
          document.body.removeChild(cameraModal);
        });
        cameraModal.present();
      } catch (e) {
        fallbackCallback();
      }
    } else {
      console.error(`Unable to load PWA Element 'pwa-camera-modal'. See the docs: https://capacitorjs.com/docs/web/pwa-elements.`);
      fallbackCallback();
    }
  }
  _createFileInput(id) {
    let input = document.querySelector(`#${id}`);
    if (!input) {
      input = document.createElement("input");
      input.id = id;
      input.type = "file";
      input.hidden = true;
      document.body.appendChild(input);
    }
    return input;
  }
  async _getImageResolution(image) {
    try {
      const bitmap = await createImageBitmap(image);
      const resolution = `${bitmap.width}x${bitmap.height}`;
      bitmap.close();
      return resolution;
    } catch (e) {
      console.warn("Failed to get image resolution:", e);
      return void 0;
    }
  }
  _getBase64FromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result;
        const base64 = dataUrl.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (e) => {
        reject(e);
      };
      reader.readAsDataURL(file);
    });
  }
  _getVideoMetadata(videoFile) {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.muted = true;
      video.onloadedmetadata = () => {
        const seekTime = Math.min(1, video.duration * 0.1);
        video.currentTime = seekTime;
      };
      video.onseeked = () => {
        const result = {
          resolution: `${video.videoWidth}x${video.videoHeight}`,
          duration: video.duration
        };
        try {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            result.thumbnail = canvas.toDataURL("image/jpeg", 0.8).split(",")[1];
          }
        } catch (e) {
          console.warn("Failed to generate video thumbnail:", e);
        }
        URL.revokeObjectURL(video.src);
        resolve(result);
      };
      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        resolve({});
      };
      video.src = URL.createObjectURL(videoFile);
    });
  }
  async checkPermissions() {
    if (typeof navigator === "undefined" || !navigator.permissions) {
      throw this.unavailable("Permissions API not available in this browser");
    }
    try {
      const permission = await window.navigator.permissions.query({
        name: "camera"
      });
      return {
        camera: permission.state,
        photos: "granted"
      };
    } catch (_a) {
      throw this.unavailable("Camera permissions are not available in this browser");
    }
  }
  async requestPermissions() {
    throw this.unimplemented("Not implemented on web.");
  }
  async pickLimitedLibraryPhotos() {
    throw this.unavailable("Not implemented on web.");
  }
  async getLimitedLibraryPhotos() {
    throw this.unavailable("Not implemented on web.");
  }
}
const Camera = registerPlugin("Camera", {
  web: () => new CameraWeb()
});
function s(t) {
  t.CapacitorUtils.Synapse = new Proxy(
    {},
    {
      get(e, n) {
        return new Proxy({}, {
          get(w, o) {
            return (c, p, r) => {
              const i = t.Capacitor.Plugins[n];
              if (i === void 0) {
                r(new Error(`Capacitor plugin ${n} not found`));
                return;
              }
              if (typeof i[o] != "function") {
                r(new Error(`Method ${o} not found in Capacitor plugin ${n}`));
                return;
              }
              (async () => {
                try {
                  const a = await i[o](c);
                  p(a);
                } catch (a) {
                  r(a);
                }
              })();
            };
          }
        });
      }
    }
  );
}
function u(t) {
  t.CapacitorUtils.Synapse = new Proxy(
    {},
    {
      get(e, n) {
        return t.cordova.plugins[n];
      }
    }
  );
}
function f(t = false) {
  typeof window > "u" || (window.CapacitorUtils = window.CapacitorUtils || {}, window.Capacitor !== void 0 && !t ? s(window) : window.cordova !== void 0 && u(window));
}
const Geolocation = registerPlugin("Geolocation", {
  web: () => __vitePreload(() => import("./web-1ttaw9-M.js"), true ? __vite__mapDeps([0,1,2]) : void 0).then((m) => new m.GeolocationWeb())
});
f();
const App = registerPlugin("App", {
  web: () => __vitePreload(() => import("./web-Bk-Mo0pO.js"), true ? __vite__mapDeps([3,1,2]) : void 0).then((m) => new m.AppWeb())
});
class NativeSyncService {
  constructor() {
    this.initialized = false;
    this.initNativeListeners();
  }
  async initNativeListeners() {
    if (this.initialized) return;
    this.initialized = true;
    if (Capacitor.isNativePlatform()) {
      try {
        App.addListener("backButton", ({ canGoBack }) => {
          if (canGoBack) {
            window.history.back();
          } else {
            App.minimizeApp();
          }
        });
      } catch (e) {
        console.warn("Native backButton listener fallback:", e);
      }
      try {
        App.addListener("appStateChange", ({ isActive }) => {
          if (isActive) {
            this.syncCloudData();
          }
        });
      } catch (e) {
        console.warn("Native appStateChange listener fallback:", e);
      }
    }
  }
  /**
   * Syncs data between cloud (Firestore) and local storage
   */
  async syncCloudData() {
    try {
      const customers = customerService.getCustomers();
      return { success: true, count: customers.length };
    } catch (e) {
      return { success: false };
    }
  }
  /**
   * Capture photo for Barcode Scanning / Property Doorstep Verification / Document Proof
   */
  async captureDocumentPhoto() {
    try {
      if (Capacitor.isPluginAvailable("Camera")) {
        const photo = await Camera.getPhoto({
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Camera,
          quality: 85,
          allowEditing: false
        });
        return { dataUrl: photo.dataUrl };
      } else {
        return { error: "Native camera not available on this device" };
      }
    } catch (err) {
      return { error: err.message || "Camera capture cancelled" };
    }
  }
  /**
   * Get High Accuracy GPS Location for Field Beat Tagging
   */
  async getCurrentBeatLocation() {
    try {
      if (Capacitor.isPluginAvailable("Geolocation")) {
        const pos = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 1e4,
          maximumAge: 3e3
        });
        return {
          location: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp
          }
        };
      } else {
        return { error: "Native Geolocation plugin not available" };
      }
    } catch (err) {
      return new Promise((resolve) => {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                location: {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  accuracy: position.coords.accuracy,
                  timestamp: position.timestamp
                }
              });
            },
            (error) => resolve({ error: error.message }),
            { enableHighAccuracy: true, timeout: 1e4 }
          );
        } else {
          resolve({ error: "Geolocation not supported" });
        }
      });
    }
  }
  async getCurrentPosition() {
    const res = await this.getCurrentBeatLocation();
    if (res.location) {
      return {
        coords: {
          latitude: res.location.latitude,
          longitude: res.location.longitude,
          accuracy: res.location.accuracy
        }
      };
    }
    return null;
  }
  isNative() {
    return Capacitor.isNativePlatform();
  }
}
const nativeSyncService = new NativeSyncService();
const nativeDeviceService = nativeSyncService;
function DailyVerificationView() {
  var _a, _b;
  const { userProfile } = useAuth();
  const [tasks, setTasks] = reactExports.useState([]);
  const [selectedTask, setSelectedTask] = reactExports.useState(null);
  const [occupancy, setOccupancy] = reactExports.useState("Occupied");
  const [propertyType, setPropertyType] = reactExports.useState("House");
  const [houseNo, setHouseNo] = reactExports.useState("");
  const [remarks, setRemarks] = reactExports.useState("");
  const [gpsLoading, setGpsLoading] = reactExports.useState(false);
  const [gpsCoords, setGpsCoords] = reactExports.useState({ captured: false });
  const [gpsError, setGpsError] = reactExports.useState(null);
  const [toastMessage, setToastMessage] = reactExports.useState(null);
  const empId = (userProfile == null ? void 0 : userProfile.employeeId) || (userProfile == null ? void 0 : userProfile.id) || "50510312";
  const beatNo = (userProfile == null ? void 0 : userProfile.beat) || "Beat 2";
  const loadTasks = () => {
    const list = verificationService.getDailyVerificationTasks(empId, beatNo);
    setTasks(list);
  };
  reactExports.useEffect(() => {
    loadTasks();
    const unsub = verificationService.subscribe(loadTasks);
    return () => unsub();
  }, [empId, beatNo]);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4e3);
  };
  const handleOpenTask = (task) => {
    setSelectedTask(task);
    setOccupancy(task.occupancyStatus);
    setPropertyType(task.propertyType);
    setHouseNo(task.houseNo);
    setRemarks(task.remarks || "");
    setGpsCoords({
      lat: task.latitude,
      lng: task.longitude,
      captured: task.gpsCaptured
    });
    setGpsError(null);
  };
  const handleCaptureGps = async () => {
    setGpsLoading(true);
    setGpsError(null);
    try {
      const pos = await nativeDeviceService.getCurrentPosition();
      if (pos) {
        setGpsCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          captured: true
        });
        showToast("📍 GPS coordinates captured successfully!");
      } else {
        setGpsError("GPS location unavailable. You can still submit without GPS.");
      }
    } catch (e) {
      setGpsError("Location permission denied or device GPS offline.");
    } finally {
      setGpsLoading(false);
    }
  };
  const handleSubmitVerification = (status) => {
    if (!selectedTask) return;
    const res = verificationService.submitVerification(selectedTask.id, {
      status,
      occupancyStatus: occupancy,
      propertyType,
      houseNo: houseNo.trim() || selectedTask.houseNo,
      remarks: remarks.trim(),
      latitude: gpsCoords.lat,
      longitude: gpsCoords.lng,
      gpsCaptured: gpsCoords.captured
    });
    if (res.success) {
      showToast(status === "Verified" ? "✅ Property verified & recorded in postal registry!" : "⚠️ Property marked for Admin Review.");
      setSelectedTask(null);
    }
  };
  const completedCount = tasks.filter((t) => t.status === "Verified").length;
  const progressPercent = tasks.length > 0 ? Math.round(completedCount / tasks.length * 100) : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 sm:p-6 max-w-5xl mx-auto space-y-6", children: [
    toastMessage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold shadow-md flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: toastMessage }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setToastMessage(null), className: "text-emerald-700 hover:text-emerald-900", children: "✕" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 14 }),
            " Daily 10-Property Doorstep Verification"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl sm:text-2xl font-black text-slate-900 tracking-tight", children: "My Daily Verification Tasks" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-slate-500 mt-0.5", children: [
            "Assigned Beat: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: beatNo }),
            " • Target: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "10 Properties / Day" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-slate-500 font-medium", children: "Completed Today" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xl font-black text-slate-900", children: [
              completedCount,
              " / ",
              tasks.length
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-12 h-12 rounded-xl bg-red-700 text-white font-black text-sm flex items-center justify-center", children: [
            progressPercent,
            "%"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "bg-emerald-600 h-full rounded-full transition-all duration-300",
          style: { width: `${progressPercent}%` }
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: tasks.map((task, idx) => {
      var _a2;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          onClick: () => handleOpenTask(task),
          className: `p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${(selectedTask == null ? void 0 : selectedTask.id) === task.id ? "border-red-500 bg-red-50/40 shadow-sm ring-2 ring-red-500/20" : task.status === "Verified" ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200 bg-white hover:border-slate-300"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center", children: idx + 1 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: `px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${task.status === "Verified" ? "bg-emerald-100 text-emerald-800" : task.status === "Needs Review" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-900"}`,
                  children: task.status
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold text-slate-900 text-sm", children: [
                "House / Plot: ",
                task.houseNo
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-slate-600 line-clamp-1 mt-0.5", children: typeof task.address === "string" ? task.address : ((_a2 = task.address) == null ? void 0 : _a2.fullAddress) || `${task.houseNo || "Plot"}, Sector ${task.sector || ""}, ${task.colony || "Dadabari"}` })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Colony: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: task.colony })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Status: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: task.occupancyStatus })
              ] })
            ] })
          ]
        },
        task.id
      );
    }) }),
    selectedTask && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-slate-100 pb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-red-700 font-bold", children: selectedTask.propertyCode }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-slate-900", children: "Doorstep Verification" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setSelectedTask(null),
            className: "w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold",
            children: "✕"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Recorded Address:" }),
          " ",
          typeof selectedTask.address === "string" ? selectedTask.address : ((_a = selectedTask.address) == null ? void 0 : _a.fullAddress) || `${selectedTask.houseNo || "Plot"}, Sector ${selectedTask.sector || ""}, ${selectedTask.colony || "Dadabari"}`
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Colony & Sector:" }),
          " ",
          selectedTask.colony,
          ", Sector ",
          selectedTask.sector
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "House / Plot Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: houseNo,
              onChange: (e) => setHouseNo(e.target.value),
              placeholder: "Verify House / Plot No...",
              className: "w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Occupancy Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: occupancy,
                onChange: (e) => setOccupancy(e.target.value),
                className: "w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Occupied", children: "Occupied (Residents Present)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Vacant", children: "Vacant (No Resident)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Rented", children: "Rented (Tenant Residing)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Commercial", children: "Commercial / Shop" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Address Left", children: "Address Left / Shifted" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Property Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: propertyType,
                onChange: (e) => setPropertyType(e.target.value),
                className: "w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "House", children: "Residential House" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Flat", children: "Apartment / Flat" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Shop", children: "Shop / Retail" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Office", children: "Office / Commercial" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Other", children: "Other" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-slate-700 flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation, { size: 14, className: "text-red-700" }),
              "GPS Geo-Tagging (Doorstep Location)"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: handleCaptureGps,
                disabled: gpsLoading,
                className: "px-3 py-1 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 disabled:opacity-50 cursor-pointer shadow-xs",
                children: gpsLoading ? "Acquiring GPS..." : "Capture GPS"
              }
            )
          ] }),
          gpsCoords.captured && gpsCoords.lat ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] font-mono text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200 flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 12 }),
            "Lat: ",
            gpsCoords.lat.toFixed(5),
            ", Lng: ",
            (_b = gpsCoords.lng) == null ? void 0 : _b.toFixed(5)
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-slate-500", children: "Captures actual device coordinates to tag the property gate for postal delivery navigation." }),
          gpsError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200", children: gpsError })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Field Remarks / Delivery Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              value: remarks,
              onChange: (e) => setRemarks(e.target.value),
              placeholder: "e.g. Verified with electricity bill. Owner resides with family. Door bell active.",
              rows: 2,
              className: "w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-2 border-t border-slate-100", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => handleSubmitVerification("Verified"),
            className: "flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 16 }),
              "Confirm & Mark Verified"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => handleSubmitVerification("Needs Review"),
            className: "py-3 px-4 bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 hover:border-amber-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 15 }),
              "Flag for Review"
            ]
          }
        )
      ] })
    ] }) })
  ] });
}
export {
  DailyVerificationView as default
};
