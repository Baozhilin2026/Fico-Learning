# -*- coding: utf-8 -*-
import json
import re

# Only these questions should have table format
TABLE_QUESTIONS = [2, 4, 15, 17, 24, 28, 38, 40, 42, 49, 52, 60, 68, 72, 77, 80]

def should_use_table(question_no):
    """Check if this question should use table format"""
    num = int(question_no[1:])
    return num in TABLE_QUESTIONS

def convert_to_table(text):
    """Convert various comparison formats to markdown table"""
    lines = text.split('\n')

    # Remove empty lines at start
    while lines and not lines[0].strip():
        lines.pop(0)

    if not lines:
        return text

    # Check format type and process accordingly

    # Format 1: Q2 style - headers on first line like "SAP FI/ SAP CO"
    first_line = lines[0].strip()
    if '/' in first_line and len(first_line) < 100 and ':' not in first_line:
        parts = first_line.split('/')
        parts = [p.strip() for p in parts if p.strip()]
        if len(parts) >= 2 and all(len(p) < 50 for p in parts):
            # This is Q2 format
            table_lines = []
            table_lines.append('| 特性 | ' + ' | '.join(parts) + ' |')
            table_lines.append('| ' + ' | '.join(['---'] * (len(parts) + 1)) + ' |')

            # Find all keys (lines with colon at start)
            key_sections = []
            current_key = None
            current_content = []

            for line in lines[1:]:
                line = line.strip()
                if not line:
                    continue

                # Check if this line starts a new key
                has_key = False
                key_name = ''
                for sep in [':', '：']:
                    idx = line.find(sep)
                    if idx > 0 and idx < 30:
                        key_name = line[:idx].strip()
                        has_key = True
                        break

                if has_key:
                    # Save previous section
                    if current_key and current_content:
                        key_sections.append((current_key, current_content))
                    current_key = key_name
                    # Get value after colon
                    for sep in [':', '：']:
                        if sep in line:
                            current_content = [line.split(sep, 1)[1].strip()]
                            break
                elif current_key:
                    current_content.append(line)

            # Don't forget last section
            if current_key and current_content:
                key_sections.append((current_key, current_content))

            # Build table rows
            for key, content_list in key_sections:
                full_content = ' '.join(content_list)
                # Split by /
                if ' / ' in full_content:
                    values = [v.strip() for v in full_content.split(' / ')]
                elif '/' in full_content:
                    values = [v.strip() for v in full_content.split('/')]
                else:
                    values = [full_content]

                # Pad values to match header count
                while len(values) < len(parts):
                    values.append('')

                table_lines.append('| ' + key + ' | ' + ' | '.join(values[:len(parts)]) + ' |')

            return '\n'.join(table_lines)

    # Format 2: Q4 style - "Company（公司）/ Company Code（公司代码）" followed by multi-colon lines
    if '/' in first_line and '（' in first_line and '）' in first_line:
        parts = first_line.split('/')
        parts = [p.strip() for p in parts if p.strip()]
        if len(parts) == 2 and all('（' in p or '(' in p for p in parts):
            # This is like Q4 format - need to extract all keys first
            table_lines = []
            table_lines.append('| 特性 | ' + ' | '.join(parts) + ' |')
            table_lines.append('| ' + ' | '.join(['---'] * 3) + ' |')

            # Collect all key-value pairs
            # Format: key: value1 / value2 / value3 / value4
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
                for sep in [':', '：', ': ', ': ']:
                    if sep in line:
                        idx = line.find(sep)
                        if idx > 0 and idx < 30:
                            key_name = line[:idx].strip()
                            has_key = True
                            # Save previous key's accumulated content
                            if current_key:
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
            if current_key:
                key_values[current_key] = ' '.join(all_content)

            # Now split values by /
            for key, content in key_values.items():
                values = []
                if ' / ' in content:
                    values = [v.strip() for v in content.split(' / ')]
                elif '/' in content:
                    values = [v.strip() for v in content.split('/')]
                else:
                    values = [content]

                # Pad to 2 columns
                while len(values) < 2:
                    values.append('')

                table_lines.append('| ' + key + ' | ' + ' | '.join(values[:2]) + ' |')

            return '\n'.join(table_lines)

    # Format 3: Error/Solution format - lines with "/" as separator
    slash_lines = [l for l in lines if '/' in l and l.strip()]
    if len(slash_lines) >= 2:
        table_lines = []

        # Check if first line looks like a title
        first_line = lines[0].strip()
        if len(first_line) < 30 and '/' in first_line:
            # Might be a title, skip it
            title_parts = first_line.split('/')
            # Use as headers
            table_lines.append('| ' + ' | '.join(title_parts) + ' |')
            table_lines.append('| ' + ' | '.join(['---'] * len(title_parts)) + ' |')
        else:
            table_lines.append('| 错误 / Error | 排查解决方法 / Solution |')
            table_lines.append('| --- | --- |')

        for line in slash_lines:
            line = line.strip()
            if ' / ' in line:
                parts = line.split(' / ', 1)
            elif '/' in line:
                parts = line.split('/', 1)
            else:
                continue

            if len(parts) == 2:
                table_lines.append(f'| {parts[0].strip()} | {parts[1].strip()} |')

        return '\n'.join(table_lines) if len(table_lines) > 2 else text

def convert_section_headers_to_table(text):
    """Convert section header format (like Q15) to markdown table"""
    lines = text.split('\n')

    # Remove empty lines at start
    while lines and not lines[0].strip():
        lines.pop(0)

    if not lines:
        return text

    # Look for section headers (lines with parentheses like "Proposal Run（提议运行）")
    headers = []
    header_positions = []

    for i, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue

        # Check if this is a section header:
        # - Contains parentheses with Chinese
        # - No colon
        # - Relatively short
        if ('（' in line or '(' in line) and ')' in line:
            if ':' not in line and '：' not in line and len(line) < 60:
                # Also check if next line has a colon (indicating this is a header)
                if i + 1 < len(lines):
                    next_line = lines[i + 1].strip()
                    if ':' in next_line or '：' in next_line:
                        headers.append(line)
                        header_positions.append(i)

    if len(headers) >= 2:
        # This is section header format
        table_lines = []
        table_lines.append('| ' + ' | '.join(headers) + ' |')
        table_lines.append('| ' + ' | '.join(['---'] * len(headers)) + ' |')

        # Collect all key-value pairs
        key_values = {}  # key -> [value1, value2, ...]

        current_section_idx = -1
        for i in range(len(lines)):
            line = lines[i].strip()
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
                    if len(parts) == 2:
                        key_name = parts[0].strip()
                        value = parts[1].strip()
                        has_colon = True
                    break

            if has_colon:
                # Add value to appropriate section(s)
                # If value is empty, check next line
                j = i + 1
                while j < len(lines) and not value:
                    next_line = lines[j].strip()
                    if next_line and not next_line.startswith('Answer') and ':' not in next_line:
                        value += ' ' + next_line
                        j += 1
                    else:
                        break

                # Split value if it belongs to multiple sections
                # (e.g., when value has content for both columns)
                if current_section_idx == 0:
                    key_values[key_name] = [value, '']
                elif current_section_idx == 1:
                    if key_name not in key_values:
                        key_values[key_name] = ['', value]
                    else:
                        key_values[key_name][1] = value
                else:
                    key_values[key_name] = [value]

        # Build table rows
        for key, values in key_values.items():
            while len(values) < len(headers):
                values.append('')
            table_lines.append('| ' + key + ' | ' + ' | '.join(values) + ' |')

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

        q_pattern = r'^(\d+)\.\s+(.+?)(?:\n中文[：:]|$)'
        q_matches = list(re.finditer(q_pattern, section_content, re.MULTILINE))

        for q_idx, q_match in enumerate(q_matches):
            q_text = q_match.group(2).strip()
            q_start = q_match.start()
            question_no = f'Q{q_counter}'

            if q_idx + 1 < len(q_matches):
                q_end = q_matches[q_idx + 1].start()
            else:
                q_end = len(section_content)

            q_content = section_content[q_start:q_end]

            # Extract Chinese question
            cn_question = ''
            cn_match = re.search(r'中文[：:]\s*(.+?)(?:\nAnswer|$)', q_content, re.DOTALL)
            if cn_match:
                cn_question = cn_match.group(1).strip()

            # Extract English answer
            answer_en = ''
            # Updated pattern - match until next question or end
            answer_pattern = r'\nAnswer\s*(?:英文[：:]?\s*)?\n?(.+?)(?=\n\d+\.|$)'
            answer_match = re.search(answer_pattern, q_content, re.DOTALL)
            if answer_match:
                answer_en = answer_match.group(1).strip()

            # Extract Chinese answer
            answer_cn = ''
            cn_ans_pattern = r'Answer\s+中文[：:]\s*\n?(.+?)(?=\n\d+\.|$)'
            cn_ans_match = re.search(cn_ans_pattern, q_content, re.DOTALL)
            if cn_ans_match:
                answer_cn = cn_ans_match.group(1).strip()

            # Clean up answers
            answer_en = re.sub(r'\n\s*\n\s*', '\n\n', answer_en).strip()
            answer_cn = re.sub(r'\n\s*\n\s*', '\n\n', answer_cn).strip()

            # Remove "补充" sections
            answer_cn = re.split(r'\n补充(?:英文|中文)[：:]', answer_cn)[0].strip()
            answer_en = re.split(r'\n补充(?:英文|中文)[：:]', answer_en)[0].strip()

            # Apply table conversion only for specified questions
            if answer_en and should_use_table(question_no):
                # Try section headers format first (like Q15), then regular format
                converted = convert_section_headers_to_table(answer_en)
                if converted != answer_en:
                    answer_en = converted
                else:
                    answer_en = convert_to_table(answer_en)

            if answer_cn and should_use_table(question_no):
                converted = convert_section_headers_to_table(answer_cn)
                if converted != answer_cn:
                    answer_cn = converted
                else:
                    answer_cn = convert_to_table(answer_cn)

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

# Check specific questions
check_q = [4, 17, 19, 22, 27, 28, 29, 2]
print("\nTable status for checked questions:")
for part in result['parts']:
    for q in part['questions']:
        num = int(q['questionNo'][1:])
        if num in check_q:
            has_table = '|' in q['sampleAnswer']
            has_en = bool(q['sampleAnswer'])
            has_cn = bool(q['sampleAnswerCN'])
            print(f"{q['questionNo']}: Table={has_table}, EN={has_en}, CN={has_cn}")
