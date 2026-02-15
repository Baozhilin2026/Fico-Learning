import json
import re

def parse_interview_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split by section headers (一、, 二、, etc.)
    section_pattern = r'([一二三四五六七八九十]+、)\s*(.+?)\s*Questions?'
    sections = re.split(section_pattern, content)

    parts = []
    q_counter = 1

    # Process sections (sections array has pattern: [prefix1, title1, content1, prefix2, title2, content2, ...])
    for i in range(1, len(sections), 2):
        section_num = sections[i]
        section_title = sections[i+1] if i+1 < len(sections) else ''
        section_content = sections[i+2] if i+2 < len(sections) else ''

        # Extract Chinese title from section_title if exists
        cn_title_match = re.search(r'[\u4e00-\u9fff]+', section_title)
        full_title = section_title.strip()

        part = {
            'partId': f'SCENARIO{len(parts)+1}',
            'partName': full_title,
            'questions': []
        }

        # Split by question numbers (1., 2., 3., etc.)
        # Use positive lookbehind to find lines starting with numbers
        question_blocks = re.split(r'\n(?=\d+\.\s)', section_content)

        for block in question_blocks:
            if not block.strip():
                continue

            lines = [l.strip() for l in block.strip().split('\n') if l.strip()]
            if not lines:
                continue

            # First line should be the question number and English question
            first_line = lines[0]
            q_match = re.match(r'^(\d+)\.\s+(.+)$', first_line)
            if not q_match:
                continue

            q_num = q_match.group(1)
            q_text = q_match.group(2).strip()

            # Find Chinese question
            cn_question = ''
            answer_en_lines = []
            answer_cn_lines = []
            in_answer = False
            in_cn_answer = False
            found_answer_section = False

            for line in lines[1:]:
                # Check for Chinese question
                if line.startswith('中文：'):
                    cn_question = line.replace('中文：', '').strip()
                    continue

                # Check for Answer section
                if line.startswith('Answer'):
                    in_answer = True
                    found_answer_section = True
                    # Check if it's "Answer 中文：" or "Answer 英文："
                    if '英文：' in line:
                        # Extract content after "Answer 英文："
                        en_part = line.split('英文：', 1)[1].strip()
                        if en_part:
                            answer_en_lines.append(en_part)
                    elif '中文：' in line:
                        in_cn_answer = True
                        cn_part = line.split('中文：', 1)[1].strip()
                        if cn_part:
                            answer_cn_lines.append(cn_part)
                    continue

                # Check for补充 sections
                if line.startswith('补充英文：') or line.startswith('补充中文：'):
                    in_answer = False
                    in_cn_answer = False
                    continue

                # Check if we hit another question number
                if re.match(r'^\d+\.\s', line):
                    break

                # Collect answer content
                if in_answer and not in_cn_answer:
                    answer_en_lines.append(line)
                elif in_cn_answer:
                    answer_cn_lines.append(line)

            # Build answers
            answer_en = '\n'.join(answer_en_lines).strip()
            answer_cn = '\n'.join(answer_cn_lines).strip()

            # Handle cases where answers might be mixed
            if not answer_cn and answer_en:
                # Try to separate Chinese from English if mixed
                # Look for Chinese characters at the end
                cn_match = re.search(r'([\u4e00-\u9fff].*)$', answer_en, re.MULTILINE | re.DOTALL)
                if cn_match:
                    # Split by finding the transition point
                    cn_start = answer_en.find(cn_match.group(1)[0])
                    if cn_start > 0:
                        answer_cn = answer_en[cn_start:].strip()
                        answer_en = answer_en[:cn_start].strip()

            # Clean up answers
            answer_en = re.sub(r'\n\s*\n\s*', '\n\n', answer_en).strip()
            answer_cn = re.sub(r'\n\s*\n\s*', '\n\n', answer_cn).strip()

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

print(f"Successfully parsed {len(result['parts'])} parts with {sum(len(p['questions']) for p in result['parts'])} questions")

# Print first question as sample
if result['parts'] and result['parts'][0]['questions']:
    q = result['parts'][0]['questions'][0]
    print("\n--- Sample Question ---")
    print(f"Q: {q['questionContent']}")
    print(f"Q_CN: {q['questionContentCN']}")
    print(f"A_EN: {q['sampleAnswer'][:100]}...")
    print(f"A_CN: {q['sampleAnswerCN'][:100]}...")
