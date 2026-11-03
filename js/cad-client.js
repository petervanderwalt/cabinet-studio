let worker, sequence = 0;
const pending = new Map();
export function requestCad(type,panels,onProgress) {
  if (!worker) {
    worker = new Worker(new URL('./cad-worker.js?v=20261103s',import.meta.url),{type:'module'});
    worker.onmessage = ({data}) => {
      const task = pending.get(data.id);
      if (data.progress) { task?.onProgress?.(data.progress); return; }
      pending.delete(data.id);
      if (data.error) task?.reject(new Error(data.error));
      else task?.resolve(data.result);
    };
    worker.onerror = error => {
      for (const task of pending.values()) task.reject(new Error(error.message || 'CAD modeller failed to load.'));
      pending.clear(); worker.terminate(); worker = null;
    };
  }
  return new Promise((resolve,reject)=>{
    const id=++sequence; pending.set(id,{resolve,reject,onProgress}); worker.postMessage({id,type,panels});
  });
}
