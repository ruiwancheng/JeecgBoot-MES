package org.jeecg.modules.warehouse.controller;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.jeecgframework.poi.excel.ExcelImportUtil;
import org.jeecgframework.poi.excel.def.NormalExcelConstants;
import org.jeecgframework.poi.excel.entity.ExportParams;
import org.jeecgframework.poi.excel.entity.ImportParams;
import org.jeecgframework.poi.excel.entity.enmus.ExcelType;
import org.jeecgframework.poi.excel.view.JeecgEntityExcelView;
import org.jeecg.common.system.vo.LoginUser;
import org.apache.shiro.SecurityUtils;
import org.jeecg.common.api.vo.Result;
import org.jeecg.common.system.query.QueryGenerator;
import org.jeecg.common.util.oConvertUtils;
import org.jeecg.modules.warehouse.entity.Warehouse;
import org.jeecg.modules.warehouse.entity.WarehouseLocation;
import org.jeecg.modules.warehouse.vo.WarehousePage;
import org.jeecg.modules.warehouse.service.IWarehouseService;
import org.jeecg.modules.warehouse.service.IWarehouseLocationService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.servlet.ModelAndView;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.extern.slf4j.Slf4j;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import org.jeecg.common.aspect.annotation.AutoLog;
import org.apache.shiro.authz.annotation.RequiresPermissions;

/**
 * @Description: 仓库管理
 * @Author: jeecg-boot
 * @Date: 2026-06-21
 * @Version: V1.0
 */
@Tag(name = "仓库管理")
@RestController
@RequestMapping("/warehouse/warehouse")
@Slf4j
public class WarehouseController {

    @Autowired
    private IWarehouseService warehouseService;

    @Autowired
    private IWarehouseLocationService warehouseLocationService;

    // ===================== 主表 CRUD =====================

    @Operation(summary = "仓库管理-分页列表查询")
    @GetMapping(value = "/list")
    public Result<IPage<Warehouse>> queryPageList(Warehouse warehouse,
                                                   @RequestParam(name = "pageNo", defaultValue = "1") Integer pageNo,
                                                   @RequestParam(name = "pageSize", defaultValue = "10") Integer pageSize,
                                                   HttpServletRequest req) {
        QueryWrapper<Warehouse> queryWrapper = QueryGenerator.initQueryWrapper(warehouse, req.getParameterMap());
        Page<Warehouse> page = new Page<Warehouse>(pageNo, pageSize);
        IPage<Warehouse> pageList = warehouseService.page(page, queryWrapper);
        return Result.OK(pageList);
    }

    // ===================== ERP模式：主表独立操作（不影响子表） =====================

    @AutoLog(value = "仓库管理-添加主表")
    @Operation(summary = "仓库管理-添加")
    @RequiresPermissions("warehouse:warehouse:add")
    @PostMapping(value = "/addMain")
    public Result<String> addMain(@RequestBody Warehouse warehouse) {
        warehouseService.save(warehouse);
        return Result.OK("添加成功！");
    }

    @AutoLog(value = "仓库管理-编辑主表")
    @Operation(summary = "仓库管理-编辑")
    @RequiresPermissions("warehouse:warehouse:edit")
    @RequestMapping(value = "/editMain", method = {RequestMethod.PUT, RequestMethod.POST})
    public Result<String> editMain(@RequestBody Warehouse warehouse) {
        warehouseService.updateById(warehouse);
        return Result.OK("编辑成功!");
    }

    // ===================== 一对多原始接口（Excel导入导出用） =====================

    @AutoLog(value = "仓库管理-添加（含库位）")
    @Operation(summary = "仓库管理-添加（含库位）")
    @RequiresPermissions("warehouse:warehouse:add")
    @PostMapping(value = "/add")
    public Result<String> add(@RequestBody WarehousePage warehousePage) {
        Warehouse warehouse = new Warehouse();
        BeanUtils.copyProperties(warehousePage, warehouse);
        warehouseService.saveMain(warehouse, warehousePage.getWarehouseLocationList());
        return Result.OK("添加成功！");
    }

    @AutoLog(value = "仓库管理-编辑（含库位）")
    @Operation(summary = "仓库管理-编辑（含库位）")
    @RequiresPermissions("warehouse:warehouse:edit")
    @RequestMapping(value = "/edit", method = {RequestMethod.PUT, RequestMethod.POST})
    public Result<String> edit(@RequestBody WarehousePage warehousePage) {
        Warehouse warehouse = new Warehouse();
        BeanUtils.copyProperties(warehousePage, warehouse);
        Warehouse warehouseEntity = warehouseService.getById(warehouse.getId());
        if (warehouseEntity == null) {
            return Result.error("未找到对应数据");
        }
        warehouseService.updateMain(warehouse, warehousePage.getWarehouseLocationList());
        return Result.OK("编辑成功!");
    }

    @AutoLog(value = "仓库管理-通过id删除")
    @Operation(summary = "仓库管理-通过id删除")
    @RequiresPermissions("warehouse:warehouse:delete")
    @DeleteMapping(value = "/delete")
    public Result<String> delete(@RequestParam(name = "id", required = true) String id) {
        warehouseService.delMain(id);
        return Result.OK("删除成功!");
    }

    @AutoLog(value = "仓库管理-批量删除")
    @Operation(summary = "仓库管理-批量删除")
    @RequiresPermissions("warehouse:warehouse:deleteBatch")
    @DeleteMapping(value = "/deleteBatch")
    public Result<String> deleteBatch(@RequestParam(name = "ids", required = true) String ids) {
        this.warehouseService.delBatchMain(Arrays.asList(ids.split(",")));
        return Result.OK("批量删除成功！");
    }

    @Operation(summary = "仓库管理-通过id查询")
    @GetMapping(value = "/queryById")
    public Result<Warehouse> queryById(@RequestParam(name = "id", required = true) String id) {
        Warehouse warehouse = warehouseService.getById(id);
        if (warehouse == null) {
            return Result.error("未找到对应数据");
        }
        return Result.OK(warehouse);
    }

    // ===================== 子表独立CRUD（ERP模式） =====================

    @Operation(summary = "库位管理-分页列表查询")
    @GetMapping(value = "/listWarehouseLocationByMainId")
    public Result<IPage<WarehouseLocation>> listWarehouseLocationByMainId(
            @RequestParam(name = "warehouseId", required = false) String warehouseId,
            @RequestParam(name = "pageNo", defaultValue = "1") Integer pageNo,
            @RequestParam(name = "pageSize", defaultValue = "10") Integer pageSize,
            HttpServletRequest req) {
        QueryWrapper<WarehouseLocation> queryWrapper = QueryGenerator.initQueryWrapper(new WarehouseLocation(), req.getParameterMap());
        if (warehouseId != null && !warehouseId.isEmpty()) {
            queryWrapper.eq("warehouse_id", warehouseId);
        }
        Page<WarehouseLocation> page = new Page<>(pageNo, pageSize);
        IPage<WarehouseLocation> pageList = warehouseLocationService.page(page, queryWrapper);
        return Result.OK(pageList);
    }

    @AutoLog(value = "库位管理-添加")
    @Operation(summary = "库位管理-添加")
    @PostMapping(value = "/addWarehouseLocation")
    public Result<String> addWarehouseLocation(@RequestBody WarehouseLocation entity) {
        warehouseLocationService.save(entity);
        return Result.OK("添加成功！");
    }

    @AutoLog(value = "库位管理-编辑")
    @Operation(summary = "库位管理-编辑")
    @RequestMapping(value = "/editWarehouseLocation", method = {RequestMethod.PUT, RequestMethod.POST})
    public Result<String> editWarehouseLocation(@RequestBody WarehouseLocation entity) {
        warehouseLocationService.updateById(entity);
        return Result.OK("编辑成功!");
    }

    @AutoLog(value = "库位管理-通过id删除")
    @Operation(summary = "库位管理-通过id删除")
    @DeleteMapping(value = "/deleteWarehouseLocation")
    public Result<String> deleteWarehouseLocation(@RequestParam(name = "id") String id) {
        warehouseLocationService.removeById(id);
        return Result.OK("删除成功!");
    }

    @AutoLog(value = "库位管理-批量删除")
    @Operation(summary = "库位管理-批量删除")
    @DeleteMapping(value = "/deleteBatchWarehouseLocation")
    public Result<String> deleteBatchWarehouseLocation(@RequestParam(name = "ids") String ids) {
        warehouseLocationService.removeByIds(Arrays.asList(ids.split(",")));
        return Result.OK("批量删除成功!");
    }

    // ===================== Excel 导入导出 =====================

    @RequiresPermissions("warehouse:warehouse:exportXls")
    @RequestMapping(value = "/exportXls")
    public ModelAndView exportXls(HttpServletRequest request, Warehouse warehouse) {
        QueryWrapper<Warehouse> queryWrapper = QueryGenerator.initQueryWrapper(warehouse, request.getParameterMap());
        LoginUser sysUser = (LoginUser) SecurityUtils.getSubject().getPrincipal();
        String selections = request.getParameter("selections");
        if (oConvertUtils.isNotEmpty(selections)) {
            queryWrapper.in("id", Arrays.asList(selections.split(",")));
        }
        List<Warehouse> warehouseList = warehouseService.list(queryWrapper);
        List<WarehousePage> pageList = new ArrayList<>();
        for (Warehouse main : warehouseList) {
            WarehousePage vo = new WarehousePage();
            BeanUtils.copyProperties(main, vo);
            vo.setWarehouseLocationList(warehouseLocationService.selectByMainId(main.getId()));
            pageList.add(vo);
        }
        ModelAndView mv = new ModelAndView(new JeecgEntityExcelView());
        mv.addObject(NormalExcelConstants.FILE_NAME, "仓库管理列表");
        mv.addObject(NormalExcelConstants.CLASS, WarehousePage.class);
        mv.addObject(NormalExcelConstants.PARAMS, new ExportParams("仓库管理数据", "导出人:" + sysUser.getRealname(), "仓库管理", ExcelType.XSSF));
        mv.addObject(NormalExcelConstants.DATA_LIST, pageList);
        return mv;
    }

    @RequiresPermissions("warehouse:warehouse:importExcel")
    @RequestMapping(value = "/importExcel", method = RequestMethod.POST)
    public Result<?> importExcel(HttpServletRequest request, HttpServletResponse response) {
        MultipartHttpServletRequest multipartRequest = (MultipartHttpServletRequest) request;
        Map<String, MultipartFile> fileMap = multipartRequest.getFileMap();
        for (Map.Entry<String, MultipartFile> entity : fileMap.entrySet()) {
            MultipartFile file = entity.getValue();
            ImportParams params = new ImportParams();
            params.setTitleRows(2);
            params.setHeadRows(1);
            params.setNeedSave(true);
            try {
                List<WarehousePage> list = ExcelImportUtil.importExcel(file.getInputStream(), WarehousePage.class, params);
                for (WarehousePage page : list) {
                    Warehouse po = new Warehouse();
                    BeanUtils.copyProperties(page, po);
                    warehouseService.saveMain(po, page.getWarehouseLocationList());
                }
                return Result.OK("文件导入成功！数据行数:" + list.size());
            } catch (Exception e) {
                log.error(e.getMessage(), e);
                return Result.error("文件导入失败:" + e.getMessage());
            } finally {
                try {
                    file.getInputStream().close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
        return Result.OK("文件导入失败！");
    }
}
