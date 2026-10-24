import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Inbox, MessageSquare, Search, Send, Wifi, WifiOff } from "lucide-react";
import api, { getApiMessage } from "../../lib/api";
import usePageTitle from "../../hooks/usePageTitle";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { Avatar } from "../../components/ui/Avatar";
import { StatusBadge } from "../../components/ui/Badge";
import { buttonClass } from "../../components/ui/Button";
import { EmptyState, ErrorState, LoadingBlock } from "../../components/ui/Feedback";
import { PageHeader } from "../../components/dashboard/DashboardUI";
import { INQUIRY_STATUS, formatDate, formatDateTime, timeAgo } from "../../lib/format";

function identifier(record) {
  return record?.id || record?._id || "";
}

function otherPeople(conversation, userId) {
  return (conversation?.participants || []).filter(
    (participant) => String(participant._id || participant.id) !== String(userId)
  );
}

function ConversationRow({ conversation, userId, active, onSelect }) {
  const person = otherPeople(conversation, userId)[0];
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-start gap-3 border-l-2 px-4 py-3.5 text-left transition ${
        active
          ? "border-brand-400 bg-brand-500/[0.07]"
          : "border-transparent hover:bg-white/[0.025]"
      }`}
    >
      <Avatar src={person?.avatar} name={person?.name || "BuildBridge"} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className={`truncate text-xs font-semibold ${active ? "text-white" : "text-slate-200"}`}>
            {person?.name || "BuildBridge"}
          </p>
          <span className="shrink-0 text-[9px] text-slate-600">{timeAgo(conversation.lastMessageAt)}</span>
        </div>
        <p className="mt-0.5 truncate text-[10px] text-brand-300/80">{conversation.inquiry?.title || "Direct conversation"}</p>
        <div className="mt-1 flex items-center gap-2">
          <p className={`min-w-0 flex-1 truncate text-[11px] ${conversation.unreadCount ? "text-slate-300" : "text-slate-500"}`}>
            {conversation.lastMessageText || "No messages yet"}
          </p>
          {conversation.unreadCount ? (
            <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-brand-500 px-1 text-[9px] font-bold text-white">
              {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}

export default function Messages() {
  const { conversationId: id } = useParams();
  const navigate = useNavigate();
  const { user, socket } = useAuth();
  const toast = useToast();
  const userId = identifier(user);
  usePageTitle(id ? "Conversation" : "Messages");

  const [conversations, setConversations] = useState({ loading: true, error: "", items: [] });
  const [thread, setThread] = useState({ loading: false, error: "", conversation: null, messages: [] });
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const viewportRef = useRef(null);

  const loadConversations = useCallback(async () => {
    setConversations((current) => ({ ...current, loading: current.items.length === 0, error: "" }));
    try {
      const { data } = await api.get("/conversations");
      setConversations({ loading: false, error: "", items: data.items || [] });
    } catch (error) {
      setConversations({ loading: false, error: getApiMessage(error, "Your conversations could not be loaded."), items: [] });
    }
  }, []);

  const loadThread = useCallback(async () => {
    if (!id) {
      setThread({ loading: false, error: "", conversation: null, messages: [] });
      return;
    }
    setThread((current) => ({ ...current, loading: true, error: "" }));
    try {
      const { data } = await api.get(`/conversations/${id}`);
      setThread({ loading: false, error: "", conversation: data.conversation, messages: data.messages || [] });
      setConversations((current) => ({
        ...current,
        items: current.items.map((item) =>
          identifier(item) === id ? { ...item, unreadCount: 0 } : item
        ),
      }));
    } catch (error) {
      setThread({ loading: false, error: getApiMessage(error, "This conversation could not be loaded."), conversation: null, messages: [] });
    }
  }, [id]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    loadThread();
  }, [loadThread]);

  useEffect(() => {
    setDraft("");
  }, [id]);

  useEffect(() => {
    if (!socket || !id) return undefined;
    socket.emit("conversation:join", id);
    const onMessage = ({ conversationId, message }) => {
      if (String(conversationId) !== String(id) || !message) return;
      setThread((current) => {
        const existing = current.messages.findIndex((item) => identifier(item) === identifier(message));
        if (existing >= 0) {
          const next = [...current.messages];
          next[existing] = message;
          return { ...current, messages: next };
        }
        return { ...current, messages: [...current.messages, message] };
      });
    };
    const onUpdated = (payload) => {
      if (String(payload?.conversationId) === String(id)) loadThread();
      loadConversations();
    };
    socket.on("message:new", onMessage);
    socket.on("conversation:updated", onUpdated);
    return () => {
      socket.emit("conversation:leave", id);
      socket.off("message:new", onMessage);
      socket.off("conversation:updated", onUpdated);
    };
  }, [socket, id, loadThread, loadConversations]);

  useEffect(() => {
    if (!viewportRef.current) return;
    viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
  }, [thread.messages.length, thread.loading]);

  const send = async (event) => {
    event?.preventDefault();
    const body = draft.trim();
    if (!body || !id) return;
    setSending(true);
    try {
      const { data } = await api.post(`/conversations/${id}/messages`, { body });
      setThread((current) => {
        if (current.messages.some((message) => identifier(message) === identifier(data.message))) return current;
        return { ...current, messages: [...current.messages, data.message] };
      });
      setConversations((current) => ({
        ...current,
        items: current.items.map((item) =>
          identifier(item) === id
            ? { ...item, lastMessageText: body, lastMessageAt: new Date().toISOString(), lastMessageSender: userId }
            : item
        ),
      }));
      setDraft("");
    } catch (error) {
      toast.error("Message not sent", getApiMessage(error, "Please try again."));
    } finally {
      setSending(false);
    }
  };

  const handleComposerKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  };

  const filteredConversations = conversations.items.filter((conversation) => {
    if (unreadOnly && !conversation.unreadCount) return false;
    if (!search.trim()) return true;
    const person = otherPeople(conversation, userId)[0];
    const haystack = `${person?.name || ""} ${conversation.inquiry?.title || ""} ${conversation.lastMessageText || ""}`.toLowerCase();
    return haystack.includes(search.trim().toLowerCase());
  });

  const activeConversation = identifier(thread.conversation) === id ? thread.conversation : null;
  const threadPeople = otherPeople(activeConversation, userId);
  const unreadTotal = conversations.items.reduce((sum, item) => sum + (item.unreadCount || 0), 0);

  return (
    <div>
      <PageHeader
        eyebrow="Private messages"
        title="Conversations"
        description="Messages stay tied to the relevant inquiry, so scope, decisions, and files remain together."
        actions={
          <span
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] ${
              socket?.connected
                ? "border-mint-400/20 bg-mint-400/[0.05] text-mint-300"
                : "border-white/10 bg-white/[0.02] text-slate-500"
            }`}
          >
            {socket?.connected ? <Wifi size={11} /> : <WifiOff size={11} />}
            {socket?.connected ? "Live updates" : "Reconnecting"}
          </span>
        }
      />

      <div className="surface grid min-h-[620px] overflow-hidden rounded-2xl lg:grid-cols-[340px_1fr]">
        <div className={`border-white/8 lg:border-r ${id ? "hidden lg:block" : "block"}`}>
          <div className="border-b border-white/8 px-4 py-3">
            <div className="relative">
              <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search conversations…"
                aria-label="Search conversations"
                className="input-base py-2 pl-8 pr-3 text-xs"
              />
            </div>
            <div className="mt-2.5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setUnreadOnly((current) => !current)}
                className={`rounded-lg px-2 py-1 text-[10px] font-medium transition ${
                  unreadOnly ? "bg-brand-500/15 text-brand-200" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Unread only {unreadTotal ? `(${unreadTotal})` : ""}
              </button>
              <span className="text-[10px] text-slate-600">{conversations.items.length} total</span>
            </div>
          </div>

          {conversations.loading ? (
            <LoadingBlock label="Loading conversations" />
          ) : conversations.error ? (
            <div className="p-4">
              <ErrorState message={conversations.error} onRetry={loadConversations} />
            </div>
          ) : filteredConversations.length ? (
            <ul className="max-h-[540px] divide-y divide-white/[0.05] overflow-y-auto">
              {filteredConversations.map((conversation) => (
                <li key={identifier(conversation)}>
                  <ConversationRow
                    conversation={conversation}
                    userId={userId}
                    active={identifier(conversation) === id}
                    onSelect={() => navigate(`/dashboard/messages/${identifier(conversation)}`)}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4">
              <EmptyState
                icon={Inbox}
                title={search || unreadOnly ? "No conversations match" : "No conversations yet"}
                description={
                  search || unreadOnly
                    ? "Clear the filters to see your full inbox."
                    : "A conversation opens automatically when a customer sends an inquiry."
                }
                className="border-0"
                action={
                  search || unreadOnly ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        setUnreadOnly(false);
                      }}
                      className={buttonClass("secondary", "sm")}
                    >
                      Clear filters
                    </button>
                  ) : null
                }
              />
            </div>
          )}
        </div>

        <div className={`flex min-h-[620px] flex-col ${id ? "block" : "hidden lg:flex"}`}>
          {!id ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-slate-400">
                <MessageSquare size={20} />
              </span>
              <h2 className="text-sm font-semibold text-white">Select a conversation</h2>
              <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500">
                Choose a conversation to read the full history and send a message. Attachments and proposals live in the
                related inquiry.
              </p>
            </div>
          ) : thread.loading && !activeConversation ? (
            <LoadingBlock label="Loading conversation" />
          ) : thread.error ? (
            <div className="p-5">
              <ErrorState message={thread.error} onRetry={loadThread} />
              <div className="mt-4 text-center">
                <Link to="/dashboard/messages" className={buttonClass("secondary", "sm")}>
                  Back to conversations
                </Link>
              </div>
            </div>
          ) : activeConversation ? (
            <>
              <div className="flex items-center gap-3 border-b border-white/8 px-4 py-3 sm:px-5">
                <Link
                  to="/dashboard/messages"
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/5 hover:text-white lg:hidden"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft size={16} />
                </Link>
                <Avatar src={threadPeople[0]?.avatar} name={threadPeople[0]?.name} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {threadPeople.map((person) => person.name).join(", ") || "Conversation"}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] text-slate-500">
                    {activeConversation.inquiry?.title || "Project conversation"}
                  </p>
                </div>
                {identifier(activeConversation.inquiry) ? (
                  <Link
                    to={`/dashboard/inquiries/${identifier(activeConversation.inquiry)}`}
                    className="hidden items-center gap-1.5 text-[11px] text-brand-300 transition hover:text-brand-200 sm:inline-flex"
                  >
                    Open inquiry <ArrowUpRight size={11} />
                  </Link>
                ) : null}
              </div>

              {activeConversation.inquiry ? (
                <div className="flex items-center justify-between gap-3 border-b border-white/8 bg-white/[0.015] px-4 py-2 sm:px-5">
                  <p className="truncate text-[10px] text-slate-500">
                    Project: <span className="text-slate-300">{activeConversation.inquiry.title}</span>
                  </p>
                  <StatusBadge status={activeConversation.inquiry.status} map={INQUIRY_STATUS} />
                </div>
              ) : null}

              <div ref={viewportRef} className="flex-1 overflow-y-auto px-4 py-5 sm:px-5" style={{ maxHeight: "460px" }}>
                {thread.messages.length ? (
                  <div className="space-y-3">
                    {thread.messages.map((message, index) => {
                      const senderId = identifier(message.sender) || message.sender;
                      const own = String(senderId) === String(userId);
                      const previous = thread.messages[index - 1];
                      const newDay =
                        !previous ||
                        new Date(message.createdAt).toDateString() !== new Date(previous.createdAt).toDateString();
                      return (
                        <div key={identifier(message)}>
                          {newDay ? (
                            <div className="my-5 flex items-center gap-3">
                              <span className="h-px flex-1 bg-white/5" />
                              <span className="text-[9px] uppercase tracking-wider text-slate-600">
                                {formatDate(message.createdAt, { weekday: "long" })}
                              </span>
                              <span className="h-px flex-1 bg-white/5" />
                            </div>
                          ) : null}
                          {message.system ? (
                            <div className="my-3 flex justify-center">
                              <p className="max-w-xl rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-center text-[10px] leading-relaxed text-slate-500">
                                {message.body}
                              </p>
                            </div>
                          ) : (
                            <div className={`flex items-end gap-2 ${own ? "flex-row-reverse" : ""}`}>
                              {!own ? (
                                <Avatar src={message.sender?.avatar} name={message.sender?.name} size="sm" />
                              ) : null}
                              <div className={`max-w-[80%] ${own ? "items-end" : "items-start"} flex flex-col gap-1`}>
                                {!own ? (
                                  <span className="px-1 text-[10px] text-slate-500">{message.sender?.name || "Participant"}</span>
                                ) : null}
                                <div
                                  className={`whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[12px] leading-relaxed ${
                                    own
                                      ? "rounded-br-md bg-brand-600 text-white shadow-lg shadow-brand-950/30"
                                      : "rounded-bl-md border border-white/8 bg-white/[0.04] text-slate-200"
                                  }`}
                                >
                                  {message.body}
                                </div>
                                <span className={`px-1 text-[9px] text-slate-600 ${own ? "self-end" : ""}`}>
                                  {formatDateTime(message.createdAt)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center">
                    <MessageSquare size={20} className="mb-3 text-slate-600" />
                    <p className="text-xs font-medium text-slate-300">Start the conversation</p>
                    <p className="mt-1 max-w-xs text-[11px] leading-relaxed text-slate-500">
                      Introduce yourself, ask a clarifying question, or confirm the next step.
                    </p>
                  </div>
                )}
              </div>

              <form onSubmit={send} className="border-t border-white/8 p-3 sm:p-4">
                <div className="rounded-xl border border-white/10 bg-ink-950/60 p-2 focus-within:border-brand-400/45">
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={handleComposerKeyDown}
                    rows={2}
                    maxLength={5000}
                    placeholder="Write a message… Enter to send, Shift + Enter for a new line"
                    aria-label="Message"
                    className="w-full resize-none border-0 bg-transparent px-2 py-1 text-xs leading-relaxed text-slate-200 placeholder:text-slate-600 focus:outline-none"
                  />
                  <div className="flex items-center justify-between gap-2 px-1 pt-1">
                    <span className="text-[9px] text-slate-600">{draft.length}/5000</span>
                    <button
                      type="submit"
                      disabled={!draft.trim() || sending}
                      className={buttonClass("primary", "sm")}
                    >
                      <Send size={12} />
                      {sending ? "Sending…" : "Send"}
                    </button>
                  </div>
                </div>
              </form>
            </>
          ) : null}
        </div>
      </div>

      <p className="mt-4 text-[10px] leading-relaxed text-slate-600">
        Messages are private to the participants in this conversation. Do not share passwords or sensitive payment details.
      </p>
    </div>
  );
}
