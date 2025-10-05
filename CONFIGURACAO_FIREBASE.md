# Configuração do Firebase para o Sistema de Gestão Cemiterial

## Pré-requisitos
1. Conta no Google/Firebase
2. Projeto criado no Firebase Console

## Passos para Configuração

### 1. Criar Projeto no Firebase
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Digite o nome do projeto (ex: "sistema-cemiterio")
4. Configure o Google Analytics (opcional)
5. Clique em "Criar projeto"

### 2. Configurar Firestore Database
1. No painel do projeto, clique em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha "Iniciar no modo de teste" (para desenvolvimento)
4. Selecione a localização (preferencialmente próxima ao Brasil)
5. Clique em "Concluído"

### 3. Configurar Regras de Segurança (Desenvolvimento)
No Firestore, vá para "Regras" e use:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**ATENÇÃO**: Essas regras são apenas para desenvolvimento. Para produção, implemente regras de segurança adequadas.

### 4. Obter Credenciais do Projeto
1. No painel do projeto, clique no ícone de engrenagem ⚙️
2. Selecione "Configurações do projeto"
3. Role para baixo até "Seus aplicativos"
4. Clique em "Adicionar aplicativo" e selecione "Web" (ícone </>)
5. Digite um nome para o app (ex: "sistema-cemiterio-web")
6. Marque "Configurar também o Firebase Hosting" (opcional)
7. Clique em "Registrar app"
8. Copie as credenciais mostradas

### 5. Configurar as Credenciais no Sistema
1. Abra o arquivo `cemiterio - v2.html`
2. Localize a seção de configuração do Firebase (linha ~15)
3. Substitua os valores placeholder pelas suas credenciais:

```javascript
const firebaseConfig = {
    apiKey: "sua-api-key-real",
    authDomain: "seu-projeto-real.firebaseapp.com",
    projectId: "seu-projeto-id-real",
    storageBucket: "seu-projeto-real.appspot.com",
    messagingSenderId: "seu-numero-real",
    appId: "sua-app-id-real"
};
```

### 6. Estrutura das Coleções no Firestore
O sistema criará automaticamente as seguintes coleções:

- **exhumations**: Dados das exumações
- **burials**: Dados dos sepultamentos  
- **agents**: Dados dos agentes sepultadores
- **funeralHomes**: Dados das funerárias
- **openGraves**: Dados das sepulturas abertas
- **waitingDrawer**: Dados da gaveta de espera

### 7. Migração de Dados Existentes (Opcional)
Se você já possui dados no localStorage, eles serão mantidos como fallback caso o Firebase não esteja disponível.

Para migrar dados existentes:
1. Abra o console do navegador (F12)
2. Execute o seguinte código para cada coleção:

```javascript
// Exemplo para exumações
const localExhumations = JSON.parse(localStorage.getItem('exhumations') || '[]');
localExhumations.forEach(async (item) => {
    await saveToFirebase('exhumations', item);
});
```

### 8. Configurações de Produção

#### Regras de Segurança Recomendadas:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura e escrita apenas para usuários autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### Autenticação (Opcional):
Para adicionar autenticação:
1. No Firebase Console, vá para "Authentication"
2. Clique em "Começar"
3. Configure os provedores desejados (Email/senha, Google, etc.)
4. Implemente a autenticação no código

### 9. Monitoramento e Backup
1. Configure alertas no Firebase Console
2. Implemente backup regular dos dados
3. Monitore o uso e custos

### 10. Solução de Problemas

#### Erro de CORS:
Se encontrar erros de CORS, certifique-se de que:
- O domínio está autorizado no Firebase Console
- As regras do Firestore estão corretas

#### Dados não aparecem:
- Verifique as credenciais do Firebase
- Abra o console do navegador para ver erros
- Verifique se as regras do Firestore permitem acesso

#### Fallback para localStorage:
O sistema automaticamente usa localStorage se o Firebase não estiver disponível.

## Custos
- Firestore oferece um plano gratuito generoso
- Para uso básico do sistema, provavelmente ficará dentro do limite gratuito
- Monitore o uso no Firebase Console

## Suporte
Para problemas específicos do Firebase, consulte:
- [Documentação oficial](https://firebase.google.com/docs)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)
- [Comunidade Firebase](https://firebase.google.com/community)