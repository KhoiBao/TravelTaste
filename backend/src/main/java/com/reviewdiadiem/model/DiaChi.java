package com.reviewdiadiem.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Field;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiaChi implements Serializable {

    @Field("so")
    private String so;

    @Field("duong")
    private String duong;

    @Field("quan")
    private String quan;

    @Field("thanhPho")
    private String thanhPho;
}
