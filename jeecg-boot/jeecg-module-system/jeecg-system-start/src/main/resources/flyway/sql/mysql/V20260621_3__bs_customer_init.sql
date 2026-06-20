-- =====================================================
-- 客户管理模块初始化
-- =====================================================

-- 1. 客户主表
CREATE TABLE IF NOT EXISTS `bs_customer` (
  `id` varchar(36) NOT NULL COMMENT '主键',
  `customer_code` varchar(50) DEFAULT NULL COMMENT '客户编码',
  `customer_name` varchar(100) DEFAULT NULL COMMENT '客户名称',
  `customer_type` varchar(20) DEFAULT NULL COMMENT '客户类型',
  `customer_status` varchar(20) DEFAULT '1' COMMENT '客户状态',
  `contact_person` varchar(50) DEFAULT NULL COMMENT '联系人',
  `contact_phone` varchar(20) DEFAULT NULL COMMENT '联系电话',
  `contact_email` varchar(100) DEFAULT NULL COMMENT '联系邮箱',
  `province` varchar(50) DEFAULT NULL COMMENT '省',
  `city` varchar(50) DEFAULT NULL COMMENT '市',
  `area` varchar(50) DEFAULT NULL COMMENT '区',
  `address` varchar(200) DEFAULT NULL COMMENT '详细地址',
  `remark` text COMMENT '备注',
  `processing_fee_rate` decimal(5,2) DEFAULT NULL COMMENT '加工费率(%)',
  `settlement_method` varchar(20) DEFAULT NULL COMMENT '结算方式',
  `payment_days` int(11) DEFAULT NULL COMMENT '账期(天)',
  `dealer_level` varchar(20) DEFAULT NULL COMMENT '经销商等级',
  `credit_limit` decimal(12,2) DEFAULT NULL COMMENT '信用额度(元)',
  `cooperation_date` date DEFAULT NULL COMMENT '合作开始日期',
  `dealer_region` varchar(200) DEFAULT NULL COMMENT '经销区域',
  `commission_rate` decimal(5,2) DEFAULT NULL COMMENT '提成比例(%)',
  `commission_method` varchar(20) DEFAULT NULL COMMENT '提成结算方式',
  `agency_region` varchar(200) DEFAULT NULL COMMENT '代理区域',
  `agency_products` varchar(500) DEFAULT NULL COMMENT '代理产品范围',
  `create_by` varchar(50) DEFAULT NULL COMMENT '创建人',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(50) DEFAULT NULL COMMENT '更新人',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `sys_org_code` varchar(64) DEFAULT NULL COMMENT '所属部门',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_customer_code` (`customer_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='客户管理';

-- 2. 字典：客户类型
INSERT INTO `sys_dict` (`id`, `dict_name`, `dict_code`, `description`, `del_flag`, `create_by`, `create_time`, `update_by`, `update_time`, `type`)
VALUES (REPLACE(UUID(),'-',''), '客户类型', 'customer_type', '客户类型字典', 0, 'admin', NOW(), NULL, NULL, 0);

INSERT INTO `sys_dict_item` (`id`, `dict_id`, `item_text`, `item_value`, `description`, `sort_order`, `status`, `create_by`, `create_time`, `update_by`, `update_time`)
SELECT REPLACE(UUID(),'-',''), d.id, '来料加工客户', '1', '来料加工客户', 1, 1, 'admin', NOW(), NULL, NULL FROM sys_dict d WHERE d.dict_code = 'customer_type';

INSERT INTO `sys_dict_item` (`id`, `dict_id`, `item_text`, `item_value`, `description`, `sort_order`, `status`, `create_by`, `create_time`, `update_by`, `update_time`)
SELECT REPLACE(UUID(),'-',''), d.id, '渠道经销商', '2', '渠道经销商', 2, 1, 'admin', NOW(), NULL, NULL FROM sys_dict d WHERE d.dict_code = 'customer_type';

INSERT INTO `sys_dict_item` (`id`, `dict_id`, `item_text`, `item_value`, `description`, `sort_order`, `status`, `create_by`, `create_time`, `update_by`, `update_time`)
SELECT REPLACE(UUID(),'-',''), d.id, '分销客户', '3', '分销客户', 3, 1, 'admin', NOW(), NULL, NULL FROM sys_dict d WHERE d.dict_code = 'customer_type';

-- 3. 字典：客户状态
INSERT INTO `sys_dict` (`id`, `dict_name`, `dict_code`, `description`, `del_flag`, `create_by`, `create_time`, `update_by`, `update_time`, `type`)
VALUES (REPLACE(UUID(),'-',''), '客户状态', 'customer_status', '客户状态字典', 0, 'admin', NOW(), NULL, NULL, 0);

INSERT INTO `sys_dict_item` (`id`, `dict_id`, `item_text`, `item_value`, `description`, `sort_order`, `status`, `create_by`, `create_time`, `update_by`, `update_time`)
SELECT REPLACE(UUID(),'-',''), d.id, '正常', '1', '正常', 1, 1, 'admin', NOW(), NULL, NULL FROM sys_dict d WHERE d.dict_code = 'customer_status';

INSERT INTO `sys_dict_item` (`id`, `dict_id`, `item_text`, `item_value`, `description`, `sort_order`, `status`, `create_by`, `create_time`, `update_by`, `update_time`)
SELECT REPLACE(UUID(),'-',''), d.id, '停用', '2', '停用', 2, 1, 'admin', NOW(), NULL, NULL FROM sys_dict d WHERE d.dict_code = 'customer_status';

INSERT INTO `sys_dict_item` (`id`, `dict_id`, `item_text`, `item_value`, `description`, `sort_order`, `status`, `create_by`, `create_time`, `update_by`, `update_time`)
SELECT REPLACE(UUID(),'-',''), d.id, '黑名单', '3', '黑名单', 3, 1, 'admin', NOW(), NULL, NULL FROM sys_dict d WHERE d.dict_code = 'customer_status';

-- 4. 字典：结算方式
INSERT INTO `sys_dict` (`id`, `dict_name`, `dict_code`, `description`, `del_flag`, `create_by`, `create_time`, `update_by`, `update_time`, `type`)
VALUES (REPLACE(UUID(),'-',''), '结算方式', 'settlement_method', '结算方式字典', 0, 'admin', NOW(), NULL, NULL, 0);

INSERT INTO `sys_dict_item` (`id`, `dict_id`, `item_text`, `item_value`, `description`, `sort_order`, `status`, `create_by`, `create_time`, `update_by`, `update_time`)
SELECT REPLACE(UUID(),'-',''), d.id, '月结', '1', '月结', 1, 1, 'admin', NOW(), NULL, NULL FROM sys_dict d WHERE d.dict_code = 'settlement_method';

INSERT INTO `sys_dict_item` (`id`, `dict_id`, `item_text`, `item_value`, `description`, `sort_order`, `status`, `create_by`, `create_time`, `update_by`, `update_time`)
SELECT REPLACE(UUID(),'-',''), d.id, '批次结', '2', '批次结', 2, 1, 'admin', NOW(), NULL, NULL FROM sys_dict d WHERE d.dict_code = 'settlement_method';

INSERT INTO `sys_dict_item` (`id`, `dict_id`, `item_text`, `item_value`, `description`, `sort_order`, `status`, `create_by`, `create_time`, `update_by`, `update_time`)
SELECT REPLACE(UUID(),'-',''), d.id, '即时结', '3', '即时结', 3, 1, 'admin', NOW(), NULL, NULL FROM sys_dict d WHERE d.dict_code = 'settlement_method';

-- 5. 字典：经销商等级
INSERT INTO `sys_dict` (`id`, `dict_name`, `dict_code`, `description`, `del_flag`, `create_by`, `create_time`, `update_by`, `update_time`, `type`)
VALUES (REPLACE(UUID(),'-',''), '经销商等级', 'dealer_level', '经销商等级字典', 0, 'admin', NOW(), NULL, NULL, 0);

INSERT INTO `sys_dict_item` (`id`, `dict_id`, `item_text`, `item_value`, `description`, `sort_order`, `status`, `create_by`, `create_time`, `update_by`, `update_time`)
SELECT REPLACE(UUID(),'-',''), d.id, '一级', '1', '一级', 1, 1, 'admin', NOW(), NULL, NULL FROM sys_dict d WHERE d.dict_code = 'dealer_level';

INSERT INTO `sys_dict_item` (`id`, `dict_id`, `item_text`, `item_value`, `description`, `sort_order`, `status`, `create_by`, `create_time`, `update_by`, `update_time`)
SELECT REPLACE(UUID(),'-',''), d.id, '二级', '2', '二级', 2, 1, 'admin', NOW(), NULL, NULL FROM sys_dict d WHERE d.dict_code = 'dealer_level';

INSERT INTO `sys_dict_item` (`id`, `dict_id`, `item_text`, `item_value`, `description`, `sort_order`, `status`, `create_by`, `create_time`, `update_by`, `update_time`)
SELECT REPLACE(UUID(),'-',''), d.id, '三级', '3', '三级', 3, 1, 'admin', NOW(), NULL, NULL FROM sys_dict d WHERE d.dict_code = 'dealer_level';

-- 6. 字典：提成结算方式
INSERT INTO `sys_dict` (`id`, `dict_name`, `dict_code`, `description`, `del_flag`, `create_by`, `create_time`, `update_by`, `update_time`, `type`)
VALUES (REPLACE(UUID(),'-',''), '提成结算方式', 'commission_method', '提成结算方式字典', 0, 'admin', NOW(), NULL, NULL, 0);

INSERT INTO `sys_dict_item` (`id`, `dict_id`, `item_text`, `item_value`, `description`, `sort_order`, `status`, `create_by`, `create_time`, `update_by`, `update_time`)
SELECT REPLACE(UUID(),'-',''), d.id, '货款到账后', '1', '货款到账后', 1, 1, 'admin', NOW(), NULL, NULL FROM sys_dict d WHERE d.dict_code = 'commission_method';

INSERT INTO `sys_dict_item` (`id`, `dict_id`, `item_text`, `item_value`, `description`, `sort_order`, `status`, `create_by`, `create_time`, `update_by`, `update_time`)
SELECT REPLACE(UUID(),'-',''), d.id, '月结', '2', '月结', 2, 1, 'admin', NOW(), NULL, NULL FROM sys_dict d WHERE d.dict_code = 'commission_method';

INSERT INTO `sys_dict_item` (`id`, `dict_id`, `item_text`, `item_value`, `description`, `sort_order`, `status`, `create_by`, `create_time`, `update_by`, `update_time`)
SELECT REPLACE(UUID(),'-',''), d.id, '季度结', '3', '季度结', 3, 1, 'admin', NOW(), NULL, NULL FROM sys_dict d WHERE d.dict_code = 'commission_method';

-- ========== 菜单权限 ==========
INSERT INTO sys_permission(id, parent_id, name, url, component, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_route, is_leaf, keep_alive, hidden, hide_tab, description, status, del_flag, rule_flag, create_by, create_time, update_by, update_time, internal_or_external)
VALUES ('178199715322001', NULL, '客户管理', '/bs/customer/bsCustomerList', 'bs/customer/BsCustomerList', NULL, NULL, 0, NULL, '1', 0.00, 0, 'ant-design:team-outlined', 1, 0, 0, 0, 0, NULL, '1', 0, 0, 'admin', '2026-06-21 00:00:00', NULL, NULL, 0);

INSERT INTO sys_permission(id, parent_id, name, url, component, is_route, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_leaf, keep_alive, hidden, hide_tab, description, create_by, create_time, update_by, update_time, del_flag, rule_flag, status, internal_or_external)
VALUES ('178199715322002', '178199715322001', '添加客户管理', NULL, NULL, 0, NULL, NULL, 2, 'bs:bs_customer:add', '1', NULL, 0, NULL, 1, 0, 0, 0, NULL, 'admin', '2026-06-21 00:00:00', NULL, NULL, 0, 0, '1', 0);

INSERT INTO sys_permission(id, parent_id, name, url, component, is_route, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_leaf, keep_alive, hidden, hide_tab, description, create_by, create_time, update_by, update_time, del_flag, rule_flag, status, internal_or_external)
VALUES ('178199715322003', '178199715322001', '编辑客户管理', NULL, NULL, 0, NULL, NULL, 2, 'bs:bs_customer:edit', '1', NULL, 0, NULL, 1, 0, 0, 0, NULL, 'admin', '2026-06-21 00:00:00', NULL, NULL, 0, 0, '1', 0);

INSERT INTO sys_permission(id, parent_id, name, url, component, is_route, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_leaf, keep_alive, hidden, hide_tab, description, create_by, create_time, update_by, update_time, del_flag, rule_flag, status, internal_or_external)
VALUES ('178199715322004', '178199715322001', '删除客户管理', NULL, NULL, 0, NULL, NULL, 2, 'bs:bs_customer:delete', '1', NULL, 0, NULL, 1, 0, 0, 0, NULL, 'admin', '2026-06-21 00:00:00', NULL, NULL, 0, 0, '1', 0);

INSERT INTO sys_permission(id, parent_id, name, url, component, is_route, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_leaf, keep_alive, hidden, hide_tab, description, create_by, create_time, update_by, update_time, del_flag, rule_flag, status, internal_or_external)
VALUES ('178199715322005', '178199715322001', '批量删除客户管理', NULL, NULL, 0, NULL, NULL, 2, 'bs:bs_customer:deleteBatch', '1', NULL, 0, NULL, 1, 0, 0, 0, NULL, 'admin', '2026-06-21 00:00:00', NULL, NULL, 0, 0, '1', 0);

INSERT INTO sys_permission(id, parent_id, name, url, component, is_route, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_leaf, keep_alive, hidden, hide_tab, description, create_by, create_time, update_by, update_time, del_flag, rule_flag, status, internal_or_external)
VALUES ('178199715322006', '178199715322001', '导出excel_客户管理', NULL, NULL, 0, NULL, NULL, 2, 'bs:bs_customer:exportXls', '1', NULL, 0, NULL, 1, 0, 0, 0, NULL, 'admin', '2026-06-21 00:00:00', NULL, NULL, 0, 0, '1', 0);

INSERT INTO sys_permission(id, parent_id, name, url, component, is_route, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_leaf, keep_alive, hidden, hide_tab, description, create_by, create_time, update_by, update_time, del_flag, rule_flag, status, internal_or_external)
VALUES ('178199715322007', '178199715322001', '导入excel_客户管理', NULL, NULL, 0, NULL, NULL, 2, 'bs:bs_customer:importExcel', '1', NULL, 0, NULL, 1, 0, 0, 0, NULL, 'admin', '2026-06-21 00:00:00', NULL, NULL, 0, 0, '1', 0);

-- ========== admin 角色授权 ==========
INSERT INTO sys_role_permission (id, role_id, permission_id, data_rule_ids, operate_date, operate_ip) VALUES ('178199715322008', 'f6817f48af4fb3af11b9e8bf182f618b', '178199715322001', NULL, '2026-06-21 00:00:00', '127.0.0.1');
INSERT INTO sys_role_permission (id, role_id, permission_id, data_rule_ids, operate_date, operate_ip) VALUES ('178199715322009', 'f6817f48af4fb3af11b9e8bf182f618b', '178199715322002', NULL, '2026-06-21 00:00:00', '127.0.0.1');
INSERT INTO sys_role_permission (id, role_id, permission_id, data_rule_ids, operate_date, operate_ip) VALUES ('178199715322010', 'f6817f48af4fb3af11b9e8bf182f618b', '178199715322003', NULL, '2026-06-21 00:00:00', '127.0.0.1');
INSERT INTO sys_role_permission (id, role_id, permission_id, data_rule_ids, operate_date, operate_ip) VALUES ('178199715322011', 'f6817f48af4fb3af11b9e8bf182f618b', '178199715322004', NULL, '2026-06-21 00:00:00', '127.0.0.1');
INSERT INTO sys_role_permission (id, role_id, permission_id, data_rule_ids, operate_date, operate_ip) VALUES ('178199715322012', 'f6817f48af4fb3af11b9e8bf182f618b', '178199715322005', NULL, '2026-06-21 00:00:00', '127.0.0.1');
INSERT INTO sys_role_permission (id, role_id, permission_id, data_rule_ids, operate_date, operate_ip) VALUES ('178199715322013', 'f6817f48af4fb3af11b9e8bf182f618b', '178199715322006', NULL, '2026-06-21 00:00:00', '127.0.0.1');
INSERT INTO sys_role_permission (id, role_id, permission_id, data_rule_ids, operate_date, operate_ip) VALUES ('178199715322014', 'f6817f48af4fb3af11b9e8bf182f618b', '178199715322007', NULL, '2026-06-21 00:00:00', '127.0.0.1');
