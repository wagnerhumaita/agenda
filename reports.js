// ===== MONTH SELECTOR FUNCTIONS =====
function populateMonthSelector() {
    const selector = document.getElementById('monthSelector');
    if (!selector) return;
    
    const months = new Set();
    
    exhumations.forEach(ex => {
        if (ex.dataExumacao) {
            const date = new Date(ex.dataExumacao);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            months.add(monthKey);
        }
    });
    
    burials.forEach(burial => {
        if (burial.data) {
            const date = new Date(burial.data);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            months.add(monthKey);
        }
    });
    
    const sortedMonths = Array.from(months).sort().reverse();
    
    selector.innerHTML = '<option value="">Selecione um mês</option>' +
        sortedMonths.map(month => {
            const [year, monthNum] = month.split('-');
            const monthName = new Date(year, monthNum - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
            return `<option value="${month}">${monthName.charAt(0).toUpperCase() + monthName.slice(1)}</option>`;
        }).join('');
}

function populateDashboardMonthSelector() {
    const selector = document.getElementById('dashboardMonthSelector');
    if (!selector) return;
    
    const months = new Set();
    
    exhumations.forEach(ex => {
        if (ex.dataExumacao) {
            const date = new Date(ex.dataExumacao);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            months.add(monthKey);
        }
    });
    
    burials.forEach(burial => {
        if (burial.data) {
            const date = new Date(burial.data);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            months.add(monthKey);
        }
    });
    
    const sortedMonths = Array.from(months).sort().reverse();
    
    selector.innerHTML = '<option value="">Selecione um mês</option>' +
        sortedMonths.map(month => {
            const [year, monthNum] = month.split('-');
            const monthName = new Date(year, monthNum - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
            return `<option value="${month}">${monthName.charAt(0).toUpperCase() + monthName.slice(1)}</option>`;
        }).join('');
}

// ===== MONTHLY RANKING FUNCTIONS =====
function updateMonthlyRanking() {
    const selectedMonth = document.getElementById('monthSelector').value;
    const container = document.getElementById('monthlyRanking');
    
    if (!selectedMonth) {
        container.innerHTML = `
            <div class="text-center py-16">
                <div class="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span class="text-4xl opacity-50">🏆</span>
                </div>
                <p class="text-slate-500 dark:text-slate-400 text-lg">Selecione um mês para ver o ranking</p>
                <p class="text-slate-400 dark:text-slate-500 text-sm mt-2">O ranking será baseado no total de trabalhos realizados</p>
            </div>
        `;
        return;
    }
    
    const [year, month] = selectedMonth.split('-');
    
    const monthExhumations = exhumations.filter(ex => {
        if (!ex.dataExumacao) return false;
        const date = new Date(ex.dataExumacao);
        return date.getFullYear() == year && (date.getMonth() + 1) == month;
    });
    
    const monthBurials = burials.filter(burial => {
        if (!burial.data) return false;
        const date = new Date(burial.data);
        return date.getFullYear() == year && (date.getMonth() + 1) == month;
    });
    
    const agentStats = {};
    
    monthExhumations.forEach(ex => {
        if (ex.agenteSepultador) {
            if (!agentStats[ex.agenteSepultador]) {
                agentStats[ex.agenteSepultador] = { exhumations: 0, burials: 0, total: 0 };
            }
            agentStats[ex.agenteSepultador].exhumations++;
            agentStats[ex.agenteSepultador].total++;
        }
    });
    
    monthBurials.forEach(burial => {
        if (burial.agentes && burial.agentes.length > 0) {
            burial.agentes.forEach(agentName => {
                if (!agentStats[agentName]) {
                    agentStats[agentName] = { exhumations: 0, burials: 0, total: 0 };
                }
                agentStats[agentName].burials++;
                agentStats[agentName].total++;
            });
        }
    });
    
    const rankedAgents = Object.entries(agentStats)
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.total - a.total);
    
    if (rankedAgents.length === 0) {
        container.innerHTML = `
            <div class="text-center py-16">
                <div class="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span class="text-4xl opacity-50">📅</span>
                </div>
                <p class="text-slate-500 dark:text-slate-400 text-lg">Nenhum trabalho registrado neste mês</p>
                <p class="text-slate-400 dark:text-slate-500 text-sm mt-2">Selecione outro mês ou registre novos trabalhos</p>
            </div>
        `;
        return;
    }
    
    const monthName = new Date(year, month - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    
    container.innerHTML = `
        <div class="mb-6">
            <h4 class="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Ranking de ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}
            </h4>
            <p class="text-sm text-slate-600 dark:text-slate-400">
                Total de ${monthExhumations.length} exumações e ${monthBurials.length} sepultamentos
            </p>
        </div>
        
        <div class="space-y-4">
            ${rankedAgents.map((agent, index) => {
                const medalEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';
                const bgColor = index === 0 ? 'from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20' : 
                               index === 1 ? 'from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20' :
                               index === 2 ? 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20' :
                               'from-slate-50 to-slate-100 dark:from-slate-800/20 dark:to-slate-700/20';
                
                return `
                    <div class="bg-gradient-to-r ${bgColor} rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-4">
                                <div class="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-2xl flex items-center justify-center text-2xl">
                                    ${medalEmoji}
                                </div>
                                <div>
                                    <h5 class="text-xl font-bold text-slate-800 dark:text-slate-200">${index + 1}º ${agent.name}</h5>
                                    <p class="text-sm text-slate-600 dark:text-slate-400">
                                        ${agent.exhumations} exumações • ${agent.burials} sepultamentos
                                    </p>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="text-3xl font-bold text-slate-800 dark:text-slate-200">${agent.total}</div>
                                <div class="text-sm text-slate-500 dark:text-slate-400">trabalhos</div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function updateMonthlyStats() {
    const selectedMonth = document.getElementById('dashboardMonthSelector').value;
    const container = document.getElementById('monthlyStatsContent');
    
    if (!selectedMonth) {
        container.innerHTML = `
            <div class="text-center py-16">
                <div class="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span class="text-4xl opacity-50">📅</span>
                </div>
                <p class="text-slate-500 dark:text-slate-400 text-lg">Selecione um mês para ver as estatísticas</p>
                <p class="text-slate-400 dark:text-slate-500 text-sm mt-2">Dados de exumações, sepultamentos e funerárias</p>
            </div>
        `;
        return;
    }
    
    const [year, month] = selectedMonth.split('-');
    
    const monthExhumations = exhumations.filter(ex => {
        if (!ex.dataExumacao) return false;
        const date = new Date(ex.dataExumacao);
        return date.getFullYear() == year && (date.getMonth() + 1) == month;
    });
    
    const monthBurials = burials.filter(burial => {
        if (!burial.data) return false;
        const date = new Date(burial.data);
        return date.getFullYear() == year && (date.getMonth() + 1) == month;
    });
    
    const funeralHomeStats = {};
    monthBurials.forEach(burial => {
        if (burial.funeraria) {
            funeralHomeStats[burial.funeraria] = (funeralHomeStats[burial.funeraria] || 0) + 1;
        }
    });
    
    const sortedFuneralHomes = Object.entries(funeralHomeStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);
    
    const monthName = new Date(year, month - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    
    container.innerHTML = `
        <div class="mb-8">
            <h3 class="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6">
                Resumo de ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div class="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 rounded-2xl p-6 border border-teal-200/50 dark:border-teal-700/50">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-3xl font-bold text-teal-600 dark:text-teal-400">${monthExhumations.length}</div>
                            <div class="text-sm font-medium text-teal-700 dark:text-teal-300 uppercase tracking-wide">Exumações</div>
                        </div>
                        <div class="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center">
                            <span class="text-3xl">📋</span>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-700/50">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-3xl font-bold text-purple-600 dark:text-purple-400">${monthBurials.length}</div>
                            <div class="text-sm font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wide">Sepultamentos</div>
                        </div>
                        <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                            <span class="text-3xl">⚰️</span>
                        </div>
                    </div>
                </div>
            </div>
            
            ${sortedFuneralHomes.length > 0 ? `
                <div class="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20 rounded-2xl p-6 border border-rose-200/50 dark:border-rose-700/50">
                    <h4 class="text-lg font-bold text-rose-800 dark:text-rose-200 mb-4 flex items-center">
                        <span class="mr-2">🏢</span>
                        Participações das Funerárias
                    </h4>
                    <div class="space-y-3">
                        ${sortedFuneralHomes.map(([name, count], index) => {
                            const percentage = Math.round((count / monthBurials.length) * 100);
                            const medalEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';
                            
                            return `
                                <div class="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                                    <div class="flex items-center space-x-3">
                                        <span class="text-lg">${medalEmoji}</span>
                                        <div>
                                            <div class="font-semibold text-slate-800 dark:text-slate-200">${name}</div>
                                            <div class="text-sm text-slate-600 dark:text-slate-400">${percentage}% do total</div>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-2xl font-bold text-rose-600 dark:text-rose-400">${count}</div>
                                        <div class="text-xs text-slate-500 dark:text-slate-400">sepultamentos</div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            ` : `
                <div class="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/20 dark:to-slate-700/20 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 text-center">
                    <span class="text-4xl opacity-50">🏢</span>
                    <p class="text-slate-500 dark:text-slate-400 mt-2">Nenhuma participação de funerária registrada neste mês</p>
                </div>
            `}
        </div>
    `;
}

// ===== PRINT FUNCTIONS =====
function printMonthlyRanking() {
    const selectedMonth = document.getElementById('monthSelector').value;
    if (!selectedMonth) {
        alert('Selecione um mês primeiro!');
        return;
    }
    
    const [year, month] = selectedMonth.split('-');
    const monthName = new Date(year, month - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    
    const monthExhumations = exhumations.filter(ex => {
        if (!ex.dataExumacao) return false;
        const date = new Date(ex.dataExumacao);
        return date.getFullYear() == year && (date.getMonth() + 1) == month;
    });
    
    const monthBurials = burials.filter(burial => {
        if (!burial.data) return false;
        const date = new Date(burial.data);
        return date.getFullYear() == year && (date.getMonth() + 1) == month;
    });
    
    const agentStats = {};
    
    monthExhumations.forEach(ex => {
        if (ex.agenteSepultador) {
            if (!agentStats[ex.agenteSepultador]) {
                agentStats[ex.agenteSepultador] = { exhumations: 0, burials: 0, total: 0 };
            }
            agentStats[ex.agenteSepultador].exhumations++;
            agentStats[ex.agenteSepultador].total++;
        }
    });
    
    monthBurials.forEach(burial => {
        if (burial.agentes && burial.agentes.length > 0) {
            burial.agentes.forEach(agentName => {
                if (!agentStats[agentName]) {
                    agentStats[agentName] = { exhumations: 0, burials: 0, total: 0 };
                }
                agentStats[agentName].burials++;
                agentStats[agentName].total++;
            });
        }
    });
    
    const rankedAgents = Object.entries(agentStats)
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.total - a.total);
    
    if (rankedAgents.length === 0) {
        alert('Nenhum trabalho registrado neste mês!');
        return;
    }
    
    const printContent = `
        <div class="print-only">
            <h1 style="text-align: center; margin-bottom: 20px;">Ranking Mensal dos Agentes</h1>
            <p style="text-align: center; margin-bottom: 30px;">
                ${monthName.charAt(0).toUpperCase() + monthName.slice(1)} - 
                ${monthExhumations.length} exumações e ${monthBurials.length} sepultamentos
            </p>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #f3f4f6;">
                        <th style="border: 1px solid #d1d5db; padding: 12px; text-align: left;">Posição</th>
                        <th style="border: 1px solid #d1d5db; padding: 12px; text-align: left;">Nome do Agente</th>
                        <th style="border: 1px solid #d1d5db; padding: 12px; text-align: center;">Exumações</th>
                        <th style="border: 1px solid #d1d5db; padding: 12px; text-align: center;">Sepultamentos</th>
                        <th style="border: 1px solid #d1d5db; padding: 12px; text-align: center;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${rankedAgents.map((agent, index) => `
                        <tr>
                            <td style="border: 1px solid #d1d5db; padding: 12px; text-align: center; font-weight: bold;">${index + 1}º</td>
                            <td style="border: 1px solid #d1d5db; padding: 12px;">${agent.name}</td>
                            <td style="border: 1px solid #d1d5db; padding: 12px; text-align: center;">${agent.exhumations}</td>
                            <td style="border: 1px solid #d1d5db; padding: 12px; text-align: center;">${agent.burials}</td>
                            <td style="border: 1px solid #d1d5db; padding: 12px; text-align: center; font-weight: bold;">${agent.total}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <p style="margin-top: 30px; text-align: center;">
                Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
            </p>
        </div>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Ranking Mensal - ${monthName}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    th { background-color: #f2f2f2; font-weight: bold; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                </style>
            </head>
            <body>${printContent}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function printMonthlyStats() {
    const selectedMonth = document.getElementById('dashboardMonthSelector').value;
    if (!selectedMonth) {
        alert('Selecione um mês primeiro!');
        return;
    }
    
    const [year, month] = selectedMonth.split('-');
    const monthName = new Date(year, month - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    
    const monthExhumations = exhumations.filter(ex => {
        if (!ex.dataExumacao) return false;
        const date = new Date(ex.dataExumacao);
        return date.getFullYear() == year && (date.getMonth() + 1) == month;
    });
    
    const monthBurials = burials.filter(burial => {
        if (!burial.data) return false;
        const date = new Date(burial.data);
        return date.getFullYear() == year && (date.getMonth() + 1) == month;
    });
    
    const funeralHomeStats = {};
    monthBurials.forEach(burial => {
        if (burial.funeraria) {
            funeralHomeStats[burial.funeraria] = (funeralHomeStats[burial.funeraria] || 0) + 1;
        }
    });
    
    const sortedFuneralHomes = Object.entries(funeralHomeStats)
        .sort(([,a], [,b]) => b - a);
    
    const printContent = `
        <div class="print-only">
            <h1 style="text-align: center; margin-bottom: 20px;">Estatísticas Mensais</h1>
            <p style="text-align: center; margin-bottom: 30px;">
                ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}
            </p>
            
            <div style="margin-bottom: 30px;">
                <h2 style="margin-bottom: 15px;">Resumo Geral</h2>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr>
                        <td style="border: 1px solid #ddd; padding: 12px; background-color: #f9f9f9; font-weight: bold;">Exumações</td>
                        <td style="border: 1px solid #ddd; padding: 12px; text-align: center; font-size: 18px; font-weight: bold;">${monthExhumations.length}</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #ddd; padding: 12px; background-color: #f9f9f9; font-weight: bold;">Sepultamentos</td>
                        <td style="border: 1px solid #ddd; padding: 12px; text-align: center; font-size: 18px; font-weight: bold;">${monthBurials.length}</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #ddd; padding: 12px; background-color: #f9f9f9; font-weight: bold;">Total de Atividades</td>
                        <td style="border: 1px solid #ddd; padding: 12px; text-align: center; font-size: 18px; font-weight: bold;">${monthExhumations.length + monthBurials.length}</td>
                    </tr>
                </table>
            </div>
            
            ${sortedFuneralHomes.length > 0 ? `
                <div>
                    <h2 style="margin-bottom: 15px;">Participações das Funerárias</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background-color: #f3f4f6;">
                                <th style="border: 1px solid #d1d5db; padding: 12px; text-align: left;">Posição</th>
                                <th style="border: 1px solid #d1d5db; padding: 12px; text-align: left;">Funerária</th>
                                <th style="border: 1px solid #d1d5db; padding: 12px; text-align: center;">Sepultamentos</th>
                                <th style="border: 1px solid #d1d5db; padding: 12px; text-align: center;">Percentual</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sortedFuneralHomes.map(([name, count], index) => {
                                const percentage = Math.round((count / monthBurials.length) * 100);
                                return `
                                    <tr>
                                        <td style="border: 1px solid #d1d5db; padding: 12px; text-align: center; font-weight: bold;">${index + 1}º</td>
                                        <td style="border: 1px solid #d1d5db; padding: 12px;">${name}</td>
                                        <td style="border: 1px solid #d1d5db; padding: 12px; text-align: center; font-weight: bold;">${count}</td>
                                        <td style="border: 1px solid #d1d5db; padding: 12px; text-align: center;">${percentage}%</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            ` : ''}
            
            <p style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
                Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
            </p>
        </div>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Estatísticas Mensais - ${monthName}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    th { background-color: #f2f2f2; font-weight: bold; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                    h1, h2 { color: #333; }
                </style>
            </head>
            <body>${printContent}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function printOpenGraves() {
    const printContent = `
        <div class="print-only">
            <h1 style="text-align: center; margin-bottom: 20px;">Lista de Sepulturas Abertas</h1>
            <p style="text-align: center; margin-bottom: 30px;">Data: ${new Date().toLocaleDateString('pt-BR')}</p>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #f3f4f6;">
                        <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Quadra</th>
                        <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Lote</th>
                        <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Data Abertura</th>
                        <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Origem</th>
                    </tr>
                </thead>
                <tbody>
                    ${openGraves.map(grave => `
                        <tr>
                            <td style="border: 1px solid #d1d5db; padding: 8px;">${grave.quadra}</td>
                            <td style="border: 1px solid #d1d5db; padding: 8px;">${grave.lote}</td>
                            <td style="border: 1px solid #d1d5db; padding: 8px;">${grave.dataAbertura}</td>
                            <td style="border: 1px solid #d1d5db; padding: 8px;">${grave.origem}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <p style="margin-top: 30px; text-align: center;">Total: ${openGraves.length} sepultura(s) aberta(s)</p>
        </div>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Lista de Sepulturas Abertas</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                </style>
            </head>
            <body>${printContent}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function printAllOpenGraves() {
    if (openGraves.length === 0) {
        alert('Nenhuma sepultura aberta para imprimir!');
        return;
    }
    
    const printContent = `
        <div class="print-only">
            <h1 style="text-align: center; margin-bottom: 20px;">Lista de Sepulturas Abertas</h1>
            <p style="text-align: center; margin-bottom: 30px;">Data: ${new Date().toLocaleDateString('pt-BR')} - Total: ${openGraves.length} sepultura(s)</p>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #f3f4f6;">
                        <th style="border: 1px solid #000; padding: 8px; text-align: left; width: 12%;">Data Exumação</th>
                        <th style="border: 1px solid #000; padding: 8px; text-align: left; width: 8%;">Quadra</th>
                        <th style="border: 1px solid #000; padding: 8px; text-align: left; width: 8%;">Lote</th>
                        <th style="border: 1px solid #000; padding: 8px; text-align: left; width: 20%;">Agente</th>
                        <th style="border: 1px solid #000; padding: 8px; text-align: left; width: 17%;">Destino</th>
                        <th style="border: 1px solid #000; padding: 8px; text-align: left; width: 35%;">Fechamento</th>
                    </tr>
                </thead>
                <tbody>
                    ${openGraves.map(grave => {
                        const relatedExhumation = exhumations.find(ex => 
                            ex.quadra === grave.quadra && ex.lote === grave.lote && ex.status === 'concluída'
                        );
                        
                        const dataExumacao = relatedExhumation ? relatedExhumation.dataExumacao : '-';
                        const agente = relatedExhumation ? relatedExhumation.agenteSepultador || '-' : '-';
                        const destino = relatedExhumation ? relatedExhumation.destino || '-' : '-';
                        
                        return {
                            grave,
                            dataExumacao,
                            agente,
                            destino,
                            sortDate: relatedExhumation ? new Date(relatedExhumation.dataExumacao) : new Date('1900-01-01')
                        };
                    }).sort((a, b) => a.sortDate - b.sortDate).map(item => {
                        const dataFormatted = item.dataExumacao !== '-' ? new Date(item.dataExumacao + 'T00:00:00').toLocaleDateString('pt-BR') : '-';
                        
                        return `
                        <tr>
                            <td style="border: 1px solid #000; padding: 8px;">${dataFormatted}</td>
                            <td style="border: 1px solid #000; padding: 8px;">${item.grave.quadra}</td>
                            <td style="border: 1px solid #000; padding: 8px;">${item.grave.lote}</td>
                            <td style="border: 1px solid #000; padding: 8px;">${item.agente}</td>
                            <td style="border: 1px solid #000; padding: 8px;">${item.destino}</td>
                            <td style="border: 1px solid #000; padding: 20px; height: 40px;"></td>
                        </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Lista de Sepulturas Abertas</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #000; padding: 8px; text-align: left; vertical-align: top; }
                    th { background-color: #f2f2f2; font-weight: bold; }
                </style>
            </head>
            <body>${printContent}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function printBurialsByDate() {
    const selectedDate = document.getElementById('burialCalendarDate').value;
    if (!selectedDate) {
        alert('Selecione uma data primeiro!');
        return;
    }
    
    const dayBurials = burials.filter(burial => burial.data === selectedDate);
    
    if (dayBurials.length === 0) {
        alert('Nenhum sepultamento encontrado para esta data!');
        return;
    }
    
    dayBurials.sort((a, b) => {
        const timeA = a.horario || '00:00';
        const timeB = b.horario || '00:00';
        return timeA.localeCompare(timeB);
    });
    
    const selectedDateFormatted = new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR');
    
    const printContent = `
        <div class="print-only">
            <h1 style="text-align: center; margin-bottom: 20px;">Sepultamentos do Dia</h1>
            <p style="text-align: center; margin-bottom: 30px;">Data: ${selectedDateFormatted}</p>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #f3f4f6;">
                        <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Velório</th>
                        <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Horário</th>
                        <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Nome do Falecido</th>
                        <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Quadra</th>
                        <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Lote</th>
                        <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Agentes Sepultadores</th>
                    </tr>
                </thead>
                <tbody>
                    ${dayBurials.map(burial => `
                        <tr>
                            <td style="border: 1px solid #d1d5db; padding: 8px;">${burial.velorio || '-'}</td>
                            <td style="border: 1px solid #d1d5db; padding: 8px;">${burial.horario}</td>
                            <td style="border: 1px solid #d1d5db; padding: 8px;">${burial.nomefalecido}</td>
                            <td style="border: 1px solid #d1d5db; padding: 8px;">${burial.quadra}</td>
                            <td style="border: 1px solid #d1d5db; padding: 8px;">${burial.lote}</td>
                            <td style="border: 1px solid #d1d5db; padding: 8px;">${burial.agentes && burial.agentes.length > 0 ? burial.agentes.join(', ') : 'Não definido'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <p style="margin-top: 30px; text-align: center;">Total: ${dayBurials.length} sepultamento(s) para ${selectedDateFormatted}</p>
        </div>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Sepultamentos do Dia - ${selectedDateFormatted}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                </style>
            </head>
            <body>${printContent}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function printExhumationsByDate() {
    const selectedDate = document.getElementById('calendarDate').value;
    if (!selectedDate) {
        alert('Selecione uma data primeiro!');
        return;
    }
    
    const dayExhumations = exhumations.filter(ex => ex.dataExumacao === selectedDate);
    
    if (dayExhumations.length === 0) {
        alert('Nenhuma exumação encontrada para esta data!');
        return;
    }
    
    const selectedDateFormatted = new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR');
    
    const exhumationsByAgent = {};
    dayExhumations.forEach(ex => {
        const agent = ex.agenteSepultador || 'Não definido';
        if (!exhumationsByAgent[agent]) {
            exhumationsByAgent[agent] = [];
        }
        exhumationsByAgent[agent].push(ex);
    });
    
    let agentSections = '';
    Object.entries(exhumationsByAgent).forEach(([agent, exhumations]) => {
        agentSections += `
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 0;">
                <thead>
                    <tr style="background-color: #000000; color: #ffffff;">
                        <th style="border: 1px solid #000; padding: 12px; text-align: left; font-weight: bold;">Quadra</th>
                        <th style="border: 1px solid #000; padding: 12px; text-align: left; font-weight: bold;">Lote</th>
                        <th style="border: 1px solid #000; padding: 12px; text-align: left; font-weight: bold;">Nome do Falecido</th>
                        <th style="border: 1px solid #000; padding: 12px; text-align: left; font-weight: bold;">Agente Sepultador</th>
                        <th style="border: 1px solid #000; padding: 12px; text-align: left; font-weight: bold;">Destino</th>
                        <th style="border: 1px solid #000; padding: 12px; text-align: left; font-weight: bold;">Data da Exumação</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        exhumations.forEach(ex => {
            let destinoInfo = ex.destino;
            if (ex.destino === 'sepultura' && ex.quadraDestino && ex.loteDestino) {
                destinoInfo += ` (Q${ex.quadraDestino} L${ex.loteDestino})`;
            } else if (ex.destino === 'nicho' && ex.numeroNicho) {
                destinoInfo += ` (${ex.numeroNicho})`;
            } else if (ex.destino === 'sepulcro' && ex.quadraSepulcro && ex.numeroSepulcro) {
                destinoInfo += ` (Q${ex.quadraSepulcro} N${ex.numeroSepulcro})`;
            } else if (ex.destino === 'traslado' && ex.destinoTraslado) {
                destinoInfo += ` (${ex.destinoTraslado})`;
            } else if ((ex.destino === 'traslado-crematório' || ex.destino === 'traslado') && ex.protocolo) {
                destinoInfo += ` (Prot: ${ex.protocolo})`;
            }
            
            agentSections += `
                <tr style="background-color: #ffffff; color: #000000;">
                    <td style="border: 1px solid #ddd; padding: 12px;">${ex.quadra}</td>
                    <td style="border: 1px solid #ddd; padding: 12px;">${ex.lote}</td>
                    <td style="border: 1px solid #ddd; padding: 12px;">${ex.nomefalecido}</td>
                    <td style="border: 1px solid #ddd; padding: 12px;">${agent}</td>
                    <td style="border: 1px solid #ddd; padding: 12px;">${destinoInfo}</td>
                    <td style="border: 1px solid #ddd; padding: 12px;">${selectedDateFormatted}</td>
                </tr>
            `;
        });
        
        agentSections += `
                </tbody>
            </table>
            <div style="margin-bottom: 30px;"></div>
        `;
    });
    
    const printContent = `
        <div class="print-only">
            <h1 style="text-align: center; margin-bottom: 20px; font-size: 24px; font-weight: bold;">Exumações do Dia</h1>
            <p style="text-align: center; margin-bottom: 40px; font-size: 16px;">Data: ${selectedDateFormatted}</p>
            
            ${agentSections}
            
            <p style="margin-top: 30px; text-align: center; font-size: 14px;">Total: ${dayExhumations.length} exumação(ões) agendada(s) para ${selectedDateFormatted}</p>
        </div>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Exumações do Dia - ${selectedDateFormatted}</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 20px; 
                        line-height: 1.4;
                    }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin-bottom: 0;
                    }
                    th, td { 
                        border: 1px solid #ddd; 
                        padding: 12px; 
                        text-align: left; 
                        vertical-align: top;
                    }
                    th { 
                        background-color: #000000 !important; 
                        color: #ffffff !important; 
                        font-weight: bold;
                    }
                    td {
                        background-color: #ffffff !important;
                        color: #000000 !important;
                    }
                    @media print {
                        th { 
                            background-color: #000000 !important; 
                            color: #ffffff !important; 
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        td {
                            background-color: #ffffff !important;
                            color: #000000 !important;
                        }
                    }
                </style>
            </head>
            <body>${printContent}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}