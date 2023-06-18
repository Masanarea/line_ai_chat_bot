'use client'
import { useState } from 'react'

type History = {
    inputText: string
    completionText: string
}

export default function Home() {
    const [userInput, setUserInput] = useState('')
    const [response, setResponse] = useState('')
    const [histories, setHistories] = useState<History[]>([])

    async function handleChat() {
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userInput, histories }),
            })

            if (!res.ok) {
                throw new Error(await res.text())
            }

            const data = await res.json()
            setResponse(data.comment)
            setHistories([
                ...histories,
                { inputText: userInput, completionText: data.comment },
            ])
            console.log(histories)
        } catch (error) {
            console.error(error)
            alert('An error occurred while trying to chat.')
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <div className="flex flex-col items-center justify-center space-y-8">
                <input
                    className="border-2 border-gray-300 rounded-md px-4 py-2 text-black"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type your message here..."
                />
                <button
                    className="px-6 py-2 bg-blue-600 text-white rounded-md"
                    onClick={handleChat}
                >
                    Send
                </button>
                <p>{response}</p>
            </div>
        </div>
    )
}
