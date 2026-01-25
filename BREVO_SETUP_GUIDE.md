# 🚀 Configuration Newsletter avec Brevo

## ✅ Avantages de Brevo

- 📧 **300 emails/jour gratuits**
- 👥 **Contacts illimités**
- 📊 **Statistiques détaillées** (taux d'ouverture, clics)
- 📝 **Éditeur d'emails** drag & drop
- 🎯 **Campagnes newsletters** professionnelles
- ✅ **Conforme RGPD**

---

## 📋 ÉTAPE 1 : Créer un compte Brevo

### 1.1 Inscription
1. Allez sur : https://www.brevo.com/fr/
2. Cliquez sur **"S'inscrire gratuitement"**
3. Remplissez le formulaire :
   - Email : `wesleybentura@gmail.com`
   - Mot de passe : (créez-en un sécurisé)
   - Nom de l'entreprise : "Le Débrief Podcast"

### 1.2 Validation
1. Vérifiez votre boîte mail
2. Cliquez sur le lien de confirmation
3. Complétez votre profil si demandé

### 1.3 Plan gratuit
- ✅ Sélectionnez le plan **"Free"**
- ✅ 300 emails/jour
- ✅ Contacts illimités

---

## 📋 ÉTAPE 2 : Obtenir la clé API

### 2.1 Accéder aux paramètres
1. Connectez-vous à Brevo : https://app.brevo.com
2. Cliquez sur votre **nom** (en haut à droite)
3. Sélectionnez **"Paramètres"** ou **"Settings"**

### 2.2 Créer une clé API
1. Dans le menu gauche : **"Clés API"** (ou **"API Keys"**)
2. Cliquez sur **"Créer une nouvelle clé API"**
3. Nom de la clé : **"Website Newsletter"**
4. Permissions : Gardez les permissions par défaut (accès complet)
5. Cliquez sur **"Générer"**

### 2.3 Copier la clé
- ⚠️ **IMPORTANT** : La clé ne sera affichée qu'une seule fois !
- Format : `xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Copiez-la** et gardez-la en sécurité

### 2.4 Ajouter la clé dans votre projet
Ajoutez la clé dans votre fichier `.env.local` :

```env
BREVO_API_KEY=xkeysib-votre-cle-ici
```

---

## 📋 ÉTAPE 3 : Créer une liste de contacts

### 3.1 Accéder aux listes
1. Dans Brevo, allez dans **"Contacts"**
2. Cliquez sur **"Listes"** (dans le sous-menu)

### 3.2 Créer une nouvelle liste
1. Cliquez sur **"Créer une liste"**
2. Nom de la liste : **"Newsletter Le Débrief"**
3. Description (optionnel) : "Inscrits à la newsletter du podcast"
4. Cliquez sur **"Créer"**

### 3.3 Récupérer l'ID de la liste
1. Cliquez sur votre liste "Newsletter Le Débrief"
2. Dans l'URL, notez le numéro de la liste
   - Exemple : `https://app.brevo.com/contact/list/id/123`
   - L'ID est : **123**
3. Ajoutez-le dans `.env.local` :

```env
BREVO_LIST_ID=123
```

---

## 📋 ÉTAPE 4 : Configuration du projet

### 4.1 Variables d'environnement
Votre fichier `.env.local` doit contenir :

```env
# Existing keys
NEXT_PUBLIC_YOUTUBE_CHANNEL_ID=UCQp1rnvqh08DCfw3ul_D5oA
YOUTUBE_API_KEY=AIzaSyBe_InQ40_MJ-ad4LJ7G8lsq7FgYy-hMn8
OPENAI_API_KEY=sk-proj-VTlkzqW0...

# Brevo configuration
BREVO_API_KEY=xkeysib-votre-cle-api-brevo
BREVO_LIST_ID=123
ADMIN_EMAIL=wesleybentura@gmail.com
```

### 4.2 Configuration Netlify
Ajoutez ces mêmes variables dans Netlify :
1. Netlify Dashboard → Votre site
2. **Site settings** → **Environment variables**
3. Ajoutez :
   - `BREVO_API_KEY` = votre clé Brevo
   - `BREVO_LIST_ID` = votre ID de liste
   - `ADMIN_EMAIL` = wesleybentura@gmail.com

---

## 📋 ÉTAPE 5 : Configuration de l'expéditeur

### 5.1 Vérifier un domaine ou email d'expédition
1. Dans Brevo : **Paramètres** → **Expéditeurs et domaines**
2. Cliquez sur **"Ajouter un expéditeur"**
3. Options :
   - **Option A (simple)** : Utilisez un email gratuit
     - Email : `wesleybentura@gmail.com`
     - Nom : "Le Débrief Podcast"
   - **Option B (pro)** : Configurez votre propre domaine
     - Email : `newsletter@ledebriefpodcast.com`
     - Suivez les instructions DNS

4. Validez l'email (cliquez sur le lien reçu par email)

### 5.2 Ajouter dans .env.local
```env
BREVO_SENDER_EMAIL=wesleybentura@gmail.com
BREVO_SENDER_NAME=Le Débrief Podcast
```

---

## 📋 ÉTAPE 6 : Test de l'intégration

Une fois tout configuré :

### 6.1 En local
```bash
# Démarrez le serveur local
npm run dev

# Allez sur http://localhost:3000
# Testez l'inscription à la newsletter
```

### 6.2 Vérification dans Brevo
1. Allez dans **Contacts** → **Tous les contacts**
2. Cherchez l'email de test
3. Vérifiez qu'il est bien dans la liste "Newsletter Le Débrief"

### 6.3 Vérification des emails
- Vous devriez recevoir un email de bienvenue
- Vous devriez recevoir une notification admin

---

## 📋 ÉTAPE 7 : Déploiement en production

### 7.1 Pusher le code
```bash
git add -A
git commit -m "Integrate Brevo for newsletter management"
git push origin main
```

### 7.2 Attendre le déploiement Netlify
- Le build prendra 2-3 minutes
- Vérifiez qu'il est "Published"

### 7.3 Tester en production
- Allez sur votre site en production
- Inscrivez-vous avec un vrai email
- Vérifiez dans Brevo que le contact est ajouté

---

## 📊 ÉTAPE 8 : Gérer vos inscrits

### Voir tous les inscrits
1. Brevo Dashboard → **Contacts**
2. Filtrez par liste : "Newsletter Le Débrief"
3. Vous verrez tous vos inscrits avec leurs infos

### Exporter en CSV
1. **Contacts** → **Tous les contacts**
2. Cliquez sur **"Exporter"**
3. Sélectionnez la liste
4. Format : CSV
5. Téléchargez

### Statistiques
- **Campagnes** : Voir le taux d'ouverture
- **Rapports** : Statistiques détaillées
- **Tableaux de bord** : Vue d'ensemble

---

## 🎯 ÉTAPE 9 : Envoyer votre première newsletter

### 9.1 Créer une campagne
1. **Campagnes** → **Créer une campagne**
2. Type : **Email**
3. Choisissez un template ou créez le vôtre

### 9.2 Configurer
- **Expéditeur** : Le Débrief Podcast
- **Destinataires** : Liste "Newsletter Le Débrief"
- **Objet** : Ex: "🎙️ Nouvel épisode : [Titre]"

### 9.3 Contenu
Utilisez l'éditeur drag & drop pour créer un bel email avec :
- Logo du podcast
- Résumé de l'épisode
- Lien YouTube
- Liens réseaux sociaux

### 9.4 Envoyer
- **Test** : Envoyez-vous un test d'abord
- **Planifier** ou **Envoyer immédiatement**

---

## ✅ Checklist complète

- [ ] Compte Brevo créé
- [ ] Clé API obtenue
- [ ] Liste "Newsletter Le Débrief" créée
- [ ] ID de liste récupéré
- [ ] Expéditeur validé
- [ ] Variables d'environnement configurées (local)
- [ ] Variables d'environnement configurées (Netlify)
- [ ] Test en local réussi
- [ ] Code déployé en production
- [ ] Test en production réussi
- [ ] Premier inscrit visible dans Brevo

---

## 🆘 Support

### Problèmes courants

**"Invalid API key"**
- Vérifiez que la clé commence par `xkeysib-`
- Vérifiez qu'elle est bien copiée (sans espaces)

**"List not found"**
- Vérifiez l'ID de la liste dans l'URL Brevo
- L'ID doit être un nombre (ex: 123)

**"Sender not validated"**
- Vérifiez vos emails, cliquez sur le lien de validation
- Attendez quelques minutes après validation

### Documentation Brevo
- API Docs : https://developers.brevo.com/
- Support : https://help.brevo.com/

---

## 🎉 Résultat final

Après configuration complète :
- ✅ Formulaire d'inscription fonctionnel
- ✅ Contacts automatiquement ajoutés à Brevo
- ✅ Email de bienvenue automatique
- ✅ Notification admin à chaque inscription
- ✅ Interface Brevo pour gérer vos inscrits
- ✅ Statistiques et analytics
- ✅ Possibilité d'envoyer des newsletters pros

---

**Commencez par créer votre compte Brevo, puis on configure tout le reste ! 🚀**
