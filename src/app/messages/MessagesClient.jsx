// src/app/messages/MessagesClient.jsx
'use client';

import { useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { MessageCircle, LogIn, SearchX } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import InboxList from '@/components/Messages/InboxList';
import ChatPanel from '@/components/Messages/ChatPanel';
import { useStageHeight } from '@/components/Messages/messageUtils';
import { isHydrated } from '@/utils/conversation';
import './messages.css';

export default function MessagesClient() {
  const router = useRouter();
  const params = useSearchParams();
  const convId = params.get('c');

  const { user, loading: authLoading } = useAuth();
  const userId = user?._id?.toString();

  const { inbox, inboxLoading, loadInbox, enterConversation, leaveConversation } = useChat();

  const stageRef = useRef(null);
  const chatOpen = !!convId;

  const selected = useMemo(() => inbox.find((c) => c._id === convId) || null, [inbox, convId]);
  const selectedId = selected?._id || null;

  // A conversation can arrive with bare ids (no names or product yet): fetch the full record once.
  const needsHydrate = !!selected && !isHydrated(selected);
  useEffect(() => {
    if (needsHydrate) loadInbox();
  }, [needsHydrate, loadInbox]);

  // Latest values for effects that must only re-run when the selected id changes
  const selectedRef = useRef(null);
  selectedRef.current = selected;
  const enterRef = useRef(enterConversation);
  enterRef.current = enterConversation;
  const leaveRef = useRef(leaveConversation);
  leaveRef.current = leaveConversation;

  // On phones, an open chat hides the bottom tab bar (see messages.css).
  // Declared BEFORE useStageHeight so the bar is hidden before height is measured.
  useEffect(() => {
    if (!chatOpen) return;
    document.body.dataset.msChat = '1';
    return () => { delete document.body.dataset.msChat; };
  }, [chatOpen]);

  useStageHeight(stageRef, '--ms-h', [chatOpen]);

  // URL decides which conversation is open
  useEffect(() => {
    if (!userId) return;
    if (selectedId) enterRef.current(selectedRef.current);
    else leaveRef.current();
  }, [selectedId, userId]);

  useEffect(() => () => leaveRef.current(), []);

  const handleSelect = (conv) => {
    const url = `/messages?c=${conv._id}`;
    // push when coming from the list (so phone Back works), replace when switching chats
    if (convId) router.replace(url, { scroll: false });
    else router.push(url, { scroll: false });
  };

  const handleBack = () => router.replace('/messages', { scroll: false });

  let chatPane;
  if (selected) {
    chatPane = (
      <ChatPanel key={selected._id} conversation={selected} userId={userId} onBack={handleBack} />
    );
  } else if (convId && inboxLoading) {
    chatPane = <div className="ms-pane-empty"><span className="ms-skel" style={{ width: 160, height: 14, borderRadius: 7 }} /></div>;
  } else if (convId && inbox.length > 0) {
    chatPane = (
      <div className="ms-pane-empty">
        <div className="ms-pane-icon"><SearchX size={34} strokeWidth={1.6} /></div>
        <h2>Conversation not found</h2>
        <p>It may have been archived or you don’t have access to it.</p>
        <button type="button" className="ms-btn" onClick={handleBack}>Back to messages</button>
      </div>
    );
  } else {
    chatPane = (
      <div className="ms-pane-empty">
        <div className="ms-pane-icon"><MessageCircle size={34} strokeWidth={1.6} /></div>
        <h2>Your messages</h2>
        <p>Select a conversation to start chatting with buyers and sellers.</p>
      </div>
    );
  }

  return (
    <div className="ms-stage" ref={stageRef}>
      {authLoading ? null : !userId ? (
        <div className="ms-shell ms-shell-solo">
          <div className="ms-pane-empty">
            <div className="ms-pane-icon"><LogIn size={34} strokeWidth={1.6} /></div>
            <h2>Sign in to view messages</h2>
            <p>You need to be logged in to see your conversations.</p>
            <Link href="/login?redirect=/messages" className="ms-btn">Log in</Link>
          </div>
        </div>
      ) : (
        <div className={`ms-shell${chatOpen ? ' has-chat' : ''}`}>
          <aside className="ms-list-pane">
            <InboxList
              inbox={inbox}
              loading={inboxLoading}
              userId={userId}
              activeId={convId}
              onSelect={handleSelect}
              onRefresh={loadInbox}
            />
          </aside>
          <section className="ms-chat-pane">{chatPane}</section>
        </div>
      )}
    </div>
  );
}