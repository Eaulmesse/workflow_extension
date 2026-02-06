# Cours : API minimale (endpoints, handler, router)

Ce document explique comment fonctionne la communication Popup ↔ Background dans l’extension, avec l’exemple minimal déjà en place dans le projet.

---

## 1. Vue d’ensemble

L’extension a deux contextes qui ne partagent pas la mémoire :

- **Popup** : la petite fenêtre quand on clique sur l’icône (UI).
- **Background** : le script qui tourne en arrière-plan (logique, storage).

Ils communiquent uniquement par **messages** :

```
Popup  --message-->  Background  --réponse-->  Popup
```

Dans le projet, un message a toujours la forme :

- **Requête** : `{ endpoint: string, payload?: ... }`
- **Réponse** : `{ success: boolean, data?: ..., error?: string }`

L’exemple minimal fait exactement ça : le popup envoie `workflows/list`, le background répond avec une liste (en dur), le popup l’affiche.

---

## 2. Les fichiers de l’exemple minimal

### 2.1 `src/api/types.ts`

**Rôle** : Définir le format de tous les messages (requête et réponse).

- **MessageRequest** : ce que le popup envoie (`endpoint` + `payload` optionnel).
- **MessageResponse\<T\>** : ce que le background renvoie (`success`, `data` ou `error`).

Tout le monde (popup, router, handlers) utilise ces types pour rester cohérent.

---

### 2.2 `src/api/workflows/workflow.endpoints.ts`

**Rôle** : Centraliser les **noms** des endpoints pour les workflows.

- Constantes : `LIST`, `GET`, `CREATE`, etc.
- Valeurs : `'workflows/list'`, `'workflows/get'`, …

Pourquoi un fichier dédié ?

- Éviter les typos (`'workflow/list'` vs `'workflows/list'`).
- Un seul endroit à modifier si tu changes un nom.
- Le popup et le router utilisent les mêmes constantes.

---

### 2.3 `src/api/workflows/WorkflowHandler.ts`

**Rôle** : Traiter les requêtes qui concernent les workflows.

- **handleList()** : retourne une liste (ici en dur).
- **handleGet(payload)** : retourne un workflow par id (exemple minimal).

Chaque méthode :

1. Reçoit les infos nécessaires (éventuellement via `payload`).
2. Fait le travail (pour l’instant données en dur ; plus tard : appeler un service / StorageManager).
3. Retourne un `MessageResponse<T>` : `{ success, data }` ou `{ success: false, error }`.

Le handler ne connaît pas le popup ni Chrome : il ne fait que “répondre à une question” (liste des workflows, détail d’un workflow, etc.).

---

### 2.4 `src/background/router.ts`

**Rôle** : Recevoir **tous** les messages et les envoyer au bon handler.

- Il connaît les endpoints (via `WORKFLOW_ENDPOINTS`) et le `WorkflowHandler`.
- Pour chaque message, il regarde `message.endpoint` :
  - si c’est `workflows/list` → il appelle `workflowHandler.handleList()`;
  - si c’est `workflows/get` → il appelle `workflowHandler.handleGet(payload)`.
- Il retourne la `MessageResponse` renvoyée par le handler (ou une erreur “endpoint inconnu”).

Donc : **un seul point d’entrée** (`handle(message)`), et tout le tri se fait ici.

---

### 2.5 `src/background/background.ts`

**Rôle** : Point d’entrée du background (service worker).

- Au démarrage / à l’installation : appelle `migrateStorage()` pour initialiser le storage.
- Ensuite : enregistre un listener `chrome.runtime.onMessage`.
  - Quand un message arrive, il appelle `router.handle(message)`.
  - La réponse est renvoyée au popup avec `sendResponse(...)`.
  - `return true` est nécessaire pour que Chrome garde le canal ouvert jusqu’à ce que la réponse soit envoyée (réponse asynchrone).

Donc le background ne contient **pas** la logique métier : il délègue tout au router.

---

### 2.6 `src/popup/popup.ts`

**Rôle** : Afficher l’UI et parler au background.

- Au chargement de la page (`DOMContentLoaded`), il appelle une fonction `loadWorkflows()`.
- `loadWorkflows()` :
  1. Construit un message : `{ endpoint: WORKFLOW_ENDPOINTS.LIST }` (pas de payload pour une liste).
  2. Envoie le message avec `chrome.runtime.sendMessage(...)`.
  3. Dans le callback (ou la Promise), reçoit la `MessageResponse`.
  4. Si `success` et `data`, affiche les workflows dans `#app` ; sinon affiche l’erreur.

Tu peux faire la même chose pour un autre endpoint (par ex. `workflows/get` avec `payload: { id: '1' }`) pour voir le flux “get” de bout en bout.

---

## 3. Parcours d’un message (exemple : workflows/list)

Ordre réel d’exécution :

1. **Popup** : utilisateur ouvre le popup → `DOMContentLoaded` → `loadWorkflows()`.
2. **Popup** : `chrome.runtime.sendMessage({ endpoint: 'workflows/list' })`.
3. **Background** : `chrome.runtime.onMessage` reçoit le message.
4. **Background** : `router.handle(message)` est appelé.
5. **Router** : `message.endpoint === 'workflows/list'` → appelle `workflowHandler.handleList()`.
6. **WorkflowHandler** : `handleList()` retourne `{ success: true, data: { '1': {...}, '2': {...} } }`.
7. **Router** : retourne cette réponse à `background.ts`.
8. **Background** : `sendResponse(response)` envoie la réponse au popup.
9. **Popup** : le callback de `sendMessage` reçoit la réponse et met à jour `#app`.

Tu peux mettre des `console.log` dans le handler, le router et le background pour suivre ce parcours.

---

## 4. Tester l’exemple minimal

1. Build : `npm run build` (ou `npm run dev`).
2. Dans Chrome : `chrome://extensions` → “Charger l’extension non empaquetée” → dossier `dist`.
3. Cliquer sur l’icône de l’extension pour ouvrir le popup.
4. Tu dois voir s’afficher la liste des deux workflows en dur (“1: Workflow de test”, “2: Autre workflow”).
5. Ouvrir la console du **service worker** (lien “Inspecter le service worker” sur la carte de l’extension) et éventuellement la console du **popup** (clic droit sur le popup → Inspecter) pour vérifier qu’il n’y a pas d’erreur.
npm
Si ça affiche bien la liste, le flux Popup → Background → Router → Handler → Réponse → Popup est en place.

---

## 5. Étapes suivantes (pour apprendre en faisant)

- **Ajouter un endpoint** : par ex. `workflows/get` est déjà dans le router et le handler ; dans le popup, appelle `sendMessage({ endpoint: WORKFLOW_ENDPOINTS.GET, payload: { id: '1' } })` et affiche `response.data`.
- **Brancher le StorageManager** : dans `WorkflowHandler.handleList()`, au lieu de retourner des données en dur, récupérer une instance du `StorageManager`, appeler `getAll('workflows')`, et retourner `{ success: true, data: workflows }`.
- **Créer un vrai service** : ajouter un `WorkflowService` qui utilise le `StorageManager`, et faire appeler ce service par le `WorkflowHandler` (le handler ne parle plus au storage directement, seulement au service).

Une fois que tu as fait ces trois étapes, tu as le même schéma que décrit dans ton architecture : Popup → Background → Router → Handler → Service → Storage.

---

## 6. Résumé

| Fichier | Rôle |
|--------|------|
| `api/types.ts` | Format des messages (requête / réponse). |
| `api/workflows/workflow.endpoints.ts` | Noms des endpoints workflows. |
| `api/workflows/WorkflowHandler.ts` | Logique de traitement des requêtes “workflows”. |
| `background/router.ts` | Aiguillage message → bon handler. |
| `background/background.ts` | Écoute des messages, appelle le router, envoie la réponse. |
| `popup/popup.ts` | Envoie des messages (ex. `workflows/list`) et affiche la réponse. |

L’exemple minimal ne contient pas encore de service ni de storage ; il sert uniquement à faire fonctionner ce flux de messages de bout en bout. Une fois que tu le vois tourner, tu peux remplacer les données en dur par des appels au `StorageManager` puis à un `WorkflowService`.
