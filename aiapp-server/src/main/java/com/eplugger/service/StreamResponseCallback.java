package com.eplugger.service;

public interface StreamResponseCallback {
    void onData(String data);

    void onComplete();

    void onError(Throwable throwable);
}