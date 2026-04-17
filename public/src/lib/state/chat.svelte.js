import { supabase } from '$lib/supabase/client';

function createChatState() {
  let gameId = $state(null);
  let userId = $state(null);
  let userName = $state(null);
  let messages = $state([]);
  let isLoading = $state(false);
  let isInitialized = $state(false);
  let channel = $state(null);

  async function loadHistory() {
    if (!gameId) return;
    isLoading = true;

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('game_id', gameId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error loading chat history:', error);
    } else {
      messages = data ? data.reverse() : [];
    }

    isLoading = false;
  }

  async function sendMessage(content) {
    if (!gameId || !userId || !userName || !content.trim()) return;

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        game_id: gameId,
        user_id: userId,
        author_name: userName,
        content: content.trim(),
      });

    if (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  function handleRealtime(payload) {
    if (payload.eventType === 'INSERT') {
      const newMessage = payload.new;
      if (newMessage.game_id === gameId) {
        messages = [...messages, newMessage];
        if (messages.length > 50) {
          messages = messages.slice(-50);
        }
      }
    }
  }

  async function init(newGameId, newUserId, newUserName) {
    if (isInitialized) return;

    gameId = newGameId;
    userId = newUserId;
    userName = newUserName;
    isInitialized = true;

    await loadHistory();

    channel = supabase
      .channel(`chat:${gameId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `game_id=eq.${gameId}`,
      }, handleRealtime)
      .subscribe();
  }

  function destroy() {
    if (channel) {
      supabase.removeChannel(channel);
      channel = null;
    }
    isInitialized = false;
    gameId = null;
    userId = null;
    userName = null;
    messages = [];
  }

  return {
    get messages() {
      return messages;
    },
    get isLoading() {
      return isLoading;
    },
    get isInitialized() {
      return isInitialized;
    },
    init,
    destroy,
    sendMessage,
  };
}

export const chatState = createChatState();