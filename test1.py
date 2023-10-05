#
# text2vec-large-chinese + FAISS + ChatOpenAI
#
import os

from langchain import PromptTemplate
from langchain.chains import ConversationalRetrievalChain
from langchain.chat_models import ChatOpenAI
from clc.source_service import SourceService


os.environ["OPENAI_API_KEY"] = "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"

questions = [
    "你了解E-MOTION的PAC语言吗？",
    "使用E-MOTION的PAC语言, 如何获取当前座标并打印出来？",
    "运动到目标点后，打印出目标点的位置，写出完整的PAC程序",
    "使用E-MOTION的PAC機器人語言，編寫一個程序來啟動一個新任務 'task1'",
    "What are the data types in PAC robot language?",
    "What are the pose type data in PAC robot language?",
    "Explain to me how to use 'APPROACH' statement in PAC language.",
    "How to rewrite APPROACH statement using MOVE statement?",
    "Use APPROACH statement to make the robot move (CP control) to a position 80 mm away from the position of lp3 in "
    "the –Zm direction",
]


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


config = LangChainCFG()
source_service = SourceService(config)
db = source_service.load_vector_store(config.vector_store_path)


def conversation():
    # prompt_template = """基于以下已知信息，简洁和专业的来回答用户的问题。如果无法从中得到答案，请说 "根据已知信息无法回答该问题" 或
    # "没有提供足够的相关信息"，不允许在答案中添加编造成分，答案请使用中文。已知内容: {context} 问题: {question}"""
    # prompt = PromptTemplate(template=prompt_template,
    #                         input_variables=["context", "question"])
    retriever = db.as_retriever()
    retriever.search_kwargs["distance_metric"] = "cos"
    retriever.search_kwargs["fetch_k"] = 50
    retriever.search_kwargs["maximal_marginal_relevance"] = True
    retriever.search_kwargs["k"] = 5
    model = ChatOpenAI(model_name="gpt-3.5-turbo")
    # qa = ConversationalRetrievalChain.from_llm(model, retriever=retriever,
    #                                            return_source_documents=True,
    #                                            combine_docs_chain_kwargs={"prompt": prompt})
    qa = ConversationalRetrievalChain.from_llm(model, retriever=retriever,
                                               return_source_documents=True)
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
    conversation()
