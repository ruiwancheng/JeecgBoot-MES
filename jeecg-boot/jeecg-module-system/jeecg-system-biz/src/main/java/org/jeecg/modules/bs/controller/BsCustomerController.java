package org.jeecg.modules.bs.controller;

import java.util.Arrays;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.jeecg.common.api.vo.Result;
import org.jeecg.common.system.query.QueryGenerator;
import org.jeecg.common.aspect.annotation.AutoLog;
import org.jeecg.modules.bs.entity.BsCustomer;
import org.jeecg.modules.bs.service.IBsCustomerService;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.extern.slf4j.Slf4j;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * @Description: 客户管理
 * @Author: jeecg-boot
 * @Date: 2026-06-21
 * @Version: V1.0
 */
@Tag(name = "客户管理")
@RestController
@RequestMapping("/bs/customer")
@Slf4j
public class BsCustomerController {

    @Autowired
    private IBsCustomerService bsCustomerService;

    /**
     * 分页列表查询
     */
    @GetMapping(value = "/list")
    @Operation(summary = "客户管理-分页列表查询")
    public Result<IPage<BsCustomer>> queryPageList(BsCustomer bsCustomer,
            @RequestParam(name = "pageNo", defaultValue = "1") Integer pageNo,
            @RequestParam(name = "pageSize", defaultValue = "10") Integer pageSize,
            HttpServletRequest req) {
        QueryWrapper<BsCustomer> queryWrapper = QueryGenerator.initQueryWrapper(bsCustomer, req.getParameterMap());
        Page<BsCustomer> page = new Page<>(pageNo, pageSize);
        IPage<BsCustomer> pageList = bsCustomerService.page(page, queryWrapper);
        return Result.OK(pageList);
    }

    /**
     * 添加
     */
    @PostMapping(value = "/add")
    @AutoLog(value = "客户管理-添加")
    @Operation(summary = "客户管理-添加")
    @RequiresPermissions("bs:bs_customer:add")
    public Result<String> add(@RequestBody BsCustomer bsCustomer) {
        bsCustomerService.save(bsCustomer);
        return Result.OK("添加成功！");
    }

    /**
     * 编辑
     */
    @RequestMapping(value = "/edit", method = { RequestMethod.PUT, RequestMethod.POST })
    @AutoLog(value = "客户管理-编辑")
    @Operation(summary = "客户管理-编辑")
    @RequiresPermissions("bs:bs_customer:edit")
    public Result<String> edit(@RequestBody BsCustomer bsCustomer) {
        bsCustomerService.updateById(bsCustomer);
        return Result.OK("编辑成功！");
    }

    /**
     * 通过id删除
     */
    @DeleteMapping(value = "/delete")
    @AutoLog(value = "客户管理-通过id删除")
    @Operation(summary = "客户管理-通过id删除")
    @RequiresPermissions("bs:bs_customer:delete")
    public Result<String> delete(@RequestParam(name = "id", required = true) String id) {
        bsCustomerService.removeById(id);
        return Result.OK("删除成功！");
    }

    /**
     * 批量删除
     */
    @DeleteMapping(value = "/deleteBatch")
    @AutoLog(value = "客户管理-批量删除")
    @Operation(summary = "客户管理-批量删除")
    @RequiresPermissions("bs:bs_customer:deleteBatch")
    public Result<String> deleteBatch(@RequestParam(name = "ids", required = true) String ids) {
        this.bsCustomerService.removeByIds(Arrays.asList(ids.split(",")));
        return Result.OK("批量删除成功！");
    }

    /**
     * 通过id查询
     */
    @GetMapping(value = "/queryById")
    @Operation(summary = "客户管理-通过id查询")
    public Result<BsCustomer> queryById(@RequestParam(name = "id", required = true) String id) {
        BsCustomer bsCustomer = bsCustomerService.getById(id);
        if (bsCustomer == null) {
            return Result.error("未找到对应数据");
        }
        return Result.OK(bsCustomer);
    }
}
