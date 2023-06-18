import { NextResponse, NextRequest } from 'next/server'
import {
    ChatCompletionRequestMessageRoleEnum,
    Configuration,
    OpenAIApi,
} from 'openai'
import { load } from 'ts-dotenv'

type History = {
    inputText: string
    completionText: string
}

const env = load({
    OPENAI_API_KEY: String,
})

type Message = {
    role: ChatCompletionRequestMessageRoleEnum
    content: string
}

const configuration = new Configuration({
    apiKey: env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

// 必要に応じて、request: Request を引数にとる
export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const prompt =
            '令和に人気だったビジネス書をいくつか教えてください。語尾は猫のマネで『ニャン』でお願いします！'
        const model = 'gpt-3.5-turbo'

        if (!request.body) {
            throw new Error('Request body is null')
        }

        // this will convert the body stream to JSON
        const requestBody = await request.json()

        const userInput = requestBody.userInput
        const histories: History[] = requestBody.histories
        console.log('チャットの履歴')
        console.log(histories)
        const messages: Message[] = [
            {
                role: ChatCompletionRequestMessageRoleEnum.System,
                content: prompt,
            },
        ]
        for (const history of histories) {
            messages.push({
                role: ChatCompletionRequestMessageRoleEnum.User,
                content: history.inputText,
            })
            messages.push({
                role: ChatCompletionRequestMessageRoleEnum.Assistant,
                content: history.completionText,
            })
        }
        const response = await openai.createChatCompletion({
            model: model,
            messages: messages,
        })

        const generatedText: string =
            response.data.choices[0].message?.content ?? ''

        if (generatedText) {
            histories.push({
                inputText: userInput,
                completionText: generatedText,
            })
        }
        console.log('チャットの履歴 その2')
        console.log(histories)
        console.log('メッセージ一覧 その1')
        console.log(messages)
        return NextResponse.json({ comment: generatedText })
    } catch (error: any) {
        console.error(error)
        return NextResponse.json({
            comment: '通信に失敗しました。',
            errors: error.message,
            status: 500,
        })
    }
}
