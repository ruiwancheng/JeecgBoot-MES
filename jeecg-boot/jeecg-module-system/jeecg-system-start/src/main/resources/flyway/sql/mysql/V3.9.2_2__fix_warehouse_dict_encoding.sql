-- =====================================================
-- 修复仓库模块字典编码乱码
-- 原因: Flyway disabled，字典数据通过其他途径创建时编码错误
-- 固定: 更新 sys_dict_item 中因编码错误导致的乱码文本
-- =====================================================

-- 使用 _utf8mb4 前缀强制 MySQL 以 UTF-8 解释字符串
-- 避免 JDBC 连接/Flyway 编码差异导致二次乱码

UPDATE sys_dict_item
SET item_text = _utf8mb4'存储区',
    description = _utf8mb4'存储区'
WHERE dict_id = (SELECT id FROM sys_dict WHERE dict_code = 'location_category')
  AND item_value = '1';

UPDATE sys_dict_item
SET item_text = _utf8mb4'拣货区',
    description = _utf8mb4'拣货区'
WHERE dict_id = (SELECT id FROM sys_dict WHERE dict_code = 'location_category')
  AND item_value = '2';

UPDATE sys_dict_item
SET item_text = _utf8mb4'退货区',
    description = _utf8mb4'退货区'
WHERE dict_id = (SELECT id FROM sys_dict WHERE dict_code = 'location_category')
  AND item_value = '3';

UPDATE sys_dict_item
SET item_text = _utf8mb4'质检区',
    description = _utf8mb4'质检区'
WHERE dict_id = (SELECT id FROM sys_dict WHERE dict_code = 'location_category')
  AND item_value = '4';

UPDATE sys_dict_item
SET item_text = _utf8mb4'待检区',
    description = _utf8mb4'待检区'
WHERE dict_id = (SELECT id FROM sys_dict WHERE dict_code = 'location_category')
  AND item_value = '5';

UPDATE sys_dict_item
SET item_text = _utf8mb4'件',
    description = _utf8mb4'件'
WHERE dict_id = (SELECT id FROM sys_dict WHERE dict_code = 'capacity_unit')
  AND item_value = '1';

UPDATE sys_dict_item
SET item_text = _utf8mb4'箱',
    description = _utf8mb4'箱'
WHERE dict_id = (SELECT id FROM sys_dict WHERE dict_code = 'capacity_unit')
  AND item_value = '2';

UPDATE sys_dict_item
SET item_text = _utf8mb4'托',
    description = _utf8mb4'托'
WHERE dict_id = (SELECT id FROM sys_dict WHERE dict_code = 'capacity_unit')
  AND item_value = '3';

UPDATE sys_dict_item
SET item_text = _utf8mb4'吨',
    description = _utf8mb4'吨'
WHERE dict_id = (SELECT id FROM sys_dict WHERE dict_code = 'capacity_unit')
  AND item_value = '4';

UPDATE sys_dict_item
SET item_text = _utf8mb4'立方米',
    description = _utf8mb4'立方米'
WHERE dict_id = (SELECT id FROM sys_dict WHERE dict_code = 'capacity_unit')
  AND item_value = '5';
