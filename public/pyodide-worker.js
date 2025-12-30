importScripts('https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js');

let pyodide = null;
let initialized = false;

async function initPyodide() {
  if (initialized) return;
  try {
    pyodide = await loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/' });
    await pyodide.loadPackage('micropip');
    // Provide a simple stdout capture helper
    pyodide.runPython(`
import sys
import io
class StringIOWrapper(io.StringIO):
    def get_val(self):
        return self.getvalue()
sys.stdout = StringIOWrapper()
`);
    initialized = true;
    postMessage({ type: 'ready' });
  } catch (e) {
    postMessage({ type: 'error', error: String(e) });
  }
}

// simple RPC by id
const pending = new Map();

onmessage = async (ev) => {
  const msg = ev.data || {};
  if (msg.type === 'init') {
    await initPyodide();
    return;
  }

  if (msg.type === 'run') {
    const id = msg.id || null;
    if (!initialized) {
      await initPyodide();
    }
    try {
      // reset stdout
      pyodide.runPython("sys.stdout = io.StringIO()");
      // run code
      await pyodide.runPythonAsync(msg.code);
      const res = pyodide.runPython("sys.stdout.getvalue()") || '';
      postMessage({ type: 'result', id, result: String(res) });
    } catch (err) {
      postMessage({ type: 'result', id, error: String(err) });
    }
  }
};
