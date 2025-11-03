package com.eriksandsten.hauppaugechromecast;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.CommonsRequestLoggingFilter;
import jakarta.servlet.http.HttpServletRequest;

@Configuration
public class RequestLoggingConfig {

    @Bean
    public CommonsRequestLoggingFilter logFilter() {
        CommonsRequestLoggingFilter filter = new CommonsRequestLoggingFilter() {

            @Override
            protected void beforeRequest(HttpServletRequest request, String message) {
                String clientIp = request.getRemoteAddr();
                logger.info("Incoming request from IP " + clientIp + ": " + request.getMethod() + " " + request.getRequestURI());
            }

            @Override
            protected void afterRequest(HttpServletRequest request, String message) {
                // optional: log after request
            }
        };

        filter.setIncludeQueryString(true);
        filter.setIncludePayload(true);
        filter.setIncludeHeaders(true);
        return filter;
    }
}
