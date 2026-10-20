# -*- coding: utf-8 -*-
"""
读取全量客户 JSON，每 100 条生成一个 MD 分片文件。
用法：python 04_生成MD分片.py [源JSON路径]
默认源：G:\\1\\探迹客户数据\\结果目录\\客户数据_全量.json
输出：G:\\1\\探迹客户数据\\结果目录\\md\\客户数据_001.md ...（每 100 条一个）
"""
import json
import os
import sys

SRC = sys.argv[1] if len(sys.argv) > 1 else r"G:\1\探迹客户数据\结果目录\客户数据_全量.json"
OUT = r"G:\1\探迹客户数据\结果目录\md"
CHUNK = 100


def cell(v):
    s = str(v) if v not in (None, "") else "--"
    return s.replace("|", "\\|").replace("\r", " ").replace("\n", " ")


def main():
    with open(SRC, "r", encoding="utf-8") as f:
        data = json.load(f)
    os.makedirs(OUT, exist_ok=True)
    total = len(data)
    n_files = (total + CHUNK - 1) // CHUNK
    for fi in range(n_files):
        part = data[fi * CHUNK:(fi + 1) * CHUNK]
        lines = [
            "# 探迹客户数据 · 第 %d/%d 批（第 %d~%d 条）" % (
                fi + 1, n_files, fi * CHUNK + 1, fi * CHUNK + len(part)),
            "",
            "| 序号 | 客户名称 | 公司名称 | 公司法人 | Hot联系方式 | 负责人 |",
            "| --- | --- | --- | --- | --- | --- |",
        ]
        for it in part:
            lines.append("| %s | %s | %s | %s | %s | %s |" % (
                cell(it.get("no")),
                cell(it.get("name")),
                cell(it.get("company")),
                cell(it.get("legal")),
                cell(it.get("hot")),
                cell(it.get("charger")),
            ))
        path = os.path.join(OUT, "客户数据_%03d.md" % (fi + 1))
        with open(path, "w", encoding="utf-8") as f:
            f.write("\n".join(lines) + "\n")
    print("完成：共 %d 条数据，生成 %d 个 MD 分片 -> %s" % (total, n_files, OUT))


if __name__ == "__main__":
    main()
