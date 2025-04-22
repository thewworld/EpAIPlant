/**
 * Monaco Editor Worker Proxy
 * 这个文件用作Monaco编辑器Web Worker的代理
 */
self.MonacoEnvironment = {
  baseUrl: 'https://unpkg.com/monaco-editor@0.33.0/min/'
};

// 使用importScripts从CDN动态加载编辑器核心代码
importScripts('https://unpkg.com/monaco-editor@0.33.0/min/vs/base/worker/workerMain.js'); 