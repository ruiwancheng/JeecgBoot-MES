package org.jeecg.modules.warehouse.entity;

import java.io.Serializable;
import java.util.Date;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonFormat;
import org.springframework.format.annotation.DateTimeFormat;
import org.jeecgframework.poi.excel.annotation.Excel;
import org.jeecg.common.aspect.annotation.Dict;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

/**
 * @Description: 库位管理
 * @Author: jeecg-boot
 * @Date: 2026-06-21
 * @Version: V1.0
 */
@Data
@TableName("warehouse_location")
@Accessors(chain = true)
@EqualsAndHashCode(callSuper = false)
@Schema(description = "库位管理")
public class WarehouseLocation implements Serializable {
    private static final long serialVersionUID = 1L;

    /** 主键 */
    @TableId(type = IdType.ASSIGN_ID)
    @Schema(description = "主键")
    private String id;

    /** 所属仓库 */
    @Schema(description = "所属仓库")
    private String warehouseId;

    /** 库位编码 */
    @Excel(name = "库位编码", width = 15)
    @Schema(description = "库位编码")
    private String locationCode;

    /** 库位名称 */
    @Excel(name = "库位名称", width = 15)
    @Schema(description = "库位名称")
    private String locationName;

    /** 库位分类 */
    @Excel(name = "库位分类", width = 15, dicCode = "location_category")
    @Dict(dicCode = "location_category")
    @Schema(description = "库位分类")
    private String category;

    /** 存放商品 */
    @Excel(name = "存放商品", width = 20)
    @Schema(description = "存放商品")
    private String productName;

    /** 容量 */
    @Excel(name = "容量", width = 15)
    @Schema(description = "容量")
    private Integer capacity;

    /** 容量单位 */
    @Excel(name = "容量单位", width = 15, dicCode = "capacity_unit")
    @Dict(dicCode = "capacity_unit")
    @Schema(description = "容量单位")
    private String capacityUnit;

    /** 创建人 */
    @Schema(description = "创建人")
    private String createBy;

    /** 创建时间 */
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Schema(description = "创建时间")
    private Date createTime;

    /** 更新人 */
    @Schema(description = "更新人")
    private String updateBy;

    /** 更新时间 */
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Schema(description = "更新时间")
    private Date updateTime;

    /** 所属部门 */
    @Schema(description = "所属部门")
    private String sysOrgCode;
}
