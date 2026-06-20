package org.jeecg.modules.warehouse.vo;

import java.io.Serializable;
import java.util.List;
import org.jeecg.modules.warehouse.entity.Warehouse;
import org.jeecg.modules.warehouse.entity.WarehouseLocation;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

/**
 * @Description: 仓库管理 Page VO
 * @Author: jeecg-boot
 * @Date: 2026-06-21
 * @Version: V1.0
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
public class WarehousePage extends Warehouse implements Serializable {
    private static final long serialVersionUID = 1L;

    /** 库位列表 */
    private List<WarehouseLocation> warehouseLocationList;
}
