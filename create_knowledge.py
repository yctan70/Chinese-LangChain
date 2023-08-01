#!/usr/bin/env python
# -*- coding:utf-8 _*-
"""
@author:quincy qiang
@license: Apache Licence
@file: create_knowledge.py
@time: 2023/04/18
@contact: yanqiangmiffy@gamil.com
@software: PyCharm
@description: - emoji：https://emojixd.com/pocket/science
"""
import os
import pandas as pd
from langchain.schema import Document
from langchain.document_loaders import UnstructuredFileLoader
from langchain.embeddings.huggingface import HuggingFaceEmbeddings
from langchain.vectorstores import FAISS
from tqdm import tqdm
from clc.langchain_application import LangChainApplication
import glob

from clc.source_service import SourceService


class LangChainCFG:
    llm_model_name = 'THUDM/chatglm2-6b-int4'  # 本地模型文件 or huggingface远程仓库
    embedding_model_name = 'GanymedeNil/text2vec-large-chinese'  # 检索模型文件 or huggingface远程仓库
    vector_store_path = './cache/emotion'
    docs_path = './docs/emotion'
    kg_vector_stores = {
        'emotion': './cache/emotion',
        '中文维基百科': './cache/zh_wikipedia',
        '大规模金融研报': './cache/financial_research_reports',
        '初始化': './cache',
    }  # 可以替换成自己的知识库，如果没有需要设置为None
    # kg_vector_stores=None
    patterns = ['模型问答', '知识库问答']  #
    n_gpus = 1


LOADER_MAPPING = [".csv", ".pdf", ".pac", ".hal", ".ini"]
config = LangChainCFG()
source_service = SourceService(config)

all_files = []
for ext in LOADER_MAPPING:
    all_files.extend(
        glob.glob(os.path.join(config.docs_path, f"**/*{ext}"), recursive=True)
    )
source_service.init_source_vector(all_files)

# Wikipedia数据处理

# docs = []

# with open('docs/zh_wikipedia/zhwiki.sim.utf8', 'r', encoding='utf-8') as f:
#     for idx, line in tqdm(enumerate(f.readlines())):
#         metadata = {"source": f'doc_id_{idx}'}
#         docs.append(Document(page_content=line.strip(), metadata=metadata))
#
# vector_store = FAISS.from_documents(docs, embeddings)
# vector_store.save_local('cache/zh_wikipedia/')


# docs = []
#
# with open('cache/zh_wikipedia/wiki.zh-sim-cleaned.txt', 'r', encoding='utf-8') as f:
#     for idx, line in tqdm(enumerate(f.readlines())):
#         metadata = {"source": f'doc_id_{idx}'}
#         docs.append(Document(page_content=line.strip(), metadata=metadata))
#
# vector_store = FAISS.from_documents(docs, embeddings)
# vector_store.save_local('cache/zh_wikipedia/')


# 金融研报数据处理
# docs = []
#
# for doc in tqdm(os.listdir(docs_path)):
#     if doc.endswith('.txt'):
#         # print(doc)
#         # loader = UnstructuredFileLoader(f'{docs_path}/{doc}', mode="elements")
#         # doc = loader.load()
#         f = open(f'{docs_path}/{doc}', 'r', encoding='utf-8')
#
#         # docs.extend(doc)
#         docs.append(Document(page_content=''.join(f.read().split()), metadata={"source": f'doc_id_{doc}'}))
# vector_store = FAISS.from_documents(docs, embeddings)
# vector_store.save_local('cache/financial_research_reports')

# # 英雄联盟
#
# docs = []
#
# lol_df = pd.read_csv('cache/lol/champions.csv')
# # lol_df.columns = ['id', '英雄简称', '英雄全称', '出生地', '人物属性', '英雄类别', '英雄故事']
# print(lol_df)
#
# for idx, row in lol_df.iterrows():
#     metadata = {"source": f'doc_id_{idx}'}
#     text = ' '.join(row.values)
#     # for col in ['英雄简称', '英雄全称', '出生地', '人物属性', '英雄类别', '英雄故事']:
#     #     text += row[col]
#     docs.append(Document(page_content=text, metadata=metadata))
#
# vector_store = FAISS.from_documents(docs, embeddings)
# vector_store.save_local('cache/lol/')
