package com.reviewdiadiem.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Field;

import java.io.Serializable;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ViTri implements Serializable {

    @Field("type")
    private String type = "Point";

    @Field("coordinates")
    private List<Double> coordinates; // [kinhDo, viDo] -> lng trước, lat sau
}
