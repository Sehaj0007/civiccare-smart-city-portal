import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const quickActions = [
  { label: 'Raise complaint', route: '/raise-complaint' },
  { label: 'Track complaints', route: '/my-complaints' },
  { label: 'User login', route: '/login' },
];

const starterMessages = [
  {
    id: 'welcome',
    sender: 'bot',
    text: 'Hi, I am CivicCare Assistant. I can help you raise complaints, find the right login page, and explain how the portal works.',
  },
];

const getBotReply = (message) => {
  const text = message.toLowerCase();

  if (text.includes('raise') || text.includes('complaint') || text.includes('report')) {
    return {
      text: 'To report an issue, open Raise Complaint, choose a category, describe the issue clearly, and submit it with a photo if available.',
      cta: { label: 'Open Raise Complaint', route: '/raise-complaint' },
    };
  }

  if (text.includes('track') || text.includes('status') || text.includes('my complaint')) {
    return {
      text: 'You can monitor complaint progress from My Complaints after logging in. Each complaint shows its current stage and latest updates.',
      cta: { label: 'Open My Complaints', route: '/my-complaints' },
    };
  }

  if (text.includes('register') || text.includes('sign up') || text.includes('signup')) {
    return {
      text: 'New citizens can create an account from the registration page before raising or tracking complaints.',
      cta: { label: 'Open Register', route: '/register' },
    };
  }

  if (text.includes('admin')) {
    return {
      text: 'Admins can sign in from the dedicated admin login page to manage departments, assignments, and dashboard activity.',
      cta: { label: 'Open Admin Login', route: '/admin-login' },
    };
  }

  if (text.includes('staff') || text.includes('team member')) {
    return {
      text: 'Staff members can use the staff login page to access assigned field work and operational dashboards.',
      cta: { label: 'Open Staff Login', route: '/staff-login' },
    };
  }

  if (text.includes('supervisor')) {
    return {
      text: 'Supervisors can use the supervisor login page to monitor teams, assignments, and resolution flow.',
      cta: { label: 'Open Supervisor Login', route: '/supervisor-login' },
    };
  }

  return {
    text: 'I can help with complaint filing, complaint tracking, registration, and finding the correct login page. Try asking about complaints, status, admin, supervisor, or staff access.',
  };
};

const ChatLink = ({ cta, onNavigate }) => {
  if (!cta) return null;

  return (
    <Link
      to={cta.route}
      onClick={onNavigate}
      className="inline-flex items-center rounded-full border border-[#7ED957]/30 bg-[#7ED957]/10 px-3 py-1.5 text-xs font-semibold text-[#7ED957] transition hover:border-[#7ED957]/60 hover:bg-[#7ED957]/20"
    >
      {cta.label}
    </Link>
  );
};

export const CivicCareChatbot = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(starterMessages);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages]);

  const suggestionChips = useMemo(
    () => ['How do I raise a complaint?', 'How can I track status?', 'Where is staff login?'],
    []
  );

  const sendMessage = (rawMessage) => {
    const trimmedMessage = rawMessage.trim();
    if (!trimmedMessage) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmedMessage,
    };

    const botReply = getBotReply(trimmedMessage);
    const botMessage = {
      id: `bot-${Date.now() + 1}`,
      sender: 'bot',
      text: botReply.text,
      cta: botReply.cta,
    };

    setMessages((prev) => [...prev, userMessage, botMessage]);
    setInput('');
  };

  const handleQuickAction = (route) => {
    navigate(route);
    setIsOpen(false);
  };

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[70] sm:bottom-6 sm:right-6">
      {isOpen && (
        <div className="pointer-events-auto mb-4 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-[28px] border border-[#7ED957]/20 bg-[#091109]/95 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="border-b border-[#7ED957]/15 bg-gradient-to-r from-[#7ED957]/18 via-[#122012] to-[#091109] px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#7ED957]">CivicCare</p>
                <h2 className="mt-1 text-lg font-semibold text-white">Citizen Support Chat</h2>
                <p className="mt-1 text-sm text-gray-300">Quick help for complaints, tracking, and portal access.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-white/10 p-2 text-gray-300 transition hover:border-[#7ED957]/30 hover:bg-white/5 hover:text-white"
                aria-label="Close chatbot"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          </div>

          <div className="max-h-[24rem] space-y-4 overflow-y-auto px-4 py-4">
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => handleQuickAction(action.route)}
                  className="rounded-full border border-[#7ED957]/20 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-200 transition hover:border-[#7ED957]/40 hover:bg-[#7ED957]/10 hover:text-white"
                >
                  {action.label}
                </button>
              ))}
            </div>

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    message.sender === 'user'
                      ? 'rounded-br-md bg-[#7ED957] text-[#071007]'
                      : 'rounded-bl-md border border-white/10 bg-[#111a11] text-gray-100'
                  }`}
                >
                  <p>{message.text}</p>
                  {message.cta ? (
                    <div className="mt-3">
                      <ChatLink cta={message.cta} onNavigate={() => setIsOpen(false)} />
                    </div>
                  ) : null}
                </div>
              </div>
            ))}

            <div className="flex flex-wrap gap-2">
              {suggestionChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => sendMessage(chip)}
                  className="rounded-full border border-white/10 bg-[#0d150d] px-3 py-1.5 text-xs text-gray-300 transition hover:border-[#7ED957]/30 hover:text-white"
                >
                  {chip}
                </button>
              ))}
            </div>

            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage(input);
            }}
            className="border-t border-white/10 bg-[#081008] p-4"
          >
            <div className="flex items-center gap-3 rounded-2xl border border-[#7ED957]/15 bg-white/5 px-3 py-2 focus-within:border-[#7ED957]/40">
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask CivicCare for help..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                aria-label="Chat with CivicCare assistant"
              />
              <button
                type="submit"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#7ED957] text-[#071007] transition hover:scale-105 hover:bg-[#95ea6f]"
                aria-label="Send message"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M22 2L15 22l-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="pointer-events-auto flex items-center gap-3 rounded-full border border-[#7ED957]/30 bg-[#0d180d]/95 px-4 py-3 text-white shadow-xl shadow-black/40 backdrop-blur-xl transition hover:-translate-y-1 hover:border-[#7ED957]/60 hover:bg-[#112011]"
        aria-expanded={isOpen}
        aria-label="Open CivicCare chatbot"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7ED957] text-[#071007] shadow-lg shadow-[#7ED957]/25">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h8M8 14h5" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18l-3 3V6a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H6z"
            />
          </svg>
        </span>
        <span className="hidden sm:block text-left">
          <span className="block text-xs uppercase tracking-[0.22em] text-[#7ED957]">Need help?</span>
          <span className="block text-sm font-semibold">Chat with CivicCare</span>
        </span>
      </button>
    </div>
  );
};

export default CivicCareChatbot;
