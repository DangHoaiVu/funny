package com.example.product_management.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {
    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name","lggpgidw",
                "api_key", "261572378417673",
                "api_secret", "0iNVViXmwkQYQYH-RmyNTxDtRJQ"
        ));
    }
}
