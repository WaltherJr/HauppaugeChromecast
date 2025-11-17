package com.eriksandsten.hauppaugechromecast.exception;

public class HttpBadRequestException extends RuntimeException {
    public HttpBadRequestException(String message) {
        super(message);
    }
}
