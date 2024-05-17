import { ChatOpenAI } from "@langchain/openai";
import { FC } from "react";

//import { Layout } from "./layout";

//envファイルを読み込み（VITE）
const OPENAI_API_KEY: string = import.meta.env.VITE_OPENAI_API_KEY;

const chatModel = new ChatOpenAI({
  apiKey: OPENAI_API_KEY,
});

const response = await chatModel.invoke(
  "オリンパス株式会社と株式会社不二家がカメラの画像処理技術で関連があります。この２社の提携から考えられる事業展開を教えてください。必ず日本語で回答してください。",
);

export const AiChat: FC = () => {
  return <p>{response.content.toString()}</p>;
};
