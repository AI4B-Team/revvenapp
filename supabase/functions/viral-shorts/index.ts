import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUBMAGIC_API_KEY = Deno.env.get('SUBMAGIC_API_KEY');
const SUBMAGIC_BASE_URL = 'https://api.submagic.co/v1';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!SUBMAGIC_API_KEY) {
      console.error('SUBMAGIC_API_KEY is not configured');
      throw new Error('Submagic API key is not configured');
    }

    const { action, ...params } = await req.json();
    console.log(`Processing action: ${action}`, params);

    let response;
    let result;

    switch (action) {
      case 'get-templates':
        console.log('Fetching templates from Submagic');
        response = await fetch(`${SUBMAGIC_BASE_URL}/templates`, {
          method: 'GET',
          headers: {
            'x-api-key': SUBMAGIC_API_KEY,
          },
        });
        result = await response.json();
        console.log('Templates response:', result);
        break;

      case 'get-languages':
        console.log('Fetching languages from Submagic');
        response = await fetch(`${SUBMAGIC_BASE_URL}/languages`, {
          method: 'GET',
          headers: {
            'x-api-key': SUBMAGIC_API_KEY,
          },
        });
        result = await response.json();
        console.log('Languages response:', result);
        break;

      case 'create-project':
        console.log('Creating project with params:', params);
        const { title, language, videoUrl, templateName, magicZooms, magicBrolls, removeSilencePace, hookTitle } = params;
        
        const projectBody: Record<string, unknown> = {
          title,
          language,
          videoUrl,
          templateName,
        };

        if (magicZooms !== undefined) projectBody.magicZooms = magicZooms;
        if (magicBrolls !== undefined) projectBody.magicBrolls = magicBrolls;
        if (removeSilencePace) projectBody.removeSilencePace = removeSilencePace;
        if (hookTitle) projectBody.hookTitle = hookTitle;

        response = await fetch(`${SUBMAGIC_BASE_URL}/projects`, {
          method: 'POST',
          headers: {
            'x-api-key': SUBMAGIC_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(projectBody),
        });
        result = await response.json();
        console.log('Create project response:', result);
        break;

      case 'get-project':
        const { projectId } = params;
        console.log('Getting project status for:', projectId);
        response = await fetch(`${SUBMAGIC_BASE_URL}/projects/${projectId}`, {
          method: 'GET',
          headers: {
            'x-api-key': SUBMAGIC_API_KEY,
          },
        });
        result = await response.json();
        console.log('Get project response:', result);
        break;

      case 'export-project':
        const { projectId: exportProjectId } = params;
        console.log('Exporting project:', exportProjectId);
        response = await fetch(`${SUBMAGIC_BASE_URL}/projects/${exportProjectId}/export`, {
          method: 'POST',
          headers: {
            'x-api-key': SUBMAGIC_API_KEY,
            'Content-Type': 'application/json',
          },
        });
        result = await response.json();
        console.log('Export project response:', result);
        break;

      default:
        console.error('Unknown action:', action);
        throw new Error(`Unknown action: ${action}`);
    }

    if (!response.ok) {
      console.error('Submagic API error:', response.status, result);
      return new Response(JSON.stringify({ error: result.message || 'Submagic API error', details: result }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in viral-shorts function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
