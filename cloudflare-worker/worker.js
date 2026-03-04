// Cloudflare Worker for Tencent Cloud TTS Proxy
// This hides your API credentials and provides CORS for your website

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      })
    }

    const url = new URL(request.url)

    // Root path - show status
    if (url.pathname === '/') {
      return new Response('FICO TTS Proxy is running!', {
        headers: {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    // TTS endpoint
    if (request.method === 'POST' && url.pathname === '/tts') {
      return handleTTS(request, env)
    }

    // 404 for other paths
    return new Response('Not found', { status: 404 })
  }
}

async function handleTTS(request, env) {
  try {
    const { text, rate = 1.0, volume = 5 } = await request.json()

    if (!text) {
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }

    // Get credentials from environment variables
    const secretId = env.TENCENT_TTS_SECRET_ID
    const secretKey = env.TENCENT_TTS_SECRET_KEY

    if (!secretId || !secretKey) {
      return new Response(JSON.stringify({
        error: 'Server not configured. Please set TENCENT_TTS_SECRET_ID and TENCENT_TTS_SECRET_KEY in Worker Settings.'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }

    // Call Tencent Cloud TTS API
    const ttsResponse = await callTencentTTS(text, rate, volume, secretId, secretKey)

    return new Response(JSON.stringify(ttsResponse), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message || 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
}

async function callTencentTTS(text, rate, volume, secretId, secretKey) {
  const endpoint = 'tts.ap-shenzhen.tencentcloudapi.com'
  const path = '/'
  const region = 'ap-shenzhen'
  const timestamp = Math.floor(Date.now() / 1000)

  // Request body
  const requestBody = {
    Text: text,
    SessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    Codec: 'mp3',
    SampleRate: 16000,
    Rate: rate,
    Volume: volume,
    Speed: 1.0,
    VoiceType: 1
  }

  const body = JSON.stringify(requestBody)

  // Generate signature
  const authorization = await generateSignature(
    'POST',
    endpoint,
    path,
    '',
    body,
    secretId,
    secretKey,
    timestamp
  )

  // Call Tencent Cloud TTS API
  const response = await fetch(`https://${endpoint}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authorization,
      'Host': endpoint,
      'X-TC-Action': 'TextToVoice',
      'X-TC-Timestamp': timestamp.toString(),
      'X-TC-Version': '2019-08-23',
      'X-TC-Region': region
    },
    body
  })

  const data = await response.json()

  if (data.Response && data.Response.Error) {
    throw new Error(data.Response.Error.Message)
  }

  return {
    audioContent: data.Response.Audio,
    codec: 'mp3',
    sampleRate: 16000
  }
}

// Tencent Cloud TTS signature v3
async function generateSignature(method, endpoint, path, query, body, secretId, secretKey, timestamp) {
  const algorithm = 'TC3-HMAC-SHA256'
  const date = new Date(timestamp * 1000).toISOString().substr(0, 10)
  const service = 'tts'
  const credentialScope = `${date}/${service}/tc3_request`

  // Helper functions
  const hmacSha256 = async (key, data) => {
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(key),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data))
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  const sha256 = async (data) => {
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data))
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  // Canonical request
  const canonicalHeaders = 'content-type:application/json\nhost:' + endpoint + '\n'
  const signedHeaders = 'content-type;host'
  const hashedPayload = await sha256(body)
  const canonicalRequest = `${method}\n${path}\n${query}\n${canonicalHeaders}\n${signedHeaders}\n${hashedPayload}`

  // String to sign
  const hashedCanonicalRequest = await sha256(canonicalRequest)
  const stringToSign = `${algorithm}\n${timestamp}\n${credentialScope}\n${hashedCanonicalRequest}`

  // Calculate signature
  const secretDate = await hmacSha256('TC3' + secretKey, date)
  const secretService = await hmacSha256(secretDate, service)
  const secretSigning = await hmacSha256(secretService, 'tc3_request')
  const signature = await hmacSha256(secretSigning, stringToSign)

  // Authorization header
  return `${algorithm} Credential=${secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`
}
