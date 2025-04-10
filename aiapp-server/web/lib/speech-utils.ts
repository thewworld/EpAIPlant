// 语音识别接口
export interface SpeechRecognitionResult {
  transcript: string
  isFinal: boolean
}

// 检查浏览器是否支持语音识别
export function isSpeechRecognitionSupported(): boolean {
  return "webkitSpeechRecognition" in window || "SpeechRecognition" in window
}

// 检查浏览器是否支持语音合成
export function isSpeechSynthesisSupported(): boolean {
  return "speechSynthesis" in window
}

// 创建语音识别实例
export function createSpeechRecognition() {
  // 使用浏览器原生SpeechRecognition或webkitSpeechRecognition
  const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRecognitionAPI) {
    throw new Error("Speech Recognition is not supported in this browser")
  }

  const recognition = new SpeechRecognitionAPI()

  // 配置语音识别
  recognition.continuous = true // 持续监听
  recognition.interimResults = true // 返回临时结果
  recognition.lang = "zh-CN" // 设置语言为中文

  return recognition
}

// 获取可用的语音合成声音
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSynthesisSupported()) return []
  return window.speechSynthesis.getVoices()
}

// 文本转语音
export function speakText(text: string, voice?: SpeechSynthesisVoice, rate = 1, pitch = 1): SpeechSynthesisUtterance {
  if (!isSpeechSynthesisSupported()) {
    throw new Error("Speech Synthesis is not supported in this browser")
  }

  // 创建语音合成话语
  const utterance = new SpeechSynthesisUtterance(text)

  // 设置语音参数
  if (voice) utterance.voice = voice
  utterance.rate = rate // 语速
  utterance.pitch = pitch // 音调
  utterance.lang = "zh-CN" // 语言

  // 开始播放
  window.speechSynthesis.speak(utterance)

  return utterance
}

// 停止所有语音合成
export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel()
  }
}

// 暂停语音合成
export function pauseSpeaking(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.pause()
  }
}

// 恢复语音合成
export function resumeSpeaking(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.resume()
  }
}

