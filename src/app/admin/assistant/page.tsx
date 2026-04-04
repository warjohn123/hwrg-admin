'use client';

import { FormEvent, useMemo, useState } from 'react';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const SUGGESTED_QUESTIONS = [
  "Who hasn't clocked in today?",
  'How many active employees do we have?',
  'How many inactive employees are there?',
  'How many branches are registered?',
];

export default function AdminAssistantPage() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Ask me about active employees, today's missing clock-ins, and branch overview. I will use live admin data to answer.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const canSend = useMemo(
    () => question.trim().length > 0 && !isLoading,
    [question, isLoading],
  );

  const askAssistant = async (nextQuestion?: string) => {
    const content = (nextQuestion ?? question).trim();
    if (!content || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/assistant/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: content }),
      });

      const data = await response.json();
      const answer =
        typeof data?.answer === 'string'
          ? data.answer
          : data?.error || 'I could not generate an answer for that question.';

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: answer,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Request failed. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await askAssistant();
  };

  return (
    <section className="max-w-5xl mx-auto h-[calc(100vh-10rem)] flex flex-col">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">Admin AI Assistant</h2>
        <p className="text-sm text-gray-600">
          Ask operational questions instead of jumping across pages.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {SUGGESTED_QUESTIONS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => askAssistant(item)}
            disabled={isLoading}
            className="px-3 py-1.5 text-sm rounded-full bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-60"
          >
            {item}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-3xl rounded-lg px-4 py-3 whitespace-pre-wrap ${
              message.role === 'user'
                ? 'ml-auto bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            {message.content}
          </div>
        ))}

        {isLoading && (
          <div className="bg-gray-100 text-gray-900 rounded-lg px-4 py-3 inline-block">
            Thinking...
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="mt-4 flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask: Who has not clocked in today?"
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!canSend}
          className="px-5 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </section>
  );
}
