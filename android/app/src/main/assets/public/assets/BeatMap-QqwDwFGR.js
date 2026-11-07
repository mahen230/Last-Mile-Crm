import { c as createLucideIcon, r as reactExports, R as React__default, aQ as React, b as customerService, j as jsxRuntimeExports, Q as Navigation, S as Search, B as Building2, e as MapPin, p as Phone } from "./index-CLJIrWlm.js";
import { r as reactDomExports } from "./index-TMvcVEqD.js";
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  [
    "path",
    {
      d: "m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z",
      key: "9ktpf1"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }]
];
const Compass = createLucideIcon("compass", __iconNode);
const VERSION = "1.10.0";
function __rest(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
    t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
}
function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, [])).next());
  });
}
typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};
const MSG_REPEATED_SET_OPTIONS = (options) => `The setOptions() function should only be called once. The options passed to the additional call (${JSON.stringify(options)}) will be ignored.`;
const MSG_IMPORT_LIBRARY_EXISTS = (options) => `The google.maps.importLibrary() function is already defined, and @googlemaps/js-api-loader will use the existing function instead of overwriting it. The options passed to setOptions (${JSON.stringify(options)}) will be ignored.`;
const MSG_TRUSTED_TYPES_POLICY_FAILED = (policyName, error) => `Failed to create Trusted Types policy "${policyName}": ${error instanceof Error ? error.message : String(error)}.

If your Content Security Policy uses "require-trusted-types-for 'script'", allow this policy with "trusted-types ${policyName} google-maps-api-loader google-maps-api#html lit-html". The "google-maps-api-loader", "lit-html", and "google-maps-api#html" policies are required for full Maps JavaScript API execution. Falling back to a string script URL.`;
const logDevWarning = () => {
};
const logDevNotice = () => {
};
const TRUSTED_TYPES_POLICY_NAME = "@googlemaps/js-api-loader";
const fallbackPolicy = { createScriptURL: (url) => url };
let policy;
function getPolicy() {
  if (policy) {
    return policy;
  }
  const trustedTypes = globalThis.trustedTypes;
  if (!trustedTypes) {
    policy = fallbackPolicy;
    return policy;
  }
  try {
    policy = trustedTypes.createPolicy(TRUSTED_TYPES_POLICY_NAME, {
      createScriptURL: (url) => url
    });
  } catch (e) {
    logDevWarning(MSG_TRUSTED_TYPES_POLICY_FAILED(TRUSTED_TYPES_POLICY_NAME, e));
    policy = fallbackPolicy;
  }
  return policy;
}
function setScriptSrc(script, src) {
  script.src = getPolicy().createScriptURL(src);
}
const bootstrap = (bootstrapParams) => {
  var bootstrapPromise;
  var script;
  var bootstrapParamsKey;
  var PRODUCT_NAME = "The Google Maps JavaScript API";
  var GOOGLE = "google";
  var IMPORT_API_NAME = "importLibrary";
  var PENDING_BOOTSTRAP_KEY = "__ib__";
  var doc = document;
  var global_ = window;
  var google_ = global_[GOOGLE] || (global_[GOOGLE] = {});
  var namespace = google_.maps || (google_.maps = {});
  var libraries = /* @__PURE__ */ new Set();
  var searchParams = new URLSearchParams();
  var triggerBootstrap = () => bootstrapPromise || (bootstrapPromise = new Promise(async (resolve, reject) => {
    var _a;
    await (script = doc.createElement("script"));
    searchParams.set("libraries", [...libraries] + "");
    for (bootstrapParamsKey in bootstrapParams) {
      searchParams.set(bootstrapParamsKey.replace(/[A-Z]/g, (g) => "_" + g[0].toLowerCase()), bootstrapParams[bootstrapParamsKey]);
    }
    searchParams.set("callback", GOOGLE + ".maps." + PENDING_BOOTSTRAP_KEY);
    setScriptSrc(script, "https://maps.googleapis.com/maps/api/js?" + searchParams);
    namespace[PENDING_BOOTSTRAP_KEY] = resolve;
    script.onerror = () => bootstrapPromise = reject(Error(PRODUCT_NAME + " could not load."));
    script.nonce = ((_a = doc.querySelector("script[nonce]")) == null ? void 0 : _a.nonce) || "";
    doc.head.append(script);
  }));
  namespace[IMPORT_API_NAME] ? console.warn(PRODUCT_NAME + " only loads once. Ignoring:", bootstrapParams) : namespace[IMPORT_API_NAME] = (libraryName, ...args) => libraries.add(libraryName) && triggerBootstrap().then(() => namespace[IMPORT_API_NAME](libraryName, ...args));
};
let setOptionsWasCalled_ = false;
function setOptions(options) {
  if (setOptionsWasCalled_) {
    logDevWarning(MSG_REPEATED_SET_OPTIONS(options));
    return;
  }
  if (options.apiKey) {
    if (!options.key) {
      options.key = options.apiKey;
    }
  }
  installImportLibrary_(options);
  setOptionsWasCalled_ = true;
}
async function importLibrary(libraryName) {
  var _a, _b;
  if (!((_b = (_a = window == null ? void 0 : window.google) == null ? void 0 : _a.maps) == null ? void 0 : _b.importLibrary)) {
    throw new Error("google.maps.importLibrary is not installed.");
  }
  return await google.maps.importLibrary(libraryName);
}
function installImportLibrary_(options) {
  var _a, _b;
  const importLibraryExists = Boolean((_b = (_a = window.google) == null ? void 0 : _a.maps) == null ? void 0 : _b.importLibrary);
  if (importLibraryExists) {
    logDevNotice(MSG_IMPORT_LIBRARY_EXISTS(options));
  }
  if (!importLibraryExists) {
    bootstrap(options);
  }
}
const APILoadingStatus = {
  NOT_LOADED: "NOT_LOADED",
  LOADING: "LOADING",
  LOADED: "LOADED",
  FAILED: "FAILED",
  AUTH_FAILURE: "AUTH_FAILURE"
};
const DEFAULT_SOLUTION_CHANNEL = "GMP_visgl_rgmlibrary_v1_default";
const DEFAULT_INTERNAL_USAGE_ATTRIBUTION_IDS = [
  `gmp_visgl_reactgooglemaps_v${VERSION}`
];
const APIProviderContext = React__default.createContext(null);
let loadingStatus = APILoadingStatus.NOT_LOADED;
let serializedApiParams;
const listeners = /* @__PURE__ */ new Set();
function updateLoadingStatus(status) {
  if (status === loadingStatus) {
    return;
  }
  loadingStatus = status;
  listeners.forEach((listener) => listener(loadingStatus));
}
function useMapInstances() {
  const [mapInstances, setMapInstances] = reactExports.useState({});
  const addMapInstance = (mapInstance, id = "default") => {
    setMapInstances((instances) => Object.assign(Object.assign({}, instances), { [id]: mapInstance }));
  };
  const removeMapInstance = (id = "default") => {
    setMapInstances((_a) => {
      var _b = id;
      _a[_b];
      var remaining = __rest(_a, [typeof _b === "symbol" ? _b : _b + ""]);
      return remaining;
    });
  };
  const clearMapInstances = () => {
    setMapInstances({});
  };
  return { mapInstances, addMapInstance, removeMapInstance, clearMapInstances };
}
function useMap3DInstances() {
  const [map3dInstances, setMap3DInstances] = reactExports.useState({});
  const addMap3DInstance = (map3dInstance, id = "default") => {
    setMap3DInstances((instances) => Object.assign(Object.assign({}, instances), { [id]: map3dInstance }));
  };
  const removeMap3DInstance = (id = "default") => {
    setMap3DInstances((_a) => {
      var _b = id;
      _a[_b];
      var remaining = __rest(_a, [typeof _b === "symbol" ? _b : _b + ""]);
      return remaining;
    });
  };
  const clearMap3DInstances = () => {
    setMap3DInstances({});
  };
  return {
    map3dInstances,
    addMap3DInstance,
    removeMap3DInstance,
    clearMap3DInstances
  };
}
function useGoogleMapsApiLoader(props) {
  const { onLoad, onError, apiKey, version, libraries = [], region, language, authReferrerPolicy, channel, solutionChannel, fetchAppCheckToken } = props;
  const [status, setStatus] = reactExports.useState(loadingStatus);
  const [loadedLibraries, addLoadedLibrary] = reactExports.useReducer((loadedLibraries2, action) => {
    return loadedLibraries2[action.name] ? loadedLibraries2 : Object.assign(Object.assign({}, loadedLibraries2), { [action.name]: action.value });
  }, {});
  const currentSerializedParams = reactExports.useMemo(() => {
    const params = {
      apiKey,
      version,
      libraries: libraries.join(","),
      region,
      language,
      authReferrerPolicy,
      channel,
      solutionChannel
    };
    return JSON.stringify(params);
  }, [
    apiKey,
    version,
    libraries,
    region,
    language,
    authReferrerPolicy,
    channel,
    solutionChannel
  ]);
  const importLibraryCallback = reactExports.useCallback((name) => __awaiter(this, void 0, void 0, function* () {
    if (loadedLibraries[name]) {
      return loadedLibraries[name];
    }
    const res = yield importLibrary(name);
    addLoadedLibrary({ name, value: res });
    return res;
  }), [loadedLibraries]);
  reactExports.useEffect(() => {
    listeners.add(setStatus);
    setStatus(loadingStatus);
    return () => {
      listeners.delete(setStatus);
    };
  }, []);
  reactExports.useEffect(
    () => {
      (() => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
          if (serializedApiParams && serializedApiParams !== currentSerializedParams) {
            console.warn(`The Google Maps JavaScript API has already been loaded with different parameters. The new parameters will be ignored. If you need to use different parameters, please refresh the page.`);
          }
          const librariesToLoad = [
            "core",
            "maps",
            ...libraries
          ];
          const options = Object.fromEntries(Object.entries({
            key: apiKey,
            v: version,
            libraries,
            region,
            language,
            authReferrerPolicy
          }).filter(([, value]) => value !== void 0));
          if (channel !== void 0 && channel >= 0 && channel <= 999) {
            options.channel = String(channel);
          }
          if (solutionChannel === void 0) {
            options.solutionChannel = DEFAULT_SOLUTION_CHANNEL;
          } else if (solutionChannel !== "") {
            options.solutionChannel = solutionChannel;
          }
          if ((_b = (_a = window.google) === null || _a === void 0 ? void 0 : _a.maps) === null || _b === void 0 ? void 0 : _b.importLibrary) {
            const shouldUpdateLoadingStatus = !serializedApiParams;
            if (shouldUpdateLoadingStatus) {
              serializedApiParams = currentSerializedParams;
              setOptions(options);
            }
            yield Promise.all(librariesToLoad.map((name) => importLibraryCallback(name)));
            if (shouldUpdateLoadingStatus) {
              updateLoadingStatus(APILoadingStatus.LOADED);
            }
            if (onLoad)
              onLoad();
            return;
          }
          if (loadingStatus === APILoadingStatus.LOADING || loadingStatus === APILoadingStatus.LOADED) {
            if (loadingStatus === APILoadingStatus.LOADED && onLoad)
              onLoad();
            return;
          }
          serializedApiParams = currentSerializedParams;
          updateLoadingStatus(APILoadingStatus.LOADING);
          setOptions(options);
          yield Promise.all(librariesToLoad.map((name) => importLibraryCallback(name)));
          updateLoadingStatus(APILoadingStatus.LOADED);
          if (onLoad) {
            onLoad();
          }
        } catch (error) {
          updateLoadingStatus(APILoadingStatus.FAILED);
          if (onError) {
            onError(error);
          } else {
            console.error("The Google Maps JavaScript API failed to load.", error);
          }
        }
      }))();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentSerializedParams, onLoad, onError, importLibraryCallback, libraries]
  );
  reactExports.useEffect(() => {
    if (status !== APILoadingStatus.LOADED)
      return;
    const settings = google.maps.Settings.getInstance();
    if (fetchAppCheckToken) {
      settings.fetchAppCheckToken = fetchAppCheckToken;
    }
  }, [status, fetchAppCheckToken]);
  return {
    status,
    loadedLibraries,
    importLibrary: importLibraryCallback
  };
}
function useInternalUsageAttributionIds(props) {
  return reactExports.useMemo(() => props.disableUsageAttribution ? null : DEFAULT_INTERNAL_USAGE_ATTRIBUTION_IDS, [props.disableUsageAttribution]);
}
const APIProvider = (props) => {
  const { children } = props, loaderProps = __rest(props, ["children"]);
  const { mapInstances, addMapInstance, removeMapInstance, clearMapInstances } = useMapInstances();
  const { map3dInstances, addMap3DInstance, removeMap3DInstance, clearMap3DInstances } = useMap3DInstances();
  const { status, loadedLibraries, importLibrary: importLibrary2 } = useGoogleMapsApiLoader(loaderProps);
  const internalUsageAttributionIds = useInternalUsageAttributionIds(loaderProps);
  const contextValue = reactExports.useMemo(() => ({
    mapInstances,
    addMapInstance,
    removeMapInstance,
    clearMapInstances,
    map3dInstances,
    addMap3DInstance,
    removeMap3DInstance,
    clearMap3DInstances,
    status,
    loadedLibraries,
    importLibrary: importLibrary2,
    internalUsageAttributionIds
  }), [
    mapInstances,
    addMapInstance,
    removeMapInstance,
    clearMapInstances,
    map3dInstances,
    addMap3DInstance,
    removeMap3DInstance,
    clearMap3DInstances,
    status,
    loadedLibraries,
    importLibrary2,
    internalUsageAttributionIds
  ]);
  return React__default.createElement(APIProviderContext.Provider, { value: contextValue }, children);
};
function useMapEvents(map, props) {
  for (const propName of eventPropNames) {
    const handler = props[propName];
    const eventType = propNameToEventType[propName];
    reactExports.useEffect(() => {
      if (!map)
        return;
      if (!handler)
        return;
      const listener = google.maps.event.addListener(map, eventType, (ev) => {
        const mapEvent = createMapEvent(eventType, map, ev);
        if (mapEvent)
          handler(mapEvent);
      });
      return () => listener.remove();
    }, [map, eventType, handler]);
  }
}
function createMapEvent(type, map, srcEvent) {
  var _a;
  const ev = {
    type,
    map,
    detail: {},
    stoppable: false,
    stop: () => {
    }
  };
  if (cameraEventTypes.includes(type)) {
    const camEvent = ev;
    const center = map.getCenter();
    const zoom = map.getZoom();
    const heading = map.getHeading() || 0;
    const tilt = map.getTilt() || 0;
    const bounds = map.getBounds();
    if (!center || !bounds || !Number.isFinite(zoom)) {
      console.warn("[createEvent] at least one of the values from the map returned undefined. This is not expected to happen. Please report an issue at https://github.com/visgl/react-google-maps/issues/new");
      return null;
    }
    camEvent.detail = {
      center: center.toJSON(),
      zoom,
      heading,
      tilt,
      bounds: bounds.toJSON()
    };
    return camEvent;
  } else if (mouseEventTypes.includes(type)) {
    if (!srcEvent)
      throw new Error("[createEvent] mouse events must provide a srcEvent");
    const mouseEvent = ev;
    mouseEvent.domEvent = srcEvent.domEvent;
    mouseEvent.stoppable = true;
    mouseEvent.stop = () => srcEvent.stop();
    mouseEvent.detail = {
      latLng: ((_a = srcEvent.latLng) === null || _a === void 0 ? void 0 : _a.toJSON()) || null,
      placeId: srcEvent.placeId
    };
    return mouseEvent;
  }
  return ev;
}
const propNameToEventType = {
  onBoundsChanged: "bounds_changed",
  onCenterChanged: "center_changed",
  onClick: "click",
  onContextmenu: "contextmenu",
  onDblclick: "dblclick",
  onDrag: "drag",
  onDragend: "dragend",
  onDragstart: "dragstart",
  onHeadingChanged: "heading_changed",
  onIdle: "idle",
  onIsFractionalZoomEnabledChanged: "isfractionalzoomenabled_changed",
  onMapCapabilitiesChanged: "mapcapabilities_changed",
  onMapTypeIdChanged: "maptypeid_changed",
  onMousemove: "mousemove",
  onMouseout: "mouseout",
  onMouseover: "mouseover",
  onProjectionChanged: "projection_changed",
  onRenderingTypeChanged: "renderingtype_changed",
  onTilesLoaded: "tilesloaded",
  onTiltChanged: "tilt_changed",
  onZoomChanged: "zoom_changed",
  // note: onCameraChanged is an alias for the bounds_changed event,
  // since that is going to be fired in every situation where the camera is
  // updated.
  onCameraChanged: "bounds_changed"
};
const cameraEventTypes = [
  "bounds_changed",
  "center_changed",
  "heading_changed",
  "tilt_changed",
  "zoom_changed"
];
const mouseEventTypes = [
  "click",
  "contextmenu",
  "dblclick",
  "mousemove",
  "mouseout",
  "mouseover"
];
const eventPropNames = Object.keys(propNameToEventType);
function useMemoized(value, isEqual) {
  const ref = reactExports.useRef(value);
  if (!isEqual(value, ref.current)) {
    ref.current = value;
  }
  return ref.current;
}
function useCustomCompareEffect(effect, dependencies, isEqual) {
  reactExports.useEffect(effect, [useMemoized(dependencies, isEqual)]);
}
const { getOwnPropertyNames, getOwnPropertySymbols } = Object;
const { hasOwnProperty } = Object.prototype;
function combineComparators(comparatorA, comparatorB) {
  return function isEqual(a, b, state) {
    return comparatorA(a, b, state) && comparatorB(a, b, state);
  };
}
function createIsCircular(areItemsEqual) {
  return function isCircular(a, b, state) {
    if (!a || !b || typeof a !== "object" || typeof b !== "object") {
      return areItemsEqual(a, b, state);
    }
    const { cache } = state;
    const cachedA = cache.get(a);
    const cachedB = cache.get(b);
    if (cachedA && cachedB) {
      return cachedA === b && cachedB === a;
    }
    cache.set(a, b);
    cache.set(b, a);
    const result = areItemsEqual(a, b, state);
    cache.delete(a);
    cache.delete(b);
    return result;
  };
}
function getStrictProperties(object) {
  const symbols = getOwnPropertySymbols(object);
  return symbols.length ? getOwnPropertyNames(object).concat(symbols) : getOwnPropertyNames(object);
}
const hasOwn$1 = (
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  Object.hasOwn || ((object, property) => hasOwnProperty.call(object, property))
);
const PREACT_VNODE = "__v";
const PREACT_OWNER = "__o";
const REACT_OWNER = "_owner";
const { getOwnPropertyDescriptor, keys } = Object;
const sameValueEqual = (
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  Object.is || function sameValueEqual2(a, b) {
    return a === b ? a !== 0 || 1 / a === 1 / b : a !== a && b !== b;
  }
);
function strictEqual(a, b) {
  return a === b;
}
function areArrayBuffersEqual(a, b) {
  return a.byteLength === b.byteLength && areTypedArraysEqual(new Uint8Array(a), new Uint8Array(b));
}
function areArraysEqual(a, b, state) {
  let index = a.length;
  if (b.length !== index) {
    return false;
  }
  while (index-- > 0) {
    if (!state.equals(a[index], b[index], index, index, a, b, state)) {
      return false;
    }
  }
  return true;
}
function areDataViewsEqual(a, b) {
  return a.byteLength === b.byteLength && areTypedArraysEqual(new Uint8Array(a.buffer, a.byteOffset, a.byteLength), new Uint8Array(b.buffer, b.byteOffset, b.byteLength));
}
function areDatesEqual(a, b) {
  return sameValueEqual(a.getTime(), b.getTime());
}
function areErrorsEqual(a, b) {
  return a.name === b.name && a.message === b.message && a.cause === b.cause && a.stack === b.stack;
}
function areMapsEqual(a, b, state) {
  const size = a.size;
  if (size !== b.size) {
    return false;
  }
  if (!size) {
    return true;
  }
  const matchedIndices = new Uint8Array(size);
  const aIterable = a.entries();
  let aResult;
  let bResult;
  let index = 0;
  while (aResult = aIterable.next()) {
    if (aResult.done) {
      break;
    }
    const bIterable = b.entries();
    let hasMatch = 0;
    let matchIndex = 0;
    while (bResult = bIterable.next()) {
      if (bResult.done) {
        break;
      }
      if (matchedIndices[matchIndex]) {
        matchIndex++;
        continue;
      }
      const aEntry = aResult.value;
      const bEntry = bResult.value;
      if (state.equals(aEntry[0], bEntry[0], index, matchIndex, a, b, state) && state.equals(aEntry[1], bEntry[1], aEntry[0], bEntry[0], a, b, state)) {
        hasMatch = matchedIndices[matchIndex] = 1;
        break;
      }
      matchIndex++;
    }
    if (!hasMatch) {
      return false;
    }
    index++;
  }
  return true;
}
function areObjectsEqual(a, b, state) {
  const properties = keys(a);
  let index = properties.length;
  if (keys(b).length !== index) {
    return false;
  }
  while (index-- > 0) {
    if (!isPropertyEqual(a, b, state, properties[index])) {
      return false;
    }
  }
  return true;
}
function areObjectsEqualStrict(a, b, state) {
  const properties = getStrictProperties(a);
  let index = properties.length;
  if (getStrictProperties(b).length !== index) {
    return false;
  }
  let property;
  let descriptorA;
  let descriptorB;
  while (index-- > 0) {
    property = properties[index];
    if (!isPropertyEqual(a, b, state, property)) {
      return false;
    }
    descriptorA = getOwnPropertyDescriptor(a, property);
    descriptorB = getOwnPropertyDescriptor(b, property);
    if ((descriptorA || descriptorB) && (!descriptorA || !descriptorB || descriptorA.configurable !== descriptorB.configurable || descriptorA.enumerable !== descriptorB.enumerable || descriptorA.writable !== descriptorB.writable)) {
      return false;
    }
  }
  return true;
}
function arePrimitiveWrappersEqual(a, b) {
  return sameValueEqual(a.valueOf(), b.valueOf());
}
function areRegExpsEqual(a, b) {
  return a.source === b.source && a.flags === b.flags;
}
function areSetsEqual(a, b, state) {
  const size = a.size;
  if (size !== b.size) {
    return false;
  }
  if (!size) {
    return true;
  }
  const matchedIndices = new Uint8Array(size);
  const aIterable = a.values();
  let aResult;
  let bResult;
  while (aResult = aIterable.next()) {
    if (aResult.done) {
      break;
    }
    const bIterable = b.values();
    let hasMatch = 0;
    let matchIndex = 0;
    while (bResult = bIterable.next()) {
      if (bResult.done) {
        break;
      }
      if (!matchedIndices[matchIndex] && state.equals(aResult.value, bResult.value, aResult.value, bResult.value, a, b, state)) {
        hasMatch = matchedIndices[matchIndex] = 1;
        break;
      }
      matchIndex++;
    }
    if (!hasMatch) {
      return false;
    }
  }
  return true;
}
function areTypedArraysEqual(a, b) {
  let index = a.length;
  if (b.length !== index || a.byteOffset !== b.byteOffset) {
    return false;
  }
  while (index-- > 0) {
    if (a[index] !== b[index]) {
      return false;
    }
  }
  return true;
}
function areUrlsEqual(a, b) {
  return a.hostname === b.hostname && a.pathname === b.pathname && a.protocol === b.protocol && a.port === b.port && a.hash === b.hash && a.username === b.username && a.password === b.password;
}
function isPropertyEqual(a, b, state, property) {
  if ((property === REACT_OWNER || property === PREACT_OWNER || property === PREACT_VNODE) && (a.$$typeof || b.$$typeof)) {
    return true;
  }
  return hasOwn$1(b, property) && state.equals(a[property], b[property], property, property, a, b, state);
}
const toString = Object.prototype.toString;
function createEqualityComparator(config) {
  const supportedComparatorMap = createSupportedComparatorMap(config);
  const { areArraysEqual: areArraysEqual2, areDatesEqual: areDatesEqual2, areFunctionsEqual, areMapsEqual: areMapsEqual2, areNumbersEqual, areObjectsEqual: areObjectsEqual2, areRegExpsEqual: areRegExpsEqual2, areSetsEqual: areSetsEqual2, getUnsupportedCustomComparator } = config;
  return function comparator(a, b, state) {
    if (a === b) {
      return true;
    }
    if (a == null || b == null) {
      return false;
    }
    const type = typeof a;
    if (type !== typeof b) {
      return false;
    }
    if (type !== "object") {
      if (type === "number" || type === "bigint") {
        return areNumbersEqual(a, b, state);
      }
      if (type === "function") {
        return areFunctionsEqual(a, b, state);
      }
      return false;
    }
    const constructor = a.constructor;
    if (constructor !== b.constructor) {
      return false;
    }
    if (constructor === Object) {
      return areObjectsEqual2(a, b, state);
    }
    if (constructor === Array) {
      return areArraysEqual2(a, b, state);
    }
    if (constructor === Date) {
      return areDatesEqual2(a, b, state);
    }
    if (constructor === RegExp) {
      return areRegExpsEqual2(a, b, state);
    }
    if (constructor === Map) {
      return areMapsEqual2(a, b, state);
    }
    if (constructor === Set) {
      return areSetsEqual2(a, b, state);
    }
    if (constructor === Promise) {
      return false;
    }
    if (Array.isArray(a)) {
      return areArraysEqual2(a, b, state);
    }
    const tag = toString.call(a);
    const supportedComparator = supportedComparatorMap[tag];
    if (supportedComparator) {
      return supportedComparator(a, b, state);
    }
    const unsupportedCustomComparator = getUnsupportedCustomComparator && getUnsupportedCustomComparator(a, b, state, tag);
    if (unsupportedCustomComparator) {
      return unsupportedCustomComparator(a, b, state);
    }
    return false;
  };
}
function createEqualityComparatorConfig({ circular, createCustomConfig, strict }) {
  let config = {
    areArrayBuffersEqual,
    areArraysEqual: strict ? areObjectsEqualStrict : areArraysEqual,
    areDataViewsEqual,
    areDatesEqual,
    areErrorsEqual,
    areFunctionsEqual: strictEqual,
    areMapsEqual: strict ? combineComparators(areMapsEqual, areObjectsEqualStrict) : areMapsEqual,
    areNumbersEqual: sameValueEqual,
    areObjectsEqual: strict ? areObjectsEqualStrict : areObjectsEqual,
    arePrimitiveWrappersEqual,
    areRegExpsEqual,
    areSetsEqual: strict ? combineComparators(areSetsEqual, areObjectsEqualStrict) : areSetsEqual,
    areTypedArraysEqual: strict ? combineComparators(areTypedArraysEqual, areObjectsEqualStrict) : areTypedArraysEqual,
    areUrlsEqual,
    getUnsupportedCustomComparator: void 0
  };
  if (createCustomConfig) {
    config = Object.assign({}, config, createCustomConfig(config));
  }
  if (circular) {
    const areArraysEqual2 = createIsCircular(config.areArraysEqual);
    const areMapsEqual2 = createIsCircular(config.areMapsEqual);
    const areObjectsEqual2 = createIsCircular(config.areObjectsEqual);
    const areSetsEqual2 = createIsCircular(config.areSetsEqual);
    config = Object.assign({}, config, {
      areArraysEqual: areArraysEqual2,
      areMapsEqual: areMapsEqual2,
      areObjectsEqual: areObjectsEqual2,
      areSetsEqual: areSetsEqual2
    });
  }
  return config;
}
function createInternalEqualityComparator(compare) {
  return function(a, b, _indexOrKeyA, _indexOrKeyB, _parentA, _parentB, state) {
    return compare(a, b, state);
  };
}
function createIsEqual({ circular, comparator, createState, equals, strict }) {
  if (createState) {
    return function isEqual(a, b) {
      const { cache = circular ? /* @__PURE__ */ new WeakMap() : void 0, meta } = createState();
      return comparator(a, b, {
        cache,
        equals,
        meta,
        strict
      });
    };
  }
  if (circular) {
    return function isEqual(a, b) {
      return comparator(a, b, {
        cache: /* @__PURE__ */ new WeakMap(),
        equals,
        meta: void 0,
        strict
      });
    };
  }
  const state = {
    cache: void 0,
    equals,
    meta: void 0,
    strict
  };
  return function isEqual(a, b) {
    return comparator(a, b, state);
  };
}
function createSupportedComparatorMap({ areArrayBuffersEqual: areArrayBuffersEqual2, areArraysEqual: areArraysEqual2, areDataViewsEqual: areDataViewsEqual2, areDatesEqual: areDatesEqual2, areErrorsEqual: areErrorsEqual2, areFunctionsEqual, areMapsEqual: areMapsEqual2, areNumbersEqual, areObjectsEqual: areObjectsEqual2, arePrimitiveWrappersEqual: arePrimitiveWrappersEqual2, areRegExpsEqual: areRegExpsEqual2, areSetsEqual: areSetsEqual2, areTypedArraysEqual: areTypedArraysEqual2, areUrlsEqual: areUrlsEqual2 }) {
  return {
    "[object Arguments]": areObjectsEqual2,
    "[object Array]": areArraysEqual2,
    "[object ArrayBuffer]": areArrayBuffersEqual2,
    "[object AsyncGeneratorFunction]": areFunctionsEqual,
    "[object BigInt]": areNumbersEqual,
    "[object BigInt64Array]": areTypedArraysEqual2,
    "[object BigUint64Array]": areTypedArraysEqual2,
    "[object Boolean]": arePrimitiveWrappersEqual2,
    "[object DataView]": areDataViewsEqual2,
    "[object Date]": areDatesEqual2,
    // If an error tag, it should be tested explicitly. Like RegExp, the properties are not
    // enumerable, and therefore will give false positives if tested like a standard object.
    "[object Error]": areErrorsEqual2,
    "[object Float16Array]": areTypedArraysEqual2,
    "[object Float32Array]": areTypedArraysEqual2,
    "[object Float64Array]": areTypedArraysEqual2,
    "[object Function]": areFunctionsEqual,
    "[object GeneratorFunction]": areFunctionsEqual,
    "[object Int8Array]": areTypedArraysEqual2,
    "[object Int16Array]": areTypedArraysEqual2,
    "[object Int32Array]": areTypedArraysEqual2,
    "[object Map]": areMapsEqual2,
    "[object Number]": arePrimitiveWrappersEqual2,
    "[object Object]": (a, b, state) => (
      // The exception for value comparison is custom `Promise`-like class instances. These should
      // be treated the same as standard `Promise` objects, which means strict equality, and if
      // it reaches this point then that strict equality comparison has already failed.
      typeof a.then !== "function" && typeof b.then !== "function" && areObjectsEqual2(a, b, state)
    ),
    // For RegExp, the properties are not enumerable, and therefore will give false positives if
    // tested like a standard object.
    "[object RegExp]": areRegExpsEqual2,
    "[object Set]": areSetsEqual2,
    "[object String]": arePrimitiveWrappersEqual2,
    "[object URL]": areUrlsEqual2,
    "[object Uint8Array]": areTypedArraysEqual2,
    "[object Uint8ClampedArray]": areTypedArraysEqual2,
    "[object Uint16Array]": areTypedArraysEqual2,
    "[object Uint32Array]": areTypedArraysEqual2
  };
}
const deepEqual = createCustomEqual();
createCustomEqual({ strict: true });
createCustomEqual({ circular: true });
createCustomEqual({
  circular: true,
  strict: true
});
createCustomEqual({
  createInternalComparator: () => sameValueEqual
});
createCustomEqual({
  strict: true,
  createInternalComparator: () => sameValueEqual
});
createCustomEqual({
  circular: true,
  createInternalComparator: () => sameValueEqual
});
createCustomEqual({
  circular: true,
  createInternalComparator: () => sameValueEqual,
  strict: true
});
function createCustomEqual(options = {}) {
  const { circular = false, createInternalComparator: createCustomInternalComparator, createState, strict = false } = options;
  const config = createEqualityComparatorConfig(options);
  const comparator = createEqualityComparator(config);
  const equals = createCustomInternalComparator ? createCustomInternalComparator(comparator) : createInternalEqualityComparator(comparator);
  return createIsEqual({ circular, comparator, createState, equals, strict });
}
function useDeepCompareEffect(effect, dependencies) {
  useCustomCompareEffect(effect, dependencies, deepEqual);
}
const mapOptionKeys = /* @__PURE__ */ new Set([
  "backgroundColor",
  "clickableIcons",
  "controlSize",
  "disableDefaultUI",
  "disableDoubleClickZoom",
  "draggable",
  "draggableCursor",
  "draggingCursor",
  "fullscreenControl",
  "fullscreenControlOptions",
  "gestureHandling",
  "headingInteractionEnabled",
  "isFractionalZoomEnabled",
  "keyboardShortcuts",
  "mapTypeControl",
  "mapTypeControlOptions",
  "mapTypeId",
  "maxZoom",
  "minZoom",
  "noClear",
  "panControl",
  "panControlOptions",
  "restriction",
  "rotateControl",
  "rotateControlOptions",
  "scaleControl",
  "scaleControlOptions",
  "scrollwheel",
  "streetView",
  "streetViewControl",
  "streetViewControlOptions",
  "styles",
  "tiltInteractionEnabled",
  "zoomControl",
  "zoomControlOptions"
]);
function useMapOptions(map, mapProps) {
  const mapOptions = {};
  const keys2 = Object.keys(mapProps);
  for (const key of keys2) {
    if (!mapOptionKeys.has(key))
      continue;
    mapOptions[key] = mapProps[key];
  }
  useDeepCompareEffect(() => {
    if (!map)
      return;
    map.setOptions(mapOptions);
  }, [mapOptions]);
}
function useApiLoadingStatus() {
  var _a;
  return ((_a = reactExports.useContext(APIProviderContext)) === null || _a === void 0 ? void 0 : _a.status) || APILoadingStatus.NOT_LOADED;
}
function useDeckGLCameraUpdate(map, props) {
  const { viewport, viewState } = props;
  const isDeckGlControlled = !!viewport;
  reactExports.useLayoutEffect(() => {
    if (!map || !viewState)
      return;
    const { latitude, longitude, bearing: heading, pitch: tilt, zoom } = viewState;
    map.moveCamera({
      center: { lat: latitude, lng: longitude },
      heading,
      tilt,
      zoom: zoom + 1
    });
  }, [map, viewState]);
  return isDeckGlControlled;
}
function isLatLngLiteral(obj) {
  if (!obj || typeof obj !== "object")
    return false;
  if (!("lat" in obj && "lng" in obj))
    return false;
  return Number.isFinite(obj.lat) && Number.isFinite(obj.lng);
}
function latLngEquals(a, b) {
  if (!a || !b)
    return false;
  const A = toLatLngLiteral(a);
  const B = toLatLngLiteral(b);
  if (A.lat !== B.lat || A.lng !== B.lng)
    return false;
  return true;
}
function toLatLngLiteral(obj) {
  if (isLatLngLiteral(obj))
    return obj;
  return obj.toJSON();
}
function toLatLngBoundsLiteral(obj) {
  if ("north" in obj && "south" in obj && "east" in obj && "west" in obj) {
    return obj;
  }
  const ne = obj.getNorthEast().toJSON();
  const sw = obj.getSouthWest().toJSON();
  return {
    north: ne.lat,
    east: ne.lng,
    south: sw.lat,
    west: sw.lng
  };
}
function boundsEquals(a, b) {
  if (!a || !b)
    return false;
  const A = toLatLngBoundsLiteral(a);
  const B = toLatLngBoundsLiteral(b);
  return A.north === B.north && A.south === B.south && A.east === B.east && A.west === B.west;
}
function pathEquals(a, b) {
  if (!a || !b)
    return a === b;
  const arrayB = "getArray" in b ? b.getArray() : b;
  if (a.length !== arrayB.length)
    return false;
  for (let i = 0; i < a.length; i++) {
    if (!latLngEquals(a[i], arrayB[i]))
      return false;
  }
  return true;
}
function pathsEquals(a, b) {
  if (!a || !b)
    return a === b;
  const arrayB = "getArray" in b ? b.getArray().map((inner) => inner.getArray()) : b;
  if (a.length !== arrayB.length)
    return false;
  for (let i = 0; i < a.length; i++) {
    if (!pathEquals(a[i], arrayB[i]))
      return false;
  }
  return true;
}
function useMapCameraParams(map, cameraStateRef, mapProps) {
  const center = mapProps.center ? toLatLngLiteral(mapProps.center) : null;
  let lat = null;
  let lng = null;
  if (center && Number.isFinite(center.lat) && Number.isFinite(center.lng)) {
    lat = center.lat;
    lng = center.lng;
  }
  const zoom = Number.isFinite(mapProps.zoom) ? mapProps.zoom : null;
  const heading = Number.isFinite(mapProps.heading) ? mapProps.heading : null;
  const tilt = Number.isFinite(mapProps.tilt) ? mapProps.tilt : null;
  reactExports.useLayoutEffect(() => {
    if (!map)
      return;
    const nextCamera = {};
    let needsUpdate = false;
    if (lat !== null && lng !== null && (cameraStateRef.current.center.lat !== lat || cameraStateRef.current.center.lng !== lng)) {
      nextCamera.center = { lat, lng };
      needsUpdate = true;
    }
    if (zoom !== null && cameraStateRef.current.zoom !== zoom) {
      nextCamera.zoom = zoom;
      needsUpdate = true;
    }
    if (heading !== null && cameraStateRef.current.heading !== heading) {
      nextCamera.heading = heading;
      needsUpdate = true;
    }
    if (tilt !== null && cameraStateRef.current.tilt !== tilt) {
      nextCamera.tilt = tilt;
      needsUpdate = true;
    }
    if (needsUpdate) {
      map.moveCamera(nextCamera);
    }
  });
}
const AuthFailureMessage = () => {
  const style = {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 999,
    display: "flex",
    flexFlow: "column nowrap",
    textAlign: "center",
    justifyContent: "center",
    fontSize: ".8rem",
    color: "rgba(0,0,0,0.6)",
    background: "#dddddd",
    padding: "1rem 1.5rem"
  };
  return React__default.createElement(
    "div",
    { style },
    React__default.createElement("h2", null, "Error: AuthFailure"),
    React__default.createElement(
      "p",
      null,
      "A problem with your API key prevents the map from rendering correctly. Please make sure the value of the ",
      React__default.createElement("code", null, "APIProvider.apiKey"),
      " prop is correct. Check the error-message in the console for further details."
    )
  );
};
function useCallbackRef() {
  const [el, setEl] = reactExports.useState(null);
  const ref = reactExports.useCallback((value) => setEl(value), [setEl]);
  return [el, ref];
}
function useApiIsLoaded() {
  const status = useApiLoadingStatus();
  return status === APILoadingStatus.LOADED;
}
function useForceUpdate() {
  const [, forceUpdate] = reactExports.useReducer((x) => x + 1, 0);
  return forceUpdate;
}
function handleBoundsChange(map, ref) {
  const center = map.getCenter();
  const zoom = map.getZoom();
  const heading = map.getHeading() || 0;
  const tilt = map.getTilt() || 0;
  if (!center || !Number.isFinite(zoom)) {
    console.warn("[useTrackedCameraState] at least one of the values from the map returned undefined. This is not expected to happen. Please report an issue at https://github.com/visgl/react-google-maps/issues/new");
    return;
  }
  Object.assign(ref.current, {
    center: center.toJSON(),
    zoom,
    heading,
    tilt
  });
}
function useTrackedCameraStateRef(map) {
  const forceUpdate = useForceUpdate();
  const ref = reactExports.useRef({
    center: { lat: 0, lng: 0 },
    heading: 0,
    tilt: 0,
    zoom: 0
  });
  reactExports.useEffect(() => {
    if (!map)
      return;
    const listener = google.maps.event.addListener(map, "bounds_changed", () => {
      handleBoundsChange(map, ref);
      forceUpdate();
    });
    return () => listener.remove();
  }, [map, forceUpdate]);
  return ref;
}
class CachedMapStack {
  static has(key) {
    return this.entries[key] && this.entries[key].length > 0;
  }
  static pop(key) {
    if (!this.entries[key])
      return null;
    return this.entries[key].pop() || null;
  }
  static push(key, value) {
    if (!this.entries[key])
      this.entries[key] = [];
    this.entries[key].push(value);
  }
}
CachedMapStack.entries = {};
function useMapInstance(props, context) {
  const apiIsLoaded = useApiIsLoaded();
  const [map, setMap] = reactExports.useState(null);
  const [container, containerRef] = useCallbackRef();
  const cameraStateRef = useTrackedCameraStateRef(map);
  const { id, defaultBounds, defaultCenter, defaultZoom, defaultHeading, defaultTilt, reuseMaps, renderingType, colorScheme } = props, mapOptions = __rest(props, ["id", "defaultBounds", "defaultCenter", "defaultZoom", "defaultHeading", "defaultTilt", "reuseMaps", "renderingType", "colorScheme"]);
  const hasZoom = props.zoom !== void 0 || props.defaultZoom !== void 0;
  const hasCenter = props.center !== void 0 || props.defaultCenter !== void 0;
  if (!defaultBounds && (!hasZoom || !hasCenter)) {
    console.warn("<Map> component is missing configuration. You have to provide zoom and center (via the `zoom`/`defaultZoom` and `center`/`defaultCenter` props) or specify the region to show using `defaultBounds`. See https://visgl.github.io/react-google-maps/docs/api-reference/components/map#required");
  }
  if (!mapOptions.center && defaultCenter)
    mapOptions.center = defaultCenter;
  if (!mapOptions.zoom && Number.isFinite(defaultZoom))
    mapOptions.zoom = defaultZoom;
  if (!mapOptions.heading && Number.isFinite(defaultHeading))
    mapOptions.heading = defaultHeading;
  if (!mapOptions.tilt && Number.isFinite(defaultTilt))
    mapOptions.tilt = defaultTilt;
  const customIds = mapOptions.internalUsageAttributionIds;
  if (customIds == null) {
    mapOptions.internalUsageAttributionIds = context.internalUsageAttributionIds;
  } else {
    mapOptions.internalUsageAttributionIds = [
      ...context.internalUsageAttributionIds || [],
      ...customIds
    ];
  }
  for (const key of Object.keys(mapOptions))
    if (mapOptions[key] === void 0)
      delete mapOptions[key];
  const savedMapStateRef = reactExports.useRef(void 0);
  const reuseMapsRef = reactExports.useRef(reuseMaps);
  reactExports.useEffect(() => {
    reuseMapsRef.current = reuseMaps;
  }, [reuseMaps]);
  reactExports.useEffect(
    () => {
      if (!container || !apiIsLoaded)
        return;
      const { addMapInstance, removeMapInstance } = context;
      const { mapId } = props;
      const cacheKey = `${mapId || "default"}:${renderingType || "default"}:${colorScheme || "LIGHT"}`;
      let mapDiv;
      let map2;
      const cachedMap = reuseMapsRef.current && CachedMapStack.has(cacheKey) ? CachedMapStack.pop(cacheKey) : null;
      const cachedMapDiv = cachedMap === null || cachedMap === void 0 ? void 0 : cachedMap.getDiv();
      const reusedMap = cachedMap && cachedMapDiv instanceof Node ? cachedMap : null;
      if (reusedMap) {
        map2 = reusedMap;
        mapDiv = cachedMapDiv;
        container.appendChild(mapDiv);
        map2.setOptions(mapOptions);
        setTimeout(() => map2.moveCamera({}), 0);
      } else {
        if (cachedMap)
          google.maps.event.clearInstanceListeners(cachedMap);
        mapDiv = document.createElement("div");
        mapDiv.style.height = "100%";
        container.appendChild(mapDiv);
        map2 = new google.maps.Map(mapDiv, Object.assign(Object.assign(Object.assign({}, mapOptions), renderingType ? { renderingType } : {}), colorScheme ? { colorScheme } : {}));
      }
      setMap(map2);
      addMapInstance(map2, id);
      if (defaultBounds) {
        const { padding } = defaultBounds, defBounds = __rest(defaultBounds, ["padding"]);
        map2.fitBounds(defBounds, padding);
      } else if (!hasZoom || !hasCenter) {
        map2.fitBounds({ east: 180, west: -180, south: -90, north: 90 });
      }
      if (savedMapStateRef.current) {
        const { mapId: savedMapId, cameraState: savedCameraState } = savedMapStateRef.current;
        if (savedMapId !== mapId) {
          map2.moveCamera(savedCameraState);
        }
      }
      return () => {
        savedMapStateRef.current = {
          mapId,
          // eslint-disable-next-line react-hooks/exhaustive-deps
          cameraState: cameraStateRef.current
        };
        mapDiv.remove();
        if (reuseMapsRef.current) {
          CachedMapStack.push(cacheKey, map2);
        } else {
          google.maps.event.clearInstanceListeners(map2);
        }
        setMap(null);
        removeMapInstance(id);
      };
    },
    // some dependencies are ignored in the list below:
    //  - defaultBounds and the default* camera props will only be used once, and
    //    changes should be ignored
    //  - mapOptions has special hooks that take care of updating the options
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      container,
      apiIsLoaded,
      id,
      // these props can't be changed after initialization and require a new
      // instance to be created
      props.mapId,
      props.renderingType,
      props.colorScheme
    ]
  );
  return [map, containerRef, cameraStateRef];
}
const GoogleMapsContext = React__default.createContext(null);
const Map$1 = (props) => {
  const { children, id, className, style } = props;
  const context = reactExports.useContext(APIProviderContext);
  const loadingStatus2 = useApiLoadingStatus();
  if (!context) {
    throw new Error("<Map> can only be used inside an <ApiProvider> component.");
  }
  const [map, mapRef, cameraStateRef] = useMapInstance(props, context);
  useMapCameraParams(map, cameraStateRef, props);
  useMapEvents(map, props);
  useMapOptions(map, props);
  const isDeckGlControlled = useDeckGLCameraUpdate(map, props);
  const isControlledExternally = !!props.controlled;
  reactExports.useEffect(() => {
    if (!map)
      return;
    if (isDeckGlControlled) {
      map.setOptions({ disableDefaultUI: true });
    }
    if (isDeckGlControlled || isControlledExternally) {
      map.setOptions({
        gestureHandling: "none",
        keyboardShortcuts: false
      });
    }
    return () => {
      map.setOptions({
        gestureHandling: props.gestureHandling,
        keyboardShortcuts: props.keyboardShortcuts
      });
    };
  }, [
    map,
    isDeckGlControlled,
    isControlledExternally,
    props.gestureHandling,
    props.keyboardShortcuts
  ]);
  const center = props.center ? toLatLngLiteral(props.center) : null;
  let lat = null;
  let lng = null;
  if (center && Number.isFinite(center.lat) && Number.isFinite(center.lng)) {
    lat = center.lat;
    lng = center.lng;
  }
  const cameraOptions = reactExports.useMemo(() => {
    var _a, _b, _c;
    return {
      center: { lat: lat !== null && lat !== void 0 ? lat : 0, lng: lng !== null && lng !== void 0 ? lng : 0 },
      zoom: (_a = props.zoom) !== null && _a !== void 0 ? _a : 0,
      heading: (_b = props.heading) !== null && _b !== void 0 ? _b : 0,
      tilt: (_c = props.tilt) !== null && _c !== void 0 ? _c : 0
    };
  }, [lat, lng, props.zoom, props.heading, props.tilt]);
  reactExports.useLayoutEffect(() => {
    if (!map || !isControlledExternally)
      return;
    map.moveCamera(cameraOptions);
    const listener = map.addListener("bounds_changed", () => {
      map.moveCamera(cameraOptions);
    });
    return () => listener.remove();
  }, [map, isControlledExternally, cameraOptions]);
  const combinedStyle = reactExports.useMemo(() => Object.assign({
    width: "100%",
    height: "100%",
    position: "relative",
    // when using deckgl, the map should be sent to the back
    zIndex: isDeckGlControlled ? -1 : 0
  }, style), [style, isDeckGlControlled]);
  const contextValue = reactExports.useMemo(() => ({ map }), [map]);
  if (loadingStatus2 === APILoadingStatus.AUTH_FAILURE) {
    return React__default.createElement(
      "div",
      { style: Object.assign({ position: "relative" }, className ? {} : combinedStyle), className },
      React__default.createElement(AuthFailureMessage, null)
    );
  }
  return React__default.createElement("div", Object.assign({ ref: mapRef, "data-testid": "map", style: className ? void 0 : combinedStyle, className }, id ? { id } : {}), map ? React__default.createElement(GoogleMapsContext.Provider, { value: contextValue }, children) : null);
};
Map$1.deckGLViewProps = true;
const shownMessages = /* @__PURE__ */ new Set();
function logErrorOnce(...args) {
  const key = JSON.stringify(args);
  if (!shownMessages.has(key)) {
    shownMessages.add(key);
    console.error(...args);
  }
}
const useMap = (id = null) => {
  const ctx = reactExports.useContext(APIProviderContext);
  const { map } = reactExports.useContext(GoogleMapsContext) || {};
  if (ctx === null) {
    logErrorOnce("useMap(): failed to retrieve APIProviderContext. Make sure that the <APIProvider> component exists and that the component you are calling `useMap()` from is a sibling of the <APIProvider>.");
    return null;
  }
  const { mapInstances } = ctx;
  if (id !== null)
    return mapInstances[id] || null;
  if (map)
    return map;
  return mapInstances["default"] || null;
};
function useMapsLibrary(name) {
  var _a;
  const apiIsLoaded = useApiIsLoaded();
  const ctx = reactExports.useContext(APIProviderContext);
  reactExports.useEffect(() => {
    if (!apiIsLoaded || !ctx)
      return;
    void ctx.importLibrary(name);
  }, [apiIsLoaded, ctx, name]);
  return (_a = ctx === null || ctx === void 0 ? void 0 : ctx.loadedLibraries[name]) !== null && _a !== void 0 ? _a : null;
}
const SafeReact = Object.assign({}, React);
const useInsertionEffect = SafeReact.useInsertionEffect;
const useSafeInsertionEffect = (
  // React 17 doesn't have useInsertionEffect.
  useInsertionEffect && // Preact replaces useInsertionEffect with useLayoutEffect and fires too late.
  useInsertionEffect !== SafeReact.useLayoutEffect ? useInsertionEffect : (fn) => {
    fn();
  }
);
function forbiddenInRender() {
  throw new Error("useEffectEvent: invalid call during rendering.");
}
function useEffectEventPolyfill(fn) {
  const ref = reactExports.useRef(forbiddenInRender);
  useSafeInsertionEffect(() => {
    ref.current = fn;
  }, [fn]);
  return ((...args) => ref.current(...args));
}
const useEffectEvent = useEffectEventPolyfill;
const noop$1 = () => {
};
function useMapsEventListener(target, name, callback) {
  const eventFn = useEffectEvent(callback !== null && callback !== void 0 ? callback : noop$1);
  const isCallbackDefined = Boolean(callback);
  reactExports.useEffect(() => {
    if (!target || !name || !isCallbackDefined)
      return;
    const listener = google.maps.event.addListener(target, name, eventFn);
    return () => listener.remove();
  }, [target, name, isCallbackDefined]);
}
function usePropBinding(object, prop, value) {
  reactExports.useEffect(() => {
    if (!object)
      return;
    object[prop] = value;
  }, [object, prop, value]);
}
const noop = () => {
};
function useDomEventListener(target, name, callback) {
  const eventFn = useEffectEvent(callback !== null && callback !== void 0 ? callback : noop);
  const isCallbackDefined = Boolean(callback);
  reactExports.useEffect(() => {
    if (!target || !name || !isCallbackDefined)
      return;
    const listenerCallback = eventFn;
    target.addEventListener(name, listenerCallback);
    return () => target.removeEventListener(name, listenerCallback);
  }, [target, name, isCallbackDefined]);
}
class GlobalStyleManager {
  constructor() {
    this.renderedStyles = /* @__PURE__ */ new Set();
    this.styleElement = null;
  }
  getStyleElement() {
    if (!this.styleElement) {
      this.styleElement = document.createElement("style");
      this.styleElement.setAttribute("data-rgm-anchor-styles", "");
      document.head.appendChild(this.styleElement);
    }
    return this.styleElement;
  }
  addAdvancedMarkerPointerEventsOverwrite() {
    if (this.renderedStyles.has("marker-pointer-events")) {
      return;
    }
    const styleElement = this.getStyleElement();
    styleElement.textContent += `
      gmp-advanced-marker[data-origin='rgm'] {
        pointer-events: none !important;
      }
    `;
    this.renderedStyles.add("marker-pointer-events");
  }
  cleanup() {
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
      this.renderedStyles.clear();
    }
  }
}
const globalStyleManager = new GlobalStyleManager();
function isVersionGreaterEqual(major, minor) {
  var _a;
  if (!((_a = google === null || google === void 0 ? void 0 : google.maps) === null || _a === void 0 ? void 0 : _a.version))
    return void 0;
  const version = google.maps.version.split(".");
  const currentMajor = parseInt(version[0], 10);
  const currentMinor = parseInt(version[1], 10);
  return currentMajor > major || currentMajor === major && currentMinor >= minor;
}
const AdvancedMarkerContext = React__default.createContext(null);
const AdvancedMarkerAnchorPoint = {
  BOTTOM: ["50%", "100%"]
};
const AdvancedMarker = reactExports.forwardRef((props, ref) => {
  const { children, style, className, anchorPoint } = props;
  const [marker, contentContainer] = useAdvancedMarker(props);
  const advancedMarkerContextValue = reactExports.useMemo(() => marker ? { marker } : null, [marker]);
  reactExports.useImperativeHandle(ref, () => marker, [marker]);
  if (!contentContainer)
    return null;
  return React__default.createElement(AdvancedMarkerContext.Provider, { value: advancedMarkerContextValue }, reactDomExports.createPortal(React__default.createElement(MarkerContent, { anchorPoint, styles: style, className }, children), contentContainer));
});
AdvancedMarker.displayName = "AdvancedMarker";
function isElementNode(node) {
  return node.nodeType === Node.ELEMENT_NODE;
}
const MarkerContent = ({ children, styles, className }) => {
  return React__default.createElement("div", { className, style: styles }, children);
};
function useAdvancedMarker(props) {
  const [marker, setMarker] = reactExports.useState(null);
  const [contentContainer, setContentContainer] = reactExports.useState(null);
  const map = useMap();
  const markerLibrary = useMapsLibrary("marker");
  const { children, onClick, onKeyDown, onKeyUp, className, onMouseEnter, onMouseLeave, onDrag, onDragStart, onDragEnd, collisionBehavior, clickable, draggable, position, title, zIndex, anchorPoint, anchorLeft, anchorTop } = props;
  const numChildren = reactExports.Children.count(children);
  reactExports.useEffect(() => {
    if (!map || !markerLibrary)
      return;
    const newMarker = new markerLibrary.AdvancedMarkerElement();
    newMarker.map = map;
    setMarker(newMarker);
    let contentElement = null;
    if (numChildren > 0) {
      contentElement = document.createElement("div");
      newMarker.content = contentElement;
      setContentContainer(contentElement);
    }
    return () => {
      newMarker.map = null;
      contentElement === null || contentElement === void 0 ? void 0 : contentElement.remove();
      setMarker(null);
      setContentContainer(null);
    };
  }, [map, markerLibrary, numChildren]);
  reactExports.useEffect(() => {
    if (!(marker === null || marker === void 0 ? void 0 : marker.content) || !isElementNode(marker.content) || numChildren > 0)
      return;
    marker.content.className = className !== null && className !== void 0 ? className : "";
  }, [marker, className, numChildren]);
  useAdvancedMarkerAnchoring(marker, anchorPoint, anchorLeft, anchorTop, numChildren > 0);
  usePropBinding(marker, "position", position);
  usePropBinding(marker, "title", title !== null && title !== void 0 ? title : "");
  usePropBinding(marker, "zIndex", zIndex);
  usePropBinding(marker, "collisionBehavior", collisionBehavior);
  reactExports.useEffect(() => {
    if (!marker)
      return;
    if (draggable !== void 0)
      marker.gmpDraggable = draggable;
    else if (onDrag || onDragStart || onDragEnd)
      marker.gmpDraggable = true;
    else
      marker.gmpDraggable = false;
  }, [marker, draggable, onDrag, onDragEnd, onDragStart]);
  reactExports.useEffect(() => {
    if (!marker)
      return;
    const gmpClickable = clickable !== void 0 ? clickable : Boolean(onClick) || Boolean(onKeyDown) || Boolean(onKeyUp) || Boolean(onMouseEnter) || Boolean(onMouseLeave);
    marker.gmpClickable = gmpClickable;
    if ((marker === null || marker === void 0 ? void 0 : marker.content) && isElementNode(marker.content)) {
      marker.content.style.pointerEvents = gmpClickable ? "all" : "none";
      marker.content.style.cursor = gmpClickable && onClick ? "pointer" : "";
    }
  }, [
    marker,
    clickable,
    onClick,
    onKeyDown,
    onKeyUp,
    onMouseEnter,
    onMouseLeave
  ]);
  useMapsEventListener(marker, "drag", onDrag);
  useMapsEventListener(marker, "dragstart", onDragStart);
  useMapsEventListener(marker, "dragend", onDragEnd);
  useDomEventListener(marker, "gmp-click", onClick);
  useDomEventListener(marker, "keydown", onKeyDown);
  useDomEventListener(marker, "keyup", onKeyUp);
  useDomEventListener(marker, "mouseenter", onMouseEnter);
  useDomEventListener(marker, "mouseleave", onMouseLeave);
  return [marker, contentContainer];
}
function useAdvancedMarkerAnchoring(marker, anchorPoint, anchorLeft, anchorTop, hasChildren) {
  reactExports.useEffect(() => {
    if (!marker || !hasChildren)
      return;
    const anchorOptionsSupported = isVersionGreaterEqual(3, 62);
    const contentElement = marker.content;
    if (!contentElement || !isElementNode(contentElement))
      return;
    if (anchorLeft !== void 0 || anchorTop !== void 0) {
      if (!anchorOptionsSupported) {
        console.warn(`AdvancedMarker: The anchorLeft and anchorTop props are only supported in Google Maps API version 3.62 and above. The current version is ${google.maps.version}.`);
      }
      marker.anchorLeft = anchorLeft;
      marker.anchorTop = anchorTop;
      if (anchorPoint !== void 0) {
        console.warn("AdvancedMarker: the anchorPoint prop is ignored when anchorLeft and/or anchorTop are set.");
      }
      return;
    }
    if (anchorPoint !== void 0) {
      const [x, y] = anchorPoint !== null && anchorPoint !== void 0 ? anchorPoint : AdvancedMarkerAnchorPoint["BOTTOM"];
      const translateX = `calc(-1 * ${x})`;
      const translateY = `calc(-1 * ${y})`;
      if (anchorOptionsSupported) {
        marker.anchorLeft = translateX;
        marker.anchorTop = translateY;
        contentElement.style.transform = "";
      } else {
        contentElement.style.transform = `translate(50%, 100%) translate(${translateX}, ${translateY})`;
        marker.dataset.origin = "rgm";
        globalStyleManager.addAdvancedMarkerPointerEventsOverwrite();
      }
    }
  }, [marker, anchorPoint, anchorLeft, anchorTop, hasChildren]);
}
const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
const UNSET = null;
function getChangedOptions(nextOptions, trackedOptions) {
  let changedOptions = null;
  const keys2 = /* @__PURE__ */ new Set([
    ...Object.keys(trackedOptions),
    ...Object.keys(nextOptions)
  ]);
  for (const key of keys2) {
    if (!hasOwn(nextOptions, key)) {
      changedOptions !== null && changedOptions !== void 0 ? changedOptions : changedOptions = /* @__PURE__ */ Object.create(null);
      changedOptions[key] = UNSET;
      continue;
    }
    if (hasOwn(trackedOptions, key) && deepEqual(trackedOptions[key], nextOptions[key]))
      continue;
    changedOptions !== null && changedOptions !== void 0 ? changedOptions : changedOptions = /* @__PURE__ */ Object.create(null);
    changedOptions[key] = nextOptions[key];
  }
  return changedOptions;
}
function snapshotOptions(value) {
  if (Array.isArray(value))
    return value.map((entry) => snapshotOptions(entry));
  if (value === null || typeof value !== "object")
    return value;
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype)
    return value;
  const copy = {};
  for (const key of Object.keys(value))
    copy[key] = snapshotOptions(value[key]);
  return copy;
}
const appliedOptionsByObject = /* @__PURE__ */ new WeakMap();
function setMapObjectOptions(object, options, { alreadyApplied = false } = {}) {
  var _a;
  if (alreadyApplied) {
    appliedOptionsByObject.set(object, snapshotOptions(options));
    return;
  }
  const appliedOptions = (_a = appliedOptionsByObject.get(object)) !== null && _a !== void 0 ? _a : {};
  const changedOptions = getChangedOptions(options, appliedOptions);
  if (!changedOptions)
    return;
  object.setOptions(changedOptions);
  appliedOptionsByObject.set(object, snapshotOptions(options));
}
function useCircle(props) {
  var _a, _b, _c;
  const { onClick, onDrag, onDragStart, onDragEnd, onMouseOver, onMouseOut, onRadiusChanged, onCenterChanged, center, defaultCenter, radius, defaultRadius } = props, destructuredOptions = __rest(props, ["onClick", "onDrag", "onDragStart", "onDragEnd", "onMouseOver", "onMouseOut", "onRadiusChanged", "onCenterChanged", "center", "defaultCenter", "radius", "defaultRadius"]);
  const [circle, setCircle] = reactExports.useState(null);
  const map = useMap();
  const circleOptions = useMemoized(Object.assign(Object.assign({}, destructuredOptions), { clickable: (_a = destructuredOptions.clickable) !== null && _a !== void 0 ? _a : Boolean(onClick), draggable: (_b = destructuredOptions.draggable) !== null && _b !== void 0 ? _b : Boolean(onDrag || onDragStart || onDragEnd || onCenterChanged), editable: (_c = destructuredOptions.editable) !== null && _c !== void 0 ? _c : Boolean(onRadiusChanged) }), deepEqual);
  reactExports.useEffect(() => {
    if (!map) {
      if (map === void 0)
        console.error("<Circle> has to be inside a Map component.");
      return;
    }
    const newCircle = new google.maps.Circle(Object.assign(Object.assign({}, circleOptions), { center: center !== null && center !== void 0 ? center : defaultCenter, radius: radius !== null && radius !== void 0 ? radius : defaultRadius }));
    setMapObjectOptions(newCircle, circleOptions, { alreadyApplied: true });
    newCircle.setMap(map);
    setCircle(newCircle);
    return () => {
      newCircle.setMap(null);
      setCircle(null);
    };
  }, [map]);
  useMapsEventListener(circle, "click", onClick);
  useMapsEventListener(circle, "drag", onDrag);
  useMapsEventListener(circle, "dragstart", onDragStart);
  useMapsEventListener(circle, "dragend", onDragEnd);
  useMapsEventListener(circle, "mouseover", onMouseOver);
  useMapsEventListener(circle, "mouseout", onMouseOut);
  useMapsEventListener(circle, "radius_changed", onRadiusChanged ? () => {
    const newRadius = circle === null || circle === void 0 ? void 0 : circle.getRadius();
    if (newRadius !== void 0)
      onRadiusChanged(newRadius);
  } : null);
  useMapsEventListener(circle, "center_changed", onCenterChanged ? () => {
    onCenterChanged(circle === null || circle === void 0 ? void 0 : circle.getCenter());
  } : null);
  reactExports.useEffect(() => {
    if (!circle)
      return;
    setMapObjectOptions(circle, circleOptions);
  }, [circle, circleOptions]);
  reactExports.useEffect(() => {
    if (!circle || !center)
      return;
    if (!latLngEquals(center, circle.getCenter())) {
      circle.setCenter(center);
    }
  }, [circle, center]);
  reactExports.useEffect(() => {
    if (!circle || radius === void 0)
      return;
    if (radius !== circle.getRadius()) {
      circle.setRadius(radius);
    }
  }, [circle, radius]);
  return circle;
}
const Circle = reactExports.forwardRef((props, ref) => {
  const circle = useCircle(props);
  reactExports.useImperativeHandle(ref, () => circle, [circle]);
  return React__default.createElement(React__default.Fragment, null);
});
Circle.displayName = "Circle";
function setValueForStyles(element, styles, prevStyles) {
  if (styles != null && typeof styles !== "object") {
    throw new Error("The `style` prop expects a mapping from style properties to values, not a string. For example, style={{marginRight: spacing + 'em'}} when using JSX.");
  }
  const elementStyle = element.style;
  if (prevStyles == null) {
    if (styles == null)
      return;
    for (const styleName in styles) {
      if (!styles.hasOwnProperty(styleName))
        continue;
      setValueForStyle(elementStyle, styleName, styles[styleName]);
    }
    return;
  }
  for (const styleName in prevStyles) {
    if (prevStyles.hasOwnProperty(styleName) && (styles == null || !styles.hasOwnProperty(styleName))) {
      const isCustomProperty = styleName.indexOf("--") === 0;
      if (isCustomProperty) {
        elementStyle.setProperty(styleName, "");
      } else if (styleName === "float") {
        elementStyle.cssFloat = "";
      } else {
        elementStyle[styleName] = "";
      }
    }
  }
  if (styles == null)
    return;
  for (const styleName in styles) {
    const value = styles[styleName];
    if (styles.hasOwnProperty(styleName) && prevStyles[styleName] !== value) {
      setValueForStyle(elementStyle, styleName, value);
    }
  }
}
function setValueForStyle(elementStyle, styleName, value) {
  const isCustomProperty = styleName.indexOf("--") === 0;
  if (value == null || typeof value === "boolean" || value === "") {
    if (isCustomProperty) {
      elementStyle.setProperty(styleName, "");
    } else if (styleName === "float") {
      elementStyle.cssFloat = "";
    } else {
      elementStyle[styleName] = "";
    }
  } else if (isCustomProperty) {
    elementStyle.setProperty(styleName, value);
  } else if (typeof value === "number" && value !== 0 && !isUnitlessNumber(styleName)) {
    elementStyle[styleName] = value + "px";
  } else {
    if (styleName === "float") {
      elementStyle.cssFloat = value;
    } else {
      elementStyle[styleName] = ("" + value).trim();
    }
  }
}
const unitlessNumbers = /* @__PURE__ */ new Set([
  "animationIterationCount",
  "aspectRatio",
  "borderImageOutset",
  "borderImageSlice",
  "borderImageWidth",
  "boxFlex",
  "boxFlexGroup",
  "boxOrdinalGroup",
  "columnCount",
  "columns",
  "flex",
  "flexGrow",
  "flexPositive",
  "flexShrink",
  "flexNegative",
  "flexOrder",
  "gridArea",
  "gridRow",
  "gridRowEnd",
  "gridRowSpan",
  "gridRowStart",
  "gridColumn",
  "gridColumnEnd",
  "gridColumnSpan",
  "gridColumnStart",
  "fontWeight",
  "lineClamp",
  "lineHeight",
  "opacity",
  "order",
  "orphans",
  "scale",
  "tabSize",
  "widows",
  "zIndex",
  "zoom",
  "fillOpacity",
  // SVG-related properties
  "floodOpacity",
  "stopOpacity",
  "strokeDasharray",
  "strokeDashoffset",
  "strokeMiterlimit",
  "strokeOpacity",
  "strokeWidth"
]);
function isUnitlessNumber(name) {
  return unitlessNumbers.has(name);
}
function getPathsArray(polygon) {
  const mvcPaths = polygon.getPaths();
  const result = [];
  for (let i = 0; i < mvcPaths.getLength(); i++) {
    result.push(mvcPaths.getAt(i).getArray());
  }
  return result;
}
function usePolygon(props) {
  var _a, _b, _c;
  const { onClick, onDrag, onDragStart, onDragEnd, onMouseOver, onMouseOut, onPathsChanged, polygon: externalPolygon, encodedPaths, paths, defaultPaths } = props, destructuredOptions = __rest(props, ["onClick", "onDrag", "onDragStart", "onDragEnd", "onMouseOver", "onMouseOut", "onPathsChanged", "polygon", "encodedPaths", "paths", "defaultPaths"]);
  const [polygon, setPolygon] = reactExports.useState(null);
  const map = useMap();
  const geometryLibrary = useMapsLibrary("geometry");
  const isUpdatingRef = reactExports.useRef(false);
  const polygonOptions = useMemoized(Object.assign(Object.assign({}, destructuredOptions), { clickable: (_a = destructuredOptions.clickable) !== null && _a !== void 0 ? _a : Boolean(onClick), draggable: (_b = destructuredOptions.draggable) !== null && _b !== void 0 ? _b : Boolean(onDrag || onDragStart || onDragEnd || onPathsChanged), editable: (_c = destructuredOptions.editable) !== null && _c !== void 0 ? _c : Boolean(onPathsChanged) }), deepEqual);
  reactExports.useEffect(() => {
    if (!map) {
      if (map === void 0)
        console.error("<Polygon> has to be inside a Map component.");
      return;
    }
    let instance;
    if (externalPolygon) {
      instance = externalPolygon;
      const initialPaths = paths !== null && paths !== void 0 ? paths : defaultPaths;
      if (initialPaths && Array.isArray(initialPaths)) {
        instance.setPaths(initialPaths);
      }
      instance.setOptions(polygonOptions);
    } else {
      const initialPaths = paths !== null && paths !== void 0 ? paths : defaultPaths;
      const polygonOptionsWithPaths = Object.assign({}, polygonOptions);
      if (initialPaths && Array.isArray(initialPaths)) {
        polygonOptionsWithPaths.paths = initialPaths;
      }
      instance = new google.maps.Polygon(polygonOptionsWithPaths);
    }
    setMapObjectOptions(instance, polygonOptions, { alreadyApplied: true });
    instance.setMap(map);
    setPolygon(instance);
    return () => {
      instance.setMap(null);
      setPolygon(null);
    };
  }, [map, externalPolygon]);
  useMapsEventListener(polygon, "click", onClick);
  useMapsEventListener(polygon, "drag", onDrag);
  useMapsEventListener(polygon, "dragstart", onDragStart);
  useMapsEventListener(polygon, "mouseover", onMouseOver);
  useMapsEventListener(polygon, "mouseout", onMouseOut);
  useMapsEventListener(polygon, "dragend", (e) => {
    onDragEnd === null || onDragEnd === void 0 ? void 0 : onDragEnd(e);
    if (onPathsChanged && polygon && !isUpdatingRef.current) {
      onPathsChanged(getPathsArray(polygon));
    }
  });
  reactExports.useEffect(() => {
    if (!polygon || !onPathsChanged)
      return;
    const listeners2 = [];
    const mvcPaths = polygon.getPaths();
    if (typeof mvcPaths.getLength !== "function" || typeof mvcPaths.getAt !== "function") {
      return;
    }
    const handlePathsChange = () => {
      if (!isUpdatingRef.current) {
        onPathsChanged(getPathsArray(polygon));
      }
    };
    const subscribeToInnerPath = (innerPath) => {
      listeners2.push(google.maps.event.addListener(innerPath, "insert_at", handlePathsChange));
      listeners2.push(google.maps.event.addListener(innerPath, "remove_at", handlePathsChange));
      listeners2.push(google.maps.event.addListener(innerPath, "set_at", handlePathsChange));
    };
    for (let i = 0; i < mvcPaths.getLength(); i++) {
      subscribeToInnerPath(mvcPaths.getAt(i));
    }
    listeners2.push(google.maps.event.addListener(mvcPaths, "insert_at", (index) => {
      subscribeToInnerPath(mvcPaths.getAt(index));
      handlePathsChange();
    }));
    listeners2.push(google.maps.event.addListener(mvcPaths, "set_at", (index) => {
      subscribeToInnerPath(mvcPaths.getAt(index));
      handlePathsChange();
    }));
    listeners2.push(google.maps.event.addListener(mvcPaths, "remove_at", handlePathsChange));
    return () => {
      listeners2.forEach((listener) => listener.remove());
    };
  }, [
    polygon,
    onPathsChanged,
    paths,
    encodedPaths,
    polygonOptions.editable,
    polygonOptions.draggable
  ]);
  reactExports.useEffect(() => {
    if (!polygon)
      return;
    setMapObjectOptions(polygon, polygonOptions);
  }, [polygon, polygonOptions]);
  reactExports.useEffect(() => {
    if (!polygon || !paths)
      return;
    if (!Array.isArray(paths))
      return;
    const firstPath = paths[0];
    const normalizedPaths = Array.isArray(firstPath) ? paths : [paths];
    const currentPaths = polygon.getPaths();
    if (!pathsEquals(normalizedPaths, currentPaths)) {
      isUpdatingRef.current = true;
      polygon.setPaths(paths);
      isUpdatingRef.current = false;
    }
  }, [polygon, paths]);
  reactExports.useEffect(() => {
    if (!polygon || !encodedPaths || !geometryLibrary)
      return;
    isUpdatingRef.current = true;
    const decodedPaths = encodedPaths.map((encodedPath) => geometryLibrary.encoding.decodePath(encodedPath));
    polygon.setPaths(decodedPaths);
    isUpdatingRef.current = false;
  }, [polygon, encodedPaths, geometryLibrary]);
  return polygon;
}
const Polygon = reactExports.forwardRef((props, ref) => {
  const polygon = usePolygon(props);
  reactExports.useImperativeHandle(ref, () => polygon, [polygon]);
  return React__default.createElement(React__default.Fragment, null);
});
Polygon.displayName = "Polygon";
function usePolyline(props) {
  var _a, _b, _c;
  const { onClick, onDrag, onDragStart, onDragEnd, onMouseOver, onMouseOut, onPathChanged, polyline: externalPolyline, encodedPath, path, defaultPath } = props, destructuredOptions = __rest(props, ["onClick", "onDrag", "onDragStart", "onDragEnd", "onMouseOver", "onMouseOut", "onPathChanged", "polyline", "encodedPath", "path", "defaultPath"]);
  const [polyline, setPolyline] = reactExports.useState(null);
  const map = useMap();
  const geometryLibrary = useMapsLibrary("geometry");
  const isUpdatingRef = reactExports.useRef(false);
  const polylineOptions = useMemoized(Object.assign(Object.assign({}, destructuredOptions), { clickable: (_a = destructuredOptions.clickable) !== null && _a !== void 0 ? _a : Boolean(onClick), draggable: (_b = destructuredOptions.draggable) !== null && _b !== void 0 ? _b : Boolean(onDrag || onDragStart || onDragEnd || onPathChanged), editable: (_c = destructuredOptions.editable) !== null && _c !== void 0 ? _c : Boolean(onPathChanged) }), deepEqual);
  reactExports.useEffect(() => {
    if (!map) {
      if (map === void 0)
        console.error("<Polyline> has to be inside a Map component.");
      return;
    }
    let instance;
    if (externalPolyline) {
      instance = externalPolyline;
      const initialPath = path !== null && path !== void 0 ? path : defaultPath;
      if (initialPath && Array.isArray(initialPath)) {
        instance.setPath(initialPath);
      }
      instance.setOptions(polylineOptions);
    } else {
      const initialPath = path !== null && path !== void 0 ? path : defaultPath;
      const polylineOptionsWithPath = Object.assign({}, polylineOptions);
      if (initialPath && Array.isArray(initialPath)) {
        polylineOptionsWithPath.path = initialPath;
      }
      instance = new google.maps.Polyline(polylineOptionsWithPath);
    }
    setMapObjectOptions(instance, polylineOptions, { alreadyApplied: true });
    instance.setMap(map);
    setPolyline(instance);
    return () => {
      instance.setMap(null);
      setPolyline(null);
    };
  }, [map, externalPolyline]);
  useMapsEventListener(polyline, "click", onClick);
  useMapsEventListener(polyline, "drag", onDrag);
  useMapsEventListener(polyline, "dragstart", onDragStart);
  useMapsEventListener(polyline, "mouseover", onMouseOver);
  useMapsEventListener(polyline, "mouseout", onMouseOut);
  useMapsEventListener(polyline, "dragend", (e) => {
    onDragEnd === null || onDragEnd === void 0 ? void 0 : onDragEnd(e);
    if (onPathChanged && polyline && !isUpdatingRef.current) {
      onPathChanged(polyline.getPath().getArray());
    }
  });
  reactExports.useEffect(() => {
    if (!polyline || !onPathChanged)
      return;
    const mvcPath = polyline.getPath();
    if (!mvcPath)
      return;
    const handlePathChange = () => {
      if (!isUpdatingRef.current) {
        onPathChanged(mvcPath.getArray());
      }
    };
    const listeners2 = [
      google.maps.event.addListener(mvcPath, "insert_at", handlePathChange),
      google.maps.event.addListener(mvcPath, "remove_at", handlePathChange),
      google.maps.event.addListener(mvcPath, "set_at", handlePathChange)
    ];
    return () => {
      listeners2.forEach((listener) => listener.remove());
    };
  }, [
    polyline,
    onPathChanged,
    path,
    encodedPath,
    polylineOptions.editable,
    polylineOptions.draggable
  ]);
  reactExports.useEffect(() => {
    if (!polyline)
      return;
    setMapObjectOptions(polyline, polylineOptions);
  }, [polyline, polylineOptions]);
  reactExports.useEffect(() => {
    if (!polyline || !path)
      return;
    const currentPath = polyline.getPath();
    if (!pathEquals(path, currentPath)) {
      isUpdatingRef.current = true;
      polyline.setPath(path);
      isUpdatingRef.current = false;
    }
  }, [polyline, path]);
  reactExports.useEffect(() => {
    if (!polyline || !encodedPath || !geometryLibrary)
      return;
    isUpdatingRef.current = true;
    const decodedPath = geometryLibrary.encoding.decodePath(encodedPath);
    polyline.setPath(decodedPath);
    isUpdatingRef.current = false;
  }, [polyline, encodedPath, geometryLibrary]);
  return polyline;
}
const Polyline = reactExports.forwardRef((props, ref) => {
  const polyline = usePolyline(props);
  reactExports.useImperativeHandle(ref, () => polyline, [polyline]);
  return React__default.createElement(React__default.Fragment, null);
});
Polyline.displayName = "Polyline";
const DEFAULT_CAMERA_STATE = {
  center: { lat: 0, lng: 0, altitude: 0 },
  range: 0,
  heading: 0,
  tilt: 0,
  roll: 0
};
const CAMERA_PROPS = ["center", "range", "heading", "tilt", "roll"];
function updateCameraState(map3d, ref, prop) {
  const value = map3d[prop];
  if (value == null)
    return;
  if (prop === "center") {
    const center = value;
    ref.current.center = center.toJSON ? center.toJSON() : center;
  } else {
    ref.current[prop] = value;
  }
}
function useTrackedCameraStateRef3D(map3d) {
  const forceUpdate = useForceUpdate();
  const ref = reactExports.useRef(Object.assign({}, DEFAULT_CAMERA_STATE));
  reactExports.useEffect(() => {
    if (!map3d)
      return;
    const listeners2 = [];
    for (const prop of CAMERA_PROPS) {
      const eventName = `gmp-${prop}change`;
      const handler = () => {
        updateCameraState(map3d, ref, prop);
        forceUpdate();
      };
      map3d.addEventListener(eventName, handler);
      listeners2.push(() => map3d.removeEventListener(eventName, handler));
    }
    return () => {
      for (const removeListener of listeners2) {
        removeListener();
      }
    };
  }, [map3d, forceUpdate]);
  return ref;
}
function useMap3DInstance(props) {
  const maps3dLib = useMapsLibrary("maps3d");
  const [customElementReady, setCustomElementReady] = reactExports.useState(false);
  const [, containerRef] = useCallbackRef();
  const [map3d, map3dRef] = useCallbackRef();
  const cameraStateRef = useTrackedCameraStateRef3D(map3d);
  reactExports.useEffect(() => {
    customElements.whenDefined("gmp-map-3d").then(() => {
      setCustomElementReady(true);
    });
  }, []);
  reactExports.useEffect(
    () => {
      if (!map3d)
        return;
      const {
        center,
        heading,
        tilt,
        range,
        roll,
        defaultCenter,
        defaultHeading,
        defaultTilt,
        defaultRange,
        defaultRoll,
        // Non-element props to exclude
        id,
        style,
        className,
        children,
        onCenterChanged,
        onHeadingChanged,
        onTiltChanged,
        onRangeChanged,
        onRollChanged,
        onCameraChanged,
        onClick,
        onSteadyChange,
        onAnimationEnd,
        onError,
        mode,
        gestureHandling
      } = props, elementOptions = __rest(props, ["center", "heading", "tilt", "range", "roll", "defaultCenter", "defaultHeading", "defaultTilt", "defaultRange", "defaultRoll", "id", "style", "className", "children", "onCenterChanged", "onHeadingChanged", "onTiltChanged", "onRangeChanged", "onRollChanged", "onCameraChanged", "onClick", "onSteadyChange", "onAnimationEnd", "onError", "mode", "gestureHandling"]);
      const initialCenter = center !== null && center !== void 0 ? center : defaultCenter;
      const initialHeading = heading !== null && heading !== void 0 ? heading : defaultHeading;
      const initialTilt = tilt !== null && tilt !== void 0 ? tilt : defaultTilt;
      const initialRange = range !== null && range !== void 0 ? range : defaultRange;
      const initialRoll = roll !== null && roll !== void 0 ? roll : defaultRoll;
      const initialOptions = Object.assign({}, elementOptions);
      if (initialCenter)
        initialOptions.center = initialCenter;
      if (initialHeading !== void 0)
        initialOptions.heading = initialHeading;
      if (initialTilt !== void 0)
        initialOptions.tilt = initialTilt;
      if (initialRange !== void 0)
        initialOptions.range = initialRange;
      if (initialRoll !== void 0)
        initialOptions.roll = initialRoll;
      Object.assign(map3d, initialOptions);
    },
    // this effect should only run when the map3d element first becomes
    // available, so we skip re-running it when other props change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [map3d]
  );
  const isReady = !!maps3dLib && customElementReady;
  return [map3d, containerRef, map3dRef, cameraStateRef, isReady];
}
function toLatLngAltitudeLiteral(value) {
  if (!value)
    return null;
  if ("toJSON" in value && typeof value.toJSON === "function") {
    return value.toJSON();
  }
  return value;
}
function useMap3DCameraParams(map3d, cameraStateRef, props) {
  var _a, _b, _c, _d, _e, _f, _g;
  const centerLiteral = toLatLngAltitudeLiteral(props.center);
  const lat = (_a = centerLiteral === null || centerLiteral === void 0 ? void 0 : centerLiteral.lat) !== null && _a !== void 0 ? _a : null;
  const lng = (_b = centerLiteral === null || centerLiteral === void 0 ? void 0 : centerLiteral.lng) !== null && _b !== void 0 ? _b : null;
  const altitude = (_c = centerLiteral === null || centerLiteral === void 0 ? void 0 : centerLiteral.altitude) !== null && _c !== void 0 ? _c : null;
  const range = (_d = props.range) !== null && _d !== void 0 ? _d : null;
  const heading = (_e = props.heading) !== null && _e !== void 0 ? _e : null;
  const tilt = (_f = props.tilt) !== null && _f !== void 0 ? _f : null;
  const roll = (_g = props.roll) !== null && _g !== void 0 ? _g : null;
  reactExports.useLayoutEffect(() => {
    var _a2;
    if (!map3d)
      return;
    const currentState = cameraStateRef.current;
    if (lat !== null && lng !== null && (currentState.center.lat !== lat || currentState.center.lng !== lng || altitude !== null && currentState.center.altitude !== altitude)) {
      map3d.center = {
        lat,
        lng,
        altitude: (_a2 = altitude !== null && altitude !== void 0 ? altitude : currentState.center.altitude) !== null && _a2 !== void 0 ? _a2 : 0
      };
    }
    if (range !== null && currentState.range !== range) {
      map3d.range = range;
    }
    if (heading !== null && currentState.heading !== heading) {
      map3d.heading = heading;
    }
    if (tilt !== null && currentState.tilt !== tilt) {
      map3d.tilt = tilt;
    }
    if (roll !== null && currentState.roll !== roll) {
      map3d.roll = roll;
    }
  });
}
const CAMERA_EVENTS = [
  "gmp-centerchange",
  "gmp-headingchange",
  "gmp-tiltchange",
  "gmp-rangechange",
  "gmp-rollchange"
];
function createCameraEvent(map3d, type) {
  const center = map3d.center;
  let centerLiteral;
  if (center && "toJSON" in center && typeof center.toJSON === "function") {
    centerLiteral = center.toJSON();
  } else if (center) {
    centerLiteral = center;
  } else {
    centerLiteral = { lat: 0, lng: 0, altitude: 0 };
  }
  return {
    type,
    map3d,
    detail: {
      center: centerLiteral,
      range: map3d.range || 0,
      heading: map3d.heading || 0,
      tilt: map3d.tilt || 0,
      roll: map3d.roll || 0
    }
  };
}
function createClickEvent(map3d, srcEvent) {
  const placeClickEvent = srcEvent;
  return {
    type: "gmp-click",
    map3d,
    detail: {
      position: srcEvent.position || null,
      placeId: placeClickEvent.placeId
    }
  };
}
function createSteadyChangeEvent(map3d, srcEvent) {
  return {
    type: "gmp-steadychange",
    map3d,
    detail: {
      isSteady: srcEvent.isSteady
    }
  };
}
function useMap3DEvents(map3d, props) {
  const { onCenterChanged, onHeadingChanged, onTiltChanged, onRangeChanged, onRollChanged, onCameraChanged, onClick, onSteadyChange, onAnimationEnd, onError } = props;
  useMap3DEvent(map3d, "gmp-centerchange", onCenterChanged, createCameraEvent);
  useMap3DEvent(map3d, "gmp-headingchange", onHeadingChanged, createCameraEvent);
  useMap3DEvent(map3d, "gmp-tiltchange", onTiltChanged, createCameraEvent);
  useMap3DEvent(map3d, "gmp-rangechange", onRangeChanged, createCameraEvent);
  useMap3DEvent(map3d, "gmp-rollchange", onRollChanged, createCameraEvent);
  reactExports.useEffect(() => {
    if (!map3d || !onCameraChanged)
      return;
    const handler = () => {
      onCameraChanged(createCameraEvent(map3d, "camerachange"));
    };
    for (const eventName of CAMERA_EVENTS) {
      map3d.addEventListener(eventName, handler);
    }
    return () => {
      for (const eventName of CAMERA_EVENTS) {
        map3d.removeEventListener(eventName, handler);
      }
    };
  }, [map3d, onCameraChanged]);
  reactExports.useEffect(() => {
    if (!map3d || !onClick)
      return;
    const handler = (ev) => {
      onClick(createClickEvent(map3d, ev));
    };
    map3d.addEventListener("gmp-click", handler);
    return () => map3d.removeEventListener("gmp-click", handler);
  }, [map3d, onClick]);
  reactExports.useEffect(() => {
    if (!map3d || !onSteadyChange)
      return;
    const handler = (ev) => {
      onSteadyChange(createSteadyChangeEvent(map3d, ev));
    };
    map3d.addEventListener("gmp-steadychange", handler);
    return () => map3d.removeEventListener("gmp-steadychange", handler);
  }, [map3d, onSteadyChange]);
  useMap3DEvent(map3d, "gmp-animationend", onAnimationEnd, (map3d2, type) => ({
    type,
    map3d: map3d2
  }));
  useMap3DEvent(map3d, "gmp-error", onError, (map3d2, type) => ({
    type,
    map3d: map3d2
  }));
}
function useMap3DEvent(map3d, eventName, handler, createEvent) {
  reactExports.useEffect(() => {
    if (!map3d || !handler)
      return;
    const listener = () => {
      handler(createEvent(map3d, eventName));
    };
    map3d.addEventListener(eventName, listener);
    return () => map3d.removeEventListener(eventName, listener);
  }, [map3d, eventName, handler, createEvent]);
}
const MAP_3D_OPTION_KEYS = /* @__PURE__ */ new Set([
  "bounds",
  "defaultUIHidden",
  "gestureHandling",
  "internalUsageAttributionIds",
  "maxAltitude",
  "maxHeading",
  "maxTilt",
  "minAltitude",
  "minHeading",
  "minTilt",
  "mode"
]);
function useMap3DOptions(map3d, props) {
  const options = reactExports.useMemo(() => {
    const result = {};
    const keys2 = Object.keys(props);
    for (const key of keys2) {
      if (!MAP_3D_OPTION_KEYS.has(key))
        continue;
      const value = props[key];
      if (value === void 0)
        continue;
      result[key] = value;
    }
    return result;
  }, [props]);
  useDeepCompareEffect(() => {
    if (!map3d)
      return;
    Object.assign(map3d, options);
  }, [map3d, options]);
}
const GoogleMaps3DContext$1 = React__default.createContext(null);
const DEFAULT_CONTAINER_STYLE = {
  width: "100%",
  height: "100%",
  position: "relative"
};
const Map3D$1 = reactExports.forwardRef((props, ref) => {
  const { children, id, className, style } = props;
  const context = reactExports.useContext(APIProviderContext);
  if (!context) {
    throw new Error("<Map3D> can only be used inside an <APIProvider> component.");
  }
  const { addMap3DInstance, removeMap3DInstance } = context;
  const [map3d, containerRef, map3dRef, cameraStateRef, isReady] = useMap3DInstance(props);
  useMap3DCameraParams(map3d, cameraStateRef, props);
  useMap3DEvents(map3d, props);
  useMap3DOptions(map3d, props);
  reactExports.useEffect(() => {
    if (!map3d)
      return;
    const instanceId = id !== null && id !== void 0 ? id : "default";
    addMap3DInstance(map3d, instanceId);
    return () => {
      removeMap3DInstance(instanceId);
    };
  }, [map3d, id]);
  reactExports.useImperativeHandle(ref, () => ({
    map3d,
    flyCameraAround: (options) => {
      map3d === null || map3d === void 0 ? void 0 : map3d.flyCameraAround(options);
    },
    flyCameraTo: (options) => {
      map3d === null || map3d === void 0 ? void 0 : map3d.flyCameraTo(options);
    },
    stopCameraAnimation: () => {
      map3d === null || map3d === void 0 ? void 0 : map3d.stopCameraAnimation();
    }
  }), [map3d]);
  const combinedStyle = reactExports.useMemo(() => Object.assign(Object.assign({}, DEFAULT_CONTAINER_STYLE), style), [style]);
  const contextValue = reactExports.useMemo(() => ({ map3d }), [map3d]);
  if (!isReady) {
    return React__default.createElement("div", Object.assign({ ref: containerRef, "data-testid": "map-3d", style: className ? void 0 : combinedStyle, className }, id ? { id } : {}));
  }
  return React__default.createElement(
    "div",
    Object.assign({ ref: containerRef, "data-testid": "map-3d", style: className ? void 0 : combinedStyle, className }, id ? { id } : {}),
    React__default.createElement("gmp-map-3d", { ref: map3dRef, style: { width: "100%", height: "100%" } }, map3d && React__default.createElement(GoogleMaps3DContext$1.Provider, { value: contextValue }, children))
  );
});
Map3D$1.displayName = "Map3D";
const Marker3DContext$1 = reactExports.createContext(null);
const Marker3D$1 = reactExports.forwardRef(function Marker3D(props, ref) {
  const { children, onClick, position, altitudeMode, collisionBehavior, drawsWhenOccluded, extruded, label, sizePreserved, zIndex, title } = props;
  const isInteractive = Boolean(onClick);
  const [marker, setMarker] = reactExports.useState(null);
  const [contentHandledExternally, setContentHandledExternally] = reactExports.useState(false);
  const contentContainer = reactExports.useMemo(() => {
    const container = document.createElement("div");
    container.style.display = "none";
    document.body.appendChild(container);
    return container;
  }, []);
  reactExports.useEffect(() => {
    return () => contentContainer.remove();
  }, [contentContainer]);
  const markerRef = reactExports.useCallback((node) => {
    setMarker(node);
    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  }, [ref]);
  useDomEventListener(marker, "gmp-click", onClick);
  reactExports.useLayoutEffect(() => {
    if (contentHandledExternally)
      return;
    if (!marker || !contentContainer)
      return;
    while (marker.firstChild) {
      marker.removeChild(marker.firstChild);
    }
    const childNodes = Array.from(contentContainer.childNodes);
    for (const node of childNodes) {
      if (node.nodeType !== Node.ELEMENT_NODE)
        continue;
      const element = node;
      const tagName = element.tagName.toLowerCase();
      if (tagName === "img" || tagName === "svg") {
        const template = document.createElement("template");
        template.content.appendChild(element.cloneNode(true));
        marker.appendChild(template);
      } else {
        marker.appendChild(element.cloneNode(true));
      }
    }
  }, [marker, contentContainer, children, contentHandledExternally]);
  const contextValue = reactExports.useMemo(() => ({ marker, setContentHandledExternally }), [marker]);
  usePropBinding(marker, "position", position);
  usePropBinding(marker, "altitudeMode", altitudeMode);
  usePropBinding(marker, "collisionBehavior", collisionBehavior);
  usePropBinding(marker, "drawsWhenOccluded", drawsWhenOccluded);
  usePropBinding(marker, "extruded", extruded);
  usePropBinding(marker, "label", label);
  usePropBinding(marker, "sizePreserved", sizePreserved);
  usePropBinding(marker, "zIndex", zIndex);
  usePropBinding(marker, "title", title !== null && title !== void 0 ? title : "");
  return React__default.createElement(
    Marker3DContext$1.Provider,
    { value: contextValue },
    isInteractive ? React__default.createElement("gmp-marker-3d-interactive", { ref: markerRef }) : React__default.createElement("gmp-marker-3d", { ref: markerRef }),
    reactDomExports.createPortal(children, contentContainer)
  );
});
Marker3D$1.displayName = "Marker3D";
const Popover$1 = reactExports.forwardRef(function Popover(props, ref) {
  var _a;
  const { children, headerContent, style, className, open = true, position, anchor, anchorId, altitudeMode, lightDismissDisabled, autoPanDisabled, onClose } = props;
  const [popover, setPopover] = reactExports.useState(null);
  const prevStyleRef = reactExports.useRef(null);
  reactExports.useImperativeHandle(ref, () => popover, [popover]);
  usePopoverCloseObserver(popover, open, onClose);
  usePropBinding(popover, "open", open !== null && open !== void 0 ? open : false);
  usePropBinding(popover, "altitudeMode", altitudeMode);
  usePropBinding(popover, "lightDismissDisabled", lightDismissDisabled);
  usePropBinding(popover, "autoPanDisabled", autoPanDisabled);
  const positionAnchor = (_a = anchor !== null && anchor !== void 0 ? anchor : anchorId) !== null && _a !== void 0 ? _a : position;
  usePropBinding(popover, "positionAnchor", positionAnchor);
  reactExports.useLayoutEffect(() => {
    if (!popover)
      return;
    setValueForStyles(popover, style || null, prevStyleRef.current);
    prevStyleRef.current = style || null;
  }, [popover, style]);
  return React__default.createElement(
    "gmp-popover",
    { ref: setPopover, className },
    headerContent && React__default.createElement("div", { slot: "header" }, headerContent),
    children
  );
});
Popover$1.displayName = "Popover";
function usePopoverCloseObserver(popover, open, onClose) {
  const previousOpenState = reactExports.useRef(void 0);
  const openPropRef = reactExports.useRef(open);
  reactExports.useEffect(() => {
    openPropRef.current = open;
  }, [open]);
  reactExports.useEffect(() => {
    if (!popover || !onClose)
      return;
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes" && mutation.attributeName === "open") {
          const isOpen = popover.hasAttribute("open");
          if (previousOpenState.current === true && !isOpen && openPropRef.current !== false) {
            onClose();
          }
          previousOpenState.current = isOpen;
        }
      }
    });
    observer.observe(popover, {
      attributes: true,
      attributeFilter: ["open"]
    });
    previousOpenState.current = popover.hasAttribute("open");
    return () => {
      observer.disconnect();
    };
  }, [popover, onClose]);
}
function useMarker(props) {
  const [marker, setMarker] = reactExports.useState(null);
  const map = useMap();
  const { onClick, onDrag, onDragStart, onDragEnd, onMouseOver, onMouseOut } = props, markerOptions = __rest(props, ["onClick", "onDrag", "onDragStart", "onDragEnd", "onMouseOver", "onMouseOut"]);
  const { position, draggable } = markerOptions;
  reactExports.useEffect(() => {
    if (!map) {
      if (map === void 0)
        console.error("<Marker> has to be inside a Map component.");
      return;
    }
    const newMarker = new google.maps.Marker(markerOptions);
    newMarker.setMap(map);
    setMarker(newMarker);
    return () => {
      newMarker.setMap(null);
      setMarker(null);
    };
  }, [map]);
  reactExports.useEffect(() => {
    if (!marker)
      return;
    const m = marker;
    const gme = google.maps.event;
    if (onClick)
      gme.addListener(m, "click", onClick);
    if (onDrag)
      gme.addListener(m, "drag", onDrag);
    if (onDragStart)
      gme.addListener(m, "dragstart", onDragStart);
    if (onDragEnd)
      gme.addListener(m, "dragend", onDragEnd);
    if (onMouseOver)
      gme.addListener(m, "mouseover", onMouseOver);
    if (onMouseOut)
      gme.addListener(m, "mouseout", onMouseOut);
    marker.setDraggable(Boolean(draggable));
    return () => {
      gme.clearInstanceListeners(m);
    };
  }, [
    marker,
    draggable,
    onClick,
    onDrag,
    onDragStart,
    onDragEnd,
    onMouseOver,
    onMouseOut
  ]);
  reactExports.useEffect(() => {
    if (!marker)
      return;
    if (markerOptions)
      marker.setOptions(markerOptions);
  }, [marker, markerOptions]);
  reactExports.useEffect(() => {
    if (draggable || !position || !marker)
      return;
    marker.setPosition(position);
  }, [draggable, position, marker]);
  return marker;
}
const Marker = reactExports.forwardRef((props, ref) => {
  const marker = useMarker(props);
  reactExports.useImperativeHandle(ref, () => marker, [marker]);
  return React__default.createElement(React__default.Fragment, null);
});
Marker.displayName = "Marker";
const PinLegacy = (props) => {
  const advancedMarkerContext = reactExports.useContext(AdvancedMarkerContext);
  const marker3dContext = reactExports.useContext(Marker3DContext$1);
  const advancedMarker = advancedMarkerContext === null || advancedMarkerContext === void 0 ? void 0 : advancedMarkerContext.marker;
  const marker3d = marker3dContext === null || marker3dContext === void 0 ? void 0 : marker3dContext.marker;
  const setContentHandledExternally = marker3dContext === null || marker3dContext === void 0 ? void 0 : marker3dContext.setContentHandledExternally;
  const glyphContainer = reactExports.useMemo(() => document.createElement("div"), []);
  const markerLibrary = useMapsLibrary("marker");
  reactExports.useEffect(() => {
    if (marker3d && setContentHandledExternally) {
      setContentHandledExternally(true);
      return () => setContentHandledExternally(false);
    }
  }, [marker3d, setContentHandledExternally]);
  reactExports.useEffect(() => {
    if (!marker3d || !markerLibrary)
      return;
    const pinViewOptions = Object.assign({}, props);
    const pinElement = new markerLibrary.PinElement(pinViewOptions);
    if (props.children) {
      pinElement.glyph = glyphContainer;
    }
    while (marker3d.firstChild) {
      marker3d.removeChild(marker3d.firstChild);
    }
    marker3d.append(pinElement);
    return () => {
    };
  }, [marker3d, markerLibrary, glyphContainer, props]);
  reactExports.useEffect(() => {
    var _a;
    if (marker3d)
      return;
    if (!advancedMarker) {
      if (advancedMarker === void 0 && marker3d === void 0) {
        console.error("The <Pin> component can only be used inside <AdvancedMarker> or <Marker3D>.");
      }
      return;
    }
    if (props.glyph && props.children) {
      logErrorOnce("The <Pin> component only uses children to render the glyph if both the glyph property and children are present.");
    }
    if (reactExports.Children.count(props.children) > 1) {
      logErrorOnce("Passing multiple children to the <Pin> component might lead to unexpected results.");
    }
    const pinViewOptions = Object.assign({}, props);
    const pinElement = new google.maps.marker.PinElement(pinViewOptions);
    if (props.children) {
      pinElement.glyph = glyphContainer;
    }
    const markerContent = (_a = advancedMarker.content) === null || _a === void 0 ? void 0 : _a.firstChild;
    while (markerContent === null || markerContent === void 0 ? void 0 : markerContent.firstChild) {
      markerContent.removeChild(markerContent.firstChild);
    }
    if (markerContent) {
      markerContent.appendChild(pinElement.element);
    }
  }, [advancedMarker, glyphContainer, marker3d, props]);
  return reactDomExports.createPortal(props.children, glyphContainer);
};
const PinModern = (props) => {
  const { children } = props;
  const advancedMarkerContext = reactExports.useContext(AdvancedMarkerContext);
  const marker3dContext = reactExports.useContext(Marker3DContext$1);
  const advancedMarker = advancedMarkerContext === null || advancedMarkerContext === void 0 ? void 0 : advancedMarkerContext.marker;
  const marker3d = marker3dContext === null || marker3dContext === void 0 ? void 0 : marker3dContext.marker;
  const setContentHandledExternally = marker3dContext === null || marker3dContext === void 0 ? void 0 : marker3dContext.setContentHandledExternally;
  const glyphContainer = reactExports.useMemo(() => document.createElement("div"), []);
  const markerLibrary = useMapsLibrary("marker");
  reactExports.useEffect(() => {
    if (marker3d && setContentHandledExternally) {
      setContentHandledExternally(true);
      return () => setContentHandledExternally(false);
    }
  }, [marker3d, setContentHandledExternally]);
  reactExports.useEffect(() => {
    if (!marker3d || !markerLibrary)
      return;
    const pinOptions = Object.assign({}, props);
    const pinElement = new markerLibrary.PinElement(pinOptions);
    if (children) {
      pinElement.appendChild(glyphContainer);
    }
    while (marker3d.firstChild) {
      marker3d.removeChild(marker3d.firstChild);
    }
    marker3d.appendChild(pinElement);
    return () => {
    };
  }, [marker3d, markerLibrary, glyphContainer, children, props]);
  reactExports.useEffect(() => {
    var _a;
    if (marker3d)
      return;
    if (!advancedMarker || !markerLibrary) {
      if (advancedMarker === void 0 && marker3d === void 0) {
        console.error("The <Pin> component can only be used inside <AdvancedMarker> or <Marker3D>.");
      }
      return;
    }
    if ((props.glyphSrc || props.glyphText) && children) {
      logErrorOnce("The <Pin> component only uses children to render the glyph if both glyphSrc/glyphText and children are present.");
    }
    if (reactExports.Children.count(children) > 1) {
      logErrorOnce("Passing multiple children to the <Pin> component might lead to unexpected results.");
    }
    const pinOptions = Object.assign({}, props);
    const pinElement = new markerLibrary.PinElement(pinOptions);
    if (children) {
      pinElement.appendChild(glyphContainer);
    }
    const markerContent = (_a = advancedMarker.content) === null || _a === void 0 ? void 0 : _a.firstChild;
    while (markerContent === null || markerContent === void 0 ? void 0 : markerContent.firstChild) {
      markerContent.removeChild(markerContent.firstChild);
    }
    if (markerContent) {
      markerContent.appendChild(pinElement);
    }
  }, [
    advancedMarker,
    markerLibrary,
    glyphContainer,
    marker3d,
    children,
    props
  ]);
  return reactDomExports.createPortal(children, glyphContainer);
};
const Pin = (props) => {
  var _a;
  const markerLibrary = useMapsLibrary("marker");
  const isModern = reactExports.useMemo(() => {
    if (!markerLibrary)
      return false;
    return typeof customElements !== "undefined" && customElements.get("gmp-pin") !== void 0;
  }, [markerLibrary]);
  if (!markerLibrary)
    return null;
  if (isModern) {
    const { glyph, glyphSrc, glyphText } = props, restProps = __rest(props, ["glyph", "glyphSrc", "glyphText"]);
    const isUrl = glyph instanceof URL || typeof glyph === "string" && glyph.startsWith("http");
    const finalGlyphText = glyphText !== null && glyphText !== void 0 ? glyphText : typeof glyph === "string" && !isUrl ? glyph : void 0;
    const finalGlyphSrc = glyphSrc !== null && glyphSrc !== void 0 ? glyphSrc : isUrl ? String(glyph) : void 0;
    return React__default.createElement(PinModern, Object.assign({}, restProps, { glyphText: finalGlyphText, glyphSrc: finalGlyphSrc }));
  } else {
    const { glyph, glyphSrc, glyphText } = props, restProps = __rest(props, ["glyph", "glyphSrc", "glyphText"]);
    const finalGlyph = (_a = glyph !== null && glyph !== void 0 ? glyph : glyphSrc) !== null && _a !== void 0 ? _a : glyphText;
    return React__default.createElement(PinLegacy, Object.assign({}, restProps, { glyph: finalGlyph }));
  }
};
function useRectangle(props) {
  var _a, _b, _c;
  const { onClick, onDrag, onDragStart, onDragEnd, onMouseOver, onMouseOut, onBoundsChanged, bounds, defaultBounds } = props, destructuredOptions = __rest(props, ["onClick", "onDrag", "onDragStart", "onDragEnd", "onMouseOver", "onMouseOut", "onBoundsChanged", "bounds", "defaultBounds"]);
  const [rectangle, setRectangle] = reactExports.useState(null);
  const map = useMap();
  const rectangleOptions = useMemoized(Object.assign(Object.assign({}, destructuredOptions), { clickable: (_a = destructuredOptions.clickable) !== null && _a !== void 0 ? _a : Boolean(onClick), draggable: (_b = destructuredOptions.draggable) !== null && _b !== void 0 ? _b : Boolean(onDrag || onDragStart || onDragEnd || onBoundsChanged), editable: (_c = destructuredOptions.editable) !== null && _c !== void 0 ? _c : Boolean(onBoundsChanged) }), deepEqual);
  reactExports.useEffect(() => {
    if (!map) {
      if (map === void 0)
        console.error("<Rectangle> has to be inside a Map component.");
      return;
    }
    const newRectangle = new google.maps.Rectangle(Object.assign(Object.assign({}, rectangleOptions), { bounds: bounds !== null && bounds !== void 0 ? bounds : defaultBounds }));
    setMapObjectOptions(newRectangle, rectangleOptions, { alreadyApplied: true });
    newRectangle.setMap(map);
    setRectangle(newRectangle);
    return () => {
      newRectangle.setMap(null);
      setRectangle(null);
    };
  }, [map]);
  useMapsEventListener(rectangle, "click", onClick);
  useMapsEventListener(rectangle, "drag", onDrag);
  useMapsEventListener(rectangle, "dragstart", onDragStart);
  useMapsEventListener(rectangle, "dragend", onDragEnd);
  useMapsEventListener(rectangle, "mouseover", onMouseOver);
  useMapsEventListener(rectangle, "mouseout", onMouseOut);
  useMapsEventListener(rectangle, "bounds_changed", onBoundsChanged ? () => {
    onBoundsChanged(rectangle === null || rectangle === void 0 ? void 0 : rectangle.getBounds());
  } : null);
  reactExports.useEffect(() => {
    if (!rectangle)
      return;
    setMapObjectOptions(rectangle, rectangleOptions);
  }, [rectangle, rectangleOptions]);
  reactExports.useEffect(() => {
    if (!rectangle || !bounds)
      return;
    if (!boundsEquals(bounds, rectangle.getBounds())) {
      rectangle.setBounds(bounds);
    }
  }, [rectangle, bounds]);
  return rectangle;
}
const Rectangle = reactExports.forwardRef((props, ref) => {
  const rectangle = useRectangle(props);
  reactExports.useImperativeHandle(ref, () => rectangle, [
    rectangle
  ]);
  return React__default.createElement(React__default.Fragment, null);
});
Rectangle.displayName = "Rectangle";
const formatCustomerAddress = (c) => {
  if (!c) return "";
  if (typeof c.address === "string" && c.address.trim()) {
    return c.address;
  }
  if (c.address && typeof c.address === "object") {
    if (c.address.fullAddress) return c.address.fullAddress;
    const parts = [
      c.address.houseNumber || c.address.houseNo || c.houseNo,
      c.address.block && c.address.block !== c.address.sector ? c.address.block : null,
      c.address.sector || c.address.sectorLocality || c.sector,
      c.address.colony || c.address.area || c.colony || c.area,
      c.address.pincode || c.pincode ? `PIN ${c.address.pincode || c.pincode}` : null
    ].filter(Boolean);
    if (parts.length > 0) return parts.join(", ");
  }
  const fallback = [
    c.houseNo,
    c.block,
    c.sector,
    c.colony || c.area,
    c.pincode ? `PIN ${c.pincode}` : null
  ].filter(Boolean);
  return fallback.length > 0 ? fallback.join(", ") : "Dadabari S.O. Jurisdiction, Kota";
};
function BeatMap() {
  const [customers, setCustomers] = reactExports.useState([]);
  const [selectedBeat, setSelectedBeat] = reactExports.useState("1");
  const [selectedStop, setSelectedStop] = reactExports.useState(null);
  const [searchFilter, setSearchFilter] = reactExports.useState("");
  const rawApiKey = "Password";
  const hasValidGoogleMapsKey = reactExports.useMemo(() => {
    return rawApiKey.trim().length > 15 && rawApiKey !== "DEMO_MAP_ID" && !rawApiKey.includes("DEMO");
  }, [rawApiKey]);
  reactExports.useEffect(() => {
    const allCust = customerService.getCustomers();
    setCustomers(allCust);
  }, []);
  const beatsList = reactExports.useMemo(() => {
    const uniqueBeats = /* @__PURE__ */ new Set();
    customers.forEach((c) => {
      if (c.beatNo) uniqueBeats.add(c.beatNo);
    });
    for (let i = 1; i <= 33; i++) {
      uniqueBeats.add(i.toString());
    }
    return Array.from(uniqueBeats).sort((a, b) => {
      const numA = parseInt(a, 10);
      const numB = parseInt(b, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });
  }, [customers]);
  const filteredCustomers = reactExports.useMemo(() => {
    return customers.filter((c) => {
      const beatMatch = c.beatNo === selectedBeat || c.beatNo === `Beat ${selectedBeat}`;
      if (!beatMatch) return false;
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        const addrText = formatCustomerAddress(c).toLowerCase();
        return c.name.toLowerCase().includes(q) || addrText.includes(q) || c.mobile && c.mobile.includes(q);
      }
      return true;
    });
  }, [customers, selectedBeat, searchFilter]);
  const baseLat = 25.18;
  const baseLng = 75.83;
  const plottedStops = reactExports.useMemo(() => {
    return filteredCustomers.map((c, idx) => {
      const hash = c.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const angle = idx * (360 / Math.max(filteredCustomers.length, 1)) * Math.PI / 180;
      const radius = 5e-3 + hash % 100 / 100 * 0.015;
      return {
        customer: c,
        seq: idx + 1,
        lat: baseLat + Math.sin(angle) * radius,
        lng: baseLng + Math.cos(angle) * radius,
        xPercent: 50 + Math.cos(angle) * (35 + hash % 10),
        yPercent: 50 + Math.sin(angle) * (35 + (hash >> 2) % 10)
      };
    });
  }, [filteredCustomers]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-slate-50 p-4 md:p-6 space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation, { className: "text-red-700", size: 26 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Postman Beat Route & Spatial Delivery GIS" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200", children: "Field GIS" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-500 mt-1", children: "Visual sequence planner and doorstep delivery map for postal beat operations across Rajasthan Circle." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-slate-600 uppercase", children: "Select Beat:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "select",
            {
              value: selectedBeat,
              onChange: (e) => setSelectedBeat(e.target.value),
              className: "bg-white font-bold text-slate-900 text-sm px-2 py-1 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-500",
              children: beatsList.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: b, children: [
                "Beat ",
                b
              ] }, b))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-2.5 text-slate-400", size: 15 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              placeholder: "Search stop in beat...",
              value: searchFilter,
              onChange: (e) => setSearchFilter(e.target.value),
              className: "pl-9 pr-3 py-1.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pb-3 mb-3 border-b border-slate-100", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Compass, { className: "text-red-600", size: 18 }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-slate-800 text-sm", children: [
              "Beat ",
              selectedBeat,
              " Delivery Waypoints (",
              plottedStops.length,
              " stops)"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-slate-500 font-medium", children: [
            "Mode: ",
            hasValidGoogleMapsKey ? "Google Maps JavaScript API" : "Standalone Vector GIS Canvas"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative w-full h-[540px] bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 rounded-xl overflow-hidden border border-slate-800", children: hasValidGoogleMapsKey ? /* @__PURE__ */ jsxRuntimeExports.jsx(APIProvider, { apiKey: rawApiKey, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Map$1,
          {
            defaultCenter: { lat: baseLat, lng: baseLng },
            defaultZoom: 14,
            mapId: "DELIVERY_BEAT_MAP",
            className: "w-full h-full",
            children: plottedStops.map((stop) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              AdvancedMarker,
              {
                position: { lat: stop.lat, lng: stop.lng },
                onClick: () => setSelectedStop(stop.customer),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Pin,
                  {
                    background: "#dc2626",
                    glyphColor: "#ffffff",
                    borderColor: "#991b1b",
                    scale: 1.1
                  }
                )
              },
              stop.customer.id
            ))
          }
        ) }) : (
          /* Vector GIS Map with Grid, Post Office Hub & Connected Delivery Paths */
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full h-full select-none overflow-hidden flex items-center justify-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "absolute inset-0 w-full h-full pointer-events-none opacity-60", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("pattern", { id: "gridPattern", width: "40", height: "40", patternUnits: "userSpaceOnUse", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M 40 0 L 0 0 0 40", fill: "none", stroke: "#334155", strokeWidth: "0.5" }) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { width: "100%", height: "100%", fill: "url(#gridPattern)" }),
              plottedStops.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "polyline",
                {
                  points: plottedStops.map((s) => `${s.xPercent}%,${s.yPercent}%`).join(" "),
                  fill: "none",
                  stroke: "#ef4444",
                  strokeWidth: "2.5",
                  strokeDasharray: "6,4",
                  className: "animate-pulse"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "absolute z-20 flex flex-col items-center cursor-pointer group",
                style: { left: "50%", top: "50%", transform: "translate(-50%, -50%)" },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-red-600 border-2 border-white shadow-lg flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { size: 20 }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mt-1 px-2 py-0.5 rounded-md bg-slate-900/90 text-[10px] text-white font-bold border border-slate-700 whitespace-nowrap shadow-md", children: [
                    "Delivery P.O. Hub (Beat ",
                    selectedBeat,
                    ")"
                  ] })
                ]
              }
            ),
            plottedStops.map((stop) => {
              const isSelected = (selectedStop == null ? void 0 : selectedStop.id) === stop.customer.id;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => setSelectedStop(stop.customer),
                  className: "absolute z-30 flex flex-col items-center group cursor-pointer focus:outline-hidden",
                  style: {
                    left: `${stop.xPercent}%`,
                    top: `${stop.yPercent}%`,
                    transform: "translate(-50%, -50%)"
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: `w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-lg transition-transform ${isSelected ? "bg-amber-400 text-slate-950 ring-4 ring-amber-300/40 scale-125" : "bg-red-700 text-white border-2 border-white group-hover:scale-110"}`,
                        children: stop.seq
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-1 px-1.5 py-0.5 rounded-sm bg-black/80 text-[9px] text-slate-200 font-semibold max-w-[100px] truncate shadow-xs", children: stop.customer.name })
                  ]
                },
                stop.customer.id
              );
            }),
            plottedStops.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center p-6 bg-slate-900/80 rounded-xl border border-slate-800 text-slate-300 max-w-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "mx-auto text-red-500 mb-2", size: 32 }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-bold", children: [
                "No customers assigned to Beat ",
                selectedBeat,
                " yet."
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Add customers in the CRM or map them to this beat from Colony-Beat Master." })
            ] })
          ] })
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center justify-between text-xs text-slate-500", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "● Red markers represent sequential delivery stops (Stop 1 → Stop ",
            plottedStops.length,
            ")."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Click any marker to inspect customer profile & delivery details." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        selectedStop ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-5 rounded-2xl border border-red-200 shadow-xs space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-black uppercase tracking-wider text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200", children: "Selected Waypoint" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-slate-900 text-base mt-1", children: selectedStop.name })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setSelectedStop(null),
                className: "text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded-md",
                children: "Clear"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 14, className: "text-slate-400 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: formatCustomerAddress(selectedStop) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { size: 14, className: "text-slate-400 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: selectedStop.mobile || "No contact number" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-medium", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Assigned Beat:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-slate-900", children: [
                "Beat ",
                selectedStop.beatNo
              ] })
            ] })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center py-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "mx-auto text-slate-300 mb-2", size: 32 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold text-slate-700 text-sm", children: "No Stop Selected" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Select a stop from the map or list below to inspect delivery instructions." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pb-2 border-b border-slate-100", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-slate-800 text-sm", children: "Delivery Sequence" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md", children: [
              plottedStops.length,
              " Total"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-[340px] overflow-y-auto space-y-2 pr-1", children: plottedStops.map((stop) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              onClick: () => setSelectedStop(stop.customer),
              className: `p-2.5 rounded-xl border text-xs cursor-pointer transition-colors flex items-center justify-between ${(selectedStop == null ? void 0 : selectedStop.id) === stop.customer.id ? "border-red-400 bg-red-50/70" : "border-slate-200 hover:border-slate-300 bg-white"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-5 h-5 rounded-full bg-slate-150 text-slate-700 font-black text-[10px] flex items-center justify-center shrink-0", children: stop.seq }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "truncate", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-slate-800 truncate", children: stop.customer.name }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-slate-400 truncate", children: formatCustomerAddress(stop.customer) })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-slate-500 shrink-0 ml-2", children: [
                  "Beat ",
                  stop.customer.beatNo
                ] })
              ]
            },
            stop.customer.id
          )) })
        ] })
      ] })
    ] })
  ] });
}
export {
  BeatMap as default
};
