package org.jeecg.modules.warehouse.service;

import org.jeecg.modules.warehouse.entity.WarehouseLocation;
import com.baomidou.mybatisplus.extension.service.IService;
import java.util.List;

/**
 * @Description: 库位管理
 * @Author: jeecg-boot
 * @Date: 2026-06-21
 * @Version: V1.0
 */
public interface IWarehouseLocationService extends IService<WarehouseLocation> {

    List<WarehouseLocation> selectByMainId(String mainId);
}
