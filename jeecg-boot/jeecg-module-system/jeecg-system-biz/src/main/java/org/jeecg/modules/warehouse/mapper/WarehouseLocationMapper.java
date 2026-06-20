package org.jeecg.modules.warehouse.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Param;
import org.jeecg.modules.warehouse.entity.WarehouseLocation;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;

/**
 * @Description: 库位管理
 * @Author: jeecg-boot
 * @Date: 2026-06-21
 * @Version: V1.0
 */
public interface WarehouseLocationMapper extends BaseMapper<WarehouseLocation> {

    List<WarehouseLocation> selectByMainId(@Param("mainId") String mainId);

    void deleteByMainId(@Param("mainId") String mainId);
}
