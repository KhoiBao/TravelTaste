package com.reviewdiadiem.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "yeuthich")
@Data
@NoArgsConstructor
@AllArgsConstructor
@CompoundIndexes({
        @CompoundIndex(name = "idx_yeuthich_user_place_unique", def = "{'userId': 1, 'diaDiemId': 1}", unique = true),
        @CompoundIndex(name = "idx_yeuthich_user_date", def = "{'userId': 1, 'ngayTao': -1}"),
        @CompoundIndex(name = "idx_yeuthich_place", def = "{'diaDiemId': 1}")
})
public class YeuThich {

    @Id
    private String id;

    @Field("userId")
    private String userId;

    @Field("diaDiemId")
    private String diaDiemId;

    @Field("ngayTao")
    private LocalDateTime ngayTao;
}
