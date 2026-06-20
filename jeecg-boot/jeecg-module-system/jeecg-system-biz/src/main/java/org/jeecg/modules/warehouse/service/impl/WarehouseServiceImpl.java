package org.jeecg.modules.warehouse.service.impl;

import org.jeecg.modules.warehouse.entity.Warehouse;
import org.jeecg.modules.warehouse.entity.WarehouseLocation;
import org.jeecg.modules.warehouse.mapper.WarehouseMapper;
import org.jeecg.modules.warehouse.mapper.WarehouseLocationMapper;
import org.jeecg.modules.warehouse.service.IWarehouseService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import java.io.Serializable;
import java.util.Collection;
import java.util.List;

/**
 * @Description: 仓库管理
 * @Author: jeecg-boot
 * @Date: 2026-06-21
 * @Version: V1.0
 */
@Service
public class WarehouseServiceImpl extends ServiceImpl<WarehouseMapper, Warehouse> implements IWarehouseService {

    @Autowired
    private WarehouseLocationMapper warehouseLocationMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void saveMain(Warehouse warehouse, List<WarehouseLocation> warehouseLocationList) {
        this.save(warehouse);
        if (warehouseLocationList != null && !warehouseLocationList.isEmpty()) {
            for (WarehouseLocation entity : warehouseLocationList) {
                entity.setWarehouseId(warehouse.getId());
                warehouseLocationMapper.insert(entity);
            }
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateMain(Warehouse warehouse, List<WarehouseLocation> warehouseLocationList) {
        this.updateById(warehouse);
        // 先删后插
        warehouseLocationMapper.deleteByMainId(warehouse.getId());
        if (warehouseLocationList != null && !warehouseLocationList.isEmpty()) {
            for (WarehouseLocation entity : warehouseLocationList) {
                entity.setWarehouseId(warehouse.getId());
                warehouseLocationMapper.insert(entity);
            }
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void delMain(String id) {
        warehouseLocationMapper.deleteByMainId(id);
        this.removeById(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void delBatchMain(Collection<? extends Serializable> idList) {
        for (Serializable id : idList) {
            warehouseLocationMapper.deleteByMainId(id.toString());
        }
        this.removeByIds(idList);
    }
}
