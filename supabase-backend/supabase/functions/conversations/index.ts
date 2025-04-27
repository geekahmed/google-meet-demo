import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';


const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Conversation {
  id: string;
  agentId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  transcript?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // Parse the URL and path to determine the endpoint
  const url = new URL(req.url);
  const path = url.pathname.split('/').filter(Boolean);
  const endpoint = path[path.length - 1];

  try {
    // GET endpoints
    if (req.method === 'GET') {
      // GET /conversations - List all conversations
      if (endpoint === 'conversations') {
        const { data, error } = await supabase
          .from('conversations')
          .select('*')
          .order('startTime', { ascending: false });

        if (error) throw error;
        return new Response(JSON.stringify({ data }), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        });
      }
      
      // GET /conversations/:id - Get a specific conversation
      if (path.length === 2 && path[0] === 'conversations') {
        const id = path[1];
        const { data, error } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        return new Response(JSON.stringify({ data }), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        });
      }
    } 
    // POST endpoints
    else if (req.method === 'POST') {
      // POST /conversations - Create a new conversation
      if (endpoint === 'conversations') {
        const conversation: Conversation = await req.json();
        
        // Convert property names to snake_case for Postgres
        const dbConversation = {
          id: conversation.id,
          agent_id: conversation.agentId,
          start_time: conversation.startTime,
          end_time: conversation.endTime,
          duration: conversation.duration,
          transcript: conversation.transcript,
        };
        
        const { data, error } = await supabase
          .from('conversations')
          .insert([dbConversation])
          .select();

        if (error) throw error;
        return new Response(JSON.stringify({ data }), {
          headers: { 'Content-Type': 'application/json' },
          status: 201,
        });
      }
    } 
    // PUT endpoints
    else if (req.method === 'PUT') {
      // PUT /conversations/:id - Update an existing conversation
      if (path.length === 2 && path[0] === 'conversations') {
        const id = path[1];
        const updates = await req.json();
        
        // Convert property names to snake_case for Postgres
        const dbUpdates = {
          end_time: updates.endTime,
          duration: updates.duration,
          transcript: updates.transcript,
        };
        
        const { data, error } = await supabase
          .from('conversations')
          .update(dbUpdates)
          .eq('id', id)
          .select();

        if (error) throw error;
        return new Response(JSON.stringify({ data }), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        });
      }
    }

    // If we reach here, the endpoint wasn't found
    return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 404,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});