package de.fschmidt.virtualcv.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class EmailWhitelistFilter implements HandlerInterceptor {

    private final Set<String> allowedEmails;

    public EmailWhitelistFilter(@Value("${app.auth.allowed-emails}") List<String> allowedEmails) {
        this.allowedEmails = allowedEmails.stream()
            .map(String::toLowerCase)
            .collect(Collectors.toUnmodifiableSet());
    }

    @Override
    public boolean preHandle(@NonNull HttpServletRequest request,
                             @NonNull HttpServletResponse response,
                             @NonNull Object handler) throws Exception {
        String method = request.getMethod();

        if ("GET".equalsIgnoreCase(method) || "OPTIONS".equalsIgnoreCase(method) || "HEAD".equalsIgnoreCase(method)) {
            return true;
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof Jwt jwt)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return false;
        }

        String email = jwt.getClaimAsString("email");
        Boolean emailVerified = jwt.getClaim("email_verified");

        if (email == null || !Boolean.TRUE.equals(emailVerified)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write("{\"message\":\"Email not verified\",\"code\":\"EMAIL_NOT_VERIFIED\"}");
            return false;
        }

        if (!allowedEmails.contains(email.toLowerCase())) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write("{\"message\":\"Not authorized to perform write operations\",\"code\":\"EMAIL_NOT_WHITELISTED\"}");
            return false;
        }

        return true;
    }
}
