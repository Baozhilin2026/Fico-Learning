# -*- coding: utf-8 -*-
import json
import re
import sys

# Force UTF-8 encoding for Windows
if sys.platform == 'win32':
    import io
    sys.stdin = io.TextIOWrapper(sys.stdin.buffer, encoding='utf-8')
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def parse_interview_file(file_path):
    # Read file with UTF-8 encoding
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    # Remove the first line (line count from wc)
    lines = content.split('\n')
    if lines and lines[0].isdigit() and len(lines[0].split()) == 1:
        content = '\n'.join(lines[1:])

    # Find all section headers (一、, 二、, etc.)
    section_pattern = r'([一二三四五六七八九十]+、)\s*(.+?)(?:\s+Questions?)?\s*$'
    section_matches = list(re.finditer(section_pattern, content, re.MULTILINE))

    parts = []
    q_counter = 1

    for idx, match in enumerate(section_matches):
        section_num = match.group(1)
        section_title = match.group(2).strip()
        section_start = match.end()

        # Find where next section starts
        if idx + 1 < len(section_matches):
            section_end = section_matches[idx + 1].start()
        else:
            section_end = len(content)

        section_content = content[section_start:section_end]

        part = {
            'partId': f'SCENARIO{idx+1}',
            'partName': section_title,
            'questions': []
        }

        # Find all questions in this section
        # Questions start with numbers like "1.", "2.", etc.
        q_pattern = r'^(\d+)\.\s+(.+?)(?:\n中文：|$)'
        q_matches = list(re.finditer(q_pattern, section_content, re.MULTILINE))

        for q_idx, q_match in enumerate(q_matches):
            q_num = q_match.group(1)
            q_text = q_match.group(2).strip()
            q_start = q_match.end()

            # Find where next question starts
            if q_idx + 1 < len(q_matches):
                q_end = q_matches[q_idx + 1].start()
            else:
                q_end = len(section_content)

            q_content = section_content[q_match.start():q_end]

            # Extract Chinese question
            cn_question = ''
            cn_match = re.search(r'中文：(.+?)(?:\nAnswer|$)', q_content, re.DOTALL)
            if cn_match:
                cn_question = cn_match.group(1).strip()

            # Extract English answer
            answer_en = ''
            # Look for "Answer" followed by content until "Answer 中文：" or end
            en_match = re.search(r'Answer\s+(?:英文：)?\s*\n?(.+?)(?=Answer\s+中文：|中文：|$)', q_content, re.DOTALL)
            if en_match:
                answer_en = en_match.group(1).strip()

            # Extract Chinese answer
            answer_cn = ''
            cn_ans_match = re.search(r'Answer\s+中文：\s*\n?(.+?)(?=补充|$)', q_content, re.DOTALL)
            if cn_ans_match:
                answer_cn = cn_ans_match.group(1).strip()

            # Also check for standalone "中文：" after Answer
            if not answer_cn:
                cn_alt_match = re.search(r'\nAnswer\s*\n\s*([^\n]+[\u4e00-\u9fff].+?)(?=\d+\.\s|$)', q_content, re.DOTALL)
                if cn_alt_match:
                    answer_cn = cn_alt_match.group(1).strip()

            # Clean up answers
            answer_en = re.sub(r'\n\s*\n\s*', '\n\n', answer_en).strip()
            answer_cn = re.sub(r'\n\s*\n\s*', '\n\n', answer_cn).strip()

            # Remove "补充" sections if any
            answer_cn = re.split(r'补充(?:英文|中文)：', answer_cn)[0].strip()

            part['questions'].append({
                'questionNo': f'Q{q_counter}',
                'questionContent': q_text,
                'questionContentCN': cn_question,
                'sampleAnswer': answer_en,
                'sampleAnswerCN': answer_cn
            })
            q_counter += 1

        if part['questions']:
            parts.append(part)

    return {
        'documentName': 'SAP FICO Interview Questions - 100 Questions by Scenario',
        'parts': parts
    }

# Parse the file
result = parse_interview_file('D:/26年FICO模块英文学习网站/temp_interview.txt')

# Save to JSON
output_path = 'D:/26年FICO模块英文学习网站/public/data/interview-qa-new.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

total_qs = sum(len(p['questions']) for p in result['parts'])
print(f"Successfully parsed {len(result['parts'])} parts with {total_qs} questions")

# Print sample questions
if result['parts']:
    for i, part in enumerate(result['parts'][:2]):
        print(f"\nPart {i+1}: {part['partName']}")
        if part['questions']:
            q = part['questions'][0]
            print(f"  Q{q['questionNo']}: {q['questionContent'][:50]}...")
            print(f"  CN: {q['questionContentCN'][:30]}...")
            print(f"  A_EN: {q['sampleAnswer'][:50] if q['sampleAnswer'] else '(empty)'}...")
            print(f"  A_CN: {q['sampleAnswerCN'][:50] if q['sampleAnswerCN'] else '(empty)'}...")
