// Sistema de dados simulados baseado na estrutura do banco
class IndustrialDataSystem {
    constructor() {
        this.materials = [
            { id: 1, material: 'Metal' },
            { id: 2, material: 'Plastico' }
        ];
        
        this.sizes = [
            { id: 1, size: 'Pequeno' },
            { id: 2, size: 'Medio' },
            { id: 3, size: 'Grande' }
        ];
        
        this.colors = [
            { id: 1, color: 'Vermelho' },
            { id: 2, color: 'Amarelo' },
            { id: 3, color: 'Verde' },
            { id: 4, color: 'Azul' }
        ];
        
        this.parts = [];
        this.lastPartTime = new Date();
        this.systemStartTime = new Date();
        
        this.initializeHistoricalData();
        this.startDataGeneration();
    }
    
    initializeHistoricalData() {
        // Gerar dados das últimas 24 horas
        const now = new Date();
        for (let i = 0; i < 24; i++) {
            const time = new Date(now.getTime() - (i * 60 * 60 * 1000));
            const partsCount = Math.floor(Math.random() * 20) + 5; // 5-25 peças por hora
            
            for (let j = 0; j < partsCount; j++) {
                this.parts.push({
                    id: this.parts.length + 1,
                    id_cor: Math.floor(Math.random() * 4) + 1,
                    id_tamanho: Math.floor(Math.random() * 3) + 1,
                    id_material: Math.floor(Math.random() * 2) + 1,
                    cur_time: new Date(time.getTime() + (j * (60000 / partsCount)))
                });
            }
        }
        
        // Ordenar por tempo
        this.parts.sort((a, b) => a.cur_time - b.cur_time);
    }
    
    startDataGeneration() {
        // Gerar nova peça a cada 15-45 segundos
        setInterval(() => {
            if (Math.random() > 0.1) { // 90% chance de gerar peça
                this.generateNewPart();
            }
        }, (Math.random() * 30000) + 15000);
    }
    
    generateNewPart() {
        const newPart = {
            id: this.parts.length + 1,
            id_cor: Math.floor(Math.random() * 4) + 1,
            id_tamanho: Math.floor(Math.random() * 3) + 1,
            id_material: Math.floor(Math.random() * 2) + 1,
            cur_time: new Date()
        };
        
        this.parts.push(newPart);
        this.lastPartTime = new Date();
        
        // Manter apenas dados das últimas 24 horas
        const cutoffTime = new Date(Date.now() - (24 * 60 * 60 * 1000));
        this.parts = this.parts.filter(part => part.cur_time > cutoffTime);
    }
    
    getHourlyData() {
        const now = new Date();
        const hourlyData = [];
        
        for (let i = 0; i < 6; i++) {
            const hourStart = new Date(now.getTime() - (i * 4 * 60 * 60 * 1000));
            const hourEnd = new Date(hourStart.getTime() + (4 * 60 * 60 * 1000));
            
            const partsInHour = this.parts.filter(part => 
                part.cur_time >= hourStart && part.cur_time < hourEnd
            );
            
            hourlyData.push({
                time_label: hourStart.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                }),
                total_pieces: partsInHour.length
            });
        }
        
        return hourlyData.reverse();
    }
    
getLatestStats() {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - (60 * 1000)); // 1 minuto atrás
    const fiveMinutesAgo = new Date(now.getTime() - (5 * 60 * 1000)); // 5 minutos atrás
    
    // Peças do último minuto
    const lastMinuteParts = this.parts.filter(part => 
        part.cur_time >= oneMinuteAgo && part.cur_time <= now
    );
    
    let piecesPerMinute = lastMinuteParts.length;
    
    // Se não houver peças no último minuto, calcular média dos últimos 5 minutos
    if (piecesPerMinute === 0) {
        const last5MinuteParts = this.parts.filter(part => 
            part.cur_time >= fiveMinutesAgo && part.cur_time <= now
        );
        piecesPerMinute = last5MinuteParts.length / 5;
    }
    
    const recentParts = this.parts.filter(part => 
        part.cur_time > new Date(Date.now() - (60 * 60 * 1000))
    );
    
    // ... resto do código permanece igual ...
    
    return {
        total_pieces: recentParts.length,
        metal_pieces: metalParts.length,
        plastic_pieces: plasticParts.length,
        small_pieces: smallParts.length,
        medium_pieces: mediumParts.length,
        large_pieces: largeParts.length,
        pieces_per_minute: Math.round(piecesPerMinute * 10) / 10 // Arredondar para 1 decimal
    };
}
    
    getAverageStats() {
        // Calcular estatísticas médias das últimas 24 horas
        const last24Hours = this.parts.filter(part => 
            part.cur_time > new Date(Date.now() - (24 * 60 * 60 * 1000))
        );
        
        if (last24Hours.length === 0) {
            return {
                avg_pieces_per_hour: 0,
                avg_metal_percentage: 0,
                avg_plastic_percentage: 0,
                avg_small_percentage: 0,
                avg_medium_percentage: 0,
                avg_large_percentage: 0,
                total_production_24h: 0
            };
        }
        
        const totalPieces = last24Hours.length;
        const hoursActive = 24; // Assumindo produção contínua
        
        const metalCount = last24Hours.filter(part => part.id_material === 1).length;
        const plasticCount = last24Hours.filter(part => part.id_material === 2).length;
        const smallCount = last24Hours.filter(part => part.id_tamanho === 1).length;
        const mediumCount = last24Hours.filter(part => part.id_tamanho === 2).length;
        const largeCount = last24Hours.filter(part => part.id_tamanho === 3).length;
        
        return {
            avg_pieces_per_hour: (totalPieces / hoursActive).toFixed(1),
            avg_metal_percentage: ((metalCount / totalPieces) * 100).toFixed(1),
            avg_plastic_percentage: ((plasticCount / totalPieces) * 100).toFixed(1),
            avg_small_percentage: ((smallCount / totalPieces) * 100).toFixed(1),
            avg_medium_percentage: ((mediumCount / totalPieces) * 100).toFixed(1),
            avg_large_percentage: ((largeCount / totalPieces) * 100).toFixed(1),
            total_production_24h: totalPieces
        };
    }
    
    getObstructionData() {
        const timeSinceLastPart = (new Date() - this.lastPartTime) / (1000 * 60); // em minutos
        const minutesSinceLast = Math.max(0, Math.floor(timeSinceLastPart)); // Garantir que nunca seja negativo
        
        let obstructionProbability = Math.min(minutesSinceLast * 2, 95); // 2% por minuto, máx 95%
        
        // Adicionar variação aleatória
        obstructionProbability += (Math.random() - 0.5) * 10;
        obstructionProbability = Math.max(0, Math.min(100, obstructionProbability));
        
        return {
            obstruction_probability: obstructionProbability,
            minutes_since_last: minutesSinceLast
        };
    }
    
    getAllData() {
        return {
            hourly_data: this.getHourlyData(),
            latest: this.getLatestStats(),
            averages: this.getAverageStats(),
            ...this.getObstructionData()
        };
    }
}

// Variáveis globais
let charts = {};
let serverStartTime = null;
let uptimeInterval = null;
let dataUpdateInterval = null;
let sensorData = null;
let dataSystem = null;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    updateTime();
    setInterval(updateTime, 1000);
    
    initializeUptime();
    initializeCharts();
    
    // Inicializar sistema de dados
    dataSystem = new IndustrialDataSystem();
    
    // Buscar dados inicialmente
    updateSensorData();
    
    // Atualizar dados a cada 5 segundos
    dataUpdateInterval = setInterval(updateSensorData, 5000);
});

// Atualizar dados dos sensores
function updateSensorData() {
    try {
        sensorData = dataSystem.getAllData();
        updateCharts(sensorData);
        updateConnectionStatus(true);
    } catch (error) {
        console.error('Erro ao processar dados:', error);
        updateConnectionStatus(false);
    }
}

// Atualizar status de conexão
function updateConnectionStatus(connected) {
    const statusElement = document.getElementById('db-status');
    const statusText = statusElement.nextElementSibling;
    
    if (connected) {
        statusElement.className = 'connection-status';
        statusText.textContent = 'Sistema online';
    } else {
        statusElement.className = 'connection-status disconnected';
        statusText.textContent = 'Erro no sistema';
    }
}

// Atualizar horário e saudação
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    document.getElementById('current-time').textContent = timeString;
    
    // Atualizar saudação
    const hour = now.getHours();
    let greeting = 'Boa madrugada';
    if (hour >= 6 && hour < 12) greeting = 'Bom dia';
    else if (hour >= 12 && hour < 18) greeting = 'Boa tarde';
    else if (hour >= 18 && hour < 24) greeting = 'Boa noite';
    
    document.getElementById('greeting').textContent = `${greeting}, admin`;
}

// Inicializar tempo de atividade
function initializeUptime() {
    serverStartTime = new Date();
    uptimeInterval = setInterval(updateUptime, 1000);
}

// Atualizar tempo de atividade
function updateUptime() {
    if (!serverStartTime) return;
    
    const now = new Date();
    const diff = now - serverStartTime;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    document.getElementById('days').textContent = days;
    document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
}

// Inicializar gráficos
function initializeCharts() {
    // Configurações comuns
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: '#ffffff' }
            }
        }
    };

    const scaleOptions = {
        x: { 
            ticks: { color: '#a0a0a0' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
        },
        y: { 
            ticks: { color: '#a0a0a0' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' },
            min: 0,
            max: 25
        }
    };

    // Sensor 1 - Quantidade Total (Linha)
   // Sensor 1 - Quantidade Total (Linha) - Versão dinâmica
    const quantidadeCtx = document.getElementById('quantidadeChart').getContext('2d');
    charts.quantidade = new Chart(quantidadeCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Peças Produzidas',
                data: [],
                borderColor: '#4caf50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#4caf50',
                pointBorderColor: '#ffffff',
                pointRadius: 3,
                pointHoverRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#a0a0a0',
                        maxTicksLimit: 6, // Limita o número de labels no eixo X
                        callback: function(value, index, values) {
                            // Mostra apenas alguns labels para evitar sobreposição
                            const totalLabels = this.getLabelForValue(value) ? values.length : 0;
                            if (totalLabels <= 6) return this.getLabelForValue(value);
                            return index % Math.ceil(totalLabels / 6) === 0 ? this.getLabelForValue(value) : '';
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    ticks: {
                        color: '#a0a0a0',
                        maxTicksLimit: 5, // Limita o número de ticks no eixo Y
                        beginAtZero: true
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    // Usar suggestedMin/Max para escala dinâmica
                    suggestedMin: 0,
                    suggestedMax: function(context) {
                        const data = context.chart.data.datasets[0].data;
                        const maxValue = Math.max(...data);
                        return Math.ceil(maxValue * 1.1); // 10% acima do valor máximo
                    }
                }
            },
            elements: {
                point: {
                    radius: function(context) {
                        // Ajusta o tamanho dos pontos baseado na quantidade de dados
                        const dataLength = context.chart.data.labels.length;
                        return dataLength > 20 ? 2 : dataLength > 10 ? 3 : 4;
                    }
                }
            }
        }
    });
    // Sensor 2 - Indutivo (Pizza)
    const indutivoCtx = document.getElementById('indutivoChart').getContext('2d');
    charts.indutivo = new Chart(indutivoCtx, {
        type: 'doughnut',
        data: {
            labels: ['Metal', 'Plástico'],
            datasets: [{
                data: [0, 0],
                backgroundColor: ['#ff9800', '#2196f3'],
                borderWidth: 2,
                borderColor: '#1a1f2e'
            }]
        },
        options: {
            ...commonOptions,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { 
                        color: '#ffffff',
                        padding: 15,
                        usePointStyle: true
                    }
                }
            }
        }
    });

    // Sensor 3 - Tamanhos (Colunas) - Atualizado para incluir Médio
    const tamanhosCtx = document.getElementById('tamanhosChart').getContext('2d');
    charts.tamanhos = new Chart(tamanhosCtx, {
        type: 'bar',
        data: {
            labels: ['Pequeno', 'Médio', 'Grande'],
            datasets: [{
                label: 'Quantidade',
                data: [0, 0, 0],
                backgroundColor: ['#00bcd4', '#ffc107', '#9c27b0'],
                borderColor: ['#00acc1', '#ffb300', '#8e24aa'],
                borderWidth: 1
            }]
        },
        options: {
            ...commonOptions,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: { 
                    ticks: { color: '#a0a0a0' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y: { 
                    ticks: { color: '#a0a0a0' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    min: 0
                }
            }
        }
    });

    // Sensor 5 - Eficiência (Gauge)
    const eficienciaCtx = document.getElementById('eficienciaChart').getContext('2d');
    charts.eficiencia = new Chart(eficienciaCtx, {
        type: 'doughnut',
        data: {
            labels: ['Produção', 'Restante'],
            datasets: [{
                data: [0, 5],
                backgroundColor: ['#4caf50', 'rgba(255, 255, 255, 0.1)'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            circumference: 180,
            rotation: 270,
            cutout: '75%',
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            }
        }
    });
}

// Buscar dados do banco de dados via PHP (com fallback para dados simulados)
async function updateSensorData() {
    try {
        const response = await fetch('database.php');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        sensorData = data;
        updateCharts(data);
        updateConnectionStatus(true);
        
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        updateConnectionStatus(false);
        
        // Usar dados do sistema simulado em caso de erro
        sensorData = dataSystem.getAllData();
        updateCharts(sensorData);
    }
}

// Atualizar gráficos com dados do banco
function updateCharts(data) {
    if (!data || !data.hourly_data || !data.latest) return;

        // Sensor 1 - Quantidade Total com escala dinâmica
        const timeLabels = data.hourly_data.map(item => item.time_label);
        const quantities = data.hourly_data.map(item => item.total_pieces);
        
        // Atualizar dados do gráfico
        charts.quantidade.data.labels = timeLabels;
        charts.quantidade.data.datasets[0].data = quantities;
        
        // Ajustar escala Y dinamicamente
        const maxValue = Math.max(...quantities);
        const minValue = Math.min(...quantities);
        const padding = Math.max(1, Math.ceil((maxValue - minValue) * 0.1));
        
        charts.quantidade.options.scales.y.suggestedMin = Math.max(0, minValue - padding);
        charts.quantidade.options.scales.y.suggestedMax = maxValue + padding;
        
        // Ajustar densidade de pontos baseado na quantidade de dados
        const dataLength = timeLabels.length;
        charts.quantidade.options.elements.point.radius = dataLength > 20 ? 1 : dataLength > 10 ? 2 : 3;
        
        // Atualizar com animação suave
        charts.quantidade.update('none');

    // Sensor 2 - Indutivo
    const metalPieces = data.latest.metal_pieces || 0;
    const plasticPieces = data.latest.plastic_pieces || 0;
    const totalMaterial = metalPieces + plasticPieces;
    
    if (totalMaterial > 0) {
        const metalPercent = (metalPieces / totalMaterial * 100).toFixed(1);
        const plasticPercent = (plasticPieces / totalMaterial * 100).toFixed(1);
        
        charts.indutivo.data.datasets[0].data = [metalPercent, plasticPercent];
    }
    charts.indutivo.update('none');

    // Sensor 3 - Tamanhos (Incluindo peças médias)
    const smallPieces = data.latest.small_pieces || 0;
    const mediumPieces = data.latest.medium_pieces || 0;
    const largePieces = data.latest.large_pieces || 0;
    
    charts.tamanhos.data.datasets[0].data = [smallPieces, mediumPieces, largePieces];
    charts.tamanhos.update('none');

    // Sensor 4 - Obstrução
    const obstructionPercent = data.obstruction_probability || 0;
    const minutesSinceLast = data.minutes_since_last || 0;
    
    document.getElementById('obstruction-percentage').textContent = obstructionPercent.toFixed(1) + '%';
    document.getElementById('time-since-last').textContent = minutesSinceLast + ' min';
    
    // Atualizar cor do indicador de obstrução
    const obstructionIndicator = document.getElementById('sensor4-status');
    if (obstructionPercent > 70) {
        obstructionIndicator.className = 'status-indicator red critical-alert';
    } else if (obstructionPercent > 30) {
        obstructionIndicator.className = 'status-indicator yellow';
    } else {
        obstructionIndicator.className = 'status-indicator green';
    }

    // Sensor 5 - Eficiência (Peças por minuto)
    const piecesPerMinute = data.latest.pieces_per_minute || 0;
    const maxPieces = 5; // Máximo para o gauge
    
    charts.eficiencia.data.datasets[0].data = [piecesPerMinute, maxPieces - piecesPerMinute];
    charts.eficiencia.update('none');
    
    // Atualizar texto de eficiência
    document.getElementById('eficiencia-valor').textContent = piecesPerMinute.toFixed(1);
    
    // Atualizar cor do indicador de eficiência
    const eficienciaIndicator = document.getElementById('sensor5-status');
    if (piecesPerMinute >= 3.0) {
        eficienciaIndicator.className = 'status-indicator green';
    } else if (piecesPerMinute >= 2.0) {
        eficienciaIndicator.className = 'status-indicator yellow';
    } else {
        eficienciaIndicator.className = 'status-indicator red';
    }

    // Atualizar indicadores de status dos sensores
    updateSensorStatuses(data);
}

// Atualizar status dos sensores baseado nos dados
function updateSensorStatuses(data) {
    // Sensor 1 - Quantidade Total
    const sensor1Status = document.getElementById('sensor1-status');
    const totalPieces = data.latest.total_pieces || 0;
    if (totalPieces > 15) {
        sensor1Status.className = 'status-indicator green';
    } else if (totalPieces > 5) {
        sensor1Status.className = 'status-indicator yellow';
    } else {
        sensor1Status.className = 'status-indicator red';
    }

    // Sensor 2 - Indutivo
    const sensor2Status = document.getElementById('sensor2-status');
    sensor2Status.className = 'status-indicator cyan';

    // Sensor 3 - Tamanhos
    const sensor3Status = document.getElementById('sensor3-status');
    sensor3Status.className = 'status-indicator cyan';
}

// Função para obter estatísticas médias detalhadas
function getAverageStatistics() {
    if (!sensorData || !sensorData.averages) {
        return null;
    }
    
    return {
        production: {
            hourly_avg: parseFloat(sensorData.averages.avg_pieces_per_hour),
            daily_total: parseInt(sensorData.averages.total_production_24h)
        },
        materials: {
            metal_percentage: parseFloat(sensorData.averages.avg_metal_percentage),
            plastic_percentage: parseFloat(sensorData.averages.avg_plastic_percentage)
        },
        sizes: {
            small_percentage: parseFloat(sensorData.averages.avg_small_percentage),
            medium_percentage: parseFloat(sensorData.averages.avg_medium_percentage),
            large_percentage: parseFloat(sensorData.averages.avg_large_percentage)
        }
    };
}

// Análise de IA com integração do Gemini (incluindo dados médios)
async function performAnalysis() {
    const btn = document.querySelector('.analyze-btn');
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '🤖 Consultando IA...';
    btn.disabled = true;
    
    try {
        // Preparar dados do dashboard para envio (incluindo médias)
        const dashboardData = {
            hourly_data: sensorData?.hourly_data || [],
            latest: sensorData?.latest || {},
            averages: sensorData?.averages || {},
            obstruction_probability: sensorData?.obstruction_probability || 0,
            minutes_since_last: sensorData?.minutes_since_last || 0,
            timestamp: new Date().toISOString()
        };
        
        // Fazer requisição para a API do Gemini via PHP
        const response = await fetch('gemini-analysis.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                dashboardData: dashboardData
            })
        });
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.error) {
            throw new Error(result.error);
        }
        
        if (result.success && result.analysis) {
            // Exibir análise do Gemini em uma modal melhorada
            showGeminiAnalysis(result.analysis);
        } else {
            throw new Error('Resposta inválida da análise');
        }
        
    } catch (error) {
        console.error('Erro na análise:', error);
        
        // Fallback para análise local em caso de erro (incluindo dados médios)
        let fallbackInsights = [
            '🔄 Modo offline - Análise baseada em dados locais',
            '🏭 Sistema operando dentro dos parâmetros normais',
            '📊 Taxa de produção estável nas últimas 6 períodos',
            '⚙️ Sensores funcionando corretamente',
            '🔧 Balanceamento adequado entre materiais e tamanhos'
        ];
        
        if (sensorData) {
            const obstructionProb = sensorData.obstruction_probability || 0;
            const piecesPerMin = sensorData.latest?.pieces_per_minute || 0;
            const totalProduction = sensorData.latest?.total_pieces || 0;
            const averages = sensorData.averages;
            
            if (obstructionProb > 70) {
                fallbackInsights.push('🚨 ALERTA CRÍTICO: Alta probabilidade de obstrução!');
            } else if (obstructionProb > 50) {
                fallbackInsights.push('⚠️ ATENÇÃO: Probabilidade moderada de obstrução');
            }
            
            if (piecesPerMin >= 3.0) {
                fallbackInsights.push('✅ EXCELENTE: Produção acima da meta');
            } else if (piecesPerMin < 2.0) {
                fallbackInsights.push('📉 ATENÇÃO: Produção abaixo da meta');
            }
            
            if (sensorData.minutes_since_last > 30) {
                fallbackInsights.push('🕐 AVISO: Muito tempo sem produção de peças');
            }
            
            // Adicionar insights sobre médias
            if (averages) {
                fallbackInsights.push(`📈 Média diária: ${averages.avg_pieces_per_hour} peças/hora`);
                fallbackInsights.push(`🔩 Distribuição média de tamanhos: Pequeno ${averages.avg_small_percentage}%, Médio ${averages.avg_medium_percentage}%, Grande ${averages.avg_large_percentage}%`);
                fallbackInsights.push(`🏗️ Distribuição de materiais: Metal ${averages.avg_metal_percentage}%, Plástico ${averages.avg_plastic_percentage}%`);
            }
        }
        
        alert('⚠️ Erro na conexão com IA\n\n' + fallbackInsights.join('\n\n') + '\n\nDetalhes do erro: ' + error.message);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// Função para exibir análise do Gemini em modal
function showGeminiAnalysis(analysis) {
    // Criar modal se não existir
    let modal = document.getElementById('gemini-modal');
    if (!modal) {
        modal = createGeminiModal();
        document.body.appendChild(modal);
    }
    
    // Preencher conteúdo
    const content = modal.querySelector('.modal-content-text');
    const timestamp = modal.querySelector('.analysis-timestamp');
    
    content.innerHTML = formatAnalysisText(analysis);
    timestamp.textContent = `Análise gerada em: ${new Date().toLocaleString('pt-BR')}`;
    
    // Mostrar modal
    modal.style.display = 'flex';
    modal.classList.add('show');
}

function resizeCharts() {
    Object.values(charts).forEach(chart => {
        if (chart && typeof chart.resize === 'function') {
            chart.resize();
        }
    });
}

// Adicionar listener para redimensionamento da janela
window.addEventListener('resize', debounce(resizeCharts, 250));

// Função debounce para otimizar performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Criar modal para exibir análise
function createGeminiModal() {
    const modal = document.createElement('div');
    modal.id = 'gemini-modal';
    modal.className = 'analysis-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-container">
                <div class="modal-header">
                    <h2>🤖 Análise Inteligente da Produção</h2>
                    <button class="modal-close" onclick="closeGeminiModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="modal-content-text"></div>
                    <div class="analysis-timestamp"></div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="copyAnalysis()">📋 Copiar</button>
                    <button class="btn-primary" onclick="closeGeminiModal()">Fechar</button>
                </div>
            </div>
        </div>
    `;
    
    // Adicionar estilos CSS para o modal
    const styles = `
        <style>
        .analysis-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1000;
            backdrop-filter: blur(5px);
        }
        
        .analysis-modal.show {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .modal-overlay {
            background: rgba(0, 0, 0, 0.8);
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .modal-container {
            background: var(--card-bg);
            border-radius: 15px;
            max-width: 800px;
            width: 100%;
            max-height: 90vh;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 25px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .modal-header h2 {
            color: var(--text-primary);
            font-size: 1.2rem;
            margin: 0;
        }
        
        .modal-close {
            background: none;
            border: none;
            color: var(--text-secondary);
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }
        
        .modal-close:hover {
            background: rgba(255, 255, 255, 0.1);
            color: var(--text-primary);
        }
        
        .modal-body {
            padding: 25px;
            max-height: 60vh;
            overflow-y: auto;
        }
        
        .modal-content-text {
            color: var(--text-primary);
            line-height: 1.6;
            margin-bottom: 20px;
        }
        
        .modal-content-text h3 {
            color: var(--green);
            margin: 20px 0 10px 0;
            font-size: 1.1rem;
        }
        
        .modal-content-text ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        
        .modal-content-text li {
            margin: 5px 0;
            color: var(--text-secondary);
        }
        
        .analysis-timestamp {
            color: var(--text-secondary);
            font-size: 0.9rem;
            text-align: center;
            font-style: italic;
        }
        
        .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 15px;
            padding: 20px 25px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .btn-primary, .btn-secondary {
            padding: 10px 20px;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.2s;
        }
        
        .btn-primary {
            background: var(--green);
            color: white;
        }
        
        .btn-secondary {
            background: transparent;
            color: var(--text-secondary);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .btn-primary:hover {
            background: #45a049;
            transform: translateY(-1px);
        }
        
        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.1);
            color: var(--text-primary);
        }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', styles);
    
    return modal;
}

// Formatar texto da análise
function formatAnalysisText(text) {
    // Converter quebras de linha em parágrafos
    let formatted = text.replace(/\n\n/g, '</p><p>');
    formatted = '<p>' + formatted + '</p>';
    
    // Destacar títulos (linhas que começam com números ou símbolos)
    formatted = formatted.replace(/(\d+\.\s+[^<]*?)(<\/p>|<p>)/g, '<h3>$1</h3>');
    formatted = formatted.replace(/([\u{1F300}-\u{1F9FF}]\s*[^<]*?)(<\/p>|<p>)/gu, '<h3>$1</h3>');
    
    // Converter listas
    formatted = formatted.replace(/^[-•]\s+(.+)/gm, '<li>$1</li>');
    formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    return formatted;
}

// Fechar modal
function closeGeminiModal() {
    const modal = document.getElementById('gemini-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

// Copiar análise
function copyAnalysis() {
    const content = document.querySelector('.modal-content-text');
    if (content) {
        const textContent = content.innerText;
        navigator.clipboard.writeText(textContent).then(() => {
            alert('📋 Análise copiada para a área de transferência!');
        }).catch(() => {
            alert('❌ Erro ao copiar. Selecione e copie manualmente.');
        });
    }
}

// Fechar modal ao clicar fora
document.addEventListener('click', function(event) {
    const modal = document.getElementById('gemini-modal');
    if (modal && event.target === modal.querySelector('.modal-overlay')) {
        closeGeminiModal();
    }
});

// Limpeza ao sair da página
window.addEventListener('beforeunload', function() {
    if (uptimeInterval) clearInterval(uptimeInterval);
    if (dataUpdateInterval) clearInterval(dataUpdateInterval);
});