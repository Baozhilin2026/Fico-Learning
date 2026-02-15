# -*- coding: utf-8 -*-
"""
修复Q56和Q57中文答案混在一起的问题
"""
from docx import Document
import json
import re

def fix_q56_q57_answers():
    file_path = 'D:/26年FICO模块英文学习网站/面试题 新.docx'
    json_path = 'D:/26年FICO模块英文学习网站/public/data/interview-qa.json'

    doc = Document(file_path)

    # Load current JSON
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print("=== Extracting answers from Word ===")

    # Q56中文答案应该是866-870行的内容（折旧范围目的相关）
    q56_cn = """折旧范围目的：
账面折旧：按照公司会计政策
税法折旧：为符合政府法规
成本会计折旧：用于内部分析
每个区域可以根据要求过账到不同的分类账/科目。"""

    # Q57中文答案应该在878-883行（资产交易相关）
    # 但从文档看，878行之后的内容很多，让我找到正确的范围
    q57_cn = """资产交易包括：
购置：通过供应商采购或直接录入（例如：借：资产科目，贷：供应商/银行）
处置：从账簿中移除资产，可能有或无收入（例如：借：累计折旧，贷：资产科目；借：资产收入/银行，贷：资产处置收入）
转移：将资产从一个成本中心或公司代码转移到另一个（例如：内部或公司间资产转移）
通过事务代码处理，如ABZON（购置）、ABAVN（处置）、ABUMN（转移）、ABT1N（公司间转移）"""

    # 更新JSON
    for part in data['parts']:
        for q in part['questions']:
            if q['questionNo'] == 'Q56':
                q['sampleAnswerCN'] = q56_cn
                print("Fixed Q56 CN answer")
            elif q['questionNo'] == 'Q57':
                q['sampleAnswerCN'] = q57_cn
                print("Fixed Q57 CN answer")

    # 保存
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("\n=== Verification ===")
    for part in data['parts']:
        for q in part['questions']:
            if q['questionNo'] in ['Q56', 'Q57']:
                print(f"{q['questionNo']}: CN={len(q['sampleAnswerCN'])} chars")

if __name__ == '__main__':
    fix_q56_q57_answers()
