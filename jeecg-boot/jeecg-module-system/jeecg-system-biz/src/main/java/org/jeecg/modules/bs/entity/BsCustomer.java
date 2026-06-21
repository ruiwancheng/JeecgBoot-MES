//update-begin---author:developer ---date:2026-06-21  for：客户管理模块-实体-----------
package org.jeecg.modules.bs.entity;

import java.io.Serializable;
import java.math.BigDecimal;
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
 * @Description: 客户管理
 * @Author: jeecg-boot
 * @Date: 2026-06-21
 * @Version: V1.0
 */
@Data
@TableName("bs_customer")
@Accessors(chain = true)
@EqualsAndHashCode(callSuper = false)
@Schema(description = "客户管理")
public class BsCustomer implements Serializable {
    private static final long serialVersionUID = 1L;

    /** 主键 */
    @TableId(type = IdType.ASSIGN_ID)
    @Schema(description = "主键")
    private String id;

    // ====== 基本信息 ======

    /** 客户编码 */
    @Excel(name = "客户编码", width = 15)
    @Schema(description = "客户编码")
    private String customerCode;

    /** 客户名称 */
    @Excel(name = "客户名称", width = 15)
    @Schema(description = "客户名称")
    private String customerName;

    /** 客户类型 */
    @Excel(name = "客户类型", width = 15, dicCode = "customer_type")
    @Dict(dicCode = "customer_type")
    @Schema(description = "客户类型")
    private String customerType;

    /** 客户状态 */
    @Excel(name = "客户状态", width = 15, dicCode = "customer_status")
    @Dict(dicCode = "customer_status")
    @Schema(description = "客户状态")
    private String customerStatus;

    /** 联系人 */
    @Excel(name = "联系人", width = 15)
    @Schema(description = "联系人")
    private String contactPerson;

    /** 联系电话 */
    @Excel(name = "联系电话", width = 15)
    @Schema(description = "联系电话")
    private String contactPhone;

    /** 联系邮箱 */
    @Excel(name = "联系邮箱", width = 20)
    @Schema(description = "联系邮箱")
    private String contactEmail;

    /** 省 */
    @Excel(name = "省", width = 15)
    @Schema(description = "省")
    private String province;

    /** 市 */
    @Excel(name = "市", width = 15)
    @Schema(description = "市")
    private String city;

    /** 区 */
    @Excel(name = "区", width = 15)
    @Schema(description = "区")
    private String area;

    /** 详细地址 */
    @Excel(name = "详细地址", width = 20)
    @Schema(description = "详细地址")
    private String address;

    /** 备注 */
    @Excel(name = "备注", width = 20)
    @Schema(description = "备注")
    private String remark;

    // ====== 来料加工客户专用 ======

    /** 加工费率(%) */
    @Excel(name = "加工费率(%)", width = 15)
    @Schema(description = "加工费率(%)")
    private BigDecimal processingFeeRate;

    /** 结算方式 */
    @Excel(name = "结算方式", width = 15, dicCode = "settlement_method")
    @Dict(dicCode = "settlement_method")
    @Schema(description = "结算方式")
    private String settlementMethod;

    /** 账期(天) */
    @Excel(name = "账期(天)", width = 15)
    @Schema(description = "账期(天)")
    private Integer paymentDays;

    // ====== 渠道经销商专用 ======

    /** 经销商等级 */
    @Excel(name = "经销商等级", width = 15, dicCode = "dealer_level")
    @Dict(dicCode = "dealer_level")
    @Schema(description = "经销商等级")
    private String dealerLevel;

    /** 信用额度(元) */
    @Excel(name = "信用额度(元)", width = 15)
    @Schema(description = "信用额度(元)")
    private BigDecimal creditLimit;

    /** 合作开始日期 */
    @Excel(name = "合作开始日期", width = 15, format = "yyyy-MM-dd")
    @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    @Schema(description = "合作开始日期")
    private Date cooperationDate;

    /** 经销区域 */
    @Excel(name = "经销区域", width = 20)
    @Schema(description = "经销区域")
    private String dealerRegion;

    // ====== 分销客户专用 ======

    /** 提成比例(%) */
    @Excel(name = "提成比例(%)", width = 15)
    @Schema(description = "提成比例(%)")
    private BigDecimal commissionRate;

    /** 提成结算方式 */
    @Excel(name = "提成结算方式", width = 15, dicCode = "commission_method")
    @Dict(dicCode = "commission_method")
    @Schema(description = "提成结算方式")
    private String commissionMethod;

    /** 代理区域 */
    @Excel(name = "代理区域", width = 20)
    @Schema(description = "代理区域")
    private String agencyRegion;

    /** 代理产品范围 */
    @Excel(name = "代理产品范围", width = 20)
    @Schema(description = "代理产品范围")
    private String agencyProducts;

    // ====== 系统字段 ======

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
//update-end---author:developer ---date:2026-06-21  for：客户管理模块-实体-----------
