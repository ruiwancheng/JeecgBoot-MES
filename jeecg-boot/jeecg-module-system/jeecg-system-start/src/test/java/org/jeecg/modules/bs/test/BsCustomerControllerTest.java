/**
 * BsCustomerController 单元测试
 *
 * ============================================================
 * 测试目标: 验证客户管理 Controller 层的 HTTP 契约
 *
 * 测试策略:
 *   - @WebMvcTest + @MockBean 隔离 Service 层
 *   - 不依赖数据库/Redis (启动 ~3s)
 *   - Mock 基础设施 Bean (BaseCommonService/RedisUtil 等)
 *
 * 覆盖:
 *   1. 列表分页 — 正常返回 / 空结果
 *   2. 新增 — 保存客户实体
 *   3. 编辑 — 更新客户实体
 *   4. 删除 — 按ID删除 / 批量删除 / 缺ID
 *   5. 查询详情 — 正常 / 不存在ID
 *
 * 运行:
 *   cd jeecg-boot/jeecg-module-system/jeecg-system-start
 *   mvn test -DskipTests=false -Dtest=BsCustomerControllerTest
 * ============================================================
 */

//update-begin---author:developer ---date:2026-06-21  for：客户管理 Controller 单元测试-----------
package org.jeecg.modules.bs.test;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.jeecg.common.modules.redis.client.JeecgRedisClient;
import org.jeecg.common.util.RedisUtil;
import org.jeecg.config.JeecgBaseConfig;
import org.jeecg.modules.base.service.BaseCommonService;
import org.jeecg.modules.bs.controller.BsCustomerController;
import org.jeecg.modules.bs.entity.BsCustomer;
import org.jeecg.modules.bs.service.IBsCustomerService;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BsCustomerController.class)
@DisplayName("客户管理 Controller 接口测试")
class BsCustomerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private IBsCustomerService bsCustomerService;

    // 基础设施 Mock Bean (JeecgBootExceptionHandler / Shiro / Redis 依赖)
    @MockBean
    private BaseCommonService baseCommonService;

    @MockBean
    private RedisUtil redisUtil;

    @MockBean
    private JeecgRedisClient jeecgRedisClient;

    @MockBean
    private JeecgBaseConfig jeecgBaseConfig;

    private final String BASE_URL = "/bs/customer/";

    /**
     * 构造测试用的来料加工客户实体
     */
    private BsCustomer buildTestCustomer() {
        BsCustomer c = new BsCustomer();
        c.setId("test-customer-001");
        c.setCustomerCode("CUST-TEST-01");
        c.setCustomerName("测试来料加工客户");
        c.setCustomerType("1");          // 来料加工客户
        c.setCustomerStatus("1");        // 正常
        c.setContactPerson("张三");
        c.setContactPhone("13800000001");
        c.setProcessingFeeRate(new BigDecimal("15.00"));
        c.setSettlementMethod("2");      // 批次结
        c.setPaymentDays(30);
        return c;
    }

    // ==================== 分页列表 ====================

    @Test
    @DisplayName("应该返回分页列表")
    void testList() throws Exception {
        Page<BsCustomer> page = new Page<>(1, 10);
        BsCustomer c = buildTestCustomer();
        page.setRecords(Arrays.asList(c));
        page.setTotal(1);

        when(bsCustomerService.page(any(), any())).thenReturn(page);

        String result = mockMvc.perform(get(BASE_URL + "list?pageNo=1&pageSize=10"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        JSONObject json = JSON.parseObject(result);
        assertTrue(json.getBoolean("success"));
        assertEquals(200, json.getInteger("code").intValue());
        assertEquals(1, json.getJSONObject("result").getInteger("total").intValue());
    }

    @Test
    @DisplayName("应该处理空结果列表")
    void testListEmpty() throws Exception {
        Page<BsCustomer> emptyPage = new Page<>(1, 10);
        when(bsCustomerService.page(any(), any())).thenReturn(emptyPage);

        String result = mockMvc.perform(get(BASE_URL + "list?pageNo=1&pageSize=10"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        JSONObject json = JSON.parseObject(result);
        assertTrue(json.getBoolean("success"));
        assertEquals(0, json.getJSONObject("result").getInteger("total").intValue());
    }

    // ==================== 新增 ====================

    @Test
    @DisplayName("应该成功创建客户")
    void testAdd() throws Exception {
        when(bsCustomerService.save(any(BsCustomer.class))).thenReturn(true);

        JSONObject params = new JSONObject();
        params.put("customerCode", "CUST-NEW-01");
        params.put("customerName", "新增测试客户");
        params.put("customerType", "1");
        params.put("customerStatus", "1");

        String result = mockMvc.perform(post(BASE_URL + "add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(params.toJSONString()))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        JSONObject json = JSON.parseObject(result);
        assertTrue(json.getBoolean("success"), "新增应返回成功");
        verify(bsCustomerService, times(1)).save(any(BsCustomer.class));
    }

    // ==================== 编辑 ====================

    @Test
    @DisplayName("应该成功更新客户")
    void testEdit() throws Exception {
        when(bsCustomerService.updateById(any(BsCustomer.class))).thenReturn(true);

        JSONObject params = new JSONObject();
        params.put("id", "test-customer-001");
        params.put("customerCode", "CUST-TEST-01");
        params.put("customerName", "已修改客户名");
        params.put("customerType", "1");
        params.put("customerStatus", "1");

        String result = mockMvc.perform(put(BASE_URL + "edit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(params.toJSONString()))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        JSONObject json = JSON.parseObject(result);
        assertTrue(json.getBoolean("success"), "编辑应返回成功");
    }

    // ==================== 删除 ====================

    @Test
    @DisplayName("应该成功删除客户")
    void testDelete() throws Exception {
        when(bsCustomerService.removeById("test-customer-001")).thenReturn(true);

        String result = mockMvc.perform(delete(BASE_URL + "delete?id=test-customer-001"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        JSONObject json = JSON.parseObject(result);
        assertTrue(json.getBoolean("success"), "删除应返回成功");
    }

    @Test
    @DisplayName("缺少id参数时应返回失败")
    void testDeleteMissingId() throws Exception {
        String result = mockMvc.perform(delete(BASE_URL + "delete"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        JSONObject json = JSON.parseObject(result);
        // 全局异常处理器捕获后返回 success=false
        assertFalse(json.getBoolean("success"), "缺少id应返回失败");
    }

    // ==================== 批量删除 ====================

    @Test
    @DisplayName("应该成功批量删除")
    void testDeleteBatch() throws Exception {
        when(bsCustomerService.removeByIds(anyList())).thenReturn(true);

        String result = mockMvc.perform(delete(BASE_URL + "deleteBatch?ids=id1,id2,id3"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        JSONObject json = JSON.parseObject(result);
        assertTrue(json.getBoolean("success"), "批量删除应返回成功");
    }

    // ==================== 查询详情 ====================

    @Test
    @DisplayName("应该通过ID查询客户详情")
    void testQueryById() throws Exception {
        BsCustomer c = buildTestCustomer();
        when(bsCustomerService.getById("test-customer-001")).thenReturn(c);

        String result = mockMvc.perform(get(BASE_URL + "queryById?id=test-customer-001"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        JSONObject json = JSON.parseObject(result);
        assertTrue(json.getBoolean("success"));
        assertEquals("CUST-TEST-01", json.getJSONObject("result").getString("customerCode"));
        assertEquals("测试来料加工客户", json.getJSONObject("result").getString("customerName"));
    }

    @Test
    @DisplayName("查询不存在的ID应返回失败")
    void testQueryByIdNotFound() throws Exception {
        when(bsCustomerService.getById("nonexistent")).thenReturn(null);

        String result = mockMvc.perform(get(BASE_URL + "queryById?id=nonexistent"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        JSONObject json = JSON.parseObject(result);
        assertFalse(json.getBoolean("success"), "查询不存在的ID应返回失败");
    }
}
//update-end---author:developer ---date:2026-06-21  for：客户管理 Controller 单元测试-----------