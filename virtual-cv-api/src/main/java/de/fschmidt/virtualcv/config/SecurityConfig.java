package de.fschmidt.virtualcv.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // Public read endpoints
                .requestMatchers("/cv/**").permitAll()
                .requestMatchers("/health").permitAll()
                .requestMatchers("/actuator/health").permitAll()
                // OpenAPI/Swagger
                .requestMatchers("/swagger-ui/**", "/swagger-ui.html").permitAll()
                .requestMatchers("/v3/api-docs/**", "/v3/api-docs.yaml").permitAll()
                // Everything else requires authentication (for future CMS)
                .anyRequest().authenticated()
            );

        return http.build();
    }

    @Bean
    public CorsConfig corsConfig() {
        return new CorsConfig();
    }

    private org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        return corsConfig().corsConfigurationSource();
    }
}
