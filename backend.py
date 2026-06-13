from typing import TypedDict, Annotated
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.messages import BaseMessage
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition
from tools import TOOLS
import os

load_dotenv()

llm = ChatGroq(
    model="openai/gpt-oss-120b",
    api_key=os.getenv("GROQ_API_KEY"),
)

# Bind tools to the LLM so it can decide when to call them
llm_with_tools = llm.bind_tools(TOOLS)


class ChatState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]


def assistant(state: ChatState):
    response = llm_with_tools.invoke(state["messages"])
    return {"messages": [response]}


graph = StateGraph(ChatState)

graph.add_node("assistant", assistant)
graph.add_node("tools", ToolNode(TOOLS))

graph.add_edge(START, "assistant")
# If the LLM called a tool → run tools → back to assistant
# Otherwise → END
graph.add_conditional_edges("assistant", tools_condition)
graph.add_edge("tools", "assistant")

workflow = graph.compile()