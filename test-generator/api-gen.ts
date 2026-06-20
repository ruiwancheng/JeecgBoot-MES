#!/usr/bin/env npx tsx
/**
 * API 测试生成器 — 从 Java Controller 生成测试骨架
 *
 * 用法:
 *   npx tsx test-generator/api-gen.ts <Controller.java路径> [输出目录]
 *
 * 示例:
 *   npx tsx test-generator/api-gen.ts jeecg-boot/.../WarehouseController.java
 *   npx tsx test-generator/api-gen.ts jeecg-boot/.../WarehouseController.java --output test/api/
 *
 * 输出:
 *   1. {Entity}ControllerTest.java  — JUnit @WebMvcTest 骨架
 *   2. {module}.test.ts              — TS HTTP 集成测试骨架
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================
// 类型定义
// ============================================================

interface EndpointInfo {
  httpMethod: string;
  path: string;
  methodName: string;
  summary: string;
  permission: string;
  parameters: ParamInfo[];
  returnType: string;
  hasBody: boolean;
  isSubTable: boolean;
}

interface ParamInfo {
  name: string;
  type: string;
  annotation: string; // @RequestParam, @RequestBody, etc.
  required: boolean;
  defaultValue: string;
}

interface ControllerInfo {
  packageName: string;
  entityName: string;
  modulePath: string;       // @RequestMapping 类级别路径
  endpoints: EndpointInfo[];
  serviceFieldName: string;
}

// ============================================================
// Java 源码解析
// ============================================================

function parseController(sourcePath: string): ControllerInfo {
  const content = fs.readFileSync(sourcePath, 'utf-8');

  // 提取包名
  const pkgMatch = content.match(/package\s+([\w.]+)\s*;/);
  const packageName = pkgMatch?.[1] || 'unknown';

  // 提取类名 (从文件名)
  const fileName = path.basename(sourcePath, '.java');
  const entityName = fileName.replace('Controller', '');

  // 提取 @RequestMapping 类级别路径
  const reqMapMatch = content.match(/@RequestMapping\s*\(\s*["']([^"']+)["']\s*\)/);
  const modulePath = reqMapMatch?.[1] || `/${entityName.toLowerCase()}`;

  // 提取 @Tag 描述
  const tagMatch = content.match(/@Tag\s*\([^)]*name\s*=\s*["']([^"']+)["']/);
  const tagName = tagMatch?.[1] || entityName;

  // 提取注入的 Service 字段名
  const serviceMatch = content.match(/private\s+I(\w+)Service\s+(\w+Service)\s*;/);
  const serviceFieldName = serviceMatch?.[2] || (entityName.charAt(0).toLowerCase() + entityName.slice(1) + 'Service');

  // 提取所有端点方法
  const endpoints: EndpointInfo[] = [];

  // 匹配每个方法
  const methodRegex = /(@(?:GetMapping|PostMapping|PutMapping|DeleteMapping|RequestMapping)\s*\([^)]+\))\s*(?:@AutoLog[^)]*\)\s*)?(?:@Operation\s*\([^)]*\)\s*)?(?:@RequiresPermissions\s*\(\s*["']([^"']+)["']\s*\)\s*)?(?:(\w[\w\s<>]*)\s+)?(\w+)\s*\(([^)]*)\)/gs;

  let match;
  while ((match = methodRegex.exec(content)) !== null) {
    const annotationBlock = match[1];
    const permission = match[2] || '';
    const returnType = match[3] || 'Result<?>';
    const methodName = match[4];
    const paramsStr = match[5] || '';

    // 提取 HTTP 方法和路径
    let httpMethod = 'GET';
    let endpointPath = '';

    if (annotationBlock.includes('@GetMapping')) {
      httpMethod = 'GET';
      const pm = annotationBlock.match(/@GetMapping\s*\(\s*["']([^"']*)["']/);
      endpointPath = pm?.[1] || '';
    } else if (annotationBlock.includes('@PostMapping')) {
      httpMethod = 'POST';
      const pm = annotationBlock.match(/@PostMapping\s*\(\s*["']([^"']*)["']/);
      endpointPath = pm?.[1] || '';
    } else if (annotationBlock.includes('@PutMapping')) {
      httpMethod = 'PUT';
      const pm = annotationBlock.match(/@PutMapping\s*\(\s*["']([^"']*)["']/);
      endpointPath = pm?.[1] || '';
    } else if (annotationBlock.includes('@DeleteMapping')) {
      httpMethod = 'DELETE';
      const pm = annotationBlock.match(/@DeleteMapping\s*\(\s*["']([^"']*)["']/);
      endpointPath = pm?.[1] || '';
    } else if (annotationBlock.includes('@RequestMapping')) {
      // 从 @RequestMapping 中提取 method
      const methodMatch = annotationBlock.match(/method\s*=\s*\{?\s*RequestMethod\.(\w+)/);
      if (methodMatch) {
        switch (methodMatch[1]) {
          case 'POST': httpMethod = 'POST'; break;
          case 'PUT': httpMethod = 'PUT'; break;
          case 'DELETE': httpMethod = 'DELETE'; break;
          default: httpMethod = 'GET';
        }
      }
      const pm = annotationBlock.match(/value\s*=\s*["']([^"']*)["']/);
      endpointPath = pm?.[1] || '';
    }

    // 解析参数
    const parameters: ParamInfo[] = [];
    let hasBody = false;

    if (paramsStr.trim()) {
      const paramParts = splitParams(paramsStr);
      for (const part of paramParts) {
        const pInfo: ParamInfo = {
          name: '',
          type: 'String',
          annotation: '',
          required: false,
          defaultValue: '',
        };

        // @RequestParam
        const rpMatch = part.match(/@RequestParam\s*\([^)]*\)/);
        if (rpMatch) {
          pInfo.annotation = '@RequestParam';
          const nmMatch = rpMatch[0].match(/name\s*=\s*["'](\w+)["']/);
          pInfo.name = nmMatch?.[1] || '';
          const reqMatch = rpMatch[0].match(/required\s*=\s*(true|false)/);
          pInfo.required = reqMatch?.[1] === 'true';
          const dvMatch = rpMatch[0].match(/defaultValue\s*=\s*["']([^"']*)["']/);
          pInfo.defaultValue = dvMatch?.[1] || '';
          // 提取类型
          const typeMatch = part.match(/(\w+)\s+\w+\s*[,)]?\s*$/);
          if (typeMatch) pInfo.type = typeMatch[1];
        }

        // @RequestBody
        if (part.includes('@RequestBody')) {
          pInfo.annotation = '@RequestBody';
          hasBody = true;
          const typeMatch = part.match(/@RequestBody\s+(\w+)/);
          if (typeMatch) {
            pInfo.type = typeMatch[1];
            pInfo.name = typeMatch[1].charAt(0).toLowerCase() + typeMatch[1].slice(1);
          }
        }

        // HttpServletRequest
        if (part.includes('HttpServletRequest')) {
          pInfo.name = 'req';
          pInfo.type = 'HttpServletRequest';
          pInfo.annotation = '(framework)';
        }

        // HttpServletResponse
        if (part.includes('HttpServletResponse')) {
          pInfo.name = 'resp';
          pInfo.type = 'HttpServletResponse';
          pInfo.annotation = '(framework)';
        }

        parameters.push(pInfo);
      }
    }

    // 判断是否为子表端点
    const isSubTable = methodName.toLowerCase().includes('warehouselocation')
      || methodName.toLowerCase().includes('location');

    // 提取 Operation summary
    const summaryMatch = content.slice(match.index).match(/@Operation\s*\([^)]*summary\s*=\s*["']([^"']*)["']/);
    const summary = summaryMatch?.[1] || methodName;

    endpoints.push({
      httpMethod,
      path: endpointPath,
      methodName,
      summary,
      permission,
      parameters,
      returnType,
      hasBody,
      isSubTable,
    });
  }

  return { packageName, entityName, modulePath, endpoints, serviceFieldName };
}

/** 简单参数分割 (处理 Java 方法参数列表) */
function splitParams(paramsStr: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';

  for (const ch of paramsStr) {
    if (ch === '(' || ch === '<') depth++;
    else if (ch === ')' || ch === '>') depth--;
    if (ch === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

// ============================================================
// 测试代码生成
// ============================================================

function generateJavaTest(info: ControllerInfo): string {
  const { packageName, entityName, modulePath, endpoints, serviceFieldName } = info;
  const entityVar = entityName.charAt(0).toLowerCase() + entityName.slice(1);

  const mainEndpoints = endpoints.filter(e => !e.isSubTable);
  const subEndpoints = endpoints.filter(e => e.isSubTable);
  const hasSub = subEndpoints.length > 0;

  const getEndpoints = mainEndpoints.filter(e => e.httpMethod === 'GET');
  const postEndpoints = mainEndpoints.filter(e => e.httpMethod === 'POST' && !e.methodName.toLowerCase().includes('edit'));
  const putEndpoints = mainEndpoints.filter(e => e.httpMethod === 'PUT' || (e.httpMethod === 'POST' && e.methodName.toLowerCase().includes('edit')));
  const deleteEndpoints = mainEndpoints.filter(e => e.httpMethod === 'DELETE');

  const lines: string[] = [];

  lines.push(`/**`);
  lines.push(` * ${entityName}Controller 单元测试`);
  lines.push(` *`);
  lines.push(` * 自动生成于: ${new Date().toISOString().split('T')[0]}`);
  lines.push(` * 来源: ${packageName}.${entityName}Controller`);
  lines.push(` *`);
  lines.push(` * 运行: mvn test -DskipTests=false -Dtest=${entityName}ControllerTest`);
  lines.push(` */`);
  lines.push('');
  lines.push('//update-begin---author:auto-gen ---date:' + new Date().toISOString().split('T')[0] + '  for：【测试】' + entityName + 'Controller 单元测试-----------');
  lines.push(`package org.jeecg.modules.${entityName.toLowerCase()}.test;`);
  lines.push('');
  lines.push(`import ${packageName}.${entityName}Controller;`);
  lines.push(`import ${packageName.replace('controller', 'entity')}.${entityName};`);
  if (hasSub) {
    lines.push(`import ${packageName.replace('controller', 'entity')}.${entityName}Location;`);
  }
  lines.push(`import ${packageName.replace('controller', 'service')}.I${entityName}Service;`);
  if (hasSub) {
    lines.push(`import ${packageName.replace('controller', 'service')}.I${entityName}LocationService;`);
  }
  lines.push(`import org.junit.jupiter.api.*;`);
  lines.push(`import org.springframework.beans.factory.annotation.Autowired;`);
  lines.push(`import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;`);
  lines.push(`import org.springframework.boot.test.mock.mockito.MockBean;`);
  lines.push(`import org.springframework.http.MediaType;`);
  lines.push(`import org.springframework.test.web.servlet.MockMvc;`);
  lines.push(`import com.baomidou.mybatisplus.core.metadata.IPage;`);
  lines.push(`import com.baomidou.mybatisplus.extension.plugins.pagination.Page;`);
  lines.push(`import com.fasterxml.jackson.databind.ObjectMapper;`);
  lines.push('');
  lines.push(`import static org.mockito.ArgumentMatchers.*;`);
  lines.push(`import static org.mockito.Mockito.*;`);
  lines.push(`import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;`);
  lines.push(`import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;`);
  lines.push('');
  lines.push(`/**`);
  lines.push(` * ${entityName} Controller 层测试 (自动生成骨架，请替换测试值)`);
  lines.push(` *`);
  lines.push(` * 覆盖: ${endpoints.length} 个端点`);
  lines.push(` */`);
  lines.push(`@WebMvcTest(${entityName}Controller.class)`);
  lines.push(`@DisplayName("${entityName} Controller")`);
  lines.push(`class ${entityName}ControllerTest {`);
  lines.push('');
  lines.push(`    @Autowired`);
  lines.push(`    private MockMvc mockMvc;`);
  lines.push('');
  lines.push(`    @MockBean`);
  lines.push(`    private I${entityName}Service ${serviceFieldName};`);
  if (hasSub) {
    lines.push('');
    lines.push(`    @MockBean`);
    lines.push(`    private I${entityName}LocationService ${entityVar}LocationService;`);
  }
  lines.push('');
  lines.push(`    @Autowired`);
  lines.push(`    private ObjectMapper objectMapper;`);
  lines.push('');
  lines.push(`    private ${entityName} testEntity;`);
  lines.push('');
  lines.push(`    @BeforeEach`);
  lines.push(`    void setUp() {`);
  lines.push(`        testEntity = new ${entityName}();`);
  lines.push(`        testEntity.setId("test-id-001");`);
  lines.push(`        // TODO: 设置必填字段值`);
  lines.push(`        // testEntity.setCode("TEST-001");`);
  lines.push(`        // testEntity.setName("测试${entityName}");`);
  lines.push(`    }`);

  // ===== 生成各端点测试 =====
  // 列表查询
  const listEndpoint = getEndpoints.find(e => e.path.includes('list') && !e.methodName.toLowerCase().includes('by'));
  if (listEndpoint) {
    const listPath = listEndpoint.path || '/list';
    lines.push('');
    lines.push(`    @Nested`);
    lines.push(`    @DisplayName("GET ${modulePath}${listPath} - 分页列表")`);
    lines.push(`    class ListTests {`);
    lines.push(`        @Test`);
    lines.push(`        @DisplayName("should return paginated list")`);
    lines.push(`        void testList() throws Exception {`);
    lines.push(`            IPage<${entityName}> page = new Page<>(1, 10);`);
    lines.push(`            when(${serviceFieldName}.page(any(), any())).thenReturn(page);`);
    lines.push(`            mockMvc.perform(get("${modulePath}${listPath}?pageNo=1&pageSize=10"))`);
    lines.push(`                .andExpect(status().isOk())`);
    lines.push(`                .andExpect(jsonPath("$.success").value(true));`);
    lines.push(`        }`);
    lines.push(`    }`);
  }

  // 新增
  const addEndpoint = postEndpoints.find(e => e.path.includes('add') || e.methodName.toLowerCase().includes('add'));
  if (addEndpoint) {
    const addPath = addEndpoint.path || '/add';
    lines.push('');
    lines.push(`    @Nested`);
    lines.push(`    @DisplayName("POST ${modulePath}${addPath} - 新增")`);
    lines.push(`    class AddTests {`);
    lines.push(`        @Test`);
    lines.push(`        @DisplayName("should create entity")`);
    lines.push(`        void testAdd() throws Exception {`);
    lines.push(`            when(${serviceFieldName}.save(any(${entityName}.class))).thenReturn(true);`);
    lines.push(`            mockMvc.perform(post("${modulePath}${addPath}")`);
    lines.push(`                    .contentType(MediaType.APPLICATION_JSON)`);
    lines.push(`                    .content(objectMapper.writeValueAsString(testEntity)))`);
    lines.push(`                .andExpect(status().isOk())`);
    lines.push(`                .andExpect(jsonPath("$.success").value(true));`);
    lines.push(`        }`);
    lines.push(`    }`);
  }

  // 编辑
  const editEndpoint = putEndpoints.find(e =>
    e.path.includes('edit') || e.methodName.toLowerCase().includes('edit'));
  if (editEndpoint) {
    const editPath = editEndpoint.path || '/edit';
    lines.push('');
    lines.push(`    @Nested`);
    lines.push(`    @DisplayName("PUT ${modulePath}${editPath} - 编辑")`);
    lines.push(`    class EditTests {`);
    lines.push(`        @Test`);
    lines.push(`        @DisplayName("should update entity")`);
    lines.push(`        void testEdit() throws Exception {`);
    lines.push(`            when(${serviceFieldName}.updateById(any(${entityName}.class))).thenReturn(true);`);
    lines.push(`            mockMvc.perform(put("${modulePath}${editPath}")`);
    lines.push(`                    .contentType(MediaType.APPLICATION_JSON)`);
    lines.push(`                    .content(objectMapper.writeValueAsString(testEntity)))`);
    lines.push(`                .andExpect(status().isOk())`);
    lines.push(`                .andExpect(jsonPath("$.success").value(true));`);
    lines.push(`        }`);
    lines.push(`    }`);
  }

  // 删除
  const delEndpoint = deleteEndpoints.find(e => !e.methodName.toLowerCase().includes('batch'));
  if (delEndpoint) {
    const delPath = delEndpoint.path || '/delete';
    lines.push('');
    lines.push(`    @Nested`);
    lines.push(`    @DisplayName("DELETE ${modulePath}${delPath} - 删除")`);
    lines.push(`    class DeleteTests {`);
    lines.push(`        @Test`);
    lines.push(`        @DisplayName("should delete when valid id")`);
    lines.push(`        void testDelete() throws Exception {`);
    lines.push(`            when(${serviceFieldName}.removeById("test-id-001")).thenReturn(true);`);
    lines.push(`            mockMvc.perform(delete("${modulePath}${delPath}?id=test-id-001"))`);
    lines.push(`                .andExpect(status().isOk())`);
    lines.push(`                .andExpect(jsonPath("$.success").value(true));`);
    lines.push(`        }`);
    lines.push(`    }`);
  }

  // 查询详情
  const queryEndpoint = getEndpoints.find(e => e.path.includes('query') || e.path.includes('ById'));
  if (queryEndpoint) {
    const queryPath = queryEndpoint.path || '/queryById';
    lines.push('');
    lines.push(`    @Nested`);
    lines.push(`    @DisplayName("GET ${modulePath}${queryPath} - 查询详情")`);
    lines.push(`    class QueryTests {`);
    lines.push(`        @Test`);
    lines.push(`        @DisplayName("should return entity by id")`);
    lines.push(`        void testQueryById() throws Exception {`);
    lines.push(`            when(${serviceFieldName}.getById("test-id-001")).thenReturn(testEntity);`);
    lines.push(`            mockMvc.perform(get("${modulePath}${queryPath}?id=test-id-001"))`);
    lines.push(`                .andExpect(status().isOk())`);
    lines.push(`                .andExpect(jsonPath("$.success").value(true));`);
    lines.push(`        }`);
    lines.push(`    }`);
  }

  // 批量删除
  const batchDelEndpoint = deleteEndpoints.find(e => e.methodName.toLowerCase().includes('batch'));
  if (batchDelEndpoint) {
    const batchPath = batchDelEndpoint.path || '/deleteBatch';
    lines.push('');
    lines.push(`    @Nested`);
    lines.push(`    @DisplayName("DELETE ${modulePath}${batchPath} - 批量删除")`);
    lines.push(`    class BatchDeleteTests {`);
    lines.push(`        @Test`);
    lines.push(`        @DisplayName("should batch delete")`);
    lines.push(`        void testDeleteBatch() throws Exception {`);
    lines.push(`            when(${serviceFieldName}.removeByIds(anyList())).thenReturn(true);`);
    lines.push(`            mockMvc.perform(delete("${modulePath}${batchPath}?ids=id1,id2"))`);
    lines.push(`                .andExpect(status().isOk())`);
    lines.push(`                .andExpect(jsonPath("$.success").value(true));`);
    lines.push(`        }`);
    lines.push(`    }`);
  }

  // 子表列表
  const subListEndpoint = subEndpoints.find(e => e.httpMethod === 'GET' && e.path.includes('list'));
  if (subListEndpoint) {
    lines.push('');
    lines.push(`    @Nested`);
    lines.push(`    @DisplayName("子表 ${subListEndpoint.summary}")`);
    lines.push(`    class SubTableTests {`);
    lines.push(`        @Test`);
    lines.push(`        @DisplayName("should return sub-table list")`);
    lines.push(`        void testSubList() throws Exception {`);
    lines.push(`            IPage<${entityName}Location> page = new Page<>(1, 10);`);
    lines.push(`            when(${entityVar}LocationService.page(any(), any())).thenReturn(page);`);
    lines.push(`            mockMvc.perform(get("${modulePath}${subListEndpoint.path}?${entityVar}Id=test-id-001&pageNo=1&pageSize=10"))`);
    lines.push(`                .andExpect(status().isOk())`);
    lines.push(`                .andExpect(jsonPath("$.success").value(true));`);
    lines.push(`        }`);
    lines.push(`    }`);
  }

  lines.push('');
  lines.push(`    @Nested`);
  lines.push(`    @DisplayName("边界条件")`);
  lines.push(`    class BoundaryTests {`);
  lines.push(`        @Test`);
  lines.push(`        @DisplayName("should handle empty results")`);
  lines.push(`        void testEmptyResult() throws Exception {`);
  lines.push(`            IPage<${entityName}> emptyPage = new Page<>(1, 10);`);
  lines.push(`            when(${serviceFieldName}.page(any(), any())).thenReturn(emptyPage);`);
  lines.push(`            mockMvc.perform(get("${modulePath}/list"))`);
  lines.push(`                .andExpect(status().isOk())`);
  lines.push(`                .andExpect(jsonPath("$.result.total").value(0));`);
  lines.push(`        }`);
  lines.push('');
  lines.push(`        @Test`);
  lines.push(`        @DisplayName("should return error for non-existent id")`);
  lines.push(`        void testNotFound() throws Exception {`);
  lines.push(`            when(${serviceFieldName}.getById("nonexistent")).thenReturn(null);`);
  lines.push(`            mockMvc.perform(get("${modulePath}/queryById?id=nonexistent"))`);
  lines.push(`                .andExpect(status().isOk())`);
  lines.push(`                .andExpect(jsonPath("$.success").value(false));`);
  lines.push(`        }`);
  lines.push(`    }`);
  lines.push(`}`);
  lines.push('//update-end---author:auto-gen ---date:' + new Date().toISOString().split('T')[0] + '  for：【测试】' + entityName + 'Controller 单元测试-----------');
  lines.push('');

  return lines.join('\n');
}

function generateTSTest(info: ControllerInfo): string {
  const { entityName, modulePath, endpoints } = info;
  const moduleName = entityName.toLowerCase();
  const mainEndpoints = endpoints.filter(e => !e.isSubTable);
  const subEndpoints = endpoints.filter(e => e.isSubTable);

  const lines: string[] = [];
  lines.push(`/**`);
  lines.push(` * ${entityName}管理 — 后端接口测试 (自动生成骨架)`);
  lines.push(` *`);
  lines.push(` * 生成时间: ${new Date().toISOString().split('T')[0]}`);
  lines.push(` * 来源: ${entityName}Controller — ${endpoints.length} 个端点`);
  lines.push(` *`);
  lines.push(` * 前置: export TEST_TOKEN=你的token`);
  lines.push(` * 运行: npx tsx test/api/${moduleName}.test.ts`);
  lines.push(` */`);
  lines.push('');
  lines.push(`import { getToken, get, post, put, del, assertSuccess, assertFail } from '../utils/test-helper';`);
  lines.push('');
  lines.push(`const MAIN_PATH = '${modulePath}';`);
  lines.push(`const SUB_PATH  = '${modulePath}';`);
  lines.push('');
  lines.push(`let TOKEN = '';`);
  lines.push(`let mainId = '';`);
  lines.push(`let subId = '';`);
  lines.push('');

  // main function
  lines.push(`async function main() {`);
  lines.push(`  console.log('\\n🧪 ${entityName}管理 API 测试\\n');`);
  lines.push(`  TOKEN = getToken();`);
  lines.push('');

  let testNum = 0;

  // 鉴权测试
  lines.push(`  await testUnauthorized();`);
  testNum++;

  // 列表
  if (mainEndpoints.some(e => e.httpMethod === 'GET' && e.path.includes('list'))) {
    lines.push(`  await testListAll();`);
    testNum++;
  }

  // 新增
  if (mainEndpoints.some(e => e.httpMethod === 'POST')) {
    lines.push(`  await testAddMain();`);
    testNum++;
  }

  // 详情
  if (mainEndpoints.some(e => e.httpMethod === 'GET' && (e.path.includes('query') || e.path.includes('ById')))) {
    lines.push(`  await testQueryById();`);
    testNum++;
  }

  // 编辑
  if (mainEndpoints.some(e => e.httpMethod === 'PUT' || (e.httpMethod === 'POST' && e.methodName.toLowerCase().includes('edit')))) {
    lines.push(`  await testEditMain();`);
    testNum++;
  }

  // 子表
  if (subEndpoints.length > 0) {
    lines.push(`  await testListSubByMainId();`);
    lines.push(`  await testAddSub();`);
    lines.push(`  await testEditSub();`);
    lines.push(`  await testDeleteSub();`);
    testNum += 4;
  }

  // 边界
  lines.push(`  await testBoundary();`);
  testNum++;

  // 清理
  lines.push('');
  lines.push(`  if (mainId) {`);
  lines.push(`    await del(MAIN_PATH + '/delete?id=' + mainId, TOKEN);`);
  lines.push(`    console.log('  🧹 测试数据已清理');`);
  lines.push(`  }`);
  lines.push('');
  lines.push(`  console.log('\\n🎉 全部测试通过\\n');`);
  lines.push(`}`);

  // 各测试函数
  lines.push('');
  lines.push(`async function testUnauthorized() {`);
  lines.push(`  console.log('[1/${testNum}] 未登录鉴权...');`);
  lines.push(`  const res = await get(MAIN_PATH + '/list?pageNo=1&pageSize=5');`);
  lines.push(`  assertFail(res, 401);`);
  lines.push(`  console.log('  ✅ 401\\n');`);
  lines.push(`}`);

  let step = 2;
  lines.push('');
  lines.push(`async function testListAll() {`);
  lines.push(`  console.log('[${step}/${testNum}] 分页列表...');`);
  lines.push(`  const res = await get(MAIN_PATH + '/list?pageNo=1&pageSize=5', TOKEN);`);
  lines.push(`  assertSuccess(res, '列表查询失败');`);
  lines.push(`  console.log(\`  ✅ 共 \${res.result?.total || 0} 条\\n\`);`);
  lines.push(`}`);
  step++;

  lines.push('');
  lines.push(`async function testAddMain() {`);
  lines.push(`  console.log('[${step}/${testNum}] 新增...');`);
  lines.push(`  const res = await post(MAIN_PATH + '/addMain', {`);
  lines.push(`    // TODO: 替换为实际字段`);
  lines.push(`    // code: 'TEST-001', name: '测试${entityName}',`);
  lines.push(`  }, TOKEN);`);
  lines.push(`  assertSuccess(res, '新增失败');`);
  lines.push(`  // TODO: 从列表中查找创建记录的 ID`);
  lines.push(`  // const list = await get(...); const created = list.result?.records?.find(...); mainId = created.id;`);
  lines.push(`  console.log('  ✅\\n');`);
  lines.push(`}`);
  step++;

  lines.push('');
  lines.push(`async function testQueryById() {`);
  lines.push(`  if (!mainId) { console.log('  ⏭️ 跳过\\n'); return; }`);
  lines.push(`  console.log('[${step}/${testNum}] 查询详情...');`);
  lines.push(`  const res = await get(MAIN_PATH + '/queryById?id=' + mainId, TOKEN);`);
  lines.push(`  assertSuccess(res);`);
  lines.push(`  // TODO: 验证数据一致性`);
  lines.push(`  console.log('  ✅\\n');`);
  lines.push(`}`);
  step++;

  lines.push('');
  lines.push(`async function testEditMain() {`);
  lines.push(`  if (!mainId) { console.log('  ⏭️ 跳过\\n'); return; }`);
  lines.push(`  console.log('[${step}/${testNum}] 编辑...');`);
  lines.push(`  await put(MAIN_PATH + '/editMain', {`);
  lines.push(`    id: mainId,`);
  lines.push(`    // TODO: 修改字段值`);
  lines.push(`  }, TOKEN);`);
  lines.push(`  console.log('  ✅\\n');`);
  lines.push(`}`);

  if (subEndpoints.length > 0) {
    step++;
    lines.push('');
    lines.push(`async function testListSubByMainId() {`);
    lines.push(`  if (!mainId) { console.log('  ⏭️ 跳过\\n'); return; }`);
    lines.push(`  console.log('[${step}/${testNum}] 子表列表...');`);
    lines.push(`  const res = await get(`);
    lines.push(`    SUB_PATH + '/list${entityName}LocationByMainId?${moduleName}Id=' + mainId + '&pageNo=1&pageSize=10',`);
    lines.push(`    TOKEN`);
    lines.push(`  );`);
    lines.push(`  assertSuccess(res);`);
    lines.push(`  console.log(\`  ✅ \${res.result?.records?.length || 0} 条\\n\`);`);
    lines.push(`}`);

    step++;
    lines.push('');
    lines.push(`async function testAddSub() {`);
    lines.push(`  if (!mainId) return;`);
    lines.push(`  console.log('[${step}/${testNum}] 新增子表...');`);
    lines.push(`  await post(SUB_PATH + '/add${entityName}Location', {`);
    lines.push(`    ${moduleName}Id: mainId,`);
    lines.push(`    // TODO: 替换为实际子表字段`);
    lines.push(`  }, TOKEN);`);
    lines.push(`  // TODO: 从列表中查找创建的子表 ID → subId`);
    lines.push(`  console.log('  ✅\\n');`);
    lines.push(`}`);

    step++;
    lines.push('');
    lines.push(`async function testEditSub() {`);
    lines.push(`  if (!subId) { console.log('  ⏭️ 跳过\\n'); return; }`);
    lines.push(`  console.log('[${step}/${testNum}] 编辑子表...');`);
    lines.push(`  // TODO: 实现编辑`);
    lines.push(`  console.log('  ✅\\n');`);
    lines.push(`}`);

    step++;
    lines.push('');
    lines.push(`async function testDeleteSub() {`);
    lines.push(`  if (!subId) { console.log('  ⏭️ 跳过\\n'); return; }`);
    lines.push(`  console.log('[${step}/${testNum}] 删除子表...');`);
    lines.push(`  // TODO: 删除 + 验证数量减少`);
    lines.push(`  console.log('  ✅\\n');`);
    lines.push(`}`);
  }

  step++;
  lines.push('');
  lines.push(`async function testBoundary() {`);
  lines.push(`  console.log('[${step}/${testNum}] 边界条件...');`);
  lines.push(`  const notFound = await get(MAIN_PATH + '/queryById?id=nonexistent999', TOKEN);`);
  lines.push(`  if (notFound.success) throw new Error('查询不存在 ID 应返回错误');`);
  lines.push(`  const empty = await get(MAIN_PATH + '/list', TOKEN);`);
  lines.push(`  assertSuccess(empty);`);
  lines.push(`  console.log('  ✅\\n');`);
  lines.push(`}`);

  lines.push('');
  lines.push('// ==================== 权限测试端点 ====================');
  lines.push('const PERMISSIONS = [');
  for (const ep of endpoints) {
    if (ep.permission) {
      lines.push(`  '${ep.permission}',  // ${ep.summary}`);
    }
  }
  lines.push('];');

  lines.push('');
  lines.push(`main().catch((err) => {`);
  lines.push(`  console.error('\\n❌', err.message);`);
  lines.push(`  process.exit(1);`);
  lines.push(`});`);

  return lines.join('\n');
}

// ============================================================
// 主流程
// ============================================================

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
API 测试生成器 — 从 Java Controller 生成测试骨架

用法: npx tsx test-generator/api-gen.ts <Controller.java路径> [选项]

选项:
  --output <dir>  输出目录 (默认: 自动推导)
  --java-only     仅生成 Java JUnit 测试
  --ts-only       仅生成 TypeScript API 测试
  --dry-run       仅输出而不写入文件

示例:
  npx tsx test-generator/api-gen.ts jeecg-boot/.../WarehouseController.java
  npx tsx test-generator/api-gen.ts jeecg-boot/.../WarehouseController.java --java-only
`);
    process.exit(0);
  }

  const sourcePath = args[0];
  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ 文件不存在: ${sourcePath}`);
    process.exit(1);
  }

  const javaOnly = args.includes('--java-only');
  const tsOnly = args.includes('--ts-only');
  const dryRun = args.includes('--dry-run');

  console.log(`\n🔍 解析 Controller: ${path.basename(sourcePath)}\n`);

  const info = parseController(sourcePath);

  console.log(`  实体: ${info.entityName}`);
  console.log(`  路径: ${info.modulePath}`);
  console.log(`  端点: ${info.endpoints.length} 个`);

  const mainCount = info.endpoints.filter(e => !e.isSubTable).length;
  const subCount = info.endpoints.filter(e => e.isSubTable).length;
  console.log(`    主表: ${mainCount} 个`);
  if (subCount > 0) console.log(`    子表: ${subCount} 个`);

  console.log(`\n  端点列表:`);
  for (const ep of info.endpoints) {
    const method = ep.httpMethod.padEnd(7);
    const perm = ep.permission ? ` [${ep.permission}]` : '';
    console.log(`    ${method} ${info.modulePath}${ep.path || ''}  → ${ep.methodName}${perm}`);
  }

  // 生成输出
  if (!tsOnly) {
    const javaCode = generateJavaTest(info);
    const javaOutputDir = args.includes('--output')
      ? args[args.indexOf('--output') + 1]
      : path.dirname(sourcePath).replace('/controller', '/test') + '/test';

    if (dryRun) {
      console.log(`\n━━━ Java 测试预览 ━━━\n`);
      console.log(javaCode);
    } else {
      fs.mkdirSync(javaOutputDir, { recursive: true });
      const javaPath = path.join(javaOutputDir, `${info.entityName}ControllerTest.java`);
      fs.writeFileSync(javaPath, javaCode);
      console.log(`\n📄 已生成: ${javaPath}`);
    }
  }

  if (!javaOnly) {
    const tsCode = generateTSTest(info);
    const tsOutputDir = args.includes('--output')
      ? args[args.indexOf('--output') + 1]
      : 'test/api';

    if (dryRun) {
      console.log(`\n━━━ TS 测试预览 ━━━\n`);
      console.log(tsCode);
    } else {
      fs.mkdirSync(tsOutputDir, { recursive: true });
      const tsPath = path.join(tsOutputDir, `${info.entityName.toLowerCase()}.generated.test.ts`);
      fs.writeFileSync(tsPath, tsCode);
      console.log(`📄 已生成: ${tsPath}`);
    }
  }

  console.log('\n⚠️  注意: 生成的代码包含 TODO 占位符，请替换为实际测试值后运行');
  console.log('');
}

main();
