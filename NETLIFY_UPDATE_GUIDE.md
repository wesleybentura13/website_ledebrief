# 🚀 Guide de Mise à Jour Netlify

## 🔴 URGENT : Les inscriptions à la newsletter ne fonctionnent pas en production

**Raison :** Les variables d'environnement sur Netlify utilisent les **anciennes clés API** (qui ont été révoquées).

---

## ✅ SOLUTION : Mettre à jour les variables d'environnement

### Étape 1 : Se connecter à Netlify
1. Allez sur https://app.netlify.com
2. Connectez-vous avec votre compte
3. Sélectionnez votre site : **website_ledebrief** (ou le nom de votre site)

### Étape 2 : Accéder aux variables d'environnement
1. Dans le menu latéral, cliquez sur **Site settings**
2. Descendez jusqu'à **Environment variables** (dans la section "Build & deploy")
3. Cliquez sur **Environment variables**

### Étape 3 : Préparer les nouvelles valeurs
Ouvrez votre fichier `.env.local` pour copier les nouvelles clés :

**Dans votre terminal ou éditeur :**
```bash
# Afficher le contenu de .env.local
cat /Users/wesleybentura/website_debriefpodcast/.env.local
```

Vous verrez quelque chose comme :
```
RESEND_API_KEY=re_NG8d...
YOUTUBE_API_KEY=AIzaSyBe_...
OPENAI_API_KEY=sk-proj-VTlkz...
```

**Gardez cette fenêtre ouverte** pour copier les valeurs dans Netlify.

### Étape 4 : Mettre à jour les clés API dans Netlify
Vous devez mettre à jour **3 variables** :

#### 1. RESEND_API_KEY
- Cliquez sur la variable existante
- Cliquez sur **Options** → **Edit**
- **Copiez la nouvelle valeur depuis votre `.env.local`** (commence par `re_...`)
- Cliquez sur **Save**

#### 2. YOUTUBE_API_KEY  
- Cliquez sur la variable existante
- Cliquez sur **Options** → **Edit**
- **Copiez la nouvelle valeur depuis votre `.env.local`** (commence par `AIzaSy...`)
- Cliquez sur **Save**

#### 3. OPENAI_API_KEY
- Cliquez sur la variable existante
- Cliquez sur **Options** → **Edit**
- **Copiez la nouvelle valeur depuis votre `.env.local`** (commence par `sk-proj-...`)
- Cliquez sur **Save**

### Étape 5 : Vérifier les autres variables
Assurez-vous que ces variables existent aussi :

- `NEXT_PUBLIC_YOUTUBE_CHANNEL_ID` = `UCQp1rnvqh08DCfw3ul_D5oA`
- `RESEND_FROM_EMAIL` = `onboarding@resend.dev`
- `RESEND_FROM_NAME` = `Le Débrief Podcast`
- `ADMIN_EMAIL` = `wesleybentura@gmail.com` (ou votre email)

### Étape 6 : Redéployer le site
1. Allez dans l'onglet **Deploys**
2. Cliquez sur **Trigger deploy** → **Deploy site**
3. Attendez que le déploiement se termine (environ 2-3 minutes)

---

## 🧪 Tester après la mise à jour

Une fois le déploiement terminé :

1. Allez sur votre site en production
2. Scrollez jusqu'à la section "Newsletter"
3. Entrez un email de test
4. Cliquez sur "S'abonner"
5. ✅ Vous devriez voir : "Ton inscription est bien prise en compte ! Merci et à très vite dans ta boîte mail 📬"

---

## 🎯 Checklist Rapide

- [ ] Se connecter à Netlify
- [ ] Site settings → Environment variables
- [ ] Mettre à jour RESEND_API_KEY
- [ ] Mettre à jour YOUTUBE_API_KEY
- [ ] Mettre à jour OPENAI_API_KEY
- [ ] Vérifier les autres variables
- [ ] Trigger deploy
- [ ] Tester l'inscription sur le site en production

---

## ⏱️ Temps estimé : 5-10 minutes

---

## 💡 Conseil

Copiez les nouvelles clés depuis votre fichier `.env.local` local pour être sûr d'utiliser les bonnes valeurs.

Pour voir votre `.env.local` :
```bash
cat /Users/wesleybentura/website_debriefpodcast/.env.local
```

---

## 🆘 En cas de problème

Si après la mise à jour ça ne fonctionne toujours pas :
1. Vérifiez les logs de déploiement dans Netlify
2. Assurez-vous qu'il n'y a pas d'erreurs de build
3. Vérifiez que toutes les variables sont bien copiées (sans espaces avant/après)

---

**Une fois fait, les inscriptions fonctionneront en production ! 🎉**
