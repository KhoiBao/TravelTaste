package com.reviewdiadiem.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private String id;

    @Field("username")
    private String username;

    @Field("hoTen")
    private String hoTen;

    @Field("email")
    private String email;

    @Field("passwordHash")
    private String passwordHash;

    @Field("avatar")
    private String avatar;

    @Field("role")
    private String role; // ADMIN | USER

    @Field("trangThai")
    private String trangThai; // ACTIVE | BLOCKED

    @Field("ngayTao")
    private LocalDateTime ngayTao;

    @Field("ngayCapNhat")
    private LocalDateTime ngayCapNhat;
}
