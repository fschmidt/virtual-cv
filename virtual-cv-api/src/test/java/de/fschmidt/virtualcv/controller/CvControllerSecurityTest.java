package de.fschmidt.virtualcv.controller;

import de.fschmidt.virtualcv.TestcontainersConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "app.auth.google-client-id=test-client-id",
    "app.auth.allowed-emails=allowed@example.com"
})
class CvControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void getEndpointsShouldBePublic() throws Exception {
        mockMvc.perform(get("/cv"))
            .andExpect(status().isOk());
    }

    @Test
    void postWithoutTokenShouldReturn401() throws Exception {
        mockMvc.perform(post("/cv/nodes/category")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"label":"Test","sectionId":"test"}
                    """))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void putWithoutTokenShouldReturn401() throws Exception {
        mockMvc.perform(put("/cv/nodes/some-id")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"id":"some-id","label":"Updated"}
                    """))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void deleteWithoutTokenShouldReturn401() throws Exception {
        mockMvc.perform(delete("/cv/nodes/some-id"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void postWithWhitelistedEmailShouldNotReturn401() throws Exception {
        // Should pass auth but may return 400 due to invalid payload — not 401/403
        mockMvc.perform(post("/cv/nodes/category")
                .with(jwt().jwt(j -> j
                    .claim("email", "allowed@example.com")
                    .claim("email_verified", true)))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"label":"Test","sectionId":"test"}
                    """))
            .andExpect(status().is4xxClientError())
            .andExpect(result -> {
                int s = result.getResponse().getStatus();
                assert s != 401 && s != 403 : "Expected auth to pass, got " + s;
            });
    }

    @Test
    void postWithNonWhitelistedEmailShouldReturn403() throws Exception {
        mockMvc.perform(post("/cv/nodes/category")
                .with(jwt().jwt(j -> j
                    .claim("email", "hacker@evil.com")
                    .claim("email_verified", true)))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"label":"Test","sectionId":"test"}
                    """))
            .andExpect(status().isForbidden());
    }

    @Test
    void postWithUnverifiedEmailShouldReturn403() throws Exception {
        mockMvc.perform(post("/cv/nodes/category")
                .with(jwt().jwt(j -> j
                    .claim("email", "allowed@example.com")
                    .claim("email_verified", false)))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"label":"Test","sectionId":"test"}
                    """))
            .andExpect(status().isForbidden());
    }
}
