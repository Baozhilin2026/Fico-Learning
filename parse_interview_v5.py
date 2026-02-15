# -*- coding: utf-8 -*-
import json
import re
import sys

def is_comparison_format(text):
    """Check if text is in comparison format (multiple sections with headers)"""
    lines = text.split('\n')
    # Count non-empty lines that don't start with space (potential headers)
    headers = []
    for line in lines:
        line = line.strip()
        if line and ':' not in line and not line.startswith('Answer'):
            # Could be a header
            if len(line) < 50:  # Headers are usually short
                headers.append(line)
    return len(headers) >= 2

def convert_comparison_to_markdown_table(text):
    """Convert comparison format to markdown table"""
    lines = text.split('\n')

    # Parse sections
    sections = []
    current_header = None
    current_items = []

    for line in lines:
        line = line.rstrip()
        if not line:
            continue

        # Check if this is a section header (short line, no colon, all caps or mixed)
        # Headers are typically like "SAP FI", "Company（公司）", "SAP CO"
        is_header = False
        line_stripped = line.strip()

        # A header line: short, no colon, doesn't start with space
        if (len(line_stripped) < 50 and
            ':' not in line_stripped and
            not line_stripped.startswith('Answer') and
            not line_stripped.startswith('中文') and
            (line_stripped[0].isupper() or any(c in line_stripped for c in '（）()'))):

            # Check if it looks like a header (contains common patterns)
            if any(keyword in line_stripped for keyword in ['SAP', 'FI', 'CO', 'Company', '特性', '定义', '用途', 'Type', 'Feature']):
                is_header = True

        if is_header:
            # Save previous section
            if current_header and current_items:
                sections.append((current_header, current_items))
            current_header = line_stripped
            current_items = []
        elif current_header:
            current_items.append(line_stripped)

    # Don't forget the last section
    if current_header and current_items:
        sections.append((current_header, current_items))

    # If we found 2+ sections with items, convert to table
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

            # Build data rows first to know column count
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
                separator = '| ' + ' | '.join(['---'] * (len(sections) + 1)) + ' |'
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
            cn_match = re.search(r'中文[：:]\s*(.+?)(?:\nAnswer|$)', q_content, re.DOTALL)
            if cn_match:
                cn_question = cn_match.group(1).strip()

            # Find Answer section - more flexible pattern
            answer_en = ''
            # Look for "Answer" followed by content until next section marker
            answer_pattern = r'\nAnswer\s*(?:英文[：:]?\s*)?\n?(.+?)(?=\nAnswer\s+(?:中文|英文)|\n\d+\.|$)'
            answer_match = re.search(answer_pattern, q_content, re.DOTALL)

            if answer_match:
                answer_en = answer_match.group(1).strip()

            # Find Chinese answer
            answer_cn = ''
            cn_ans_pattern = r'Answer\s+中文[：:]\s*\n?(.+?)(?=\n\d+\.|\n补充|$)'
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

# Print Q2 as sample
for part in result['parts']:
    for q in part['questions']:
        if q['questionNo'] == 'Q2':
            print("\n=== Q2 Sample ===")
            print(f"Question: {q['questionContent']}")
            print(f"\nAnswer EN:\n{q['sampleAnswer']}")
            print(f"\nAnswer CN:\n{q['sampleAnswerCN']}")
            break
    else:
        continue
    break
