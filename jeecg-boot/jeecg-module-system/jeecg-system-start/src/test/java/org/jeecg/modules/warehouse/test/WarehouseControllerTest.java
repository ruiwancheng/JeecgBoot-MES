/**
 * WarehouseController 单元测试
 *
 * 基于 @WebMvcTest + @MockBean 模式
 * 运行: mvn test -DskipTests=false -pl jeecg-module-system/jeecg-system-start -Dtest=WarehouseControllerTest
 */

//update-begin---author:auto-gen ---date:2026-06-21  for：【测试】仓库管理 Controller 单元测试-----------
package org.jeecg.modules.warehouse.test;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.jeecg.common.modules.redis.client.JeecgRedisClient;
import org.jeecg.common.util.RedisUtil;
import org.jeecg.config.JeecgBaseConfig;
import org.jeecg.modules.base.service.BaseCommonService;
import org.jeecg.modules.warehouse.controller.WarehouseController;
import org.jeecg.modules.warehouse.entity.Warehouse;
import org.jeecg.modules.warehouse.entity.WarehouseLocation;
import org.jeecg.modules.warehouse.service.IWarehouseService;
import org.jeecg.modules.warehouse.service.IWarehouseLocationService;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * 仓库管理 Controller 层测试
 *
 * 覆盖: 列表/新增/编辑/删除/详情/批量删除/子表/边界
 */
@WebMvcTest(WarehouseController.class)
@DisplayName("仓库管理 Controller 接口测试")
class WarehouseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private IWarehouseService warehouseService;

    @MockBean
    private IWarehouseLocationService warehouseLocationService;

    // 基础设施 Mock Bean (JeecgBootExceptionHandler / Shiro / Redis 依赖)
    @MockBean
    private BaseCommonService baseCommonService;

    @MockBean
    private RedisUtil redisUtil;

    @MockBean
    private JeecgRedisClient jeecgRedisClient;

    @MockBean
    private JeecgBaseConfig jeecgBaseConfig;

    private final String BASE_URL = "/warehouse/warehouse/";

    private Warehouse buildTestWarehouse() {
        Warehouse w = new Warehouse();
        w.setId("test-warehouse-id-001");
        w.setWarehouseCode("WH-UNIT-001");
        w.setWarehouseName("单元测试仓库");
        w.setAddress("测试地址");
        w.setRemark("JUnit测试");
        return w;
    }

    // ==================== 分页列表 ====================

    @Test
    @DisplayName("should return paginated list when GET /list")
    void testList() throws Exception {
        Page<Warehouse> page = new Page<>(1, 10);
        Warehouse wh = buildTestWarehouse();
        page.setRecords(Arrays.asList(wh));
        page.setTotal(1);

        when(warehouseService.page(any(), any())).thenReturn(page);

        String result = mockMvc.perform(get(BASE_URL + "list?pageNo=1&pageSize=10"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        JSONObject json = JSON.parseObject(result);
        assertTrue(json.getBoolean("success"));
        assertEquals(200, json.getInteger("code").intValue());
        JSONObject resultObj = json.getJSONObject("result");
        assertEquals(1, resultObj.getInteger("total").intValue());
        assertEquals("WH-UNIT-001",
                resultObj.getJSONArray("records").getJSONObject(0).getString("warehouseCode"));
    }

    @Test
    @DisplayName("should return empty list when no records")
    void testListEmpty() throws Exception {
        Page<Warehouse> emptyPage = new Page<>(1, 10);
        when(warehouseService.page(any(), any())).thenReturn(emptyPage);

        String result = mockMvc.perform(get(BASE_URL + "list?pageNo=1&pageSize=10"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        JSONObject json = JSON.parseObject(result);
        assertTrue(json.getBoolean("success"));
        assertEquals(0, json.getJSONObject("result").getInteger("total").intValue());
    }

    // ==================== 新增 ====================

    @Test
    @DisplayName("should create warehouse when POST /addMain with valid data")
    void testAddMain() throws Exception {
        when(warehouseService.save(any(Warehouse.class))).thenReturn(true);

        JSONObject params = new JSONObject();
        params.put("warehouseCode", "WH-NEW-001");
        params.put("warehouseName", "新增测试仓库");
        params.put("address", "新仓库地址");
        params.put("remark", "API测试");

        String result = mockMvc.perform(post(BASE_URL + "addMain")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(params.toJSONString()))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        JSONObject json = JSON.parseObject(result);
        assertTrue(json.getBoolean("success"), "新增应返回成功");
        assertEquals(200, json.getInteger("code").intValue());

        // 验证 service.save 被调用了
        verify(warehouseService, times(1)).save(any(Warehouse.class));
    }

    @Test
    @DisplayName("should create warehouse with sub-table when POST /add")
    void testAddWithSubTable() throws Exception {
        doNothing().when(warehouseService).saveMain(any(Warehouse.class), anyList());

        JSONObject params = new JSONObject();
        params.put("warehouseCode", "WH-FULL-001");
        params.put("warehouseName", "含库位仓库");
        params.put("address", "完整测试地址");

        List<JSONObject> locations = new ArrayList<>();
        JSONObject loc = new JSONObject();
        loc.put("locationCode", "LOC-A01");
        loc.put("locationName", "A区1号库位");
        loc.put("category", "1");
        locations.add(loc);
        params.put("warehouseLocationList", locations);

        String result = mockMvc.perform(post(BASE_URL + "add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(params.toJSONString()))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        JSONObject json = JSON.parseObject(result);
        assertTrue(json.getBoolean("success"), "含子表新增应返回成功");
    }

    // ==================== 编辑 ====================

    @Test
    @DisplayName("should update warehouse when PUT /editMain with valid data")
    void testEditMain() throws Exception {
        when(warehouseService.updateById(any(Warehouse.class))).thenReturn(true);

        JSONObject params = new JSONObject();
        params.put("id", "test-warehouse-id-001");
        params.put("warehouseCode", "WH-UNIT-001");
        params.put("warehouseName", "单元测试仓库-已修改");
        params.put("address", "修改后地址");

        String result = mockMvc.perform(put(BASE_URL + "editMain")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(params.toJSONString()))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        JSONObject json = JSON.parseObject(result);
        assertTrue(json.getBoolean("success"), "编辑应返回成功");

        verify(warehouseService, times(1)).updateById(any(Warehouse.class));
    }

    // ==================== 删除 ====================

    @Test
    @DisplayName("should delete warehouse when DELETE /delete with valid id")
    void testDelete() throws Exception {
        doNothing().when(warehouseService).delMain("test-warehouse-id-001");

        String result = mockMvc.perform(delete(BASE_URL + "delete?id=test-warehouse-id-001"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        JSONObject json = JSON.parseObject(result);
        assertTrue(json.getBoolean("success"), "删除应返回成功");
    }

    @Test
    @DisplayName("should return error when DELETE /delete without id")
    void testDeleteMissingId() throws Exception {
        String result = mockMvc.perform(delete(BASE_URL + "delete"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        JSONObject json = JSON.parseObject(result);
        assertFalse(json.getBoolean("success"), "缺少id应返回失败");
    }

    // ==================== 批量删除 ====================

    @Test
    @DisplayName("should batch delete when DELETE /deleteBatch with valid ids")
    void testDeleteBatch() throws Exception {
        doNothing().when(warehouseService).delBatchMain(anyList());

        String result = mockMvc.perform(delete(BASE_URL + "deleteBatch?ids=id1,id2,id3"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        JSONObject json = JSON.parseObject(result);
        assertTrue(json.getBoolean("success"), "批量删除应返回成功");
    }

    // ==================== 查询详情 ====================

    @Test
    @DisplayName("should return warehouse when GET /queryById with valid id")
    void testQueryById() throws Exception {
        Warehouse wh = buildTestWarehouse();
        when(warehouseService.getById("test-warehouse-id-001")).thenReturn(wh);

        String result = mockMvc.perform(get(BASE_URL + "queryById?id=test-warehouse-id-001"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        JSONObject json = JSON.parseObject(result);
        assertTrue(json.getBoolean("success"));
        assertEquals("WH-UNIT-001",
                json.getJSONObject("result").getString("warehouseCode"));
        assertEquals("单元测试仓库",
                json.getJSONObject("result").getString("warehouseName"));
    }

    @Test
    @DisplayName("should return error when querying non-existent id")
    void testQueryByIdNotFound() throws Exception {
        when(warehouseService.getById("nonexistent")).thenReturn(null);

        String result = mockMvc.perform(get(BASE_URL + "queryById?id=nonexistent"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        JSONObject json = JSON.parseObject(result);
        assertFalse(json.getBoolean("success"), "查询不存在的ID应返回失败");
    }

    // ==================== 子表操作 ====================

    @Test
    @DisplayName("should return sub-table list when GET /listWarehouseLocationByMainId")
    void testListSubByMainId() throws Exception {
        Page<WarehouseLocation> page = new Page<>(1, 10);
        WarehouseLocation loc = new WarehouseLocation();
        loc.setId("loc-001");
        loc.setWarehouseId("test-warehouse-id-001");
        loc.setLocationCode("LOC-A01");
        loc.setLocationName("A区1号");
        loc.setCategory("1");
        page.setRecords(Arrays.asList(loc));
        page.setTotal(1);

        when(warehouseLocationService.page(any(), any())).thenReturn(page);

        String result = mockMvc.perform(get(BASE_URL
                        + "listWarehouseLocationByMainId?warehouseId=test-warehouse-id-001&pageNo=1&pageSize=10"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        JSONObject json = JSON.parseObject(result);
        assertTrue(json.getBoolean("success"));
        assertEquals(1, json.getJSONObject("result").getInteger("total").intValue());
    }

    @Test
    @DisplayName("should add sub-table record when POST /addWarehouseLocation")
    void testAddSub() throws Exception {
        when(warehouseLocationService.save(any(WarehouseLocation.class))).thenReturn(true);

        JSONObject params = new JSONObject();
        params.put("warehouseId", "test-warehouse-id-001");
        params.put("locationCode", "LOC-NEW-01");
        params.put("locationName", "新库位测试");
        params.put("category", "1");
        params.put("productName", "物料-X");
        params.put("capacity", 100);
        params.put("capacityUnit", "1");

        String result = mockMvc.perform(post(BASE_URL + "addWarehouseLocation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(params.toJSONString()))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        JSONObject json = JSON.parseObject(result);
        assertTrue(json.getBoolean("success"), "库位新增应返回成功");
    }

    @Test
    @DisplayName("should delete sub-table record when DELETE /deleteWarehouseLocation")
    void testDeleteSub() throws Exception {
        when(warehouseLocationService.removeById("loc-001")).thenReturn(true);

        String result = mockMvc.perform(delete(BASE_URL + "deleteWarehouseLocation?id=loc-001"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        JSONObject json = JSON.parseObject(result);
        assertTrue(json.getBoolean("success"), "库位删除应返回成功");
    }

    // ==================== 空参数列表 ====================

    @Test
    @DisplayName("should handle list without params gracefully")
    void testListDefaultParams() throws Exception {
        Page<Warehouse> page = new Page<>(1, 10);
        when(warehouseService.page(any(), any())).thenReturn(page);

        String result = mockMvc.perform(get(BASE_URL + "list"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        JSONObject json = JSON.parseObject(result);
        assertTrue(json.getBoolean("success"));
    }

    @Test
    @DisplayName("should handle sub-table list without warehouseId gracefully")
    void testSubListWithoutWarehouseId() throws Exception {
        Page<WarehouseLocation> page = new Page<>(1, 10);
        when(warehouseLocationService.page(any(), any())).thenReturn(page);

        String result = mockMvc.perform(get(BASE_URL
                        + "listWarehouseLocationByMainId?pageNo=1&pageSize=10"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        JSONObject json = JSON.parseObject(result);
        assertTrue(json.getBoolean("success"));
    }
}
//update-end---author:auto-gen ---date:2026-06-21  for：【测试】仓库管理 Controller 单元测试-----------
