// ===== VIEW UPDATE FUNCTIONS =====

// Calendar Views
function updateCalendarView() {
    const selectedDate = document.getElementById('calendarDate').value;
    const container = document.getElementById('calendarView');
    
    if (!selectedDate) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">Selecione uma data para ver as exumações</p>';
        return;
    }
    
    const dayExhumations = exhumations.filter(ex => ex.dataExumacao === selectedDate);
    
    if (dayExhumations.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">Nenhuma exumação agendada para esta data</p>';
        return;
    }
    
    container.innerHTML = dayExhumations.map(ex => {
        const destinoInfo = buildDestinationInfo(ex);
        const message = generateExhumationWhatsAppMessage(ex);
        const cleanNumber = ex.telefone.replace(/\D/g, '');
        const whatsappNumber = cleanNumber.startsWith('55') ? cleanNumber : '55' + cleanNumber;
        const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        
        return `
        <div class="p-4 border border-gray-200 rounded-lg">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <h4 class="font-semibold text-lg">${ex.nomefalecido}</h4>
                    <p class="text-sm text-gray-600">Quadra ${ex.quadra} - Lote ${ex.lote}</p>
                    <p class="text-sm text-gray-600">Destino: ${destinoInfo}</p>
                    <p class="text-sm text-gray-600">Solicitante: ${ex.solicitante}</p>
                    ${ex.conclusao ? `<p class="text-sm font-medium text-green-600">Conclusão: ${ex.conclusao}</p>` : ''}
                </div>
                <div>
                    <div class="mb-2">
                        <label class="block text-xs text-gray-500 mb-1">Agente Sepultador:</label>
                        <select onchange="updateExhumationAgent('${ex.id}', this.value)" class="w-full text-sm px-2 py-1 border border-gray-300 rounded">
                            <option value="">Selecionar agente</option>
                            ${agents.map(agent => `
                                <option value="${agent.nome}" ${ex.agenteSepultador === agent.nome ? 'selected' : ''}>${agent.nome}</option>
                            `).join('')}
                        </select>
                    </div>
                    <a href="${whatsappLink}" class="inline-block bg-teal-600 text-white px-3 py-1 rounded text-sm hover:bg-teal-700 transition-colors">
                        WhatsApp
                    </a>
                </div>
                <div class="flex flex-col gap-2">
                    ${ex.status === 'agendada' ? `
                        <button onclick="editExhumation('${ex.id}')" class="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition-colors">
                            Editar
                        </button>
                        <button onclick="deleteExhumation('${ex.id}')" class="bg-rose-600 text-white px-3 py-1 rounded text-sm hover:bg-rose-700 transition-colors">
                            Excluir
                        </button>
                        <button onclick="completeExhumation('${ex.id}')" class="bg-teal-600 text-white px-3 py-1 rounded text-sm hover:bg-teal-700 transition-colors">
                            Concluir
                        </button>
                    ` : `
                        <span class="text-sm font-medium text-slate-600">Status: ${ex.status}</span>
                        ${ex.status === 'concluída' ? `
                            <button onclick="editExhumationConclusion('${ex.id}')" class="bg-amber-500 text-white px-3 py-1 rounded text-sm hover:bg-amber-600 transition-colors">
                                Editar Conclusão
                            </button>
                        ` : ''}
                        <button onclick="deleteExhumation('${ex.id}')" class="bg-slate-800 text-white px-3 py-1 rounded text-sm hover:bg-slate-900 transition-colors">
                            Excluir
                        </button>
                    `}
                </div>
            </div>
        </div>
        `;
    }).join('');
}

function updateBurialCalendarView() {
    const selectedDate = document.getElementById('burialCalendarDate').value;
    const container = document.getElementById('burialCalendarView');
    
    if (!selectedDate) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">Selecione uma data para ver os sepultamentos</p>';
        return;
    }
    
    const dayBurials = burials.filter(burial => burial.data === selectedDate);
    
    if (dayBurials.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">Nenhum sepultamento agendado para esta data</p>';
        return;
    }
    
    dayBurials.sort((a, b) => {
        const timeA = a.horario || '00:00';
        const timeB = b.horario || '00:00';
        return timeA.localeCompare(timeB);
    });
    
    container.innerHTML = dayBurials.map(burial => `
        <div class="p-4 border border-gray-200 rounded-lg">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <h4 class="font-semibold text-lg">${burial.nomefalecido}</h4>
                    <p class="text-sm text-gray-600">Horário: ${burial.horario}</p>
                    <p class="text-sm text-gray-600">Quadra ${burial.quadra} - Lote ${burial.lote}</p>
                    <p class="text-sm text-gray-600">Funerária: ${burial.funeraria}</p>
                    ${(() => {
                        const funeralHome = funeralHomes.find(fh => fh.nome === burial.funeraria);
                        if (funeralHome) {
                            const greeting = new Date().getHours() < 12 ? 'Bom dia' : 'Boa tarde';
                            const today = new Date().toISOString().split('T')[0];
                            const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                            let dateText;
                            if (burial.data === today) {
                                dateText = 'hoje';
                            } else if (burial.data === tomorrow) {
                                dateText = 'amanhã';
                            } else {
                                dateText = new Date(burial.data).toLocaleDateString('pt-BR');
                            }
                            const message = `${greeting}, podemos agendar *${burial.nomefalecido}*, para ${dateText}, às ${burial.horario} horas`;
                            const whatsappLink = `https://wa.me/${funeralHome.telefone.replace(/\D/g, '').startsWith('55') ? funeralHome.telefone.replace(/\D/g, '') : '55' + funeralHome.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
                            return `<p class="text-sm text-gray-600">Tel: <a href="${whatsappLink}" target="_blank" class="text-green-600 hover:text-green-700 underline">${funeralHome.telefone}</a></p>`;
                        }
                        return '';
                    })()}
                    ${burial.velorio ? `<p class="text-sm text-gray-600">Velório: ${burial.velorio}</p>` : ''}
                </div>
                <div>
                    <p class="text-sm text-gray-600 mb-2">
                        <strong>Agentes:</strong> 
                        ${burial.agentes && burial.agentes.length > 0 ? burial.agentes.join(', ') : 'Não definido'}
                    </p>
                </div>
                <div class="flex flex-col gap-2">
                    <button onclick="editBurialAgents('${burial.id}')" class="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition-colors">
                        Editar Agentes
                    </button>
                    <button onclick="editBurial('${burial.id}')" class="bg-amber-500 text-white px-3 py-1 rounded text-sm hover:bg-amber-600 transition-colors">
                        Editar
                    </button>
                    <button onclick="deleteBurial('${burial.id}')" class="bg-rose-600 text-white px-3 py-1 rounded text-sm hover:bg-rose-700 transition-colors">
                        Excluir
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Burials List
function updateBurialsList() {
    const container = document.getElementById('burialsList');
    if (burials.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">Nenhum sepultamento agendado</p>';
        return;
    }
    
    renderBurialsList(burials);
}

function renderBurialsList(burialsToShow) {
    const container = document.getElementById('burialsList');
    
    if (burialsToShow.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">Nenhum sepultamento encontrado</p>';
        return;
    }
    
    container.innerHTML = burialsToShow.map(burial => `
        <div class="p-4 border border-gray-200 rounded-lg">
            <div class="flex justify-between items-start">
                <div>
                    <h4 class="font-semibold">${burial.nomefalecido}</h4>
                    <p class="text-sm text-gray-600">Data: ${new Date(burial.data).toLocaleDateString('pt-BR')} às ${burial.horario}</p>
                    <p class="text-sm text-gray-600">Sepultura: Quadra ${burial.quadra || 'N/A'} - Lote ${burial.lote || 'N/A'}</p>
                    <p class="text-sm text-gray-600">Funerária: ${burial.funeraria}</p>
                    ${(() => {
                        const funeralHome = funeralHomes.find(fh => fh.nome === burial.funeraria);
                        if (funeralHome) {
                            const greeting = new Date().getHours() < 12 ? 'Bom dia' : 'Boa tarde';
                            const today = new Date().toISOString().split('T')[0];
                            const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                            let dateText;
                            if (burial.data === today) {
                                dateText = 'hoje';
                            } else if (burial.data === tomorrow) {
                                dateText = 'amanhã';
                            } else {
                                dateText = new Date(burial.data).toLocaleDateString('pt-BR');
                            }
                            const message = `${greeting}, podemos agendar *${burial.nomefalecido}*, para ${dateText}, às ${burial.horario} horas`;
                            const whatsappLink = `https://wa.me/${funeralHome.telefone.replace(/\D/g, '').startsWith('55') ? funeralHome.telefone.replace(/\D/g, '') : '55' + funeralHome.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
                            return `<p class="text-sm text-gray-600">Tel: <a href="${whatsappLink}" target="_blank" class="text-green-600 hover:text-green-700 underline">${funeralHome.telefone}</a></p>`;
                        }
                        return '';
                    })()}
                    ${burial.velorio ? `<p class="text-sm text-gray-600">Velório: ${burial.velorio}</p>` : ''}
                </div>
                <div class="text-right">
                    <button onclick="editBurialAgents('${burial.id}')" class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                        Editar Agentes
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Agents List
function updateAgentsList() {
    const container = document.getElementById('agentsList');
    if (agents.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">Nenhum agente cadastrado</p>';
        return;
    }
    
    const agentsWithStats = agents.map(agent => {
        const exhumationCount = exhumations.filter(ex => ex.agenteSepultador === agent.nome).length;
        const burialCount = burials.filter(burial => burial.agentes && burial.agentes.includes(agent.nome)).length;
        const totalJobs = exhumationCount + burialCount;
        
        return {
            ...agent,
            exhumationCount,
            burialCount,
            totalJobs
        };
    });
    
    agentsWithStats.sort((a, b) => b.totalJobs - a.totalJobs);
    
    container.innerHTML = agentsWithStats.map((agent, index) => `
        <div class="card-hover bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-xl p-6 border border-slate-200/50 dark:border-slate-700/50 relative overflow-hidden">
            <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 rounded-full -mr-12 -mt-12"></div>
            <div class="relative">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex-1">
                        <div class="flex items-center space-x-3 mb-2">
                            <div class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                #${index + 1}
                            </div>
                            <div>
                                <h4 class="text-lg font-bold text-slate-800 dark:text-slate-200">${agent.nome}</h4>
                                <p class="text-sm text-slate-500 dark:text-slate-400">RGF: ${agent.rgf}</p>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-3 gap-4 mb-4">
                            <div class="text-center">
                                <div class="text-2xl font-bold text-teal-600 dark:text-teal-400">${agent.exhumationCount}</div>
                                <div class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Exumações</div>
                            </div>
                            <div class="text-center">
                                <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">${agent.burialCount}</div>
                                <div class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Sepultamentos</div>
                            </div>
                            <div class="text-center">
                                <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">${agent.totalJobs}</div>
                                <div class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total</div>
                            </div>
                        </div>
                        
                        <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-3">
                            <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-500" style="width: ${agent.totalJobs > 0 ? Math.min((agent.totalJobs / Math.max(...agentsWithStats.map(a => a.totalJobs))) * 100, 100) : 0}%"></div>
                        </div>
                    </div>
                    
                    <div class="flex flex-col gap-2 ml-4">
                        <a href="${agent.whatsappLink}" target="_blank" class="btn-modern bg-gradient-to-r from-green-600 to-green-700 dark:from-green-500 dark:to-green-600 text-white px-4 py-2 rounded-xl hover:from-green-700 hover:to-green-800 dark:hover:from-green-600 dark:hover:to-green-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl text-center">
                            <span class="flex items-center space-x-2">
                                <span>💬</span>
                                <span>WhatsApp</span>
                            </span>
                        </a>
                        <button onclick="viewAgentDetails('${agent.nome}')" class="btn-modern bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-500 dark:to-indigo-600 text-white px-4 py-2 rounded-xl hover:from-indigo-700 hover:to-indigo-800 dark:hover:from-indigo-600 dark:hover:to-indigo-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl">
                            <span class="flex items-center space-x-2">
                                <span>📊</span>
                                <span>Detalhes</span>
                            </span>
                        </button>
                        <button onclick="editAgent('${agent.id}')" class="btn-modern bg-gradient-to-r from-amber-600 to-amber-700 dark:from-amber-500 dark:to-amber-600 text-white px-4 py-2 rounded-xl hover:from-amber-700 hover:to-amber-800 dark:hover:from-amber-600 dark:hover:to-amber-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl">
                            <span class="flex items-center space-x-2">
                                <span>✏️</span>
                                <span>Editar</span>
                            </span>
                        </button>
                        <button onclick="deleteAgent('${agent.id}')" class="btn-modern bg-gradient-to-r from-rose-600 to-rose-700 dark:from-rose-500 dark:to-rose-600 text-white px-4 py-2 rounded-xl hover:from-rose-700 hover:to-rose-800 dark:hover:from-rose-600 dark:hover:to-rose-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl">
                            <span class="flex items-center space-x-2">
                                <span>🗑️</span>
                                <span>Excluir</span>
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Funeral Homes List
function updateFuneralHomesList() {
    const container = document.getElementById('funeralHomesList');
    if (funeralHomes.length === 0) {
        container.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center py-8">Nenhuma funerária cadastrada</p>';
        return;
    }
    
    const funeralHomesWithStats = funeralHomes.map(fh => {
        const participationCount = burials.filter(burial => burial.funeraria === fh.nome).length;
        return { ...fh, participacoes: participationCount };
    });
    
    container.innerHTML = funeralHomesWithStats.map(fh => `
        <div class="flex justify-between items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800">
            <div>
                <span class="font-semibold text-slate-800 dark:text-slate-200">${fh.nome}</span>
                <span class="text-sm text-gray-600 dark:text-gray-400 ml-4">Participações: ${fh.participacoes}</span>
            </div>
            <div class="flex gap-2">
                <a href="${fh.whatsappLink}" target="_blank" class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors">
                    WhatsApp
                </a>
                <button onclick="editFuneralHome('${fh.id}')" class="bg-amber-600 text-white px-3 py-1 rounded text-sm hover:bg-amber-700 transition-colors">
                    Editar
                </button>
                <button onclick="deleteFuneralHome('${fh.id}')" class="bg-rose-600 text-white px-3 py-1 rounded text-sm hover:bg-rose-700 transition-colors">
                    Excluir
                </button>
            </div>
        </div>
    `).join('');
}

// Burial Form
function updateBurialForm() {
    const funerariaSelect = document.querySelector('select[name="funeraria"]');
    funerariaSelect.innerHTML = '<option value="">Selecione a funerária</option>' +
        funeralHomes.map(fh => `<option value="${fh.nome}">${fh.nome}</option>`).join('');
    
    const sepulturaSelect = document.querySelector('select[name="sepultura"]');
    sepulturaSelect.innerHTML = '<option value="">Selecione uma sepultura aberta</option>' +
        openGraves.map(grave => `<option value="${grave.id}">Quadra ${grave.quadra} - Lote ${grave.lote}</option>`).join('') +
        '<option value="manual">Inserir manualmente</option>';
    
    const agentContainer = document.getElementById('agentSelection');
    if (agents.length === 0) {
        agentContainer.innerHTML = '<p class="text-gray-500 col-span-2">Nenhum agente cadastrado</p>';
    } else {
        agentContainer.innerHTML = agents.map(agent => `
            <label class="flex items-center space-x-2">
                <input type="checkbox" value="${agent.nome}" class="rounded">
                <span class="text-sm">${agent.nome}</span>
            </label>
        `).join('');
    }
}

// Waiting Drawer
function updateWaitingDrawerList() {
    const container = document.getElementById('waitingDrawerList');
    if (waitingDrawer.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">Nenhum resto mortal na gaveta de espera</p>';
        return;
    }
    
    container.innerHTML = waitingDrawer.map(item => `
        <div class="p-4 border border-gray-200 rounded-lg">
            <div class="flex justify-between items-center">
                <div>
                    <h4 class="font-semibold">${item.nomefalecido}</h4>
                    <p class="text-sm text-gray-600">Origem: Quadra ${item.quadraOriginal} - Lote ${item.loteOriginal}</p>
                    <p class="text-sm text-gray-600">Data de entrada: ${item.dataEntrada}</p>
                </div>
                <button onclick="removeFromWaitingDrawer('${item.id}')" class="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors">
                    Remover
                </button>
            </div>
        </div>
    `).join('');
}

// Open Graves Management
function updateOpenGravesManagement() {
    updateOpenGravesStatistics();
    updateOpenGravesManagementList();
}

function updateOpenGravesStatistics() {
    const total = openGraves.length;
    const exhumationCount = openGraves.filter(g => g.origem === 'exumação').length;
    const manualCount = openGraves.filter(g => g.origem === 'abertura-manual').length;
    const otherCount = total - exhumationCount - manualCount;

    document.getElementById('totalOpenGraves').textContent = total;
    document.getElementById('exhumationOrigin').textContent = exhumationCount;
    document.getElementById('manualOrigin').textContent = manualCount;
    document.getElementById('otherOrigin').textContent = otherCount;
}

function updateOpenGravesManagementList() {
    const container = document.getElementById('openGravesManagementList');
    const searchTerm = document.getElementById('searchGraves')?.value.toLowerCase() || '';
    
    let filteredGraves = openGraves;
    if (searchTerm) {
        filteredGraves = openGraves.filter(grave => 
            grave.quadra.toLowerCase().includes(searchTerm) || 
            grave.lote.toLowerCase().includes(searchTerm) ||
            grave.origem.toLowerCase().includes(searchTerm)
        );
    }
    
    if (filteredGraves.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">Nenhuma sepultura encontrada</p>';
        return;
    }
    
    filteredGraves.sort((a, b) => {
        if (a.quadra !== b.quadra) {
            return a.quadra.localeCompare(b.quadra);
        }
        return a.lote.localeCompare(b.lote);
    });
    
    container.innerHTML = filteredGraves.map(grave => `
        <div class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <div class="flex items-center gap-4 mb-2">
                        <h4 class="text-lg font-semibold text-gray-800">Quadra ${grave.quadra} - Lote ${grave.lote}</h4>
                        <span class="px-2 py-1 text-xs font-medium rounded-full ${getOriginBadgeClass(grave.origem)}">
                            ${grave.origem}
                        </span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <p><strong>Data de Abertura:</strong> ${grave.dataAbertura}</p>
                        <p><strong>Origem:</strong> ${grave.origem}</p>
                        ${grave.observacoes ? `<p class="md:col-span-2"><strong>Observações:</strong> ${grave.observacoes}</p>` : ''}
                    </div>
                </div>
                <div class="flex flex-col gap-2 ml-4">
                    <button onclick="editOpenGrave('${grave.id}')" class="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition-colors">
                        Editar
                    </button>
                    <button onclick="removeOpenGrave('${grave.id}')" class="bg-rose-600 text-white px-3 py-1 rounded text-sm hover:bg-rose-700 transition-colors">
                        Remover
                    </button>
                    <button onclick="extendGraveDeadline('${grave.id}')" class="bg-amber-500 text-white px-3 py-1 rounded text-sm hover:bg-amber-600 transition-colors">
                        Prorrogar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function getOriginBadgeClass(origem) {
    switch(origem) {
        case 'exumação': return 'bg-green-100 text-green-800';
        case 'abertura-manual': return 'bg-purple-100 text-purple-800';
        case 'transferência': return 'bg-blue-100 text-blue-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}