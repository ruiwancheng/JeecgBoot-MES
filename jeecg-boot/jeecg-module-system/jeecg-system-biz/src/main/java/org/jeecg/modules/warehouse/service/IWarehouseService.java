package org.jeecg.modules.warehouse.service;

import org.jeecg.modules.warehouse.entity.Warehouse;
import org.jeecg.modules.warehouse.entity.WarehouseLocation;
import com.baomidou.mybatisplus.extension.service.IService;
import java.io.Serializable;
import java.util.Collection;
import java.util.List;

/**
 * @Description: 仓库管理
 * @Author: jeecg-boot
 * @Date: 2026-06-21
 * @Version: V1.0
 */
public interface IWarehouseService extends IService<Warehouse> {

    void saveMain(Warehouse warehouse, List<WarehouseLocation> warehouseLocationList);

    void updateMain(Warehouse warehouse, List<WarehouseLocation> warehouseLocationList);

    void delMain(String id);

    void delBatchMain(Collection<? extends Serializable> idList);
}
