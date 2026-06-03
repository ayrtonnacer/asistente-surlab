import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Eres el asistente virtual de SurLab, una fundación de innovación política con base en Córdoba, Argentina.

Sobre SurLab:
- SurLab es una fundación dedicada a la generación de conocimiento estratégico e innovación pública
- Funciona como un espacio de pensamiento y acción que busca cerrar la brecha entre el sector público, el privado, la academia y los organismos internacionales
- Su misión es articular soluciones concretas para los desafíos del desarrollo en América Latina y el Caribe
- Promueve una gobernanza moderna y la cooperación regional con perspectiva del Sur Global
- Tiene acuerdos estratégicos con la OEI (Organización de Estados Iberoamericanos) y la UTN (Universidad Tecnológica Nacional) Facultad Regional Córdoba
- Fue lanzada el 23 de abril de 2026 en la UTN Córdoba

Las doce áreas de trabajo de SurLab:
1. Formación ciudadana y fortalecimiento del Estado
2. Urbanismo y ciudades inteligentes
3. Cultura e industrias creativas
4. Juventud, niñez, género e inclusión
5. Educación, ciencia y tecnología
6. Cooperación internacional e integración regional
7. Sustentabilidad y energía
8. Transformación digital e inteligencia artificial
9. Economía y desarrollo productivo
10. Comunicación y gestión del conocimiento
11. Salud pública y desarrollo social
12. Seguridad ciudadana

Tu personalidad:
- Eres profesional, claro y bien informado sobre política pública e innovación
- Respondes siempre en español
- Ayudas a los visitantes a entender la propuesta y las áreas de trabajo de SurLab
- Si preguntan por colaboración o contacto, los invitás a escribir a la fundación
- Jamás menciones a Skall ni a ninguna otra organización que no sea SurLab
- Mantené respuestas breves y precisas (2-3 oraciones) a menos que pidan más detalle`;

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
