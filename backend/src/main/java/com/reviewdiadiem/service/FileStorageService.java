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
        if (file.isEmpty() || file.getSize() > 5 * 1024 * 1024) throw new com.reviewdiadiem.exception.ApiException(org.springframework.http.HttpStatus.BAD_REQUEST, "Ảnh không hợp lệ hoặc vượt quá 5 MB");
        try {
            var image = javax.imageio.ImageIO.read(file.getInputStream());
            if (image == null) throw new com.reviewdiadiem.exception.ApiException(org.springframework.http.HttpStatus.BAD_REQUEST, "Chỉ nhận nội dung ảnh hợp lệ");
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
            String ext = ".png";

            String filename = UUID.randomUUID().toString() + ext;
            Path target = dateDir.resolve(filename);
            javax.imageio.ImageIO.write(image, "png", target.toFile());

            return "/uploads/" + dateFolder + "/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Lưu file thất bại: " + e.getMessage(), e);
        }
    }
}
