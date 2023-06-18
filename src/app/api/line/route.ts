import { NextRequest, NextResponse } from 'next/server'
import {
    Client,
    TextMessage,
    WebhookEvent,
    validateSignature,
} from '@line/bot-sdk'
import { load } from 'ts-dotenv'

const env = load({
    CHANNEL_ACCESS_TOKEN: String,
    CHANNEL_SECRET: String,
})

const config = {
    channelAccessToken: env.CHANNEL_ACCESS_TOKEN || '',
    channelSecret: env.CHANNEL_SECRET || '',
}

// LINE Messaging APIにアクセスするためのクライアントを設定
const client = new Client(config)

// 受信したイベントがテキストメッセージの場合、メッセージを返信する処理を実行するイベントハンドラーを設定(ここを応用する)
async function textEventHandler(event: WebhookEvent) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        return
    }

    const { replyToken } = event
    const { text } = event.message
    const response: TextMessage = {
        type: 'text',
        text: text,
    }
    await client.replyMessage(replyToken, response)
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    const bodyText = await request.text()
    if (
        !validateSignature(
            bodyText,
            config.channelSecret || '',
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
    return NextResponse.next()
}
