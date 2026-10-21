package com.reviewdiadiem.dto;

/** Địa điểm có thể được người dùng lưu (yêu thích). */
public interface LikeAware {

    String getId();

    void setLuotThich(int luotThich);

    void setDaYeuThich(boolean daYeuThich);
}
