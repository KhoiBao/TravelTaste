package com.reviewdiadiem.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload.dir:uploads}")
    private String uploadDir;

    public String store(MultipartFile file) {
        try {
            Path root = Paths.get(uploadDir);
            if (!Files.exists(root)) {
                Files.createDirectories(root);
            }

            String dateFolder = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy/MM"));
            Path dateDir = root.resolve(dateFolder);
            if (!Files.exists(dateDir)) {
                Files.createDirectories(dateDir);
            }

            String originalFilename = file.getOriginalFilename();
            String ext = "";
            if (originalFilename != null && originalFilename.lastIndexOf('.') > 0) {
                ext = originalFilename.substring(originalFilename.lastIndexOf('.'));
            }
            String filename = UUID.randomUUID().toString() + ext;
            Path target = dateDir.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/" + dateFolder + "/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Lưu file thất bại: " + e.getMessage(), e);
        }
    }
}
