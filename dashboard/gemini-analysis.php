<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Configuração da API do Gemini - CORRIGIDA
$GEMINI_API_KEY = 'AIzaSyDr-K4tDn_pRGSGbmRyVlvhDL-7KC2Zd9U'; // Substitua pela sua chave real
$GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=' . $GEMINI_API_KEY;

// Receber dados do dashboard
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['dashboardData'])) {
    echo json_encode(['error' => 'Dados do dashboard não fornecidos']);
    exit;
}

$dashboardData = $input['dashboardData'];

// Preparar prompt para o Gemini
$prompt = construirPromptAnalise($dashboardData);

// Dados para enviar ao Gemini - ESTRUTURA CORRIGIDA
$requestData = [
    'contents' => [
        [
            'parts' => [
                ['text' => $prompt]
            ]
        ]
    ]
];

// Fazer requisição para a API do Gemini
$curl = curl_init();
curl_setopt_array($curl, [
    CURLOPT_URL => $GEMINI_API_URL,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($requestData),
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
    ],
    CURLOPT_TIMEOUT => 30,
    CURLOPT_SSL_VERIFYPEER => false
]);

$response = curl_exec($curl);
$httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
$error = curl_error($curl);

// Debug - log da resposta completa
error_log("Gemini API Response Code: " . $httpCode);
error_log("Gemini API Response: " . $response);

curl_close($curl);

if ($error) {
    echo json_encode(['error' => 'Erro na requisição cURL: ' . $error]);
    exit;
}

if ($httpCode !== 200) {
    echo json_encode([
        'error' => 'Erro da API do Gemini: HTTP ' . $httpCode,
        'response' => $response,
        'debug_info' => [
            'url' => $GEMINI_API_URL,
            'request_data' => $requestData
        ]
    ]);
    exit;
}

$geminiResponse = json_decode($response, true);

if (!$geminiResponse) {
    echo json_encode(['error' => 'Erro ao decodificar resposta JSON da API']);
    exit;
}

// Verificar se a resposta tem a estrutura esperada
if (!isset($geminiResponse['candidates'][0]['content']['parts'][0]['text'])) {
    echo json_encode([
        'error' => 'Estrutura de resposta inválida da API do Gemini',
        'response' => $geminiResponse
    ]);
    exit;
}

$analysis = $geminiResponse['candidates'][0]['content']['parts'][0]['text'];

// Aplicar formatação similar ao JavaScript
$formattedAnalysis = formatarResposta($analysis);

echo json_encode([
    'success' => true,
    'analysis' => $formattedAnalysis,
    'timestamp' => date('Y-m-d H:i:s')
]);

function construirPromptAnalise($data) {
    $prompt = "Você é um especialista em análise de produção industrial. Analise os seguintes dados de um dashboard de monitoramento de produção de peças e forneça insights detalhados, resumidos e dito formalmente:\n\n";
    
    // Dados de produção das últimas 24h
    $prompt .= "DADOS DE PRODUÇÃO (Últimas 24h por períodos de 4h):\n";
    if (isset($data['hourly_data']) && is_array($data['hourly_data'])) {
        foreach ($data['hourly_data'] as $period) {
            $prompt .= "- {$period['time_label']}: {$period['total_pieces']} peças produzidas\n";
        }
    }
    
    // Estatísticas da última hora
    if (isset($data['latest'])) {
        $latest = $data['latest'];
        $prompt .= "\n🔧 ESTATÍSTICAS DA ÚLTIMA HORA:\n";
        $prompt .= "- Total de peças: " . ($latest['total_pieces'] ?? 0) . "\n";
        $prompt .= "- Peças de metal: " . ($latest['metal_pieces'] ?? 0) . "\n";
        $prompt .= "- Peças de plástico: " . ($latest['plastic_pieces'] ?? 0) . "\n";
        $prompt .= "- Peças pequenas: " . ($latest['small_pieces'] ?? 0) . "\n";
        $prompt .= "- Peças grandes: " . ($latest['large_pieces'] ?? 0) . "\n";
        $prompt .= "- Taxa atual: " . ($latest['pieces_per_minute'] ?? 0) . " peças/min\n";
    }
    
    // Dados de obstrução
    $prompt .= "\n MONITORAMENTO DE OBSTRUÇÃO:\n";
    $prompt .= "- Probabilidade de obstrução: " . ($data['obstruction_probability'] ?? 0) . "%\n";
    $prompt .= "- Tempo sem novas peças: " . ($data['minutes_since_last'] ?? 0) . " minutos\n";
    
    $prompt .= "\n METAS E BENCHMARKS:\n";
    $prompt .= "- Meta de produção: 3.0 peças/minuto\n";
    $prompt .= "- Limite crítico de obstrução: 70%\n";
    $prompt .= "- Tempo máximo sem produção: 30 minutos\n";
    
    $prompt .= "\nPor favor, forneça uma análise completa incluindo:\n";
    $prompt .= "1. Avaliação geral da performance\n";
    $prompt .= "2. Identificação de tendências nos dados\n";
    $prompt .= "3. Alertas críticos ou áreas de atenção\n";
    $prompt .= "4. Avaliação do risco de obstrução\n";
    
    return $prompt;
}

function formatarResposta($text) {
    // Aplicar formatações similares ao JavaScript
    $formatted = $text;
    
    // Negrito
    $formatted = preg_replace('/\*\*(.*?)\*\*/', '<strong>$1</strong>', $formatted);
    
    // Títulos
    $formatted = preg_replace('/^## (.*?)$/m', '<div class="title">$1</div>', $formatted);
    
    // Subtítulos
    $formatted = preg_replace('/^### (.*?)$/m', '<div class="subtitle">$1</div>', $formatted);
    
    // Blocos de código
    $formatted = preg_replace('/```([\s\S]*?)```/', '<pre><code>$1</code></pre>', $formatted);
    
    // Código inline
    $formatted = preg_replace('/`(.*?)`/', '<code>$1</code>', $formatted);
    
    // Quebras de linha
    $formatted = nl2br($formatted);
    
    return $formatted;
}
?>