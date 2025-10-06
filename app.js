// ===== GLOBAL VARIABLES =====
let exhumations = [];
let burials = [];
let agents = [];
let funeralHomes = [];
let openGraves = [];
let waitingDrawer = [];

// ===== FIREBASE HELPER FUNCTIONS =====
async function loadData() {
    try {
        console.log('Carregando dados do Firebase...');
        const collections = ['exhumations', 'burials', 'agents', 'funeralHomes', 'openGraves', 'waitingDrawer'];
        
        for (const collectionName of collections) {
            const querySnapshot = await window.firestore.getDocs(window.firestore.collection(window.db, collectionName));
            const data = [];
            querySnapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });
            
            if (collectionName === 'exhumations') exhumations = data;
            else if (collectionName === 'burials') burials = data;
            else if (collectionName === 'agents') agents = data;
            else if (collectionName === 'funeralHomes') funeralHomes = data;
            else if (collectionName === 'openGraves') openGraves = data;
            else if (collectionName === 'waitingDrawer') waitingDrawer = data;
            
            console.log(`✅ ${collectionName}: ${data.length} itens carregados`);
        }
        
        console.log('✅ Todos os dados carregados do Firebase');
        updateAllViews();
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados do Firebase:', error);
        loadFromLocalStorage();
        updateAllViews();
    }
}

function loadFromLocalStorage() {
    exhumations = JSON.parse(localStorage.getItem('exhumations') || '[]');
    burials = JSON.parse(localStorage.getItem('burials') || '[]');
    agents = JSON.parse(localStorage.getItem('agents') || '[]');
    funeralHomes = JSON.parse(localStorage.getItem('funeralHomes') || '[]');
    openGraves = JSON.parse(localStorage.getItem('openGraves') || '[]');
    waitingDrawer = JSON.parse(localStorage.getItem('waitingDrawer') || '[]');
    console.log('📦 Usando dados do localStorage como fallback');
}

async function saveToFirebase(collectionName, data) {
    try {
        const docRef = await window.firestore.addDoc(window.firestore.collection(window.db, collectionName), data);
        return docRef.id;
    } catch (error) {
        console.error('Erro ao salvar no Firebase:', error);
        const localData = JSON.parse(localStorage.getItem(collectionName) || '[]');
        localData.push(data);
        localStorage.setItem(collectionName, JSON.stringify(localData));
        return Date.now().toString();
    }
}

async function updateFirebase(collectionName, docId, data) {
    try {
        await window.firestore.updateDoc(window.firestore.doc(window.db, collectionName, docId), data);
    } catch (error) {
        console.error('Erro ao atualizar no Firebase:', error);
        const localData = JSON.parse(localStorage.getItem(collectionName) || '[]');
        const index = localData.findIndex(item => item.id === docId);
        if (index !== -1) {
            localData[index] = { ...localData[index], ...data };
            localStorage.setItem(collectionName, JSON.stringify(localData));
        }
    }
}

async function deleteFromFirebase(collectionName, docId) {
    try {
        await window.firestore.deleteDoc(window.firestore.doc(window.db, collectionName, docId));
        console.log(`✅ Item ${docId} excluído do Firebase (${collectionName})`);
        
        // Also update localStorage as backup
        const localData = JSON.parse(localStorage.getItem(collectionName) || '[]');
        const filteredData = localData.filter(item => item.id !== docId);
        localStorage.setItem(collectionName, JSON.stringify(filteredData));
    } catch (error) {
        console.error('❌ Erro ao excluir do Firebase:', error);
        // Fallback to localStorage only
        const localData = JSON.parse(localStorage.getItem(collectionName) || '[]');
        const filteredData = localData.filter(item => item.id !== docId);
        localStorage.setItem(collectionName, JSON.stringify(filteredData));
        throw error; // Re-throw to handle in calling function
    }
}

// ===== UTILITY FUNCTIONS =====
function formatPhone(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length <= 11) {
        value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        if (value.length < 14) {
            value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
    }
    input.value = value;
}

function generateWhatsAppLink(phone) {
    const cleanNumber = phone.replace(/\D/g, '');
    const whatsappNumber = cleanNumber.startsWith('55') ? cleanNumber : '55' + cleanNumber;
    return `https://wa.me/${whatsappNumber}`;
}

function buildDestinationInfo(ex) {
    let destinoInfo = ex.destino;
    if (ex.destino === 'sepultura' && ex.quadraDestino && ex.loteDestino) {
        destinoInfo += ` (Quadra ${ex.quadraDestino} - Lote ${ex.loteDestino})`;
    } else if (ex.destino === 'nicho' && ex.numeroNicho) {
        destinoInfo += ` (${ex.numeroNicho})`;
    } else if (ex.destino === 'sepulcro' && ex.quadraSepulcro && ex.numeroSepulcro) {
        destinoInfo += ` (Quadra ${ex.quadraSepulcro} - Nº ${ex.numeroSepulcro})`;
    } else if (ex.destino === 'traslado' && ex.destinoTraslado) {
        destinoInfo += ` (${ex.destinoTraslado})`;
    } else if ((ex.destino === 'traslado-crematório' || ex.destino === 'traslado') && ex.protocolo) {
        destinoInfo += ` (Protocolo: ${ex.protocolo})`;
    }
    return destinoInfo;
}

function generateExhumationWhatsAppMessage(ex) {
    const greeting = new Date().getHours() < 12 ? 'Bom dia' : 'Boa tarde';
    const dataFormatted = new Date(ex.dataExumacao + 'T00:00:00').toLocaleDateString('pt-BR');
    const destinoInfo = buildDestinationInfo(ex);
    
    return `${greeting}! Confirmação do agendamento de exumação:\n\n*Nome do Falecido:* ${ex.nomefalecido}\n*Data da Exumação:* ${dataFormatted}\n*Localização:* Quadra ${ex.quadra} - Lote ${ex.lote}\n*Destino:* ${destinoInfo}\n*Livro:* ${ex.livro}\n*Página:* ${ex.pagina}\n*Solicitante:* ${ex.solicitante}\n\nAgendamento confirmado!`;
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-6 right-6 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl z-50 transform translate-x-full transition-all duration-500 ease-out';
    successDiv.innerHTML = `
        <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span class="text-lg">✅</span>
            </div>
            <div>
                <div class="font-semibold">Sucesso!</div>
                <div class="text-sm opacity-90">${message}</div>
            </div>
        </div>
    `;
    document.body.appendChild(successDiv);
    
    setTimeout(() => successDiv.classList.remove('translate-x-full'), 100);
    setTimeout(() => {
        successDiv.classList.add('translate-x-full');
        setTimeout(() => successDiv.remove(), 500);
    }, 4000);
}

// ===== NAVIGATION FUNCTIONS =====
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');
    
    if (sectionId === 'dashboard') {
        updateDashboard();
    } else if (sectionId === 'burials') {
        updateBurialForm();
    } else if (sectionId === 'open-graves') {
        updateOpenGravesManagement();
    } else if (sectionId === 'agents') {
        updateAgentsList();
        populateMonthSelector();
    }
}

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.classList.toggle('hidden');
}

// ===== DARK MODE FUNCTIONS =====
function toggleDarkMode() {
    const html = document.documentElement;
    const isDark = html.classList.contains('dark');
    
    if (isDark) {
        html.classList.remove('dark');
        localStorage.setItem('darkMode', 'false');
    } else {
        html.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
    }
    
    setTimeout(() => {
        document.body.style.display = 'none';
        document.body.offsetHeight;
        document.body.style.display = '';
    }, 10);
}

function initializeDarkMode() {
    const savedMode = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedMode === 'true' || (savedMode === null && prefersDark)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

// ===== UPDATE ALL VIEWS =====
function updateAllViews() {
    updateDashboard();
    updateCalendarView();
    updateBurialCalendarView();
    updateWaitingDrawerList();
    updateBurialsList();
    updateAgentsList();
    updateFuneralHomesList();
    updateBurialForm();
    updateOpenGravesManagement();
    populateMonthSelector();
    populateDashboardMonthSelector();
}

// ===== RELOAD DATA FROM FIREBASE =====
async function reloadDataFromFirebase() {
    try {
        console.log('🔄 Recarregando dados do Firebase...');
        await loadData();
        showSuccess('Dados recarregados com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao recarregar dados:', error);
        showSuccess('Erro ao recarregar dados. Usando dados locais.');
    }
}

// ===== DASHBOARD FUNCTIONS =====
function updateDashboard() {
    // Force refresh of counts to ensure accuracy
    const exhumationCount = exhumations ? exhumations.length : 0;
    const burialCount = burials ? burials.length : 0;
    const openGravesCount = openGraves ? openGraves.length : 0;
    const agentCount = agents ? agents.length : 0;
    
    document.getElementById('exhumationCount').textContent = exhumationCount;
    document.getElementById('burialCount').textContent = burialCount;
    document.getElementById('openGravesCount').textContent = openGravesCount;
    document.getElementById('agentCount').textContent = agentCount;
    
    console.log(`📊 Dashboard atualizado: ${exhumationCount} exumações, ${burialCount} sepultamentos, ${openGravesCount} sepulturas abertas, ${agentCount} agentes`);
    updateOpenGravesList();
}

function updateOpenGravesList() {
    const container = document.getElementById('openGravesList');
    if (openGraves.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">Nenhuma sepultura aberta no momento</p>';
        return;
    }
    
    container.innerHTML = openGraves.map(grave => `
        <div class="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
            <div>
                <span class="font-semibold">Quadra ${grave.quadra} - Lote ${grave.lote}</span>
                <span class="text-sm text-gray-600 ml-4">Aberta em: ${grave.dataAbertura}</span>
                <span class="text-sm text-blue-600 ml-4">Origem: ${grave.origem}</span>
            </div>
            <button onclick="extendExhumationDeadline('${grave.id}')" class="bg-amber-500 text-white px-3 py-1 rounded text-sm hover:bg-amber-600 transition-colors">
                Prorrogar Prazo
            </button>
        </div>
    `).join('');
}

// ===== FORM SUBMISSION FUNCTIONS =====
async function scheduleExhumation(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    data.status = 'agendada';
    data.whatsappLink = generateWhatsAppLink(data.telefone);
    data.agenteSepultador = '';
    data.conclusao = '';
    data.createdAt = new Date().toISOString();
    
    const docId = await saveToFirebase('exhumations', data);
    data.id = docId;
    exhumations.push(data);
    
    showSuccess('Exumação agendada com sucesso!');
    event.target.reset();
    document.getElementById('destinationFields').innerHTML = '';
    updateCalendarView();
    updateDashboard();
}

async function scheduleBurial(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    data.agentes = Array.from(document.querySelectorAll('#agentSelection input:checked')).map(cb => cb.value);
    data.createdAt = new Date().toISOString();
    data.status = 'pendente-sepultura'; // Status inicial
    data.quadra = '';
    data.lote = '';
    data.sepultura = '';
    
    // Use custom time if selected
    if (data.horario === 'custom') {
        data.horario = data.horarioCustom;
    }
    
    const docId = await saveToFirebase('burials', data);
    data.id = docId;
    burials.push(data);
    
    showSuccess('Sepultamento agendado com sucesso! Status: Pendente de Sepultura');
    event.target.reset();
    updateBurialsList();
    updateBurialCalendarView();
    updateBurialForm();
    updateDashboard();
}

async function registerAgent(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    data.whatsappLink = generateWhatsAppLink(data.telefone);
    data.createdAt = new Date().toISOString();
    
    const docId = await saveToFirebase('agents', data);
    data.id = docId;
    agents.push(data);
    
    showSuccess('Agente cadastrado com sucesso!');
    event.target.reset();
    updateAgentsList();
    updateBurialForm();
    updateDashboard();
}

async function registerOpenGrave(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    const graveId = `${data.quadra}-${data.lote}`;
    const existingGrave = openGraves.find(g => g.id === graveId);
    
    if (existingGrave) {
        alert('Esta sepultura já está cadastrada como aberta!');
        return;
    }
    
    data.dataAbertura = new Date().toLocaleDateString('pt-BR');
    data.dataCadastro = new Date().toISOString();
    data.graveId = graveId;
    
    const docId = await saveToFirebase('openGraves', data);
    data.id = docId;
    openGraves.push(data);
    
    showSuccess('Sepultura aberta cadastrada com sucesso!');
    event.target.reset();
    updateOpenGravesManagement();
    updateBurialForm();
    updateDashboard();
}

async function registerFuneralHome(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    data.whatsappLink = generateWhatsAppLink(data.telefone);
    data.createdAt = new Date().toISOString();
    
    const docId = await saveToFirebase('funeralHomes', data);
    data.id = docId;
    funeralHomes.push(data);
    
    showSuccess('Funerária cadastrada com sucesso!');
    event.target.reset();
    updateFuneralHomesList();
    updateBurialForm();
}

// ===== DESTINATION FIELDS =====
function showDestinationFields(destination) {
    const fieldsContainer = document.getElementById('destinationFields');
    fieldsContainer.innerHTML = '';

    switch(destination) {
        case 'nicho':
            fieldsContainer.innerHTML = `
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Número do Nicho *</label>
                    <input type="text" name="numeroNicho" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Ex: N-123A">
                </div>
            `;
            break;
        case 'sepulcro':
            fieldsContainer.innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Quadra do Sepulcro *</label>
                        <input type="text" name="quadraSepulcro" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Número do Sepulcro *</label>
                        <input type="text" name="numeroSepulcro" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                </div>
            `;
            break;
        case 'sepultura':
            fieldsContainer.innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Quadra *</label>
                        <input type="text" name="quadraDestino" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Ex: A, B, 1, 2">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Lote *</label>
                        <input type="text" name="loteDestino" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Ex: 123, 45A">
                    </div>
                </div>
            `;
            break;
        case 'traslado-crematório':
            fieldsContainer.innerHTML = `
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Número do Protocolo *</label>
                    <input type="text" name="protocolo" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
            `;
            break;
        case 'traslado':
            fieldsContainer.innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Destino *</label>
                        <input type="text" name="destinoTraslado" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Número do Protocolo *</label>
                        <input type="text" name="protocolo" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                </div>
            `;
            break;
    }
}

// ===== TOGGLE FUNCTIONS =====
function toggleManualGrave(value) {
    const manualFields = document.getElementById('manualGraveFields');
    const quadraInput = document.querySelector('input[name="quadraManual"]');
    const loteInput = document.querySelector('input[name="loteManual"]');
    
    if (value === 'manual') {
        manualFields.classList.remove('hidden');
        quadraInput.required = true;
        loteInput.required = true;
    } else {
        manualFields.classList.add('hidden');
        quadraInput.required = false;
        loteInput.required = false;
        quadraInput.value = '';
        loteInput.value = '';
    }
}

function toggleBurialsList() {
    const container = document.getElementById('burialsListContainer');
    const icon = document.getElementById('burialsToggleIcon');
    const text = document.getElementById('burialsToggleText');
    
    if (container.classList.contains('hidden')) {
        container.classList.remove('hidden');
        icon.textContent = '▲';
        text.textContent = 'Ocultar';
    } else {
        container.classList.add('hidden');
        icon.textContent = '▼';
        text.textContent = 'Mostrar';
    }
}

// ===== FILTER FUNCTIONS =====
function filterBurials() {
    const searchTerm = document.getElementById('searchBurials').value.toLowerCase();
    
    if (!searchTerm) {
        renderBurialsList(burials);
        return;
    }
    
    const filteredBurials = burials.filter(burial => 
        burial.nomefalecido.toLowerCase().includes(searchTerm) ||
        burial.funeraria.toLowerCase().includes(searchTerm) ||
        (burial.quadra && burial.quadra.toLowerCase().includes(searchTerm)) ||
        (burial.lote && burial.lote.toLowerCase().includes(searchTerm)) ||
        (burial.velorio && burial.velorio.toLowerCase().includes(searchTerm))
    );
    
    renderBurialsList(filteredBurials);
}

function filterOpenGraves() {
    updateOpenGravesManagementList();
}

function filterExhumations() {
    updateCalendarView();
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async function() {
    initializeDarkMode();
    showSuccess('Carregando dados do Firebase...');
    await loadData();
    setTimeout(() => showSuccess('Dados carregados com sucesso!'), 500);
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('calendarDate').value = today;
    document.getElementById('burialCalendarDate').value = today;
    
    // Add keyboard shortcut to reload data (Ctrl+R or F5)
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey && e.key === 'r') || e.key === 'F5') {
            e.preventDefault();
            reloadDataFromFirebase();
        }
    });
    
    document.addEventListener('click', function(e) {
        const mobileMenu = document.getElementById('mobileMenu');
        const menuButton = e.target.closest('button[onclick="toggleMobileMenu()"]');
        
        if (!mobileMenu.contains(e.target) && !menuButton && !mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
        }
    });
    
    document.addEventListener('change', function(e) {
        if (e.target.name === 'horario') {
            const customField = document.getElementById('customTimeField');
            if (e.target.value === 'custom') {
                customField.classList.remove('hidden');
                customField.querySelector('input').required = true;
            } else {
                customField.classList.add('hidden');
                customField.querySelector('input').required = false;
            }
        }
    });
});