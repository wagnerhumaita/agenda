// ===== EXHUMATION MANAGEMENT FUNCTIONS =====
async function updateExhumationAgent(exhumationId, agentName) {
    const exhumation = exhumations.find(ex => ex.id === exhumationId);
    if (exhumation) {
        exhumation.agenteSepultador = agentName;
        await updateFirebase('exhumations', exhumationId, { agenteSepultador: agentName });
        showSuccess('Agente atualizado com sucesso!');
    }
}

function editExhumation(exhumationId) {
    const exhumation = exhumations.find(ex => ex.id === exhumationId);
    if (!exhumation) return;
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <h3 class="text-lg font-bold mb-4">Editar Exumação</h3>
            <form onsubmit="saveExhumationEdit(event, '${exhumationId}')">
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">Data da Exumação</label>
                        <input type="date" name="dataExumacao" value="${exhumation.dataExumacao}" required class="w-full px-3 py-2 border rounded">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Nome do Falecido</label>
                        <input type="text" name="nomefalecido" value="${exhumation.nomefalecido}" required class="w-full px-3 py-2 border rounded">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Quadra</label>
                        <input type="text" name="quadra" value="${exhumation.quadra}" required class="w-full px-3 py-2 border rounded">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Lote</label>
                        <input type="text" name="lote" value="${exhumation.lote}" required class="w-full px-3 py-2 border rounded">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Solicitante</label>
                        <input type="text" name="solicitante" value="${exhumation.solicitante}" required class="w-full px-3 py-2 border rounded">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Telefone</label>
                        <input type="tel" name="telefone" value="${exhumation.telefone}" required class="w-full px-3 py-2 border rounded">
                    </div>
                </div>
                <div class="flex gap-3">
                    <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Salvar</button>
                    <button type="button" onclick="this.closest('.fixed').remove()" class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Cancelar</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
}

async function saveExhumationEdit(event, exhumationId) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    const exhumation = exhumations.find(ex => ex.id === exhumationId);
    if (exhumation) {
        Object.assign(exhumation, data);
        exhumation.whatsappLink = generateWhatsAppLink(data.telefone);
        await updateFirebase('exhumations', exhumationId, { ...data, whatsappLink: exhumation.whatsappLink });
        showSuccess('Exumação atualizada com sucesso!');
        updateCalendarView();
        event.target.closest('.fixed').remove();
    }
}

function completeExhumation(exhumationId) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 class="text-lg font-bold mb-4">Concluir Exumação</h3>
            <div class="space-y-3">
                <button onclick="finishExhumation('${exhumationId}', 'exumado')" class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
                    Exumado
                </button>
                <button onclick="showExtensionOptions('${exhumationId}')" class="w-full bg-yellow-600 text-white py-2 rounded hover:bg-yellow-700">
                    Não saiu + prazo
                </button>
                <button onclick="finishExhumation('${exhumationId}', 'gaveta-espera')" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                    Gaveta de Espera
                </button>
                <button onclick="this.closest('.fixed').remove()" class="w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-700">
                    Cancelar
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function showExtensionOptions(exhumationId) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 class="text-lg font-bold mb-4">Prorrogar Prazo</h3>
            <div class="space-y-3">
                <button onclick="finishExhumation('${exhumationId}', 'prorrogado-1-ano')" class="w-full bg-yellow-600 text-white py-2 rounded hover:bg-yellow-700">
                    + 1 ano
                </button>
                <button onclick="finishExhumation('${exhumationId}', 'prorrogado-2-anos')" class="w-full bg-yellow-600 text-white py-2 rounded hover:bg-yellow-700">
                    + 2 anos
                </button>
                <button onclick="finishExhumation('${exhumationId}', 'prorrogado-3-anos')" class="w-full bg-yellow-600 text-white py-2 rounded hover:bg-yellow-700">
                    + 3 anos
                </button>
                <div class="flex gap-2">
                    <input type="number" id="customYears" placeholder="Anos" class="flex-1 px-3 py-2 border rounded">
                    <button onclick="finishExhumation('${exhumationId}', 'prorrogado-' + document.getElementById('customYears').value + '-anos')" class="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">
                        Confirmar
                    </button>
                </div>
                <button onclick="this.closest('.fixed').remove()" class="w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-700">
                    Voltar
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function finishExhumation(exhumationId, conclusion) {
    const exhumation = exhumations.find(ex => ex.id === exhumationId);
    if (!exhumation) return;
    
    exhumation.status = 'concluída';
    exhumation.conclusao = conclusion;
    
    const graveId = `${exhumation.quadra}-${exhumation.lote}`;
    
    if (conclusion === 'exumado' || conclusion === 'gaveta-espera') {
        if (!openGraves.find(g => g.graveId === graveId)) {
            const graveData = {
                graveId: graveId,
                quadra: exhumation.quadra,
                lote: exhumation.lote,
                dataAbertura: new Date().toLocaleDateString('pt-BR'),
                origem: 'exumação',
                dataCadastro: new Date().toISOString()
            };
            const docId = await saveToFirebase('openGraves', graveData);
            graveData.id = docId;
            openGraves.push(graveData);
        }
        
        if (conclusion === 'gaveta-espera') {
            const drawerData = {
                nomefalecido: exhumation.nomefalecido,
                quadraOriginal: exhumation.quadra,
                loteOriginal: exhumation.lote,
                dataEntrada: new Date().toLocaleDateString('pt-BR'),
                createdAt: new Date().toISOString()
            };
            const docId = await saveToFirebase('waitingDrawer', drawerData);
            drawerData.id = docId;
            waitingDrawer.push(drawerData);
            updateWaitingDrawerList();
        }
    }
    
    await updateFirebase('exhumations', exhumationId, { status: 'concluída', conclusao: conclusion });
    showSuccess('Exumação concluída!');
    updateCalendarView();
    updateDashboard();
    
    document.querySelectorAll('.fixed').forEach(modal => modal.remove());
}

function editExhumationConclusion(exhumationId) {
    completeExhumation(exhumationId);
}

async function deleteExhumation(exhumationId) {
    if (confirm('Tem certeza que deseja EXCLUIR permanentemente esta exumação? Esta ação não pode ser desfeita.')) {
        try {
            await deleteFromFirebase('exhumations', exhumationId);
            exhumations = exhumations.filter(ex => ex.id !== exhumationId);
            showSuccess('Exumação excluída permanentemente!');
            updateCalendarView();
            updateDashboard();
            updateAllViews();
        } catch (error) {
            console.error('Erro ao excluir exumação:', error);
            showSuccess('Erro ao excluir exumação. Tente novamente.');
        }
    }
}

// ===== BURIAL MANAGEMENT FUNCTIONS =====
function editBurialAgents(burialId) {
    const burial = burials.find(b => b.id === burialId);
    if (!burial) return;
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 class="text-lg font-bold mb-4">Editar Agentes - ${burial.nomefalecido}</h3>
            <div class="space-y-2 max-h-60 overflow-y-auto">
                ${agents.map(agent => `
                    <label class="flex items-center space-x-2">
                        <input type="checkbox" value="${agent.nome}" ${burial.agentes?.includes(agent.nome) ? 'checked' : ''}>
                        <span>${agent.nome}</span>
                    </label>
                `).join('')}
            </div>
            <div class="flex gap-3 mt-6">
                <button onclick="saveAgentChanges('${burialId}', this.parentElement.parentElement)" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Salvar
                </button>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
                    Cancelar
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function saveAgentChanges(burialId, modal) {
    const burial = burials.find(b => b.id === burialId);
    const selectedAgents = Array.from(modal.querySelectorAll('input:checked')).map(cb => cb.value);
    burial.agentes = selectedAgents;
    await updateFirebase('burials', burialId, { agentes: selectedAgents });
    modal.parentElement.remove();
    updateBurialsList();
    updateBurialCalendarView();
    showSuccess('Agentes atualizados com sucesso!');
}

function editBurial(burialId) {
    const burial = burials.find(b => b.id === burialId);
    if (!burial) return;
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <h3 class="text-lg font-bold mb-4">Editar Sepultamento</h3>
            <form onsubmit="saveBurialEdit(event, '${burialId}')">
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">Nome do Falecido</label>
                        <input type="text" name="nomefalecido" value="${burial.nomefalecido}" required class="w-full px-3 py-2 border rounded">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Data</label>
                        <input type="date" name="data" value="${burial.data}" required class="w-full px-3 py-2 border rounded">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Horário</label>
                        <input type="time" name="horario" value="${burial.horario}" required class="w-full px-3 py-2 border rounded">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Funerária</label>
                        <select name="funeraria" required class="w-full px-3 py-2 border rounded">
                            ${funeralHomes.map(fh => `<option value="${fh.nome}" ${burial.funeraria === fh.nome ? 'selected' : ''}>${fh.nome}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Quadra</label>
                        <input type="text" name="quadra" value="${burial.quadra}" required class="w-full px-3 py-2 border rounded">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Lote</label>
                        <input type="text" name="lote" value="${burial.lote}" required class="w-full px-3 py-2 border rounded">
                    </div>
                    <div class="col-span-2">
                        <label class="block text-sm font-medium mb-1">Velório</label>
                        <input type="text" name="velorio" value="${burial.velorio || ''}" class="w-full px-3 py-2 border rounded">
                    </div>
                </div>
                <div class="flex gap-3">
                    <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Salvar</button>
                    <button type="button" onclick="this.closest('.fixed').remove()" class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Cancelar</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
}

async function saveBurialEdit(event, burialId) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    const burial = burials.find(b => b.id === burialId);
    if (burial) {
        Object.assign(burial, data);
        await updateFirebase('burials', burialId, data);
        showSuccess('Sepultamento atualizado com sucesso!');
        updateBurialsList();
        updateBurialCalendarView();
        event.target.closest('.fixed').remove();
    }
}

async function deleteBurial(burialId) {
    if (confirm('Tem certeza que deseja EXCLUIR permanentemente este sepultamento? Esta ação não pode ser desfeita.')) {
        try {
            await deleteFromFirebase('burials', burialId);
            burials = burials.filter(b => b.id !== burialId);
            showSuccess('Sepultamento excluído permanentemente!');
            updateBurialsList();
            updateBurialCalendarView();
            updateDashboard();
            updateFuneralHomesList();
            updateAllViews();
        } catch (error) {
            console.error('Erro ao excluir sepultamento:', error);
            showSuccess('Erro ao excluir sepultamento. Tente novamente.');
        }
    }
}

function defineBurialGrave(burialId) {
    const burial = burials.find(b => b.id === burialId);
    if (!burial) return;
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 class="text-lg font-bold mb-4">🏗️ Definir Sepultura</h3>
            <p class="text-sm text-gray-600 mb-4">Sepultamento: <strong>${burial.nomefalecido}</strong></p>
            
            <form onsubmit="saveBurialGrave(event, '${burialId}')">
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">Escolha uma opção:</label>
                        <div class="space-y-2">
                            <label class="flex items-center space-x-2">
                                <input type="radio" name="graveOption" value="existing" checked onchange="toggleGraveFields()">
                                <span>Usar sepultura aberta existente</span>
                            </label>
                            <label class="flex items-center space-x-2">
                                <input type="radio" name="graveOption" value="manual" onchange="toggleGraveFields()">
                                <span>Inserir manualmente</span>
                            </label>
                        </div>
                    </div>
                    
                    <div id="existingGraveField">
                        <label class="block text-sm font-medium mb-2">Sepultura Aberta *</label>
                        <select name="sepultura" required class="w-full px-3 py-2 border rounded">
                            <option value="">Selecione uma sepultura</option>
                            ${openGraves.map(grave => `<option value="${grave.id}">Quadra ${grave.quadra} - Lote ${grave.lote}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div id="manualGraveFields" class="hidden space-y-3">
                        <div>
                            <label class="block text-sm font-medium mb-2">Quadra *</label>
                            <input type="text" name="quadraManual" class="w-full px-3 py-2 border rounded" placeholder="Ex: A, B, 1, 2">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">Lote *</label>
                            <input type="text" name="loteManual" class="w-full px-3 py-2 border rounded" placeholder="Ex: 123, 45A">
                        </div>
                    </div>
                </div>
                
                <div class="flex gap-3 mt-6">
                    <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium">
                        ✅ Definir Sepultura
                    </button>
                    <button type="button" onclick="this.closest('.fixed').remove()" class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
}

function toggleGraveFields() {
    const existingField = document.getElementById('existingGraveField');
    const manualFields = document.getElementById('manualGraveFields');
    const selectedOption = document.querySelector('input[name="graveOption"]:checked').value;
    const sepulturaSelect = document.querySelector('select[name="sepultura"]');
    const quadraInput = document.querySelector('input[name="quadraManual"]');
    const loteInput = document.querySelector('input[name="loteManual"]');
    
    if (selectedOption === 'existing') {
        existingField.classList.remove('hidden');
        manualFields.classList.add('hidden');
        sepulturaSelect.required = true;
        quadraInput.required = false;
        loteInput.required = false;
        quadraInput.value = '';
        loteInput.value = '';
    } else {
        existingField.classList.add('hidden');
        manualFields.classList.remove('hidden');
        sepulturaSelect.required = false;
        quadraInput.required = true;
        loteInput.required = true;
        sepulturaSelect.value = '';
    }
}

async function saveBurialGrave(event, burialId) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    const burial = burials.find(b => b.id === burialId);
    if (!burial) return;
    
    let quadra, lote, sepulturaId;
    
    if (data.graveOption === 'existing') {
        const selectedGrave = openGraves.find(g => g.id === data.sepultura);
        if (!selectedGrave) {
            alert('Sepultura selecionada não encontrada!');
            return;
        }
        quadra = selectedGrave.quadra;
        lote = selectedGrave.lote;
        sepulturaId = selectedGrave.id;
        
        // Remove the grave from open graves
        await deleteFromFirebase('openGraves', selectedGrave.id);
        openGraves = openGraves.filter(g => g.id !== selectedGrave.id);
    } else {
        quadra = data.quadraManual;
        lote = data.loteManual;
        sepulturaId = `${quadra}-${lote}`;
    }
    
    // Update burial with grave information
    burial.quadra = quadra;
    burial.lote = lote;
    burial.sepultura = sepulturaId;
    burial.status = 'sepultura-definida';
    
    await updateFirebase('burials', burialId, {
        quadra: quadra,
        lote: lote,
        sepultura: sepulturaId,
        status: 'sepultura-definida'
    });
    
    showSuccess('Sepultura definida com sucesso!');
    updateBurialsList();
    updateBurialCalendarView();
    updateDashboard();
    updateOpenGravesManagement();
    
    event.target.closest('.fixed').remove();
}

// ===== AGENT MANAGEMENT FUNCTIONS =====
function editAgent(agentId) {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 class="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">Editar Agente</h3>
            <form onsubmit="saveAgentEdit(event, '${agentId}')">
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nome Completo *</label>
                        <input type="text" name="nome" value="${agent.nome}" required class="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-300">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Telefone *</label>
                        <input type="tel" name="telefone" value="${agent.telefone}" required oninput="formatPhone(this)" class="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-300">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">RGF *</label>
                        <input type="text" name="rgf" value="${agent.rgf}" required class="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-300">
                    </div>
                </div>
                <div class="flex gap-3 mt-8">
                    <button type="submit" class="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300">
                        Salvar Alterações
                    </button>
                    <button type="button" onclick="this.closest('.fixed').remove()" class="flex-1 bg-gradient-to-r from-slate-600 to-slate-700 text-white py-3 rounded-xl font-semibold hover:from-slate-700 hover:to-slate-800 transition-all duration-300">
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
}

async function saveAgentEdit(event, agentId) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    const agent = agents.find(a => a.id === agentId);
    if (agent) {
        const oldName = agent.nome;
        Object.assign(agent, data);
        agent.whatsappLink = generateWhatsAppLink(data.telefone);
        
        if (oldName !== data.nome) {
            exhumations.forEach(ex => {
                if (ex.agenteSepultador === oldName) {
                    ex.agenteSepultador = data.nome;
                }
            });
            
            burials.forEach(burial => {
                if (burial.agentes && burial.agentes.includes(oldName)) {
                    const index = burial.agentes.indexOf(oldName);
                    burial.agentes[index] = data.nome;
                }
            });
        }
        
        await updateFirebase('agents', agentId, { ...data, whatsappLink: agent.whatsappLink });
        showSuccess('Agente atualizado com sucesso!');
        updateAgentsList();
        updateBurialForm();
        event.target.closest('.fixed').remove();
    }
}

async function deleteAgent(agentId) {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;
    
    const hasExhumations = exhumations.some(ex => ex.agenteSepultador === agent.nome);
    const hasBurials = burials.some(burial => burial.agentes && burial.agentes.includes(agent.nome));
    
    let confirmMessage = `Tem certeza que deseja EXCLUIR permanentemente o agente "${agent.nome}"?`;
    
    if (hasExhumations || hasBurials) {
        confirmMessage += `\n\nATENÇÃO: Este agente possui trabalhos registrados no sistema. Ao excluí-lo, os trabalhos permanecerão mas sem agente associado.`;
    }
    
    if (confirm(confirmMessage)) {
        try {
            // Update exhumations and burials to remove agent references
            const exhumationsToUpdate = exhumations.filter(ex => ex.agenteSepultador === agent.nome);
            const burialsToUpdate = burials.filter(burial => burial.agentes && burial.agentes.includes(agent.nome));
            
            // Update Firebase for affected exhumations
            for (const ex of exhumationsToUpdate) {
                ex.agenteSepultador = '';
                await updateFirebase('exhumations', ex.id, { agenteSepultador: '' });
            }
            
            // Update Firebase for affected burials
            for (const burial of burialsToUpdate) {
                burial.agentes = burial.agentes.filter(name => name !== agent.nome);
                await updateFirebase('burials', burial.id, { agentes: burial.agentes });
            }
            
            // Remove agent from local array and Firebase
            agents = agents.filter(a => a.id !== agentId);
            await deleteFromFirebase('agents', agentId);
            
            showSuccess('Agente excluído permanentemente!');
            updateAgentsList();
            updateBurialForm();
            updateDashboard();
            updateAllViews();
        } catch (error) {
            console.error('Erro ao excluir agente:', error);
            showSuccess('Erro ao excluir agente. Tente novamente.');
        }
    }
}

function viewAgentDetails(agentName) {
    const agent = agents.find(a => a.nome === agentName);
    if (!agent) return;
    
    const agentExhumations = exhumations.filter(ex => ex.agenteSepultador === agentName);
    const agentBurials = burials.filter(burial => burial.agentes && burial.agentes.includes(agentName));
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-2xl font-bold text-slate-800 dark:text-slate-200">Detalhes do Agente</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-2xl">×</button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h4 class="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Informações Pessoais</h4>
                    <div class="space-y-3">
                        <p><strong>Nome:</strong> ${agent.nome}</p>
                        <p><strong>RGF:</strong> ${agent.rgf}</p>
                        <p><strong>Telefone:</strong> ${agent.telefone}</p>
                    </div>
                    
                    <h4 class="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 mt-6">Estatísticas</h4>
                    <div class="grid grid-cols-3 gap-4">
                        <div class="text-center p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                            <div class="text-2xl font-bold text-teal-600 dark:text-teal-400">${agentExhumations.length}</div>
                            <div class="text-xs text-slate-600 dark:text-slate-400">Exumações</div>
                        </div>
                        <div class="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">${agentBurials.length}</div>
                            <div class="text-xs text-slate-600 dark:text-slate-400">Sepultamentos</div>
                        </div>
                        <div class="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                            <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">${agentExhumations.length + agentBurials.length}</div>
                            <div class="text-xs text-slate-600 dark:text-slate-400">Total</div>
                        </div>
                    </div>
                </div>
                
                <div>
                    <h4 class="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Trabalhos Recentes</h4>
                    <div class="space-y-2 max-h-48 overflow-y-auto">
                        ${[...agentExhumations.map(ex => ({
                            type: 'Exumação',
                            date: ex.dataExumacao,
                            description: `${ex.nomefalecido} - Q${ex.quadra} L${ex.lote}`,
                            color: 'teal'
                        })), ...agentBurials.map(burial => ({
                            type: 'Sepultamento',
                            date: burial.data,
                            description: `${burial.nomefalecido} - Q${burial.quadra} L${burial.lote}`,
                            color: 'purple'
                        }))].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10).map(work => `
                            <div class="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700 rounded">
                                <div>
                                    <span class="text-sm font-medium text-${work.color}-600 dark:text-${work.color}-400">${work.type}</span>
                                    <p class="text-xs text-slate-600 dark:text-slate-400">${work.description}</p>
                                </div>
                                <span class="text-xs text-slate-500 dark:text-slate-400">${new Date(work.date).toLocaleDateString('pt-BR')}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// ===== FUNERAL HOME MANAGEMENT FUNCTIONS =====
function editFuneralHome(funeralHomeId) {
    const funeralHome = funeralHomes.find(fh => fh.id === funeralHomeId);
    if (!funeralHome) return;
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 class="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">Editar Funerária</h3>
            <form onsubmit="saveFuneralHomeEdit(event, '${funeralHomeId}')">
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nome da Funerária *</label>
                        <input type="text" name="nome" value="${funeralHome.nome}" required class="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-xl focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 dark:focus:border-rose-400 transition-all duration-300">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Telefone *</label>
                        <input type="tel" name="telefone" value="${funeralHome.telefone}" required oninput="formatPhone(this)" class="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-xl focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 dark:focus:border-rose-400 transition-all duration-300">
                    </div>
                </div>
                <div class="flex gap-3 mt-8">
                    <button type="submit" class="flex-1 bg-gradient-to-r from-rose-600 to-rose-700 text-white py-3 rounded-xl font-semibold hover:from-rose-700 hover:to-rose-800 transition-all duration-300">
                        Salvar Alterações
                    </button>
                    <button type="button" onclick="this.closest('.fixed').remove()" class="flex-1 bg-gradient-to-r from-slate-600 to-slate-700 text-white py-3 rounded-xl font-semibold hover:from-slate-700 hover:to-slate-800 transition-all duration-300">
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
}

async function saveFuneralHomeEdit(event, funeralHomeId) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    const funeralHome = funeralHomes.find(fh => fh.id === funeralHomeId);
    if (funeralHome) {
        const oldName = funeralHome.nome;
        Object.assign(funeralHome, data);
        funeralHome.whatsappLink = generateWhatsAppLink(data.telefone);
        
        if (oldName !== data.nome) {
            burials.forEach(burial => {
                if (burial.funeraria === oldName) {
                    burial.funeraria = data.nome;
                }
            });
        }
        
        await updateFirebase('funeralHomes', funeralHomeId, { ...data, whatsappLink: funeralHome.whatsappLink });
        showSuccess('Funerária atualizada com sucesso!');
        updateFuneralHomesList();
        updateBurialForm();
        event.target.closest('.fixed').remove();
    }
}

async function deleteFuneralHome(funeralHomeId) {
    const funeralHome = funeralHomes.find(fh => fh.id === funeralHomeId);
    if (!funeralHome) return;
    
    const hasBurials = burials.some(burial => burial.funeraria === funeralHome.nome);
    
    let confirmMessage = `Tem certeza que deseja EXCLUIR permanentemente a funerária "${funeralHome.nome}"?`;
    
    if (hasBurials) {
        confirmMessage += `\n\nATENÇÃO: Esta funerária possui sepultamentos registrados no sistema. Ao excluí-la, os sepultamentos permanecerão mas sem funerária associada.`;
    }
    
    if (confirm(confirmMessage)) {
        try {
            // Update burials to remove funeral home references
            const burialsToUpdate = burials.filter(burial => burial.funeraria === funeralHome.nome);
            
            // Update Firebase for affected burials
            for (const burial of burialsToUpdate) {
                burial.funeraria = '';
                await updateFirebase('burials', burial.id, { funeraria: '' });
            }
            
            // Remove funeral home from local array and Firebase
            funeralHomes = funeralHomes.filter(fh => fh.id !== funeralHomeId);
            await deleteFromFirebase('funeralHomes', funeralHomeId);
            
            showSuccess('Funerária excluída permanentemente!');
            updateFuneralHomesList();
            updateBurialForm();
            updateAllViews();
        } catch (error) {
            console.error('Erro ao excluir funerária:', error);
            showSuccess('Erro ao excluir funerária. Tente novamente.');
        }
    }
}

// ===== OPEN GRAVES MANAGEMENT FUNCTIONS =====
function editOpenGrave(graveId) {
    const grave = openGraves.find(g => g.id === graveId);
    if (!grave) return;
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 class="text-lg font-bold mb-4">Editar Sepultura Aberta</h3>
            <form onsubmit="saveOpenGraveEdit(event, '${graveId}')">
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">Quadra</label>
                        <input type="text" name="quadra" value="${grave.quadra}" required class="w-full px-3 py-2 border rounded">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Lote</label>
                        <input type="text" name="lote" value="${grave.lote}" required class="w-full px-3 py-2 border rounded">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Origem</label>
                        <select name="origem" required class="w-full px-3 py-2 border rounded">
                            <option value="exumação" ${grave.origem === 'exumação' ? 'selected' : ''}>Exumação</option>
                            <option value="abertura-manual" ${grave.origem === 'abertura-manual' ? 'selected' : ''}>Abertura Manual</option>
                            <option value="transferência" ${grave.origem === 'transferência' ? 'selected' : ''}>Transferência</option>
                            <option value="outros" ${grave.origem === 'outros' ? 'selected' : ''}>Outros</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Observações</label>
                        <textarea name="observacoes" rows="3" class="w-full px-3 py-2 border rounded">${grave.observacoes || ''}</textarea>
                    </div>
                </div>
                <div class="flex gap-3 mt-6">
                    <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Salvar</button>
                    <button type="button" onclick="this.closest('.fixed').remove()" class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Cancelar</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
}

async function saveOpenGraveEdit(event, oldGraveId) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    const newGraveId = `${data.quadra}-${data.lote}`;
    
    if (newGraveId !== oldGraveId && openGraves.find(g => g.graveId === newGraveId)) {
        alert('Já existe uma sepultura aberta com esta quadra e lote!');
        return;
    }
    
    const graveIndex = openGraves.findIndex(g => g.id === oldGraveId);
    if (graveIndex !== -1) {
        const existingGrave = openGraves[graveIndex];
        const updatedData = {
            ...data,
            graveId: newGraveId
        };
        
        openGraves[graveIndex] = {
            ...existingGrave,
            ...updatedData
        };
        
        await updateFirebase('openGraves', oldGraveId, updatedData);
        showSuccess('Sepultura atualizada com sucesso!');
        updateOpenGravesManagement();
        updateBurialForm();
        event.target.closest('.fixed').remove();
    }
}

async function removeOpenGrave(graveId) {
    if (confirm('Tem certeza que deseja remover esta sepultura da lista de abertas?')) {
        await deleteFromFirebase('openGraves', graveId);
        openGraves = openGraves.filter(g => g.id !== graveId);
        showSuccess('Sepultura removida da lista!');
        updateOpenGravesManagement();
        updateBurialForm();
        updateDashboard();
    }
}

async function extendGraveDeadline(graveId) {
    const years = prompt('Quantos anos a mais? (1, 2, 3 ou mais)', '1');
    if (years && !isNaN(years) && years > 0) {
        const grave = openGraves.find(g => g.id === graveId);
        if (grave) {
            grave.prorrogacao = (grave.prorrogacao || 0) + parseInt(years);
            grave.ultimaProrrogacao = new Date().toLocaleDateString('pt-BR');
            await updateFirebase('openGraves', graveId, { 
                prorrogacao: grave.prorrogacao, 
                ultimaProrrogacao: grave.ultimaProrrogacao 
            });
            showSuccess(`Prazo prorrogado por ${years} ano(s) para a sepultura ${graveId}`);
            updateOpenGravesManagement();
        }
    }
}

function extendExhumationDeadline(graveId) {
    const years = prompt('Quantos anos a mais? (1, 2, 3 ou mais)', '1');
    if (years && !isNaN(years)) {
        showSuccess(`Prazo prorrogado por ${years} ano(s) para a sepultura ${graveId}`);
    }
}

// ===== WAITING DRAWER FUNCTIONS =====
async function removeFromWaitingDrawer(itemId) {
    if (confirm('Tem certeza que deseja remover este item da gaveta de espera?')) {
        await deleteFromFirebase('waitingDrawer', itemId);
        waitingDrawer = waitingDrawer.filter(item => item.id !== itemId);
        updateWaitingDrawerList();
        showSuccess('Item removido da gaveta de espera!');
    }
}