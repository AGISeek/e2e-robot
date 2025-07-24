# 概要设计
编写一个脚本，通过 Claude Code SDK 完成以下操作：

1. 使用 Claude Code SDK 通过 playwright mcp 打开一个站点： https://www.baidu.com
2. 分析站点的可交互元素，并且写入一个文件
3. 撰写测试场景设计文档
4. 根据设计文档，生成测试代码
5. 以上操作都必须通过 Claude Code SDK 完成，通过提示词的方式。
6. 需要通过 Claude Code SDK 检查测试代码是否正确，如果不正确，提示修改，直到正确为止。
