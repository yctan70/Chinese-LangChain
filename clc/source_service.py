#!/usr/bin/env python
# -*- coding:utf-8 _*-
"""
@author:quincy qiang
@license: Apache Licence
@file: search.py
@time: 2023/04/17
@contact: yanqiangmiffy@gamil.com
@software: PyCharm
@description: coding..
"""

import os

from duckduckgo_search import ddg
from langchain.document_loaders import UnstructuredFileLoader, TextLoader, CSVLoader
from langchain.embeddings.huggingface import HuggingFaceEmbeddings
from langchain.vectorstores import FAISS
from textsplitter import ChineseTextSplitter
from loader import UnstructuredPaddleImageLoader, UnstructuredPaddlePDFLoader
from textsplitter.zh_title_enhance import zh_title_enhance

# 文本分句长度
SENTENCE_SIZE = 100
# 是否开启中文标题加强，以及标题增强的相关配置
# 通过增加标题判断，判断哪些文本为标题，并在metadata中进行标记；
# 然后将文本与往上一级的标题进行拼合，实现文本信息的增强。
ZH_TITLE_ENHANCE = False


class SourceService(object):
    def __init__(self, config):
        self.vector_store = None
        self.config = config
        self.embeddings = HuggingFaceEmbeddings(model_name=self.config.embedding_model_name)
        self.docs_path = self.config.docs_path
        self.vector_store_path = self.config.vector_store_path

    def write_check_file(self, filepath, docs):
        folder_path = os.path.join(os.path.dirname(filepath), "tmp_files")
        if not os.path.exists(folder_path):
            os.makedirs(folder_path)
        fp = os.path.join(folder_path, 'load_file.txt')
        with open(fp, 'a+', encoding='utf-8') as fout:
            fout.write("filepath=%s,len=%s" % (filepath, len(docs)))
            fout.write('\n')
            for i in docs:
                fout.write(str(i))
                fout.write('\n')
            fout.close()

    def load_file(self, file, sentence_size=SENTENCE_SIZE, using_zh_title_enhance=ZH_TITLE_ENHANCE):
        if file.lower().endswith(".md"):
            loader = UnstructuredFileLoader(file, mode="elements")
            doc = loader.load()
        elif file.lower().endswith(".pac") or file.lower().endswith(".hal") or file.lower().endswith(".ini"):
            loader = TextLoader(file, autodetect_encoding=True)
            textsplitter = ChineseTextSplitter(pdf=False, sentence_size=sentence_size)
            doc = loader.load_and_split(textsplitter)
        elif file.lower().endswith(".pdf"):
            loader = UnstructuredPaddlePDFLoader(file)
            textsplitter = ChineseTextSplitter(pdf=True, sentence_size=sentence_size)
            doc = loader.load_and_split(textsplitter)
        elif file.lower().endswith(".jpg") or file.lower().endswith(".png"):
            loader = UnstructuredPaddleImageLoader(file, mode="elements")
            textsplitter = ChineseTextSplitter(pdf=False, sentence_size=sentence_size)
            doc = loader.load_and_split(text_splitter=textsplitter)
        elif file.lower().endswith(".csv"):
            loader = CSVLoader(file)
            doc = loader.load()
        else:
            loader = UnstructuredFileLoader(file, mode="elements")
            textsplitter = ChineseTextSplitter(pdf=False, sentence_size=sentence_size)
            doc = loader.load_and_split(text_splitter=textsplitter)
        if using_zh_title_enhance:
            doc = zh_title_enhance(doc)
        self.write_check_file(file, doc)
        return doc

    def init_source_vector(self, filepath: list[str]):
        """
        初始化本地知识库向量
        :return:
        """
        docs = []
        for file in filepath:
            doc = self.load_file(file)
            docs.extend(doc)
        self.vector_store = FAISS.from_documents(docs, self.embeddings)
        self.vector_store.save_local(self.vector_store_path)

    def add_document(self, document_path):
        doc = self.load_file(document_path)
        self.vector_store.add_documents(doc)
        self.vector_store.save_local(self.vector_store_path)

    def load_vector_store(self, path):
        if path is None:
            self.vector_store = FAISS.load_local(self.vector_store_path, self.embeddings)
        else:
            self.vector_store = FAISS.load_local(path, self.embeddings)
        return self.vector_store

    def search_web(self, query):

        # SESSION.proxies = {
        #     "http": f"socks5h://localhost:7890",
        #     "https": f"socks5h://localhost:7890"
        # }
        try:
            results = ddg(query)
            web_content = ''
            if results:
                for result in results:
                    web_content += result['body']
            return web_content
        except Exception as e:
            print(f"网络检索异常:{query}")
            return ''
# if __name__ == '__main__':
#     config = LangChainCFG()
#     source_service = SourceService(config)
#     source_service.init_source_vector()
#     search_result = source_service.vector_store.similarity_search_with_score('科比')
#     print(search_result)
#
#     source_service.add_document('/home/searchgpt/yq/Knowledge-ChatGLM/docs/added/科比.txt')
#     search_result = source_service.vector_store.similarity_search_with_score('科比')
#     print(search_result)
#
#     vector_store=source_service.load_vector_store()
#     search_result = source_service.vector_store.similarity_search_with_score('科比')
#     print(search_result)
