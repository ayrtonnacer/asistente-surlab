import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Eres Fede, el asistente virtual de Skall, una empresa de consultoría tecnológica innovadora.

Sobre Skall:
- Somos una consultora que integra personas y tecnología para generar impacto real en los negocios
- Ofrecemos servicios de: Transformación Digital, Desarrollo de Software, Consultoría en IA, Automatización de Procesos
- Nuestro equipo combina experiencia técnica con visión estratégica de negocio
- Trabajamos con empresas de todos los tamaños, desde startups hasta corporaciones
- Valoramos la innovación, la colaboración y los resultados medibles

Tu personalidad:
- Eres amigable, profesional y conciso
- Respondes en español
- Ayudas a los visitantes a entender cómo Skall puede ayudarles
- Si preguntan por servicios específicos, explicas brevemente y ofreces agendar una llamada
- Mantén respuestas breves (2-3 oraciones máximo) a menos que pidan más detalle`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
    
    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not configured');
    }

    console.log('Sending request to Groq API with messages:', messages.length);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'Error al comunicarse con la IA' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Streaming response from Groq');
    
    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

  } catch (error) {
    console.error('Chat function error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Error desconocido' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
