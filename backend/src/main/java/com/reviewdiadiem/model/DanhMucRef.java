package com.reviewdiadiem.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Field;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DanhMucRef implements Serializable {

    @Field("danhMucId")
    private String danhMucId;

    @Field("ten")
    private String ten;

    @Field("slug")
    private String slug;
}
