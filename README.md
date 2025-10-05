# Sistema de Gestão Cemiterial com Firebase

## 📋 Visão Geral
Sistema completo para gestão de cemitérios com integração Firebase para armazenamento em nuvem, incluindo:
- Agendamento de exumações
- Controle de sepultamentos
- Gestão de agentes sepultadores
- Cadastro de funerárias
- Controle de sepulturas abertas
- Gaveta de espera
- Relatórios e estatísticas

## 🚀 Principais Melhorias com Firebase
- ✅ **Armazenamento em nuvem**: Dados seguros e acessíveis de qualquer lugar
- ✅ **Sincronização automática**: Múltiplos usuários podem trabalhar simultaneamente
- ✅ **Backup automático**: Dados protegidos contra perda
- ✅ **Fallback inteligente**: Sistema funciona offline usando localStorage
- ✅ **Escalabilidade**: Suporta crescimento do volume de dados

## 📁 Arquivos do Sistema

### Arquivos Principais
- `cemiterio - v2.html` - Aplicação principal com integração Firebase
- `firebase-config.js` - Configurações do Firebase (personalizar)
- `firebase-sync.js` - Utilitários para sincronização e backup

### Documentação
- `README.md` - Este arquivo
- `CONFIGURACAO_FIREBASE.md` - Guia detalhado de configuração

## ⚙️ Configuração Rápida

### 1. Configurar Firebase
1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Ative o Firestore Database
3. Copie as credenciais do projeto
4. Edite o arquivo `cemiterio - v2.html` na linha ~15 com suas credenciais

### 2. Executar o Sistema
1. Abra `cemiterio - v2.html` em um navegador moderno
2. O sistema carregará automaticamente os dados do Firebase
3. Se for a primeira vez, os dados do localStorage serão mantidos como fallback

## 🔧 Funcionalidades Firebase

### Carregamento Automático
- Dados são carregados automaticamente do Firebase na inicialização
- Fallback para localStorage se Firebase não estiver disponível

### Salvamento em Tempo Real
- Todas as operações são salvas automaticamente no Firebase
- Backup local mantido para segurança

### Utilitários Disponíveis
Abra o console do navegador (F12) e use:

```javascript
// Migrar dados do localStorage para Firebase
await window.firebaseUtils.migrateLocalStorageToFirebase();

// Fazer backup dos dados
await window.firebaseUtils.backupFirebaseData();

// Verificar conexão
await window.firebaseUtils.checkFirebaseConnection();

// Limpar dados duplicados
await window.firebaseUtils.cleanDuplicateData();
```

## 📊 Estrutura dos Dados

### Coleções Firebase
- **exhumations**: Dados das exumações
- **burials**: Dados dos sepultamentos
- **agents**: Dados dos agentes sepultadores
- **funeralHomes**: Dados das funerárias
- **openGraves**: Dados das sepulturas abertas
- **waitingDrawer**: Dados da gaveta de espera

### Campos Adicionais
Cada documento inclui:
- `createdAt`: Timestamp de criação
- `id`: ID único do documento Firebase

## 🔒 Segurança

### Desenvolvimento
```javascript
// Regras permissivas para desenvolvimento
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Produção (Recomendado)
```javascript
// Regras com autenticação
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 📱 Compatibilidade
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Dispositivos móveis (responsivo)

## 🛠️ Solução de Problemas

### Dados não aparecem
1. Verifique as credenciais do Firebase
2. Abra o console (F12) para ver erros
3. Verifique as regras do Firestore

### Erro de CORS
1. Verifique se o domínio está autorizado no Firebase
2. Certifique-se de que está usando HTTPS (para produção)

### Performance lenta
1. Verifique a conexão com internet
2. Considere implementar paginação para grandes volumes
3. Use índices no Firestore para consultas complexas

## 💰 Custos Firebase
- **Plano Spark (Gratuito)**:
  - 1GB de armazenamento
  - 50.000 leituras/dia
  - 20.000 escritas/dia
  - Suficiente para uso básico

- **Plano Blaze (Pago)**:
  - Cobrança por uso
  - Ideal para uso intensivo

## 🔄 Migração de Dados Existentes

Se você já tem dados no localStorage:

1. Abra o console do navegador (F12)
2. Execute:
```javascript
await window.firebaseUtils.migrateLocalStorageToFirebase();
```
3. Recarregue a página

## 📈 Monitoramento
- Use o Firebase Console para monitorar uso
- Configure alertas para limites de cota
- Implemente logs personalizados se necessário

## 🆘 Suporte
- Consulte `CONFIGURACAO_FIREBASE.md` para detalhes
- [Documentação Firebase](https://firebase.google.com/docs)
- [Comunidade Firebase](https://firebase.google.com/community)

## 📝 Changelog

### v2.0 - Integração Firebase
- ✅ Integração completa com Firebase Firestore
- ✅ Sincronização automática de dados
- ✅ Fallback para localStorage
- ✅ Utilitários de backup e migração
- ✅ Melhor tratamento de erros
- ✅ Documentação completa

### v1.0 - Versão Original
- Sistema básico com localStorage
- Funcionalidades principais implementadas

## 🤝 Contribuição
Para contribuir com melhorias:
1. Faça backup dos dados antes de modificar
2. Teste em ambiente de desenvolvimento
3. Documente as alterações
4. Mantenha compatibilidade com versões anteriores