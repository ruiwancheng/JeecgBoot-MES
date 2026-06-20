/**
 * {{EntityName}}Controller 单元测试
 *
 * 基于 @WebMvcTest + @MockBean 模式，无需启动 DB/Redis
 *
 * 使用方式:
 *   1. 全局替换 {{EntityName}} → 实体名 (如 Warehouse)
 *   2. 全局替换 {{modulePath}} → 模块路径 (如 /warehouse/warehouse)
 *   3. 全局替换 {{entityVar}} → 实体变量名 (如 warehouse)
 *   4. 全局替换 {{entityPackage}} → 实体包路径 (如 org.jeecg.modules.warehouse.entity)
 *   5. 替换 {{testValue_*}} 占位符为实际测试值
 *   6. 运行: mvn test -DskipTests=false -Dtest={{EntityName}}ControllerTest
 */

//update-begin---author:developer ---date:2026-06-21  for：【测试】{{EntityName}}Controller 单元测试-----------
package org.jeecg.modules.{{moduleName}}.test;

import org.jeecg.modules.{{moduleName}}.controller.{{EntityName}}Controller;
import org.jeecg.modules.{{moduleName}}.entity.{{EntityName}};
import org.jeecg.modules.{{moduleName}}.service.I{{EntityName}}Service;
import org.jeecg.common.api.vo.Result;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.ObjectMapper;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * {{EntityName}} Controller 层测试
 *
 * 覆盖: 列表/新增/编辑/删除/详情/鉴权/边界
 */
@WebMvcTest({{EntityName}}Controller.class)
@DisplayName("{{EntityName}} Controller 接口测试")
class {{EntityName}}ControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private I{{EntityName}}Service {{entityVar}}Service;

    // 如有子表 Service，取消注释:
    // @MockBean
    // private I{{EntityName}}LocationService {{entityVar}}LocationService;

    @Autowired
    private ObjectMapper objectMapper;

    private {{EntityName}} testEntity;

    @BeforeEach
    void setUp() {
        testEntity = new {{EntityName}}();
        testEntity.setId("test-id-001");
        // TODO: 设置实体必填字段
        // testEntity.set{{EntityName}}Code("{{testValue_code}}");
        // testEntity.set{{EntityName}}Name("{{testValue_name}}");
    }

    // ==================== 列表查询 ====================

    @Nested
    @DisplayName("GET /list - 分页列表查询")
    class ListTests {

        @Test
        @DisplayName("should return paginated list when valid params")
        void testListSuccess() throws Exception {
            IPage<{{EntityName}}> page = new Page<>(1, 10);
            when({{entityVar}}Service.page(any(), any())).thenReturn(page);

            mockMvc.perform(get("{{modulePath}}/list?pageNo=1&pageSize=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.code").value(200));
        }

        @Test
        @DisplayName("should use default page params when not provided")
        void testListDefaultPagination() throws Exception {
            IPage<{{EntityName}}> page = new Page<>(1, 10);
            when({{entityVar}}Service.page(any(), any())).thenReturn(page);

            mockMvc.perform(get("{{modulePath}}/list"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
        }
    }

    // ==================== 新增 ====================

    @Nested
    @DisplayName("POST /addMain - 新增主表")
    class AddTests {

        @Test
        @DisplayName("should create entity when valid data")
        void testAddSuccess() throws Exception {
            when({{entityVar}}Service.save(any({{EntityName}}.class))).thenReturn(true);

            mockMvc.perform(post("{{modulePath}}/addMain")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(testEntity)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
        }

        @Test
        @DisplayName("should return error when required fields missing")
        void testAddMissingRequired() throws Exception {
            {{EntityName}} emptyEntity = new {{EntityName}}();

            mockMvc.perform(post("{{modulePath}}/addMain")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(emptyEntity)))
                .andExpect(jsonPath("$.success").value(false));
        }
    }

    // ==================== 编辑 ====================

    @Nested
    @DisplayName("PUT /editMain - 编辑主表")
    class EditTests {

        @Test
        @DisplayName("should update entity when valid data")
        void testEditSuccess() throws Exception {
            when({{entityVar}}Service.updateById(any({{EntityName}}.class))).thenReturn(true);

            mockMvc.perform(put("{{modulePath}}/editMain")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(testEntity)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
        }
    }

    // ==================== 删除 ====================

    @Nested
    @DisplayName("DELETE /delete - 通过id删除")
    class DeleteTests {

        @Test
        @DisplayName("should delete entity when valid id")
        void testDeleteSuccess() throws Exception {
            when({{entityVar}}Service.removeById("test-id-001")).thenReturn(true);

            mockMvc.perform(delete("{{modulePath}}/delete?id=test-id-001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
        }

        @Test
        @DisplayName("should return error when id missing")
        void testDeleteMissingId() throws Exception {
            mockMvc.perform(delete("{{modulePath}}/delete"))
                .andExpect(status().isBadRequest());
        }
    }

    // ==================== 查询详情 ====================

    @Nested
    @DisplayName("GET /queryById - 通过id查询")
    class QueryTests {

        @Test
        @DisplayName("should return entity when valid id")
        void testQueryByIdSuccess() throws Exception {
            when({{entityVar}}Service.getById("test-id-001")).thenReturn(testEntity);

            mockMvc.perform(get("{{modulePath}}/queryById?id=test-id-001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.result.id").value("test-id-001"));
        }

        @Test
        @DisplayName("should return null when id not found")
        void testQueryByIdNotFound() throws Exception {
            when({{entityVar}}Service.getById("nonexistent")).thenReturn(null);

            mockMvc.perform(get("{{modulePath}}/queryById?id=nonexistent"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(false));
        }
    }

    // ==================== 批量删除 ====================

    @Nested
    @DisplayName("DELETE /deleteBatch - 批量删除")
    class BatchDeleteTests {

        @Test
        @DisplayName("should batch delete when valid ids")
        void testDeleteBatchSuccess() throws Exception {
            when({{entityVar}}Service.removeByIds(anyList())).thenReturn(true);

            mockMvc.perform(delete("{{modulePath}}/deleteBatch?ids=id1,id2,id3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
        }
    }

    // ==================== 边界条件 ====================

    @Nested
    @DisplayName("边界条件测试")
    class BoundaryTests {

        @Test
        @DisplayName("should handle empty search results")
        void testListEmpty() throws Exception {
            IPage<{{EntityName}}> emptyPage = new Page<>(1, 10);
            when({{entityVar}}Service.page(any(), any())).thenReturn(emptyPage);

            mockMvc.perform(get("{{modulePath}}/list?pageNo=1&pageSize=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.result.total").value(0));
        }

        @Test
        @DisplayName("should handle invalid page params gracefully")
        void testListInvalidPage() throws Exception {
            IPage<{{EntityName}}> page = new Page<>(1, 10);
            when({{entityVar}}Service.page(any(), any())).thenReturn(page);

            mockMvc.perform(get("{{modulePath}}/list?pageNo=-1&pageSize=999999"))
                .andExpect(status().isOk());
        }
    }
}
//update-end---author:developer ---date:2026-06-21  for：【测试】{{EntityName}}Controller 单元测试-----------
