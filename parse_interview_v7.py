# -*- coding: utf-8 -*-
import json
import re
import sys

def is_comparison_format(text):
    """Check if text is in comparison format"""
    lines = text.split('\n')

    # First check for error/solution format (lines with / separator)
    slash_count = sum(1 for line in lines if ' / ' in line or ('/' in line and line.strip()))
    if slash_count >= 3:
        return True  # Likely error/solution format

    headers = []
    for i, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue

        # Skip if it's an item line (contains colon)
        if ':' in line or '：' in line:
            continue

        # Check if it looks like a header:
        if len(line) < 60:
            has_parens = '(' in line or '（' in line
            is_upper = line.isupper()
            no_trailing_colon = not line.endswith(':') and not line.endswith('：')
            not_answer = not line.startswith('Answer')

            if (has_parens or is_upper) and no_trailing_colon and not_answer:
                headers.append((i, line))

    return len(headers) >= 2

def convert_comparison_to_markdown_table(text):
    """Convert comparison format to markdown table"""
    lines = text.split('\n')

    # Remove title lines like "错误/解决方法"
    filtered_lines = []
    for line in lines:
        line_stripped = line.strip()
        # Skip if it's just a title line (contains slashes but very short)
        if ('/' in line_stripped or '／' in line_stripped) and len(line_stripped) < 20:
            if not any(c.isalnum() for c in line_stripped if c not in '／/（）()'):
                continue
        filtered_lines.append(line)

    # Check for new Q2 format: "SAP FI/ SAP CO" on first line
    first_line = filtered_lines[0].strip() if filtered_lines else ''
    is_headers_on_one_line = False
    headers = []

    if '/' in first_line and len(first_line) < 100:
        if ':' not in first_line and '：' not in first_line:
            parts = first_line.split('/')
            parts = [p.strip() for p in parts if p.strip()]
            if len(parts) >= 2 and all(len(p) < 50 for p in parts):
                headers = parts
                is_headers_on_one_line = True

    if is_headers_on_one_line:
        # New Q2 format processing
        table_lines = []
        table_lines.append('| 特性 | ' + ' | '.join(headers) + ' |')
        table_lines.append('| ' + ' | '.join(['---'] * (len(headers) + 1)) + ' |')

        # Reconstruct content by joining lines, then split by keys
        # Find all lines that start with a key (have colon)
        key_positions = []
        for i, line in enumerate(filtered_lines):
            if not line.strip():
                continue
            # Check if this line has a colon at the start
            has_key = False
            for sep in [':', '：']:
                idx = line.find(sep)
                if idx > 0 and idx < 30:
                    has_key = True
                    break
            if has_key:
                key_positions.append(i)

        # Process each key section
        for idx in key_positions:
            # Get all lines from this key to next key
            start_idx = idx
            end_idx = key_positions[key_positions.index(idx) + 1] if (key_positions.index(idx) + 1) < len(key_positions) else len(filtered_lines)

            # Collect content for this key
            content_lines = []
            for i in range(start_idx, end_idx):
                if i == start_idx:
                    # First line - extract key and first value
                    line = filtered_lines[i].strip()
                    for sep in [':', '：']:
                        if sep in line:
                            parts = line.split(sep, 1)
                            key = parts[0].strip()
                            content_lines.append(parts[1].strip() if len(parts) > 1 else '')
                            break
                else:
                    line = filtered_lines[i].strip()
                    if line and not line.startswith('Answer') and not line.startswith('中文'):
                        content_lines.append(line)

            # Join content and split by /
            full_content = ' '.join(content_lines)
            if ' / ' in full_content:
                values = [v.strip() for v in full_content.split(' / ')]
            elif '/' in full_content:
                values = [v.strip() for v in full_content.split('/')]
            else:
                values = [full_content.strip()]

            # Build table row
            table_lines.append('| ' + key + ' | ' + ' | '.join(values) + ' |')

        return '\n'.join(table_lines)

    # Original error/solution format handling
    slash_lines = [l for l in filtered_lines if ' / ' in l or ('/' in l and l.strip())]
    if len(slash_lines) >= 3:
        table_lines = []
        table_lines.append('| 错误 / Error | 排查解决方法 / Solution |')
        table_lines.append('| --- | --- |')

        i = 0
        while i < len(filtered_lines):
            line = filtered_lines[i].strip()
            if not line:
                i += 1
                continue

            if len(line) < 20 and '/' in line and not any(c.isalnum() for c in line if c not in '／/（）()'):
                i += 1
                continue

            if '/' in line:
                if ' / ' in line:
                    parts = line.split(' / ', 1)
                else:
                    parts = line.split('/', 1)

                if len(parts) == 2:
                    error = parts[0].strip()
                    solution = parts[1].strip()

                    j = i + 1
                    while j < len(filtered_lines):
                        next_line = filtered_lines[j].strip()
                        if (next_line and
                            not next_line.startswith('Answer') and
                            '/' not in next_line and
                            not next_line[0].isdigit() and
                            len(next_line) > 0):
                            solution += ' ' + next_line
                            j += 1
                        else:
                            break

                    table_lines.append(f'| {error} | {solution} |')
                    i = j
                    continue
            i += 1

        return '\n'.join(table_lines)

    # Parse sections for comparison format
    sections = []
    current_header = None
    current_items = []

    for line in lines:
        line_stripped = line.rstrip()
        if not line_stripped:
            continue

        is_header = False
        if line_stripped.startswith('Answer') or line_stripped.startswith('中文'):
            is_header = False
        elif ('(' in line_stripped or '（' in line_stripped) and ':' not in line_stripped and '：' not in line_stripped:
            if len(line_stripped) < 60:
                is_header = True
        elif line_stripped.isupper() and len(line_stripped) < 30:
            is_header = True
        elif re.match(r'^[A-Za-z\s]+[\(（][^\)）]+[\)）]$', line_stripped):
            if len(line_stripped) < 60:
                is_header = True

        if is_header:
            if current_header and current_items:
                sections.append((current_header, current_items))
            current_header = line_stripped
            current_items = []
        elif current_header:
            current_items.append(line_stripped)
        elif ':' in line_stripped or '：' in line_stripped:
            current_header = '特性'
            current_items.append(line_stripped)

    # Don't forget the last section
    if current_header and current_items:
        sections.append((current_header, current_items))

    if len(sections) >= 2 and any(len(items) > 0 for _, items in sections):
        all_keys = []
        seen_keys = set()
        for _, items in sections:
            for item in items:
                for sep in [':', '：']:
                    if sep in item:
                        key = item.split(sep, 1)[0].strip()
                        if key and key not in seen_keys:
                            seen_keys.add(key)
                            all_keys.append(key)
                        break

        if all_keys:
            table_lines = []
            rows = []
            for key in all_keys:
                row = {'key': key, 'values': []}
                for header, items in sections:
                    value = ''
                    for item in items:
                        found = False
                        for sep in [':', '：']:
                            if item.startswith(key + sep):
                                value = item[len(key) + 1:].strip()
                                found = True
                                break
                        if found:
                            break
                    row['values'].append(value)
                rows.append(row)

            if rows and any(any(v['values']) for v in rows):
                header = '| 特性 | ' + ' | '.join([s[0] for s in sections]) + ' |'
                table_lines.append(header)
                num_cols = len(sections) + 1
                separator = '| ' + ' | '.join(['---'] * num_cols) + ' |'
                table_lines.append(separator)
                for row in rows:
                    table_lines.append('| ' + row['key'] + ' | ' + ' | '.join(row['values']) + ' |')

            return '\n'.join(table_lines)

    return text

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

        q_pattern = r'^(\d+)\.\s+(.+?)(?:\n中文[：:]|$)'
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

            cn_question = ''
            cn_match = re.search(r'中文[：:]\s*(.+?)(?:\nAnswer|$)', q_content, re.DOTALL)
            if cn_match:
                cn_question = cn_match.group(1).strip()

            answer_en = ''
            answer_pattern = r'\nAnswer\s*(?:英文[：:]?\s*)?\n?(.+?)(?=\nAnswer\s+(?:中文|英文)|\n\d+\.|\n补充|$)'
            answer_match = re.search(answer_pattern, q_content, re.DOTALL)

            if answer_match:
                answer_en = answer_match.group(1).strip()

            answer_cn = ''
            cn_ans_pattern = r'Answer\s+中文[：:]\s*\n?(.+?)(?=\n\d+\.|\n补充(?:英文|中文)|$)'
            cn_ans_match = re.search(cn_ans_pattern, q_content, re.DOTALL)
            if cn_ans_match:
                answer_cn = cn_ans_match.group(1).strip()

            answer_en = re.sub(r'\n\s*\n\s*', '\n\n', answer_en).strip()
            answer_cn = re.sub(r'\n\s*\n\s*', '\n\n', answer_cn).strip()

            answer_cn = re.split(r'\n补充(?:英文|中文)[：:]', answer_cn)[0].strip()
            answer_en = re.split(r'\n补充(?:英文|中文)[：:]', answer_en)[0].strip()

            if answer_en and is_comparison_format(answer_en):
                answer_en = convert_comparison_to_markdown_table(answer_en)

            if answer_cn and is_comparison_format(answer_cn):
                answer_cn = convert_comparison_to_markdown_table(answer_cn)

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

result = parse_interview_file('D:/26年FICO模块英文学习网站/temp_interview.txt')

output_path = 'D:/26年FICO模块英文学习网站/public/data/interview-qa.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

total_qs = sum(len(p['questions']) for p in result['parts'])
print(f"Successfully parsed {len(result['parts'])} parts with {total_qs} questions")

# Check Q2
for part in result['parts']:
    for q in part['questions']:
        if q['questionNo'] == 'Q2':
            print("\n=== Q2 Table ===")
            for line in q['sampleAnswer'].split('\n'):
                print(line)
            break
