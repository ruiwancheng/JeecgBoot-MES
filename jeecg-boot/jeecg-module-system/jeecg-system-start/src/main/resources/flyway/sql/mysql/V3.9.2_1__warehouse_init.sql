-- =====================================================
-- 仓库管理模块初始化
-- =====================================================

-- 1. 仓库主表
CREATE TABLE IF NOT EXISTS `warehouse` (
  `id` varchar(36) NOT NULL COMMENT '主键',
  `warehouse_code` varchar(50) DEFAULT NULL COMMENT '仓库编码',
  `warehouse_name` varchar(100) DEFAULT NULL COMMENT '仓库名称',
  `address` varchar(200) DEFAULT NULL COMMENT '仓库地址',
  `manager` varchar(50) DEFAULT NULL COMMENT '负责人',
  `remark` text COMMENT '备注',
  `create_by` varchar(50) DEFAULT NULL COMMENT '创建人',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(50) DEFAULT NULL COMMENT '更新人',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `sys_org_code` varchar(64) DEFAULT NULL COMMENT '所属部门',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='仓库管理';

-- 2. 库位子表
CREATE TABLE IF NOT EXISTS `warehouse_location` (
  `id` varchar(36) NOT NULL COMMENT '主键',
  `warehouse_id` varchar(36) DEFAULT NULL COMMENT '所属仓库',
  `location_code` varchar(100) DEFAULT NULL COMMENT '库位编码',
  `location_name` varchar(100) DEFAULT NULL COMMENT '库位名称',
  `category` varchar(50) DEFAULT NULL COMMENT '库位分类',
  `product_name` varchar(200) DEFAULT NULL COMMENT '存放商品',
  `capacity` int(11) DEFAULT NULL COMMENT '容量',
  `capacity_unit` varchar(20) DEFAULT NULL COMMENT '容量单位',
  `create_by` varchar(50) DEFAULT NULL COMMENT '创建人',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(50) DEFAULT NULL COMMENT '更新人',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `sys_org_code` varchar(64) DEFAULT NULL COMMENT '所属部门',
  PRIMARY KEY (`id`),
  KEY `idx_warehouse_id` (`warehouse_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='库位管理';

-- 3. 字典：库位分类
INSERT INTO `sys_dict` (`id`, `dict_name`, `dict_code`, `description`, `del_flag`, `create_by`, `create_time`, `update_by`, `update_time`, `type`)
VALUES
('178198146775501', '库位分类', 'location_category', '库位分类字典', 0, 'admin', NOW(), NULL, NULL, 0);

INSERT INTO `sys_dict_item` (`id`, `dict_id`, `item_text`, `item_value`, `description`, `sort_order`, `status`, `create_by`, `create_time`, `update_by`, `update_time`)
VALUES
('178198146775502', '178198146775501', '存储区', '1', '存储区', 1, 1, 'admin', NOW(), NULL, NULL),
('178198146775503', '178198146775501', '拣货区', '2', '拣货区', 2, 1, 'admin', NOW(), NULL, NULL),
('178198146775504', '178198146775501', '退货区', '3', '退货区', 3, 1, 'admin', NOW(), NULL, NULL),
('178198146775505', '178198146775501', '质检区', '4', '质检区', 4, 1, 'admin', NOW(), NULL, NULL),
('178198146775506', '178198146775501', '待检区', '5', '待检区', 5, 1, 'admin', NOW(), NULL, NULL);

-- 4. 字典：容量单位
INSERT INTO `sys_dict` (`id`, `dict_name`, `dict_code`, `description`, `del_flag`, `create_by`, `create_time`, `update_by`, `update_time`, `type`)
VALUES
('178198146775507', '容量单位', 'capacity_unit', '容量单位字典', 0, 'admin', NOW(), NULL, NULL, 0);

INSERT INTO `sys_dict_item` (`id`, `dict_id`, `item_text`, `item_value`, `description`, `sort_order`, `status`, `create_by`, `create_time`, `update_by`, `update_time`)
VALUES
('178198146775508', '178198146775507', '件', '1', '件', 1, 1, 'admin', NOW(), NULL, NULL),
('178198146775509', '178198146775507', '箱', '2', '箱', 2, 1, 'admin', NOW(), NULL, NULL),
('178198146775510', '178198146775507', '托', '3', '托', 3, 1, 'admin', NOW(), NULL, NULL),
('178198146775511', '178198146775507', '吨', '4', '吨', 4, 1, 'admin', NOW(), NULL, NULL),
('178198146775512', '178198146775507', '立方米', '5', '立方米', 5, 1, 'admin', NOW(), NULL, NULL);

-- 5. 菜单权限
-- 主菜单
INSERT INTO sys_permission(id, parent_id, name, url, component, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_route, is_leaf, keep_alive, hidden, hide_tab, description, status, del_flag, rule_flag, create_by, create_time, update_by, update_time, internal_or_external)
VALUES ('178198146775513', NULL, '仓库管理', '/warehouse/warehouseList', 'warehouse/WarehouseList', NULL, NULL, 0, NULL, '1', 0.00, 0, 'ant-design:home-outlined', 1, 0, 0, 0, 0, NULL, '1', 0, 0, 'admin', '2026-06-21 00:00:00', NULL, NULL, 0);

-- 新增
INSERT INTO sys_permission(id, parent_id, name, url, component, is_route, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_leaf, keep_alive, hidden, hide_tab, description, create_by, create_time, update_by, update_time, del_flag, rule_flag, status, internal_or_external)
VALUES ('178198146775514', '178198146775513', '新增仓库', NULL, NULL, 0, NULL, NULL, 2, 'warehouse:warehouse:add', '1', NULL, 0, NULL, 1, 0, 0, 0, NULL, 'admin', '2026-06-21 00:00:00', NULL, NULL, 0, 0, '1', 0);

-- 编辑
INSERT INTO sys_permission(id, parent_id, name, url, component, is_route, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_leaf, keep_alive, hidden, hide_tab, description, create_by, create_time, update_by, update_time, del_flag, rule_flag, status, internal_or_external)
VALUES ('178198146775515', '178198146775513', '编辑仓库', NULL, NULL, 0, NULL, NULL, 2, 'warehouse:warehouse:edit', '1', NULL, 0, NULL, 1, 0, 0, 0, NULL, 'admin', '2026-06-21 00:00:00', NULL, NULL, 0, 0, '1', 0);

-- 删除
INSERT INTO sys_permission(id, parent_id, name, url, component, is_route, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_leaf, keep_alive, hidden, hide_tab, description, create_by, create_time, update_by, update_time, del_flag, rule_flag, status, internal_or_external)
VALUES ('178198146775516', '178198146775513', '删除仓库', NULL, NULL, 0, NULL, NULL, 2, 'warehouse:warehouse:delete', '1', NULL, 0, NULL, 1, 0, 0, 0, NULL, 'admin', '2026-06-21 00:00:00', NULL, NULL, 0, 0, '1', 0);

-- 批量删除
INSERT INTO sys_permission(id, parent_id, name, url, component, is_route, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_leaf, keep_alive, hidden, hide_tab, description, create_by, create_time, update_by, update_time, del_flag, rule_flag, status, internal_or_external)
VALUES ('178198146775517', '178198146775513', '批量删除仓库', NULL, NULL, 0, NULL, NULL, 2, 'warehouse:warehouse:deleteBatch', '1', NULL, 0, NULL, 1, 0, 0, 0, NULL, 'admin', '2026-06-21 00:00:00', NULL, NULL, 0, 0, '1', 0);

-- 导出excel
INSERT INTO sys_permission(id, parent_id, name, url, component, is_route, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_leaf, keep_alive, hidden, hide_tab, description, create_by, create_time, update_by, update_time, del_flag, rule_flag, status, internal_or_external)
VALUES ('178198146775518', '178198146775513', '导出仓库excel', NULL, NULL, 0, NULL, NULL, 2, 'warehouse:warehouse:exportXls', '1', NULL, 0, NULL, 1, 0, 0, 0, NULL, 'admin', '2026-06-21 00:00:00', NULL, NULL, 0, 0, '1', 0);

-- 导入excel
INSERT INTO sys_permission(id, parent_id, name, url, component, is_route, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_leaf, keep_alive, hidden, hide_tab, description, create_by, create_time, update_by, update_time, del_flag, rule_flag, status, internal_or_external)
VALUES ('178198146775519', '178198146775513', '导入仓库excel', NULL, NULL, 0, NULL, NULL, 2, 'warehouse:warehouse:importExcel', '1', NULL, 0, NULL, 1, 0, 0, 0, NULL, 'admin', '2026-06-21 00:00:00', NULL, NULL, 0, 0, '1', 0);

-- 角色授权（admin角色）
INSERT INTO sys_role_permission (id, role_id, permission_id, data_rule_ids, operate_date, operate_ip) VALUES ('178198146775520', 'f6817f48af4fb3af11b9e8bf182f618b', '178198146775513', NULL, '2026-06-21 00:00:00', '127.0.0.1');
INSERT INTO sys_role_permission (id, role_id, permission_id, data_rule_ids, operate_date, operate_ip) VALUES ('178198146775521', 'f6817f48af4fb3af11b9e8bf182f618b', '178198146775514', NULL, '2026-06-21 00:00:00', '127.0.0.1');
INSERT INTO sys_role_permission (id, role_id, permission_id, data_rule_ids, operate_date, operate_ip) VALUES ('178198146775522', 'f6817f48af4fb3af11b9e8bf182f618b', '178198146775515', NULL, '2026-06-21 00:00:00', '127.0.0.1');
INSERT INTO sys_role_permission (id, role_id, permission_id, data_rule_ids, operate_date, operate_ip) VALUES ('178198146775523', 'f6817f48af4fb3af11b9e8bf182f618b', '178198146775516', NULL, '2026-06-21 00:00:00', '127.0.0.1');
INSERT INTO sys_role_permission (id, role_id, permission_id, data_rule_ids, operate_date, operate_ip) VALUES ('178198146775524', 'f6817f48af4fb3af11b9e8bf182f618b', '178198146775517', NULL, '2026-06-21 00:00:00', '127.0.0.1');
INSERT INTO sys_role_permission (id, role_id, permission_id, data_rule_ids, operate_date, operate_ip) VALUES ('178198146775525', 'f6817f48af4fb3af11b9e8bf182f618b', '178198146775518', NULL, '2026-06-21 00:00:00', '127.0.0.1');
INSERT INTO sys_role_permission (id, role_id, permission_id, data_rule_ids, operate_date, operate_ip) VALUES ('178198146775526', 'f6817f48af4fb3af11b9e8bf182f618b', '178198146775519', NULL, '2026-06-21 00:00:00', '127.0.0.1');
