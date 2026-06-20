package org.jeecg.modules.warehouse.service.impl;

import org.jeecg.modules.warehouse.entity.WarehouseLocation;
import org.jeecg.modules.warehouse.mapper.WarehouseLocationMapper;
import org.jeecg.modules.warehouse.service.IWarehouseLocationService;
import org.springframework.stereotype.Service;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import java.util.List;

/**
 * @Description: 库位管理
 * @Author: jeecg-boot
 * @Date: 2026-06-21
 * @Version: V1.0
 */
@Service
public class WarehouseLocationServiceImpl extends ServiceImpl<WarehouseLocationMapper, WarehouseLocation> implements IWarehouseLocationService {

    @Override
    public List<WarehouseLocation> selectByMainId(String mainId) {
        return baseMapper.selectByMainId(mainId);
    }
}
