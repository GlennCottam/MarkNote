// Listen for install event, set callback
self.addEventListener('install', function(event) {
  // Perform some task
  event.waitUntil(
      caches.open('editor').then(function(cache) {
          return cache.addAll(
                [
                    '/public/main.js',
                    '/public/jquery-3.6.0.min.js',
                    '/public/bootstrap-5.0.0-beta1-dist/js/bootstrap.min.js',
                    '/public/bootstrap-5.0.0-beta1-dist/css/bootstrap.min.css',
                    '/public/CodeMirror/lib/codemirror.css',
                    '/public/CodeMirror/theme/monokai.css',
                    '/public/CodeMirror/addon/fold/foldgutter.css',
                    '/public/CodeMirror/lib/codemirror.js',
                    '/public/CodeMirror/addon/fold/foldcode.js',
                    '/public/CodeMirror/addon/fold/foldgutter.js',
                    '/public/CodeMirror/addon/fold/markdown-fold.js',
                    '/public/CodeMirror/addon/mode/overlay.js',
                    '/public/CodeMirror/mode/meta.js',
                    '/public/CodeMirror/mode/markdown/markdown.js',
                    '/public/CodeMirror/mode/xml/xml.js',
                    '/public/CodeMirror/mode/stex/stex.js',
                    '/public/CodeMirror/mode/yaml/yaml.js',
                    '/public/CodeMirror/mode/javascript/javascript.js',
                    '/public/HyperMD/mode/hypermd.css',
                    '/public/HyperMD/theme/hypermd-light.css',
                    '/public/HyperMD/ai1.js',
                ]
            );
        })
    );
});

self.addEventListener('activate', function(event) {
  // Perform some task
});