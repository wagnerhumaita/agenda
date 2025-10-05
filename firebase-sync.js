// Funções auxiliares para sincronização com Firebase
// Este arquivo contém utilitários para migração e sincronização de dados

// Função para migrar dados do localStorage para Firebase
async function migrateLocalStorageToFirebase() {
    const collections = ['exhumations', 'burials', 'agents', 'funeralHomes', 'openGraves', 'waitingDrawer'];
    
    for (const collectionName of collections) {
        try {
            const localData = JSON.parse(localStorage.getItem(collectionName) || '[]');
            
            if (localData.length > 0) {
                console.log(`Migrando ${localData.length} itens de ${collectionName}...`);
                
                for (const item of localData) {
                    // Remove o ID local antes de salvar no Firebase
                    const { id, ...itemData } = item;
                    
                    // Adiciona timestamp de migração
                    itemData.migratedAt = new Date().toISOString();
                    itemData.originalLocalId = id;
                    
                    await saveToFirebase(collectionName, itemData);
                }
                
                console.log(`✅ Migração de ${collectionName} concluída`);
            }
        } catch (error) {
            console.error(`❌ Erro ao migrar ${collectionName}:`, error);
        }
    }
    
    console.log('🎉 Migração completa! Recarregue a página para ver os dados sincronizados.');
}

// Função para fazer backup dos dados do Firebase
async function backupFirebaseData() {
    const collections = ['exhumations', 'burials', 'agents', 'funeralHomes', 'openGraves', 'waitingDrawer'];
    const backup = {
        timestamp: new Date().toISOString(),
        data: {}
    };
    
    for (const collectionName of collections) {
        try {
            const querySnapshot = await window.firestore.getDocs(
                window.firestore.collection(window.db, collectionName)
            );
            
            const data = [];
            querySnapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });
            
            backup.data[collectionName] = data;
            console.log(`✅ Backup de ${collectionName}: ${data.length} itens`);
        } catch (error) {
            console.error(`❌ Erro no backup de ${collectionName}:`, error);
        }
    }
    
    // Criar arquivo de download
    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-cemiterio-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('💾 Backup salvo como arquivo JSON');
    return backup;
}

// Função para restaurar dados de um backup
async function restoreFromBackup(backupData) {
    if (!backupData || !backupData.data) {
        console.error('❌ Dados de backup inválidos');
        return;
    }
    
    const collections = Object.keys(backupData.data);
    
    for (const collectionName of collections) {
        try {
            const items = backupData.data[collectionName];
            console.log(`Restaurando ${items.length} itens para ${collectionName}...`);
            
            for (const item of items) {
                const { id, ...itemData } = item;
                itemData.restoredAt = new Date().toISOString();
                
                await saveToFirebase(collectionName, itemData);
            }
            
            console.log(`✅ Restauração de ${collectionName} concluída`);
        } catch (error) {
            console.error(`❌ Erro ao restaurar ${collectionName}:`, error);
        }
    }
    
    console.log('🎉 Restauração completa! Recarregue a página para ver os dados.');
}

// Função para sincronizar dados offline
async function syncOfflineData() {
    const collections = ['exhumations', 'burials', 'agents', 'funeralHomes', 'openGraves', 'waitingDrawer'];
    
    for (const collectionName of collections) {
        try {
            // Verificar se há dados offline pendentes
            const offlineKey = `${collectionName}_offline`;
            const offlineData = JSON.parse(localStorage.getItem(offlineKey) || '[]');
            
            if (offlineData.length > 0) {
                console.log(`Sincronizando ${offlineData.length} itens offline de ${collectionName}...`);
                
                for (const item of offlineData) {
                    await saveToFirebase(collectionName, item);
                }
                
                // Limpar dados offline após sincronização
                localStorage.removeItem(offlineKey);
                console.log(`✅ Sincronização de ${collectionName} concluída`);
            }
        } catch (error) {
            console.error(`❌ Erro na sincronização de ${collectionName}:`, error);
        }
    }
}

// Função para verificar conectividade com Firebase
async function checkFirebaseConnection() {
    try {
        // Tentar fazer uma consulta simples
        const testQuery = await window.firestore.getDocs(
            window.firestore.collection(window.db, 'exhumations')
        );
        
        console.log('✅ Conexão com Firebase OK');
        return true;
    } catch (error) {
        console.error('❌ Erro de conexão com Firebase:', error);
        return false;
    }
}

// Função para limpar dados duplicados
async function cleanDuplicateData() {
    const collections = ['exhumations', 'burials', 'agents', 'funeralHomes', 'openGraves', 'waitingDrawer'];
    
    for (const collectionName of collections) {
        try {
            const querySnapshot = await window.firestore.getDocs(
                window.firestore.collection(window.db, collectionName)
            );
            
            const items = [];
            const duplicates = [];
            const seen = new Set();
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const key = JSON.stringify(data);
                
                if (seen.has(key)) {
                    duplicates.push(doc.id);
                } else {
                    seen.add(key);
                    items.push({ id: doc.id, ...data });
                }
            });
            
            // Remover duplicatas
            for (const duplicateId of duplicates) {
                await deleteFromFirebase(collectionName, duplicateId);
            }
            
            if (duplicates.length > 0) {
                console.log(`🧹 Removidas ${duplicates.length} duplicatas de ${collectionName}`);
            }
        } catch (error) {
            console.error(`❌ Erro ao limpar duplicatas de ${collectionName}:`, error);
        }
    }
}

// Disponibilizar funções globalmente para uso no console
window.firebaseUtils = {
    migrateLocalStorageToFirebase,
    backupFirebaseData,
    restoreFromBackup,
    syncOfflineData,
    checkFirebaseConnection,
    cleanDuplicateData
};

console.log('🔧 Utilitários Firebase carregados. Use window.firebaseUtils para acessar as funções.');