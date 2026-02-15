import json
import re

def parse_interview_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    parts = []
    current_part = None
    current_questions = []

    # Split by Chinese number + section pattern (一、二、三、etc.)
    # Pattern matches: "一、", "二、", etc with section title
    section_pattern = r'([一二三四五六七八九十]+、)\s*(.+?)[\s\n]+(?:[0-9]+\.\s|Questions|问题)'

    lines = content.split('\n')

    i = 0
    part_id_counter = 1

    while i < len(lines):
        line = lines[i].strip()

        # Detect new section (一、, 二、, etc.)
        section_match = re.match(r'^([一二三四五六七八九十]+、)\s*(.+)$', line)
        if section_match:
            # Save previous part if exists
            if current_part and current_questions:
                current_part['questions'] = current_questions
                parts.append(current_part)
                current_questions = []

            # Create new part
            section_num = section_match.group(1)
            section_title = section_match.group(2).strip()

            current_part = {
                'partId': f'SCENARIO{part_id_counter}',
                'partName': section_title,
                'questions': []
            }
            part_id_counter += 1
            i += 1
            continue

        # Detect question (starts with number + dot)
        question_match = re.match(r'^(\d+)\.\s+(.+)$', line)
        if question_match:
            q_num = question_match.group(1)
            q_text = question_match.group(2).strip()

            # Skip if no active part
            if not current_part:
                i += 1
                continue

            # Look for Chinese translation
            cn_question = ''
            j = i + 1
            while j < len(lines) and not lines[j].strip().startswith(('Answer', '答案')):
                cn_line = lines[j].strip()
                if cn_line.startswith('中文：'):
                    cn_question = cn_line.replace('中文：', '').strip()
                    break
                j += 1

            # Find answer section
            answer_en = ''
            answer_cn = ''

            j = i + 1
            in_answer = False
            in_table = False
            table_lines = []

            while j < len(lines):
                next_line = lines[j].strip()

                # Stop at next question or section
                if re.match(r'^\d+\.\s', next_line) or re.match(r'^[一二三四五六七八九十]+、', next_line):
                    break

                # Detect Answer section
                if next_line.startswith('Answer') or next_line.startswith('答案'):
                    in_answer = True
                    j += 1
                    continue

                # Detect table start
                if in_answer and next_line.startswith('|'):
                    in_table = True
                    table_lines.append(next_line)
                    j += 1
                    continue

                if in_table:
                    if next_line.startswith('|'):
                        table_lines.append(next_line)
                        j += 1
                        continue
                    else:
                        # Table ended, convert table to markdown
                        if table_lines:
                            table_content = '\n'.join(table_lines)
                            if answer_en:
                                answer_en += '\n' + table_content
                            else:
                                answer_en = table_content
                            table_lines = []
                        in_table = False

                if in_answer and next_line and not next_line.startswith('中文：'):
                    if answer_en:
                        answer_en += '\n' + next_line
                    else:
                        answer_en = next_line

                # Chinese answer
                if next_line.startswith('Answer 中文：') or next_line.startswith('中文：'):
                    cn_start = j + 1
                    while cn_start < len(lines):
                        cn_line = lines[cn_start].strip()
                        # Stop at next question/section or empty
                        if (not cn_line or
                            re.match(r'^\d+\.\s', cn_line) or
                            re.match(r'^[一二三四五六七八九十]+、', cn_line) or
                            cn_line.startswith('补充英文：') or
                            cn_line.startswith('补充中文：')):
                            break
                        if cn_line.startswith('|'):
                            # Table in Chinese answer
                            if not answer_cn:
                                answer_cn = cn_line
                            else:
                                answer_cn += '\n' + cn_line
                        elif cn_line:
                            if answer_cn:
                                answer_cn += '\n' + cn_line
                            else:
                                answer_cn = cn_line
                        cn_start += 1
                    j = cn_start
                    continue

                j += 1

            # Add trailing table content if any
            if table_lines:
                table_content = '\n'.join(table_lines)
                if answer_en:
                    answer_en += '\n' + table_content
                else:
                    answer_en = table_content

            # Clean up answers
            answer_en = re.sub(r'\n+', '\n', answer_en).strip()
            answer_cn = re.sub(r'\n+', '\n', answer_cn).strip()

            # Remove "Answer 英文：" prefix if exists
            answer_en = re.sub(r'^Answer 英文：\s*', '', answer_en)
            answer_en = re.sub(r'^Answer\s+', '', answer_en)
            answer_cn = re.sub(r'^Answer\s+', '', answer_cn)
            answer_cn = re.sub(r'^中文：\s*', '', answer_cn)

            # Create question object
            global_q_num = len(parts) * 100 + len(current_questions) + 1
            if parts:
                global_q_num = (len(parts)) * 10 + len(current_questions) + 1

            question_obj = {
                'questionNo': f'Q{global_q_num}',
                'questionContent': q_text,
                'questionContentCN': cn_question,
                'sampleAnswer': answer_en,
                'sampleAnswerCN': answer_cn
            }

            current_questions.append(question_obj)

        i += 1

    # Don't forget the last part
    if current_part and current_questions:
        current_part['questions'] = current_questions
        parts.append(current_part)

    # Renumber questions properly (Q1-Q100)
    q_counter = 1
    for part in parts:
        for q in part['questions']:
            q['questionNo'] = f'Q{q_counter}'
            q_counter += 1

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

print(f"Successfully parsed {len(result['parts'])} parts with {sum(len(p['questions']) for p in result['parts'])} questions")
print(f"Output saved to: {output_path}")
