import { FlexMessage, FlexContainer } from '@line/bot-sdk'

const createCarouselTemplate = (): FlexMessage => {
    const flex: FlexContainer = {
        type: 'carousel',
        contents: [
            {
                type: 'bubble',
                body: {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                        {
                            type: 'text',
                            text: 'Option 1',
                        },
                        {
                            type: 'button',
                            action: {
                                type: 'postback',
                                label: 'Choose',
                                data: 'option=1',
                            },
                        },
                    ],
                },
            },
            {
                type: 'bubble',
                body: {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                        {
                            type: 'text',
                            text: 'Option 2',
                        },
                        {
                            type: 'button',
                            action: {
                                type: 'postback',
                                label: 'Choose',
                                data: 'option=2',
                            },
                        },
                    ],
                },
            },
            // Add more bubbles if needed
        ],
    }

    const message: FlexMessage = {
        type: 'flex',
        altText: 'This is a carousel template',
        contents: flex,
    }

    return message
}

export default createCarouselTemplate
