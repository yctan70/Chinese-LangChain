#
# text2vec-large-chinese + PyPDFLoader + Chroma + ChatOpenAI + ConversationalRetrievalChain
#
import os
from langchain import PromptTemplate
from langchain.chains import ConversationalRetrievalChain
from langchain.chat_models import ChatOpenAI
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain.vectorstores import Chroma
from langchain.embeddings import HuggingFaceEmbeddings

os.environ["OPENAI_API_KEY"] = "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"
persist_directory = './cache/emotion3'
embedding = HuggingFaceEmbeddings(model_name='GanymedeNil/text2vec-large-chinese')

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
    loader = PyPDFLoader('./docs/emotion3/Denso Robot Programmer Manual.pdf')
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
        embedding=embedding,
        persist_directory=persist_directory
    )
    vectordb.persist()


def conversation():
    prompt_template = """Use the following pieces of context to answer the question at the end.
    If you don't know the answer, just say that you don't know, don't try to
    make up an answer.
    {context} 
    Question: {question} 
    Helpful Answer:"""
    prompt = PromptTemplate(template=prompt_template,
                            input_variables=["context", "question"])
    db = Chroma(persist_directory=persist_directory, embedding_function=embedding)
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


if __name__ == "__main__":
    # ingest()
    # source()
    conversation()
