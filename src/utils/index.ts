//@ts-nocheck
// Escape a user input string for use in a REGEX search
export const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Helper to remove async/await try/catch litter
// https://gist.github.com/DavidWells/54f9dd1af4a489e5f1358f33ce59e8ad
export const promise = (promise) =>
  promise
    .then((data) => {
      if (data instanceof Error) return [data];
      return [null, data];
    })
    .catch((err) => [err]);

export const api = {
  baseURL: 'http://localhost:3050/api',
  get: (endpoint, external?, options?) => {
    let url = external ? endpoint : api.baseURL + endpoint;
    if (options) url += '?' + new URLSearchParams(options).toString();
    return api.respond(fetch(url));
  },
  post: (endpoint, options) =>
    api.respond(
      fetch(api.baseURL + endpoint, {
        method: 'post',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(options)
      })
    ),
  respond: async (request) => {
    const [error, response] = await promise(request.then((response) => response.json()));
    return [error, response];
  }
};

// Recursive function to load scripts in order then perform callback
export const loadScripts = (scripts, callback?) => {
  const loadScript = (index) => {
    const script = document.createElement('script');
    script.src = scripts[index];
    script.onload = () => {
      if (index + 1 !== scripts.length) loadScript(index + 1);
      else if (callback) callback();
    };
    document.body.appendChild(script);
  };
  loadScript(0);
};

export const showVideo = async (callback) => {
  // Polyfill for older browsers/devices that don't support `getUserMedia()`
  // May not be nessecary since the latest versions of Android Chrome and IOS Safari both do
  if (!('mediaDevices' in navigator)) {
    navigator.mediaDevices = {};
  }

  if (!('getUserMedia' in navigator.mediaDevices)) {
    navigator.mediaDevices.getUserMedia = (constraints) => {
      const getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      if (!getUserMedia) {
        return Promise.reject(new Error('getUserMedia() is not implemented!'));
      }
      return new Promise((resolve, reject) => {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    };
  }

  // Ask for permission then display stream to canvas
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user'
        // width: { ideal: 414 },
        // height: { ideal: 736 }
      }
      // audio: true
    });
    callback(stream);
  } catch (err) {
    alert(err);
  }
};

export const randomArrayVal = (arr) => arr[Math.floor(Math.random() * arr.length)];
