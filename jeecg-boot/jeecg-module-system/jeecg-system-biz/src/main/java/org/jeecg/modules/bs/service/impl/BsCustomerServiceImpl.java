package org.jeecg.modules.bs.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.jeecg.modules.bs.entity.BsCustomer;
import org.jeecg.modules.bs.mapper.BsCustomerMapper;
import org.jeecg.modules.bs.service.IBsCustomerService;
import org.springframework.stereotype.Service;

/**
 * @Description: 客户管理
 * @Author: jeecg-boot
 * @Date: 2026-06-21
 * @Version: V1.0
 */
@Service
public class BsCustomerServiceImpl extends ServiceImpl<BsCustomerMapper, BsCustomer> implements IBsCustomerService {
}
