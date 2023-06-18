import { NextResponse } from 'next/server'
import {
    ChatCompletionRequestMessageRoleEnum,
    Configuration,
    OpenAIApi,
} from 'openai'
import { load } from 'ts-dotenv'

const env = load({
    OPENAI_API_KEY: String,
})

const configuration = new Configuration({
    apiKey: env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

// 必要に応じて、request: Request を引数にとる
export async function POST(): Promise<NextResponse> {
    try {
        const prompt =
            '令和に人気だったビジネス書をいくつか教えてください。語尾は猫のマネで『ニャン』でお願いします！'
        const model = 'gpt-3.5-turbo'
        const response = await openai.createChatCompletion({
            model: model,
            messages: [
                {
                    role: ChatCompletionRequestMessageRoleEnum.User,
                    content: prompt,
                },
            ],
        })

        const generatedText: string =
            response.data.choices[0].message?.content ?? '通信に失敗しました。'
        return NextResponse.json({ comment: generatedText })
    } catch (error) {
        console.error(error)
        return NextResponse.json({
            comment: '通信に失敗しました。',
            errors: error,
            status: 500,
        })
    }
}
