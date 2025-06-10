<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Configurações do banco de dados
$servername = "10.108.34.95:3306";
$username = "root"; // Ajuste conforme sua configuração
$password = "root"; // Ajuste conforme sua configuração
$dbname = "db_prod";

try {
    // Criar conexão
    $pdo = new PDO("mysql:host=$servername;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Buscar dados das últimas 24 horas agrupados em 6 períodos de 4 horas
    $hourlyQuery = "    
        SELECT 
            DATE_FORMAT(data_hora, '%H:%i') as time_label,
            COUNT(*) as total_pieces,
            FLOOR(HOUR(data_hora) / 4) as time_group
        FROM tb_prod    
        WHERE data_hora >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        GROUP BY time_group, DATE_FORMAT(data_hora, '%H:%i')
        ORDER BY data_hora DESC
        LIMIT 6
    ";
    
    $hourlyStmt = $pdo->prepare($hourlyQuery);
    $hourlyStmt->execute();
    $hourlyData = $hourlyStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Se não houver dados suficientes, preencher com zeros
    while (count($hourlyData) < 6) {
        $hourlyData[] = [
            'time_label' => date('H:i', strtotime('-' . count($hourlyData) * 4 . ' hours')),
            'total_pieces' => 0
        ];
    }
    
    // CORREÇÃO PRINCIPAL: Buscar estatísticas da última hora SEM JOINS
    // Usar os IDs diretos conforme especificação:
    // cor: 1=verde, 2=amarelo, 3=vermelho, 4=azul
    // material: 1=metal, 2=plástico  
    // tamanho: 1=pequeno, 2=médio, 3=grande
    $latestQuery = "
        SELECT 
            COUNT(*) as total_pieces,
            SUM(CASE WHEN material = 1 THEN 1 ELSE 0 END) as metal_pieces,
            SUM(CASE WHEN material = 2 THEN 1 ELSE 0 END) as plastic_pieces,
            SUM(CASE WHEN tamanho = 1 THEN 1 ELSE 0 END) as small_pieces,
            SUM(CASE WHEN tamanho = 2 THEN 1 ELSE 0 END) as medium_pieces,
            SUM(CASE WHEN tamanho = 3 THEN 1 ELSE 0 END) as large_pieces,
            SUM(CASE WHEN cor = 3 THEN 1 ELSE 0 END) as red_pieces,
            SUM(CASE WHEN cor = 2 THEN 1 ELSE 0 END) as yellow_pieces,
            SUM(CASE WHEN cor = 1 THEN 1 ELSE 0 END) as green_pieces,
            SUM(CASE WHEN cor = 4 THEN 1 ELSE 0 END) as blue_pieces
        FROM tb_prod
        WHERE data_hora >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
    ";
    
    $latestStmt = $pdo->prepare($latestQuery);
    $latestStmt->execute();
    $latestStats = $latestStmt->fetch(PDO::FETCH_ASSOC);
    
    // Calcular peças por minuto
    $lastMinuteQuery = "
        SELECT COUNT(*) as pieces_last_minute
        FROM tb_prod 
        WHERE data_hora >= DATE_SUB(NOW(), INTERVAL 1 MINUTE)
    ";

    $lastMinuteStmt = $pdo->prepare($lastMinuteQuery);
    $lastMinuteStmt->execute();
    $lastMinuteData = $lastMinuteStmt->fetch(PDO::FETCH_ASSOC);

    $piecesLastMinute = $lastMinuteData['pieces_last_minute'] ?? 0;

    // Se não houver peças no último minuto, calcular média dos últimos 5 minutos
    if ($piecesLastMinute == 0) {
        $last5MinutesQuery = "
            SELECT COUNT(*) as pieces_last_5min
            FROM tb_prod 
            WHERE data_hora >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
        ";
        
        $last5MinStmt = $pdo->prepare($last5MinutesQuery);
        $last5MinStmt->execute();
        $last5MinData = $last5MinStmt->fetch(PDO::FETCH_ASSOC);
        
        $piecesLast5Min = $last5MinData['pieces_last_5min'] ?? 0;
        $piecesPerMinute = $piecesLast5Min / 5;
    } else {
        $piecesPerMinute = $piecesLastMinute;
    }

    // Valor real sem variação artificial
    $latestStats['pieces_per_minute'] = round($piecesPerMinute, 1);
    
    // Buscar tempo desde a última peça
    $lastPartQuery = "
        SELECT TIMESTAMPDIFF(MINUTE, MAX(data_hora), NOW()) as minutes_since_last
        FROM tb_prod
    ";
    
    $lastPartStmt = $pdo->prepare($lastPartQuery);
    $lastPartStmt->execute();
    $lastPartData = $lastPartStmt->fetch(PDO::FETCH_ASSOC);
    
    $minutesSinceLast = $lastPartData['minutes_since_last'] ?? 0;
    
    // Calcular probabilidade de obstrução baseada no tempo
    $obstructionProbability = min(95, $minutesSinceLast * 2); // 2% por minuto, máx 95%
    
    // Adicionar variação aleatória pequena
    $obstructionProbability += (rand(-5, 5));
    $obstructionProbability = max(0, min(100, $obstructionProbability));
    
    // CORREÇÃO: Buscar estatísticas médias das últimas 24 horas SEM JOINS
    $averagesQuery = "
        SELECT 
            COUNT(*) / 24 as avg_pieces_per_hour,
            COUNT(*) as total_production_24h,
            (SUM(CASE WHEN material = 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100 as avg_metal_percentage,
            (SUM(CASE WHEN material = 2 THEN 1 ELSE 0 END) / COUNT(*)) * 100 as avg_plastic_percentage,
            (SUM(CASE WHEN tamanho = 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100 as avg_small_percentage,
            (SUM(CASE WHEN tamanho = 2 THEN 1 ELSE 0 END) / COUNT(*)) * 100 as avg_medium_percentage,
            (SUM(CASE WHEN tamanho = 3 THEN 1 ELSE 0 END) / COUNT(*)) * 100 as avg_large_percentage
        FROM tb_prod
        WHERE data_hora >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    ";
    
    $averagesStmt = $pdo->prepare($averagesQuery);
    $averagesStmt->execute();
    $averagesData = $averagesStmt->fetch(PDO::FETCH_ASSOC);
    
    // Montar resposta
    $response = [
        'success' => true,
        'hourly_data' => array_reverse($hourlyData), // Inverter para ordem cronológica
        'latest' => [
            'total_pieces' => (int)($latestStats['total_pieces'] ?? 0),
            'metal_pieces' => (int)($latestStats['metal_pieces'] ?? 0),
            'plastic_pieces' => (int)($latestStats['plastic_pieces'] ?? 0),
            'small_pieces' => (int)($latestStats['small_pieces'] ?? 0),
            'medium_pieces' => (int)($latestStats['medium_pieces'] ?? 0),
            'large_pieces' => (int)($latestStats['large_pieces'] ?? 0),
            'red_pieces' => (int)($latestStats['red_pieces'] ?? 0),
            'yellow_pieces' => (int)($latestStats['yellow_pieces'] ?? 0),
            'green_pieces' => (int)($latestStats['green_pieces'] ?? 0),
            'blue_pieces' => (int)($latestStats['blue_pieces'] ?? 0),
            'pieces_per_minute' => round($latestStats['pieces_per_minute'], 1)
        ],
        'averages' => [
            'avg_pieces_per_hour' => round($averagesData['avg_pieces_per_hour'] ?? 0, 1),
            'total_production_24h' => (int)($averagesData['total_production_24h'] ?? 0),
            'avg_metal_percentage' => round($averagesData['avg_metal_percentage'] ?? 0, 1),
            'avg_plastic_percentage' => round($averagesData['avg_plastic_percentage'] ?? 0, 1),
            'avg_small_percentage' => round($averagesData['avg_small_percentage'] ?? 0, 1),
            'avg_medium_percentage' => round($averagesData['avg_medium_percentage'] ?? 0, 1),
            'avg_large_percentage' => round($averagesData['avg_large_percentage'] ?? 0, 1)
        ],
        'obstruction_probability' => round($obstructionProbability, 1),
        'minutes_since_last' => (int)$minutesSinceLast,
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    echo json_encode($response);
    
} catch(PDOException $e) {
    // Em caso de erro, retornar erro estruturado
    $errorResponse = [
        'success' => false,
        'error' => 'Erro de conexão com banco de dados: ' . $e->getMessage(),
        'hourly_data' => [],
        'latest' => [
            'total_pieces' => 0,
            'metal_pieces' => 0,
            'plastic_pieces' => 0,
            'small_pieces' => 0,
            'medium_pieces' => 0,
            'large_pieces' => 0,
            'red_pieces' => 0,
            'yellow_pieces' => 0,
            'green_pieces' => 0,
            'blue_pieces' => 0,
            'pieces_per_minute' => 0
        ],
        'averages' => [
            'avg_pieces_per_hour' => 0,
            'total_production_24h' => 0,
            'avg_metal_percentage' => 0,
            'avg_plastic_percentage' => 0,
            'avg_small_percentage' => 0,
            'avg_medium_percentage' => 0,
            'avg_large_percentage' => 0
        ],
        'obstruction_probability' => 0,
        'minutes_since_last' => 0,
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    echo json_encode($errorResponse);
}
?>