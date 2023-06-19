import { NextRequest, NextResponse } from 'next/server'
import {
    Client,
    TextMessage,
    WebhookEvent,
    validateSignature,
} from '@line/bot-sdk'
import {
    ChatCompletionRequestMessageRoleEnum,
    Configuration,
    OpenAIApi,
} from 'openai'
import { load } from 'ts-dotenv'

const env = load({
    CHANNEL_ACCESS_TOKEN: String,
    CHANNEL_SECRET: String,
    OPENAI_API_KEY: String,
})

// LINEの環境変数設定
const line_config = {
    channelAccessToken: env.CHANNEL_ACCESS_TOKEN || '',
    channelSecret: env.CHANNEL_SECRET || '',
}

// カルーセルテンプレート
import createCarouselTemplate from './carousel'

// LINE Messaging APIにアクセスするためのクライアントを設定
const client = new Client(line_config)

//Open AIの環境変数設定
const openai_config = new Configuration({
    apiKey: env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(openai_config)

// 特定のキーワードが送信されたときに、LINE Messaging API のカルーセルテンプレートを返します
async function carouselEventHandler(event: WebhookEvent) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        return
    }

    // Check if the user sent the keyword to trigger the carousel
    if (event.message.text !== 'カールセル') {
        return
    }

    // Create the carousel using the imported function
    const carousel = createCarouselTemplate()

    await client.replyMessage(event.replyToken, carousel)
    await carouselEventHandler(event)
}

const chatGptHandler = async (text: string): Promise<string> => {
    const errorMessage = 'エラーが発生したためもう一度やり直してください'
    try {
        const response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: ChatCompletionRequestMessageRoleEnum.User,
                    content: text,
                },
            ],
        })
        const answer = response.data.choices[0].message?.content
        return answer ?? errorMessage
    } catch (error) {
        console.log(error)
    }
    return errorMessage
}

// 受信したイベントがテキストメッセージの場合、メッセージを返信する処理を実行するイベントハンドラーを設定(ここを応用する)
async function textEventHandler(event: WebhookEvent) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        return
    }

    const { replyToken } = event
    const { text } = event.message
    const gptResponseText = await chatGptHandler(text)
    const response: TextMessage = {
        type: 'text',
        text: gptResponseText,
    }
    await client.replyMessage(replyToken, response)
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    const bodyText = await request.text()
    if (
        !validateSignature(
            bodyText,
            line_config.channelSecret || '',
            request.headers.get('x-line-signature') || ''
        )
    ) {
        return NextResponse.json({
            comment: 'Invalid signature',
            status: 403,
        })
    }

    const events: WebhookEvent[] = JSON.parse(bodyText).events
    await Promise.all(
        events.map(async (event: WebhookEvent) => {
            try {
                await textEventHandler(event)
            } catch (error: any) {
                console.error(error)
                return NextResponse.json({
                    comment: '通信に失敗しました。',
                    errors: error.message,
                    status: 500,
                })
            }
        })
    )
    return NextResponse.json({
        status: 200,
    })
}
