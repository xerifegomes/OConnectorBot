/**
 * Handler para Workers AI
 * Endpoint para chat com IA dentro do worker
 */

// Helper para resposta JSON
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

async function handleAIChat(request, env) {
  try {
    const body = await request.json();
    const { message, context, prompt } = body;

    if (!message && !prompt) {
      return jsonResponse(
        { success: false, error: 'Mensagem ou prompt é obrigatório' },
        400
      );
    }

    // Usar prompt fornecido ou construir um
    const finalPrompt = prompt || `
Você é o oConnector, especialista em tecnologia e soluções para empresas.
Você é profissional, consultivo e humanizado.
Seu objetivo é identificar necessidades e oferecer soluções tecnológicas.

${context ? `Contexto: ${JSON.stringify(context)}` : ''}

Mensagem: ${message}

Responda de forma natural, consultiva e humanizada. Identifique necessidades e ofereça soluções tecnológicas.
    `.trim();

    // Chamar Workers AI
    const response = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: `Você é o oConnector, especialista em tecnologia e soluções para empresas. 
Você é profissional, consultivo e humanizado. Seu objetivo é identificar necessidades 
e oferecer soluções tecnológicas personalizadas.`
        },
        {
          role: 'user',
          content: finalPrompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return jsonResponse({
      success: true,
      response: response.response || response,
      message: response.response || response,
    });
  } catch (error) {
    console.error('Erro no Workers AI:', error);
    return jsonResponse(
      { 
        success: false, 
        error: 'Erro ao processar com IA',
        details: error.message 
      },
      500
    );
  }
}

export { handleAIChat };
