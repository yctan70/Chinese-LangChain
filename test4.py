#
# sentence-t5-base-nlpl-code-x-glue + PyPDFLoader + Chroma
# ChatOpenAI + ConversationalRetrievalChain
# ChatGLM2-6B-int4
#
import os
from langchain import PromptTemplate
from langchain.chains import ConversationalRetrievalChain
from langchain.chat_models import ChatOpenAI
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain.vectorstores import Chroma
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.llms import ChatGLM

from clc.langchain_application import LangChainApplication
from clc.source_service import SourceService


class LangChainCFG:
    llm_model_name = 'THUDM/chatglm2-6b-int4'  # 本地模型文件 or huggingface远程仓库
    embedding_model_name = 'krlvi/sentence-t5-base-nlpl-code-x-glue'  # 检索模型文件 or huggingface远程仓库
    vector_store_path = './cache/emotion4'
    docs_path = './docs'
    kg_vector_stores = {
        'emotion': './cache/emotion4',
        '中文维基百科': '/content/drive/MyDrive/cache/zh_wikipedia',
        '大规模金融研报': '/content/drive/MyDrive/cache/financial_research_reports',
        '初始化': '/content/drive/MyDrive/cache/cache',
    }  # 可以替换成自己的知识库，如果没有需要设置为None
    # kg_vector_stores=None
    patterns = ['模型问答', '知识库问答']  #
    n_gpus = 1


config = LangChainCFG()

questions = [
    "What are the data types in PAC robot language?",
    "What are the pose type data in PAC robot language?",
    "Explain to me how to use APPROACH statement as an robot control statement in PAC language.",
    "How to rewrite APPROACH statement using MOVE statement?",
    "Use APPROACH statement to make the robot move (CP control) to a position 80 mm away from the position of lp3 in "
    "the –Zm direction",
]


def ingest():
    # load the document as before
    loader = PyPDFLoader('./docs/emotion2/Denso Robot Programmer Manual.pdf')
    documents = loader.load()

    # we split the data into chunks of 1,000 characters, with an overlap
    # of 200 characters between the chunks, which helps to give better results
    # and contain the context of the information between chunks
    text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    documents = text_splitter.split_documents(documents)

    # we create our vectorDB, using the OpenAIEmbeddings transformer to create
    # embeddings from our text chunks. We set all the db information to be stored
    # inside the ./data directory, so it doesn't clutter up our source files
    vectordb = Chroma.from_documents(
        documents,
        embedding=HuggingFaceEmbeddings(model_name=config.embedding_model_name),
        persist_directory=config.vector_store_path
    )
    vectordb.persist()


def openai_chat():
    prompt_template = """Use the following pieces of context to answer the question at the end.
    If you don't know the answer, just say that you don't know, don't try to
    make up an answer.
    {context} 
    Question: {question} 
    Helpful Answer:"""
    prompt = PromptTemplate(template=prompt_template,
                            input_variables=["context", "question"])

    source_service = SourceService(config)
    db = source_service.load_chroma(config.vector_store_path)
    retriever = db.as_retriever()
    retriever.search_kwargs["distance_metric"] = "cos"
    retriever.search_kwargs["fetch_k"] = 50
    retriever.search_kwargs["maximal_marginal_relevance"] = True
    retriever.search_kwargs["k"] = 5
    model = ChatOpenAI(model_name="gpt-3.5-turbo")
    qa = ConversationalRetrievalChain.from_llm(model, retriever=retriever,
                                               return_source_documents=True,
                                               combine_docs_chain_kwargs={"prompt": prompt})
    chat_history = []
    for question in questions:
        result = qa({"question": question, "chat_history": chat_history})
        chat_history.append((question, result["answer"]))
        print("----------------------------------\n")
        print(f"**Question**: {question} \n")
        print(f"**Answer**: {result['answer']} \n")
        print("**Source**:\n")
        for doc in result['source_documents']:
            print(f"{doc} \n")


def chatglm_chat():
    app = LangChainApplication(config)
    app.source_service.load_chroma(config.vector_store_path)
    history = []
    search_text = ''
    for question in questions:
        resp = app.get_knowledge_based_answer(
            query=question,
            history_len=1,
            temperature=0.1,
            top_p=0.7,
            top_k=4,
            web_content='',
            chat_history=history
        )
        history.append((question, resp['result']))
        print(f"**Question**: {question} \n")
        print(f"**Answer**: {resp['result']} \n")
        search_text = ''
        for idx, source in enumerate(resp['source_documents'][:4]):
            sep = f'----------【搜索结果{idx + 1}：】---------------\n'
            search_text += f'{sep}\n{source.page_content}\n\n'
        print(search_text)


def chatglm_cpp_chat():
    source_service = SourceService(config)
    db = source_service.load_chroma(config.vector_store_path)
    retriever = db.as_retriever()
    retriever.search_kwargs["distance_metric"] = "cos"
    retriever.search_kwargs["fetch_k"] = 50
    retriever.search_kwargs["maximal_marginal_relevance"] = True
    retriever.search_kwargs["k"] = 5

    # default endpoint_url for a local deployed ChatGLM api server
    endpoint_url = "http://127.0.0.1:8000"

    prompt_template = """基于以下已知信息，简洁和专业的来回答用户的问题。
                        如果无法从中得到答案，请说 "根据已知信息无法回答该问题" 或 "没有提供足够的相关信息"，不允许在答案中添加编造成分，答案请使用中文。
                        已知内容:
                        {context}
                        问题:
                        {question}"""
    prompt = PromptTemplate(template=prompt_template,
                            input_variables=["context", "question"])
    llm = ChatGLM(
        endpoint_url=endpoint_url,
        max_token=10000,
        top_p=0.8,
        model_kwargs={"sample_model_args": False},
    )
    llm.with_history = True

    qa = ConversationalRetrievalChain.from_llm(llm, retriever=retriever,
                                               return_source_documents=True,
                                               combine_docs_chain_kwargs={"prompt": prompt})
    chat_history = []
    for question in questions:
        result = qa({"question": question, "chat_history": chat_history})
        chat_history.append((question, result["answer"]))
        print("----------------------------------\n")
        print(f"**Question**: {question} \n")
        print(f"**Answer**: {result['answer']} \n")
        print("**Source**:\n")
        for doc in result['source_documents']:
            print(f"{doc} \n")


if __name__ == "__main__":
    # ingest()
    # source()
    chatglm_cpp_chat()
