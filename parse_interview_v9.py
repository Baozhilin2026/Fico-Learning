# -*- coding: utf-8 -*-
import json
import re

# Only these questions should have table format
TABLE_QUESTIONS = [2, 4, 15, 17, 24, 28, 38, 40, 42, 49, 52, 60, 68, 72, 77, 80]

def should_use_table(question_no):
    num = int(question_no[1:])
    return num in TABLE_QUESTIONS

def convert_section_headers_table(text):
    """Convert section headers format to table - for Q15, Q24, etc."""
    lines = text.split('\n')

    # Remove empty lines at start
    while lines and not lines[0].strip():
        lines.pop(0)

    if not lines:
        return text

    # Find section headers - lines that look like "XXX（中文）" or similar
    headers = []
    header_positions = []

    for i, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue

        # Check if this is a section header:
        # - Contains parentheses with Chinese
        # - No colon at end
        # - Shorter than 60 chars
        # - Not starting with "Answer"
        if (('（' in line and '）' in line) or ('(' in line and ')' in line)):
            if ':' not in line and '：' not in line and not line.endswith(':') and not line.endswith('：'):
                if len(line) < 80 and not line.startswith('Answer'):
                    # Check if next lines have colons (indicating content follows)
                    if i + 1 < len(lines):
                        next_line = lines[i + 1].strip()
                        if ':' in next_line or '：' in next_line:
                            headers.append(line)
                            header_positions.append(i)

    if len(headers) < 2:
        return text

    # Now collect all key-value pairs for each section
    # Key-value format: key: value
    key_values = {}  # key -> [value_for_section_0, value_for_section_1, ...]

    current_section_idx = -1

    for i in range(len(lines)):
        line = lines[i].strip()

        # Skip empty lines and markers
        if not line or line.startswith('Answer') or line.startswith('中文'):
            continue

        # Check if this is a section header
        if line in headers:
            current_section_idx = headers.index(line)
            continue

        # Check if this line has a colon (key-value pair)
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
            # Look ahead for continuation lines
            j = i + 1
            while j < len(lines):
                next_line = lines[j].strip()
                # Stop if we hit another section header, question number, or Answer
                if (not next_line or
                    next_line in headers or
                    next_line.startswith('Answer') or
                    next_line.startswith('中文') or
                    re.match(r'^\d+\.', next_line)):
                    break
                # Stop if next line has a colon (new key-value pair)
                next_has_colon = any(sep in next_line for sep in [':', '：'])
                if next_has_colon:
                    break
                # This is continuation of the value
                value += ' ' + next_line
                j += 1

            # Store the value for the current section
            if key_name not in key_values:
                key_values[key_name] = [''] * len(headers)

            if 0 <= current_section_idx < len(headers):
                key_values[key_name][current_section_idx] = value.strip()

    # Build table
    table_lines = []
    table_lines.append('| 特性 | ' + ' | '.join(headers) + ' |')
    table_lines.append('| ' + ' | '.join(['---'] * (len(headers) + 1)) + ' |')

    for key, values in key_values.items():
        if any(v for v in values):  # Only add row if at least one value exists
            table_lines.append('| ' + key + ' | ' + ' | '.join(values) + ' |')

    return '\n'.join(table_lines)

def convert_slash_style_table(text):
    """Convert slash-separated format to table - for Q17 style"""
    lines = text.split('\n')

    # Remove empty lines at start
    while lines and not lines[0].strip():
        lines.pop(0)

    if not lines:
        return text

    # Check if this has "key: value1 / value2" format on first line
    first_line = lines[0].strip()
    if '/' in first_line and ':' in first_line:
        # Extract headers from first line
        parts = first_line.split('/')
        headers = [p.strip() for p in parts if p.strip()]

        # Remove colon from headers if present
        clean_headers = []
        for h in headers:
            for sep in [':', '：']:
                if sep in h:
                    h = h.split(sep)[0].strip()
            clean_headers.append(h)

        # Now extract key-values from rest of content
        key_values = {}
        current_key = None
        all_content = []

        for line in lines[1:]:
            line = line.strip()
            if not line or line.startswith('Answer') or line.startswith('中文'):
                continue

            # Check if line starts with a key
            has_key = False
            key_name = ''

            for sep in [':', '：']:
                if sep in line:
                    idx = line.find(sep)
                    if idx > 0 and idx < 40:
                        key_name = line[:idx].strip()
                        has_key = True
                        # Save previous key
                        if current_key and all_content:
                            key_values[current_key] = ' '.join(all_content)
                        current_key = key_name
                        # Start new content
                        for s in [':', '：']:
                            if s in line:
                                all_content = [line.split(s, 1)[1].strip()]
                                break
                        break

            if not has_key and current_key:
                all_content.append(line)

        # Don't forget last key
        if current_key and all_content:
            key_values[current_key] = ' '.join(all_content)

        # Build table
        table_lines = []
        table_lines.append('| 特性 | ' + ' | '.join(clean_headers) + ' |')
        table_lines.append('| ' + ' | '.join(['---'] * (len(clean_headers) + 1)) + ' |')

        for key, content in key_values.items():
            # Split by /
            if ' / ' in content:
                values = [v.strip() for v in content.split(' / ')]
            elif '/' in content:
                values = [v.strip() for v in content.split('/')]
            else:
                values = [content]

            # Pad to match header count
            while len(values) < len(clean_headers):
                values.append('')

            table_lines.append('| ' + key + ' | ' + ' | '.join(values[:len(clean_headers)]) + ' |')

        return '\n'.join(table_lines)

    # Error/Solution format - lines with "/" separator
    slash_lines = [l for l in lines if ' / ' in l or '/' in l]

    if len(slash_lines) >= 2:
        # Check if it's error/solution (2 columns)
        first_slash_line = slash_lines[0]
        if ' / ' in first_slash_line:
            parts = first_slash_line.split(' / ')
            if len(parts) >= 2:
                table_lines = []
                table_lines.append('| ' + ' | '.join(parts) + ' |')
                table_lines.append('| ' + ' | '.join(['---'] * len(parts)) + ' |')

                for line in slash_lines[1:]:
                    if ' / ' in line:
                        p = line.split(' / ', 1)
                    elif '/' in line:
                        p = line.split('/', 1)
                    else:
                        continue

                    row_parts = [part.strip() for part in p]
                    while len(row_parts) < len(parts):
                        row_parts.append('')

                    table_lines.append('| ' + ' | '.join(row_parts[:len(parts)]) + ' |')

                return '\n'.join(table_lines)

    return text

def convert_to_table(text):
    """Main table conversion function"""
    if not text:
        return text

    lines = text.split('\n')
    while lines and not lines[0].strip():
        lines.pop(0)

    if not lines:
        return text

    first_line = lines[0].strip()

    # Format 1: Section headers format (Q15, Q24, Q38, etc.)
    # Check for section headers with parentheses
    section_header_result = convert_section_headers_table(text)
    if section_header_result != text and '|' in section_header_result:
        return section_header_result

    # Format 2: Slash style (Q17)
    slash_result = convert_slash_style_table(text)
    if slash_result != text and '|' in slash_result:
        return slash_result

    # Format 3: Q2/Q4/Q28 style - headers on first line
    if '/' in first_line and len(first_line) < 100:
        parts = first_line.split('/')
        parts = [p.strip() for p in parts if p.strip()]
        if len(parts) >= 2 and all(len(p) < 50 for p in parts):
            # This is Q2 format
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
