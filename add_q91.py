# -*- coding: utf-8 -*-
"""
添加Q91到JSON
"""
import json

def add_q91():
    json_path = 'D:/26年FICO模块英文学习网站/public/data/interview-qa.json'

    # Q91 from Word document
    q91_en = "Use T-code: OB58\nCreate a new version or copy from an existing one\nDefine hierarchy nodes (Assets, Liabilities, Income, Expenses)\nAssign GL accounts or account ranges to groups\nUse it in F.01 (Financial Statement Report)\nThis allows flexible and customized reporting for stakeholders."

    q91_cn = "在SAP FI中，如何生成财务报表版本？\n使用T代码：OB58\n创建新版本或从现有版本复制\n定义层次节点（资产、负债、收入、费用）\n将总账科目或科目范围分配到组\n在F.01（财务报表）中使用\n这允许向利益相关者提供灵活和定制的报告。"

    # Load JSON
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Find PART9 and add Q91
    for part in data['parts']:
        if part['partId'] == 'PART9':
            new_q = {
                'questionNo': 'Q91',
                'questionContent': 'How do you generate a financial statement version in SAP FI?',
                'questionContentCN': '在SAP FI中，如何生成财务报表版本？',
                'sampleAnswer': q91_en,
                'sampleAnswerCN': q91_cn
            }
            part['questions'].append(new_q)
            print(f"Added Q91 to {part['partId']}")
            break

    # Save
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\n=== Done! ===")
    print(f"Total questions now: {sum(len(p['questions']) for p in data['parts'])}")

if __name__ == '__main__':
    add_q91()
