package com.reviewdiadiem.util;

import org.bson.types.ObjectId;
import java.util.List;

/** Nested reference fields can originate from the ObjectId seed or String application model. */
public final class MongoIds {
    private MongoIds() {}
    public static List<Object> references(String id) {
        return ObjectId.isValid(id) ? List.of(id, new ObjectId(id)) : List.of(id);
    }
}
