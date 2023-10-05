import PyPDF2
from transformers import AutoTokenizer
import json
import requests
import re

URI = f'http://c706-35-240-160-66.ngrok-free.app/generate'
tokenizer = AutoTokenizer.from_pretrained("TheBloke/guanaco-13B-GPTQ")
history = {'internal': [], 'visible': []}
command = "You are an API that converts bodies of text into a single question and answer into a JSON format. Each JSON " \
          "contains a single question with a single answer. Only respond with the JSON and no additional text. \n"


def run(user_input, history):
    request = {
        'inputs': user_input,
        'parameters': {
            'max_tokens': 512,
            'temperature': 0.7,
            'top_p': 0.1,
            'top_k': 40,
        }
    }

    response = requests.post(URI, json=request)

    result = response.json()['generated_text']
    return result


def extract_text_from_pdf(file_path):
    pdf_file_obj = open(file_path, 'rb')
    pdf_reader = PyPDF2.PdfReader(pdf_file_obj)
    text = ''
    for page_num in range(len(pdf_reader.pages)):
        page_obj = pdf_reader.pages[page_num]
        text += page_obj.extract_text()
    pdf_file_obj.close()
    return text


def tokenize(text):
    enc = tokenizer.encode(text)
    return enc


def chunks(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i:i + n]


def is_json(data):
    try:
        json.loads(data)
        return True
    except ValueError:
        return False


def submit_to_api(chunk, retries=3):
    for i in range(retries):
        try:
            response = run(command + chunk.strip(), history)
            # Extract JSON string from between back-ticks
            if is_json(response):
                print(response)
                return json.loads(response)
            else:
                match = re.search(r'`(.*?)`', response, re.S)
                if match and is_json(match.group(1)):
                    print(f"Attempt {i + 1} failed. Retrying...")
                    return json.loads(match.group(1))  # assuming you want to return the JSON data
                else:
                    print(f"Request failed: {e}")
        except requests.exceptions.RequestException as e:
            continue
    print("Max retries exceeded. Skipping this chunk.")
    return None


text = extract_text_from_pdf('./docs/emotion2/Denso Robot Programmer Manual.pdf')
tokens = tokenize(text)

token_chunks = list(chunks(tokens, 256))

responses = []

for chunk in token_chunks:
    response = submit_to_api(tokenizer.decode(chunk))
    if response is not None:
        responses.append(response)

# Write responses to a JSON file
with open('responses.json', 'w') as f:
    json.dump(responses, f)
