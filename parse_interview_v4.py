# -*- coding: utf-8 -*-
import json
import re
import sys

def convert_comparison_to_table(text):
    """Convert comparison format to markdown table"""
    lines = text.split('\n')

    # Detect comparison format (e.g., "SAP FI", "SAP CO" as section headers)
    sections = []
    current_section = None
    current_items = []

    for line in lines:
        line = line.rstrip()
        if not line:
            if current_section and current_items:
                sections.append((current_section, current_items))
                current_section = None
                current_items = []
            continue

        # Check if this is a section header (line with Chinese/English only, no colon on first line)
        # Pattern: Section name followed by items with colons
        if ':' not in line and not line.startswith(' ') and line.strip():
            # Save previous section
            if current_section and current_items:
                sections.append((current_section, current_items))
                current_items = []
            current_section = line.strip()
        elif current_section:
            current_items.append(line.strip())

    # Don't forget the last section
    if current_section and current_items:
        sections.append((current_section, current_items))

    # If we found 2+ sections, convert to table
    if len(sections) >= 2:
        # Collect all unique keys from all sections
        all_keys = []
        for _, items in sections:
            for item in items:
                if ':' in item:
                    key = item.split(':', 1)[0].strip()
                    if key not in all_keys:
                        all_keys.append(key)

        # Build markdown table
        table_lines = []
        # Header row
        header = '| ' + ' | '.join(['特性'] + [s[0] for s in sections]) + ' |'
        table_lines.append(header)
        # Separator row
        separator = '|' + '|'.join(['---'] + ['---' for _ in sections]) + '|'
        table_lines.append(separator)

        # Data rows
        for key in all_keys:
            row = [key]
            for _, items in sections:
                value = ''
                for item in items:
                    if item.startswith(key + ':') or item.startswith(key + '：'):
                        value = item.split(':', 1)[1].split('：', 1)[-1].strip()
                        break
                row.append(value)
            table_lines.append('| ' + ' | '.join(row) + ' |')

        return '\n'.join(table_lines)

    return text

def parse_interview_file(file_path):
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    # Remove the first line (line count from wc)
    lines = content.split('\n')
    if lines and lines[0].isdigit() and len(lines[0].split()) == 1:
        content = '\n'.join(lines[1:])

    # Find all section headers
    section_pattern = r'([一二三四五六七八九十]+、)\s*(.+?)(?:\s+Questions?)?\s*$'
    section_matches = list(re.finditer(section_pattern, content, re.MULTILINE))

    parts = []
    q_counter = 1

    for idx, match in enumerate(section_matches):
        section_num = match.group(1)
        section_title = match.group(2).strip()
        section_start = match.end()

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

        # Find all questions
        q_pattern = r'^(\d+)\.\s+(.+?)(?:\n中文：|$)'
        q_matches = list(re.finditer(q_pattern, section_content, re.MULTILINE))

        for q_idx, q_match in enumerate(q_matches):
            q_num = q_match.group(1)
            q_text = q_match.group(2).strip()
            q_start = q_match.start()

            if q_idx + 1 < len(q_matches):
                q_end = q_matches[q_idx + 1].start()
            else:
                q_end = len(section_content)

            q_content = section_content[q_start:q_end]

            # Extract Chinese question
            cn_question = ''
            cn_match = re.search(r'中文：(.+?)(?:\nAnswer|$)', q_content, re.DOTALL)
            if cn_match:
                cn_question = cn_match.group(1).strip()

            # Find Answer section
            answer_match = re.search(r'\nAnswer\s*(?:英文：)?\s*\n?(.+?)(?=Answer\s+中文：|Answer\s*$|中文：|$)', q_content, re.DOTALL)

            answer_en = ''
            if answer_match:
                answer_en = answer_match.group(1).strip()

            # Find Chinese answer
            answer_cn = ''
            cn_ans_match = re.search(r'Answer\s+中文：\s*\n?(.+?)(?:\d+\.\s|$)', q_content, re.DOTALL)
            if cn_ans_match:
                answer_cn = cn_ans_match.group(1).strip()

            # Clean up answers
            answer_en = re.sub(r'\n\s*\n\s*', '\n\n', answer_en).strip()
            answer_cn = re.sub(r'\n\s*\n\s*', '\n\n', answer_cn).strip()

            # Remove "补充" sections if any
            answer_cn = re.split(r'补充(?:英文|中文)：', answer_cn)[0].strip()

            # Convert comparison format to table for English answer
            if answer_en and not '|' in answer_en:
                converted_en = convert_comparison_to_table(answer_en)
                if converted_en != answer_en:
                    answer_en = converted_en

            # Convert comparison format to table for Chinese answer
            if answer_cn and not '|' in answer_cn:
                converted_cn = convert_comparison_to_table(answer_cn)
                if converted_cn != answer_cn:
                    answer_cn = converted_cn

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
output_path = 'D:/26年FICO模块英文学习网站/public/data/interview-qa.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

total_qs = sum(len(p['questions']) for p in result['parts'])
print(f"Successfully parsed {len(result['parts'])} parts with {total_qs} questions")

# Print Q2 as sample
for part in result['parts']:
    for q in part['questions']:
        if q['questionNo'] == 'Q2':
            print("\n=== Q2 Sample ===")
            print(f"Question: {q['questionContent']}")
            print(f"Answer EN (first 200 chars):\n{q['sampleAnswer'][:200]}")
            break
