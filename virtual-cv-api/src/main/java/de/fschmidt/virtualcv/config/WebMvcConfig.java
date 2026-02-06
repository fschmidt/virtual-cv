package de.fschmidt.virtualcv.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private final EmailWhitelistFilter emailWhitelistFilter;

    public WebMvcConfig(EmailWhitelistFilter emailWhitelistFilter) {
        this.emailWhitelistFilter = emailWhitelistFilter;
    }

    @Override
    public void addInterceptors(@NonNull InterceptorRegistry registry) {
        registry.addInterceptor(emailWhitelistFilter)
            .addPathPatterns("/cv/**");
    }
}
