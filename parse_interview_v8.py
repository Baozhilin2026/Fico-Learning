# -*- coding: utf-8 -*-
import json
import re

# Only these questions should have table format
TABLE_QUESTIONS = [2, 4, 15, 17, 24, 28, 38, 40, 42, 49, 52, 60, 68, 72, 77, 80]

def should_use_table(question_no):
    num = int(question_no[1:])
    return num in TABLE_QUESTIONS

def convert_to_table(text):
    """Convert various comparison formats to markdown table"""
    if not text:
        return text

    lines = text.split('\n')
    # Remove empty lines at start
    while lines and not lines[0].strip():
        lines.pop(0)

    if not lines:
        return text

    # Format 1: Q2 style - headers on first line like "SAP FI/ SAP CO"
    first_line = lines[0].strip()
    if '/' in first_line and len(first_line) < 100 and ':' not in first_line:
        parts = first_line.split('/')
        parts = [p.strip() for p in parts if p.strip()]
        if len(parts) >= 2 and all(len(p) < 50 for p in parts):
            return convert_q2_style(lines, parts)

    # Format 2: Section headers format (like Q15, Q24)
    # Look for headers like "Proposal Run（提议运行）"
    section_headers = []
    for i, line in enumerate(lines):
        line = line.strip()
        if '（' in line and '）' in line and ':' not in line and '：' not in line:
            if len(line) < 60 and i > 0:
                section_headers.append((i, line))

    if len(section_headers) >= 2:
        return convert_section_headers_style(lines, section_headers)

    # Format 3: Error/Solution format with "/" separator
    if any(' / ' in l for l in lines):
        return convert_slash_style(lines)

    return text

def convert_q2_style(lines, headers):
    """Convert Q2 style format to table"""
    table_lines = []
    table_lines.append('| 特性 | ' + ' | '.join(headers) + ' |')
    table_lines.append('| ' + ' | '.join(['---'] * (len(headers) + 1)) + ' |')

    key_sections = []
    current_key = None
    current_content = []

    for line in lines[1:]:
        line = line.strip()
        if not line or line.startswith('Answer') or line.startswith('中文'):
            continue

        has_key = False
        key_name = ''
        for sep in [':', '：']:
            idx = line.find(sep)
            if idx > 0 and idx < 30:
                key_name = line[:idx].strip()
                has_key = True
                break

        if has_key:
            if current_key and current_content:
                key_sections.append((current_key, current_content))
            current_key = key_name
            for sep in [':', '：']:
                if sep in line:
                    current_content = [line.split(sep, 1)[1].strip()]
                    break
        elif current_key:
            current_content.append(line)

    if current_key and current_content:
        key_sections.append((current_key, current_content))

    for key, content_list in key_sections:
        full_content = ' '.join(content_list)
        if ' / ' in full_content:
            values = [v.strip() for v in full_content.split(' / ')]
        elif '/' in full_content:
            values = [v.strip() for v in full_content.split('/')]
        else:
            values = [full_content]

        while len(values) < len(headers):
            values.append('')
        table_lines.append('| ' + key + ' | ' + ' | '.join(values[:len(headers)]) + ' |')

    return '\n'.join(table_lines)

def convert_section_headers_style(lines, section_headers):
    """Convert section headers style (like Q15, Q24) to table"""
    headers = [h[1] for h in section_headers]
    table_lines = []
    table_lines.append('| ' + ' | '.join(headers) + ' |')
    table_lines.append('| ' + ' | '.join(['---'] * len(headers)) + ' |')

    # Map key to values (index -> value)
    key_values = {}

    current_section = -1
    for i in range(len(lines)):
        line = lines[i].strip()

        # Check if this is a section header
        for idx, (pos, header) in enumerate(section_headers):
            if line == header and i > 0:
                current_section = idx
                continue

        # Skip non-content lines
        if not line or line.startswith('Answer') or line.startswith('中文') or line == headers[0] or line == headers[1]:
            continue

        # Check for key-value pair
        has_key = False
        key_name = ''
        value = ''
        for sep in [':', '：']:
            if sep in line:
                parts = line.split(sep, 1)
                if len(parts) >= 1:
                    key_name = parts[0].strip()
                    value = parts[1].strip() if len(parts) > 1 else ''
                    has_key = True
                    # Look ahead for continuation
                    j = i + 1
                    while j < len(lines):
                        next_line = lines[j].strip()
                        if (not next_line or
                            next_line.startswith('Answer') or
                            next_line.startswith('中文') or
                            next_line[0].isdigit() or
                            any(h[1] == next_line for h in section_headers)):
                            break
                        # Check if next line starts with a new key
                        next_has_key = False
                        for s in [':', '：']:
                            if s in next_line and next_line.find(s) < 30:
                                next_has_key = True
                                break
                        if next_has_key:
                            break
                        value += ' ' + next_line
                        j += 1
                    break
        if has_key and current_section >= 0:
            if key_name not in key_values:
                key_values[key_name] = [''] * len(headers)
            key_values[key_name][current_section] = value

    # Build table rows
    for key, values in key_values.items():
        table_lines.append('| ' + key + ' | ' + ' | '.join(values) + ' |')

    return '\n'.join(table_lines)

def convert_slash_style(lines):
    """Convert slash-separated style to table"""
    table_lines = []

    # Determine if it's error/solution or multi-column format
    slash_lines = [l for l in lines if ' / ' in l or '/' in l]

    if len(slash_lines) >= 2:
        # Check if it's error/solution (2 columns) or multi-column
        first_slash_line = slash_lines[0]
        if ' / ' in first_slash_line:
            parts = first_slash_line.split(' / ')
            if len(parts) == 2:
                # Check if it's error/solution (Error / Solution)
                if any(w in parts[0].upper() for w in ['ERROR', '错误', 'WRONG', '错误']):
                    table_lines.append('| ' + ' | '.join(parts) + ' |')
                    table_lines.append('| --- | --- |')
                    for line in slash_lines[1:]:
                        if ' / ' in line:
                            p = line.split(' / ', 1)
                        elif '/' in line:
                            p = line.split('/', 1)
                        else:
                            continue
                        if len(p) == 2:
                            table_lines.append(f'| {p[0].strip()} | {p[1].strip()} |')
                    return '\n'.join(table_lines)

    return ' '.join(lines)

def parse_interview_file(file_path):
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    lines = content.split('\n')
    if lines and lines[0].isdigit() and len(lines[0].split()) == 1:
        content = '\n'.join(lines[1:])

    section_pattern = r'([一二三四五六七八九十]+、)\s*(.+?)(?:\s+Questions?)?\s*$'
    section_matches = list(re.finditer(section_pattern, content, re.MULTILINE))

    parts = []
    q_counter = 1

    for idx, match in enumerate(section_matches):
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

        # Find all questions in this section
        q_pattern = r'^(\d+)\.\s+'
        q_lines = []
        for i, line in enumerate(section_content.split('\n')):
            if re.match(q_pattern, line):
                q_lines.append((i, line))

        for q_idx, (pos, line) in enumerate(q_lines):
            q_num = re.match(r'^(\d+)\.\s+', line).group(1)
            q_text = re.sub(r'^\d+\.\s+', '', line).strip()

            q_start = pos + len(q_num) + 1  # Skip the number and dot

            # Find where next question starts
            if q_idx + 1 < len(q_lines):
                q_end = q_lines[q_idx + 1][0]
            else:
                q_end = len(section_content.split('\n'))

            q_content = '\n'.join(section_content.split('\n')[q_start:q_end])

            # Extract Chinese question
            cn_question = ''
            cn_match = re.search(r'中文[：:]\s*(.+?)(?=\nAnswer|$)', q_content, re.DOTALL)
            if cn_match:
                cn_question = cn_match.group(1).strip()

            # Extract English answer - everything from "Answer" until next question or end
            answer_en = ''
            answer_match = re.search(r'\nAnswer\s*\n?(.+?)(?=\n\d+\.|$)', q_content, re.DOTALL)
            if answer_match:
                answer_en = answer_match.group(1).strip()

            # Extract Chinese answer
            answer_cn = ''
            cn_ans_match = re.search(r'Answer\s+中文[：:]\s*\n?(.+?)(?=\n\d+\.|$)', q_content, re.DOTALL)
            if cn_ans_match:
                answer_cn = cn_ans_match.group(1).strip()

            # Clean up answers
            answer_en = re.sub(r'\n\s*\n\s*', '\n\n', answer_en).strip()
            answer_cn = re.sub(r'\n\s*\n\s*', '\n\n', answer_cn).strip()

            # Remove "补充" sections
            answer_cn = re.split(r'\n补充(?:英文|中文)[：:]', answer_cn)[0].strip()
            answer_en = re.split(r'\n补充(?:英文|中文)[：:]', answer_en)[0].strip()

            # Apply table conversion only for specified questions
            if answer_en and should_use_table(f'Q{q_counter}'):
                converted = convert_to_table(answer_en)
                if converted != answer_en:
                    answer_en = converted

            if answer_cn and should_use_table(f'Q{q_counter}'):
                converted = convert_to_table(answer_cn)
                if converted != answer_cn:
                    answer_cn = converted

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

# Check table questions
print("\nTable questions status:")
for part in result['parts']:
    for q in part['questions']:
        num = int(q['questionNo'][1:])
        if num in TABLE_QUESTIONS:
            has_table = '|' in q['sampleAnswer']
            has_en = bool(q['sampleAnswer'])
            print(f"{q['questionNo']}: Table={has_table}, EN={has_en}")
