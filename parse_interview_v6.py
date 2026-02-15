# -*- coding: utf-8 -*-
import json
import re
import sys

def is_comparison_format(text):
    """Check if text is in comparison format"""
    lines = text.split('\n')
    headers = []

    # First check for error/solution format (lines with / separator)
    slash_count = sum(1 for line in lines if ' / ' in line or '/' in line)
    if slash_count >= 3:
        return True  # Likely error/solution format

    for i, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue

        # Skip if it's an item line (contains colon)
        if ':' in line or '：' in line:
            continue

        # Check if it looks like a header:
        # - Relatively short
        # - No colon
        # - Often contains parentheses with Chinese text OR is all uppercase
        if len(line) < 60:
            # Check for common patterns in headers
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

    # Remove title lines like "错误/解决方法" or "错误/排查解决方法"
    filtered_lines = []
    for line in lines:
        line_stripped = line.strip()
        # Skip if it's just a title line (contains slashes but very short)
        if ('/' in line_stripped or '／' in line_stripped) and len(line_stripped) < 20:
            # Check if it's actually a title (no real content)
            if not any(c.isalnum() for c in line_stripped if c not in '／/（）()'):
                continue
        filtered_lines.append(line)

    # First check for error/solution format (lines with / separator)
    slash_lines = [l for l in filtered_lines if ' / ' in l or ('/' in l and l.strip())]
    if len(slash_lines) >= 2:
        # This is likely error/solution format or comparison format

        # Check if first line is like "SAP FI/ SAP CO" (headers on one line)
        first_line = filtered_lines[0].strip() if filtered_lines else ''
        is_headers_on_one_line = False
        headers = []

        if '/' in first_line and len(first_line) < 100:
            # Check if it looks like headers (no colon, just names with / separator)
            if ':' not in first_line and '：' not in first_line:
                parts = first_line.split('/')
                parts = [p.strip() for p in parts if p.strip()]
                if len(parts) >= 2 and all(len(p) < 50 for p in parts):
                    headers = parts
                    is_headers_on_one_line = True

        if is_headers_on_one_line:
            # New format: headers on first line, data on subsequent lines with "key: value1 / value2"
            # Content may span multiple lines
            table_lines = []
            table_lines.append('| 特性 | ' + ' | '.join(headers) + ' |')
            table_lines.append('| ' + ' | '.join(['---'] * (len(headers) + 1)) + ' |')

            # Process remaining lines
            i = 1
            while i < len(filtered_lines):
                line = filtered_lines[i].strip()
                if not line or line.startswith('Answer') or line.startswith('中文'):
                    i += 1
                    continue

                # Check if this line starts a new key (has colon at start)
                has_colon_at_start = False
                if ':' in line or '：' in line:
                    # Check if colon is near the start (within first 20 chars)
                    for sep in [':', '：']:
                        idx = line.find(sep)
                        if idx > 0 and idx < 30:
                            has_colon_at_start = True
                            break

                if has_colon_at_start:
                    # This is a new key-value pair
                    # Split by /
                    if ' / ' in line:
                        parts = line.split(' / ')
                    elif '/' in line:
                        parts = line.split('/')
                    else:
                        i += 1
                        continue

                    # Extract key from first part
                    key = ''
                    first_value = ''
                    for sep in [':', '：']:
                        if sep in parts[0]:
                            kv = parts[0].split(sep, 1)
                            key = kv[0].strip()
                            first_value = kv[1].strip() if len(kv) > 1 else ''
                            break

                    values = [first_value] + [p.strip() for p in parts[1:]]

                    # Check if values continue on next lines
                    j = i + 1
                    while j < len(filtered_lines):
                        next_line = filtered_lines[j].strip()
                        if not next_line:
                            j += 1
                            continue

                        # Stop if we hit a new section/question
                        if (next_line.startswith('Answer') or
                            next_line.startswith('中文') or
                            next_line[0].isdigit()):
                            break

                        # Stop if next line has a colon (new key)
                        next_has_colon = False
                        for sep in [':', '：']:
                            idx = next_line.find(sep)
                            if idx > 0 and idx < 30:
                                next_has_colon = True
                                break
                        if next_has_colon:
                            break

                        # This is continuation of the last value
                        if values:
                            values[-1] = values[-1] + ' ' + next_line
                        j += 1

                    # Build table row
                    table_lines.append('| ' + key + ' | ' + ' | '.join(values) + ' |')
                    i = j
                else:
                    # Line without colon at start - skip
                    i += 1

            return '\n'.join(table_lines)

        # Original error/solution format handling
        table_lines = []
        table_lines.append('| 错误 / Error | 排查解决方法 / Solution |')
        table_lines.append('| --- | --- |')

        # Need to handle multi-line entries
        i = 0
        while i < len(filtered_lines):
            line = filtered_lines[i].strip()
            if not line:
                i += 1
                continue

            # Skip title lines
            if len(line) < 20 and '/' in line and not any(c.isalnum() for c in line if c not in '／/（）()'):
                i += 1
                continue

            # Check if this line has a /
            if '/' in line:
                # Split by first /
                if ' / ' in line:
                    parts = line.split(' / ', 1)
                else:
                    parts = line.split('/', 1)

                if len(parts) == 2:
                    error = parts[0].strip()
                    solution = parts[1].strip()

                    # Check if solution continues on next line
                    j = i + 1
                    while j < len(filtered_lines):
                        next_line = filtered_lines[j].strip()
                        # If next line doesn't start with a new pattern and isn't empty
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

        # Check if this is a section header
        is_header = False

        # Skip if it's clearly not a header
        if line_stripped.startswith('Answer') or line_stripped.startswith('中文'):
            is_header = False
        # Check for header pattern: text with parentheses (like "Proposal Run（提议运行）")
        elif ('(' in line_stripped or '（' in line_stripped) and ':' not in line_stripped and '：' not in line_stripped:
            if len(line_stripped) < 60:
                is_header = True
        # Also check for simple all-caps headers like "SAP FI" or "SAP CO"
        elif line_stripped.isupper() and len(line_stripped) < 30:
            is_header = True
        # Check for mixed case with parentheses at end
        elif re.match(r'^[A-Za-z\s]+[\(（][^\)）]+[\)）]$', line_stripped):
            if len(line_stripped) < 60:
                is_header = True

        if is_header:
            # Save previous section
            if current_header and current_items:
                sections.append((current_header, current_items))
            current_header = line_stripped
            current_items = []
        elif current_header:
            current_items.append(line_stripped)
        # First line might be before any header
        elif ':' in line_stripped or '：' in line_stripped:
            current_header = '特性'
            current_items.append(line_stripped)

    # Don't forget the last section
    if current_header and current_items:
        sections.append((current_header, current_items))

    # If we found 2+ sections, convert to table
    if len(sections) >= 2 and any(len(items) > 0 for _, items in sections):
        # Collect all unique keys from all sections
        all_keys = []
        seen_keys = set()
        for _, items in sections:
            for item in items:
                # Extract key (part before colon)
                for sep in [':', '：']:
                    if sep in item:
                        key = item.split(sep, 1)[0].strip()
                        if key and key not in seen_keys:
                            seen_keys.add(key)
                            all_keys.append(key)
                        break

        # If we have keys, build table
        if all_keys:
            table_lines = []

            # Build data rows
            rows = []
            for key in all_keys:
                row = {'key': key, 'values': []}
                for header, items in sections:
                    value = ''
                    for item in items:
                        # Try to find value for this key
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

            # Only create table if we have meaningful data
            if rows and any(any(v['values']) for v in rows):
                # Header row
                header = '| 特性 | ' + ' | '.join([s[0] for s in sections]) + ' |'
                table_lines.append(header)
                # Separator
                num_cols = len(sections) + 1
                separator = '| ' + ' | '.join(['---'] * num_cols) + ' |'
                table_lines.append(separator)
                # Data rows
                for row in rows:
                    table_lines.append('| ' + row['key'] + ' | ' + ' | '.join(row['values']) + ' |')

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

            # Extract Chinese question
            cn_question = ''
            cn_match = re.search(r'中文[：:]\s*(.+?)(?:\nAnswer|$)', q_content, re.DOTALL)
            if cn_match:
                cn_question = cn_match.group(1).strip()

            # Find Answer section
            answer_en = ''
            answer_pattern = r'\nAnswer\s*(?:英文[：:]?\s*)?\n?(.+?)(?=\nAnswer\s+(?:中文|英文)|\n\d+\.|\n补充|$)'
            answer_match = re.search(answer_pattern, q_content, re.DOTALL)

            if answer_match:
                answer_en = answer_match.group(1).strip()

            # Find Chinese answer
            answer_cn = ''
            cn_ans_pattern = r'Answer\s+中文[：:]\s*\n?(.+?)(?=\n\d+\.|\n补充(?:英文|中文)|$)'
            cn_ans_match = re.search(cn_ans_pattern, q_content, re.DOTALL)
            if cn_ans_match:
                answer_cn = cn_ans_match.group(1).strip()

            # Clean up answers
            answer_en = re.sub(r'\n\s*\n\s*', '\n\n', answer_en).strip()
            answer_cn = re.sub(r'\n\s*\n\s*', '\n\n', answer_cn).strip()

            # Remove "补充" sections if any
            answer_cn = re.split(r'\n补充(?:英文|中文)[：:]', answer_cn)[0].strip()
            answer_en = re.split(r'\n补充(?:英文|中文)[：:]', answer_en)[0].strip()

            # Convert comparison format to table if detected
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

# Parse the file
result = parse_interview_file('D:/26年FICO模块英文学习网站/temp_interview.txt')

# Save to JSON
output_path = 'D:/26年FICO模块英文学习网站/public/data/interview-qa.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

total_qs = sum(len(p['questions']) for p in result['parts'])
print(f"Successfully parsed {len(result['parts'])} parts with {total_qs} questions")

# Check specific questions
q_nums = [2, 4, 15, 17, 24, 28, 38, 40, 42, 49, 52, 60, 68, 72, 77, 80]
print("\nTable status for questions with comparison format:")
for part in result['parts']:
    for q in part['questions']:
        num = int(q['questionNo'][1:])
        if num in q_nums:
            has_table = '|' in q['sampleAnswer']
            print(f"{q['questionNo']}: Table = {has_table}")
