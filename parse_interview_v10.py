# -*- coding: utf-8 -*-
import json
import re

# Only these questions should have table format
TABLE_QUESTIONS = [2, 4, 15, 17, 24, 28, 38, 40, 42, 49, 52, 60, 68, 72, 77, 80]

def should_use_table(question_no):
    num = int(question_no[1:])
    return num in TABLE_QUESTIONS

def convert_section_headers_table(text):
    """Format: Section headers like 'XXX（中文）' with repeated keys across sections
    Examples: Q15, Q24, Q38"""
    lines = text.split('\n')

    # Remove empty lines at start
    while lines and not lines[0].strip():
        lines.pop(0)

    if not lines:
        return text

    # Find section headers
    headers = []
    header_positions = []

    for i, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue

        # Section header: contains parentheses, no colon, not Answer
        if ('（' in line and '）' in line) or ('(' in line and ')' in line):
            if ':' not in line and '：' not in line and not line.startswith('Answer'):
                if len(line) < 100:
                    headers.append(line)
                    header_positions.append(i)

    if len(headers) < 2:
        return text

    # Build key->values mapping
    key_values = {}  # key -> [value_for_section_0, value_for_section_1, ...]
    current_section_idx = -1
    current_key = None
    current_value_parts = []

    for i in range(len(lines)):
        line = lines[i].strip()

        # Skip empty lines and markers
        if not line or line.startswith('Answer') or line.startswith('中文'):
            continue

        # Check if this is a section header
        if line in headers:
            # Save previous key-value
            if current_key and current_value_parts:
                if current_key not in key_values:
                    key_values[current_key] = [''] * len(headers)
                if 0 <= current_section_idx < len(headers):
                    key_values[current_key][current_section_idx] = ' '.join(current_value_parts).strip()
            current_section_idx = headers.index(line)
            current_key = None
            current_value_parts = []
            continue

        # Check if this line starts a new key-value pair
        has_colon = False
        key_name = ''
        value = ''

        for sep in [':', '：']:
            if sep in line:
                parts = line.split(sep, 1)
                if len(parts) >= 1:
                    key_name = parts[0].strip()
                    value = parts[1].strip() if len(parts) > 1 else ''
                    has_colon = True
                break

        if has_colon and key_name:
            # Save previous key-value
            if current_key and current_value_parts:
                if current_key not in key_values:
                    key_values[current_key] = [''] * len(headers)
                if 0 <= current_section_idx < len(headers):
                    key_values[current_key][current_section_idx] = ' '.join(current_value_parts).strip()

            current_key = key_name
            current_value_parts = [value] if value else []
        elif current_key:
            # Continuation of current value
            current_value_parts.append(line)

    # Don't forget last key-value
    if current_key and current_value_parts:
        if current_key not in key_values:
            key_values[current_key] = [''] * len(headers)
        if 0 <= current_section_idx < len(headers):
            key_values[current_key][current_section_idx] = ' '.join(current_value_parts).strip()

    # Build table
    if not key_values:
        return text

    table_lines = []
    table_lines.append('| 特性 | ' + ' | '.join(headers) + ' |')
    table_lines.append('| ' + ' | '.join(['---'] * (len(headers) + 1)) + ' |')

    for key, values in key_values.items():
        if any(v for v in values):
            table_lines.append('| ' + key + ' | ' + ' | '.join(values) + ' |')

    return '\n'.join(table_lines)

def convert_slash_rows_format(text):
    """Format: Header like 'Type/ Description' then rows with 'key/ value'
    Examples: Q60, Q68"""
    lines = text.split('\n')

    # Remove empty lines at start
    while lines and not lines[0].strip():
        lines.pop(0)

    if not lines:
        return text

    # Find header row (first non-empty line with "/" and no colon)
    header_line = None
    header_idx = -1

    for i, line in enumerate(lines):
        line = line.strip()
        if not line or line.startswith('Answer') or line.startswith('中文'):
            continue
        if '/' in line and ':' not in line and '：' not in line:
            header_line = line
            header_idx = i
            break

    if not header_line:
        return text

    # Parse headers
    headers = [h.strip() for h in header_line.split('/')]
    if len(headers) < 2:
        return text

    # Find all data rows (lines with "/" after header)
    data_rows = []
    for i in range(header_idx + 1, len(lines)):
        line = lines[i].strip()
        if not line or line.startswith('Answer') or line.startswith('中文'):
            continue
        if '/' in line:
            data_rows.append(line)

    if len(data_rows) < 2:
        return text

    # Build table
    table_lines = []
    table_lines.append('| ' + ' | '.join(headers) + ' |')
    table_lines.append('| ' + ' | '.join(['---'] * len(headers)) + ' |')

    for row in data_rows:
        parts = [p.strip() for p in row.split('/', len(headers) - 1)]
        while len(parts) < len(headers):
            parts.append('')
        table_lines.append('| ' + ' | '.join(parts[:len(headers)]) + ' |')

    return '\n'.join(table_lines)

def convert_two_column_slash_format(text):
    """Format: 'Header1/ Header2' then 'Key: value1/ value2'
    Examples: Q72, Q77, Q80"""
    lines = text.split('\n')

    # Remove empty lines at start
    while lines and not lines[0].strip():
        lines.pop(0)

    if not lines:
        return text

    # Find header row (first non-empty line with "/" and no colon at end)
    header_line = None
    header_idx = -1

    for i, line in enumerate(lines):
        line = line.strip()
        if not line or line.startswith('Answer') or line.startswith('中文'):
            continue
        if '/' in line and not line.endswith(':') and not line.endswith('：'):
            if ':' not in line or line.count('/') >= 2:
                header_line = line
                header_idx = i
                break

    if not header_line:
        return text

    # Parse headers
    headers = [h.strip() for h in header_line.split('/')]
    if len(headers) < 2:
        return text

    # Find all key-value pairs (lines with colon)
    key_values = {}  # key -> [value1, value2]

    i = header_idx + 1
    while i < len(lines):
        line = lines[i].strip()
        if not line or line.startswith('Answer') or line.startswith('中文'):
            i += 1
            continue

        # Check for key-value pair
        has_key = False
        key_name = ''
        value_start = ''

        for sep in [':', '：']:
            if sep in line:
                parts = line.split(sep, 1)
                if len(parts) >= 1:
                    key_name = parts[0].strip()
                    value_start = parts[1].strip() if len(parts) > 1 else ''
                    has_key = True
                break

        if has_key and key_name:
            # Collect full value (may span multiple lines)
            full_value = value_start
            j = i + 1
            while j < len(lines):
                next_line = lines[j].strip()
                if (not next_line or
                    next_line.startswith('Answer') or
                    next_line.startswith('中文') or
                    any(sep in next_line for sep in [':', '：'])):
                    break
                full_value += ' ' + next_line
                j += 1

            # Split by /
            if ' / ' in full_value:
                values = [v.strip() for v in full_value.split(' / ')]
            elif '/' in full_value:
                values = [v.strip() for v in full_value.split('/')]
            else:
                values = [full_value]

            while len(values) < len(headers):
                values.append('')

            key_values[key_name] = values[:len(headers)]
            i = j
        else:
            i += 1

    if not key_values:
        return text

    # Build table
    table_lines = []
    table_lines.append('| 特性 | ' + ' | '.join(headers) + ' |')
    table_lines.append('| ' + ' | '.join(['---'] * (len(headers) + 1)) + ' |')

    for key, values in key_values.items():
        table_lines.append('| ' + key + ' | ' + ' | '.join(values) + ' |')

    return '\n'.join(table_lines)

def convert_q2_format(text):
    """Format: 'Header1/ Header2' then 'key: value1/ value2' on same lines
    Examples: Q2, Q4, Q28"""
    lines = text.split('\n')

    # Remove empty lines at start
    while lines and not lines[0].strip():
        lines.pop(0)

    if not lines:
        return text

    first_line = lines[0].strip()

    # Check if first line looks like headers (has "/" but no colon)
    if '/' not in first_line or ':' in first_line or '：' in first_line:
        return text

    parts = first_line.split('/')
    parts = [p.strip() for p in parts if p.strip()]
    if len(parts) < 2:
        return text

    table_lines = []
    table_lines.append('| 特性 | ' + ' | '.join(parts) + ' |')
    table_lines.append('| ' + ' | '.join(['---'] * (len(parts) + 1)) + ' |')

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
            if idx > 0 and idx < 40:
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

        while len(values) < len(parts):
            values.append('')
        table_lines.append('| ' + key + ' | ' + ' | '.join(values[:len(parts)]) + ' |')

    return '\n'.join(table_lines)

def convert_error_solution_format(text):
    """Format: Error/ Solution rows"""
    lines = text.split('\n')

    # Remove empty lines at start
    while lines and not lines[0].strip():
        lines.pop(0)

    if not lines:
        return text

    # Look for lines with "/" separator
    slash_lines = [l for l in lines if ' / ' in l or ('/' in l and l.strip())]

    if len(slash_lines) < 2:
        return text

    table_lines = []

    # Use first line as headers
    first_slash_line = slash_lines[0]
    if ' / ' in first_slash_line:
        headers = first_slash_line.split(' / ')
    else:
        headers = first_slash_line.split('/')

    headers = [h.strip() for h in headers if h.strip()]
    table_lines.append('| ' + ' | '.join(headers) + ' |')
    table_lines.append('| ' + ' | '.join(['---'] * len(headers)) + ' |')

    for line in slash_lines[1:]:
        if ' / ' in line:
            parts = line.split(' / ', len(headers) - 1)
        elif '/' in line:
            parts = line.split('/', len(headers) - 1)
        else:
            continue

        parts = [p.strip() for p in parts]
        while len(parts) < len(headers):
            parts.append('')
        table_lines.append('| ' + ' | '.join(parts[:len(headers)]) + ' |')

    return '\n'.join(table_lines)

def convert_to_table(text):
    """Main table conversion function - tries all formats"""
    if not text:
        return text

    # Try each format in order
    formats = [
        convert_section_headers_table,   # Q15, Q24, Q38
        convert_slash_rows_format,       # Q60, Q68
        convert_two_column_slash_format, # Q72, Q77, Q80
        convert_q2_format,               # Q2, Q4, Q28
        convert_error_solution_format,   # Q17, Q40, Q42, etc.
    ]

    for format_func in formats:
        result = format_func(text)
        if result != text and '|' in result and result.count('|') >= 6:
            return result

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

            q_start = pos
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

            # Extract English answer
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
            question_no = f'Q{q_counter}'
            if answer_en and should_use_table(question_no):
                converted = convert_to_table(answer_en)
                if '|' in converted:
                    answer_en = converted

            if answer_cn and should_use_table(question_no):
                converted = convert_to_table(answer_cn)
                if '|' in converted:
                    answer_cn = converted

            part['questions'].append({
                'questionNo': question_no,
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

# Also check Q19, Q27
print("\nChecking Q19 (English) and Q27 (Chinese):")
for part in result['parts']:
    for q in part['questions']:
        if q['questionNo'] == 'Q19':
            print(f"Q19 EN: {bool(q['sampleAnswer'])} - Length: {len(q['sampleAnswer'])}")
        if q['questionNo'] == 'Q27':
            print(f"Q27 CN: {bool(q['sampleAnswerCN'])} - Length: {len(q['sampleAnswerCN'])}")

# Check Q22, Q29 don't have tables
print("\nQ22, Q29 table status (should be False):")
for part in result['parts']:
    for q in part['questions']:
        if q['questionNo'] in ['Q22', 'Q29']:
            has_table = '|' in q['sampleAnswer']
            print(f"{q['questionNo']}: Table={has_table}")
