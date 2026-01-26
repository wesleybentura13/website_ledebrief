# 🤖 Guide d'Automatisation de la Newsletter

## 🎯 Objectif

Envoyer **automatiquement** une newsletter à tous vos abonnés dès qu'un nouvel épisode est publié sur YouTube, avec un teaser généré par IA.

---

## ✨ Fonctionnalités

✅ **Détection automatique** des nouveaux épisodes YouTube  
✅ **Récupération automatique** de la transcription  
✅ **Génération d'un teaser** attractif avec OpenAI  
✅ **Envoi automatique** à tous les abonnés Brevo  
✅ **Tracking** pour éviter les doublons  
✅ **Sécurisé** avec un token secret  

---

## 🔧 Configuration (10 minutes)

### Étape 1 : Ajouter la variable CRON_SECRET

Pour sécuriser l'endpoint, créez un secret :

#### En local (`.env.local`)

Ajoutez cette ligne :

```env
CRON_SECRET=votre-secret-aleatoire-123456
```

⚠️ **Générez un secret fort** : utilisez un générateur de mots de passe aléatoires.

#### Sur Netlify

1. **Site settings** → **Environment variables**
2. Ajoutez :
   - Variable : `CRON_SECRET`
   - Value : `votre-secret-aleatoire-123456`
3. Ajoutez aussi (si pas déjà fait) :
   - `NEXT_PUBLIC_BASE_URL` = `https://votre-site.netlify.app`

---

### Étape 2 : Ajouter `data/sent-newsletters.json` au `.gitignore`

Ce fichier est déjà créé mais doit être ignoré par Git (pour éviter les conflits) :

Vérifiez que `.gitignore` contient :

```gitignore
# Newsletter tracking
data/sent-newsletters.json
```

Si ce n'est pas le cas, ajoutez-le.

---

### Étape 3 : Tester en local

#### 3.1 Démarrez le serveur

```bash
npm run dev
```

#### 3.2 Appelez l'endpoint

```bash
curl -X POST http://localhost:3000/api/newsletter/auto-send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer votre-secret-aleatoire-123456"
```

#### 3.3 Résultat attendu

Si un nouvel épisode est détecté :

```json
{
  "ok": true,
  "message": "Newsletter sent successfully",
  "episode": "#XX - Titre de l'épisode",
  "videoId": "xxxxx"
}
```

Si l'épisode a déjà été envoyé :

```json
{
  "ok": true,
  "message": "Newsletter already sent for this episode",
  "episode": "#XX - Titre de l'épisode"
}
```

---

### Étape 4 : Déployer sur Netlify

```bash
git add -A
git commit -m "Add newsletter automation system"
git push origin main
```

Attendez que Netlify déploie (2-3 minutes).

---

## 🕐 Configuration du Cron Job (Automatisation)

Pour que la newsletter s'envoie automatiquement, il faut appeler l'endpoint régulièrement. Voici 3 options :

---

### Option 1 : cron-job.org (RECOMMANDÉ - Gratuit)

**C'est la solution la plus simple et gratuite.**

#### 1. Créez un compte

👉 https://cron-job.org/en/signup/

#### 2. Créez un nouveau cron job

- **URL** : `https://votre-site.netlify.app/api/newsletter/auto-send`
- **HTTP Method** : `POST`
- **Schedule** : 
  - Toutes les heures : `0 * * * *`
  - Toutes les 3 heures : `0 */3 * * *`
  - Toutes les 6 heures : `0 */6 * * *`
- **HTTP Headers** :
  - `Content-Type`: `application/json`
  - `Authorization`: `Bearer votre-secret-aleatoire-123456`

#### 3. Activez le job

✅ Votre newsletter s'enverra automatiquement !

---

### Option 2 : EasyCron (Gratuit jusqu'à 100 jobs/jour)

👉 https://www.easycron.com/

1. Créez un compte
2. Créez un nouveau cron job
3. **URL** : `https://votre-site.netlify.app/api/newsletter/auto-send`
4. **Méthode** : POST
5. **Headers** : 
   ```
   Content-Type: application/json
   Authorization: Bearer votre-secret-aleatoire-123456
   ```
6. **Fréquence** : Toutes les heures

---

### Option 3 : GitHub Actions (Gratuit illimité)

Si vous voulez tout garder sur GitHub :

Créez `.github/workflows/newsletter-cron.yml` :

```yaml
name: Send Newsletter

on:
  schedule:
    # Runs every hour
    - cron: '0 * * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  send-newsletter:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Newsletter
        run: |
          curl -X POST ${{ secrets.SITE_URL }}/api/newsletter/auto-send \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

Ajoutez les secrets dans GitHub :
- `Settings` → `Secrets and variables` → `Actions`
- Ajoutez `SITE_URL` et `CRON_SECRET`

---

## 📧 Que se passe-t-il lors de l'envoi automatique ?

1. **Le cron job appelle** `/api/newsletter/auto-send`
2. **Le système vérifie** le dernier épisode YouTube
3. **Si c'est un nouvel épisode** :
   - 📝 Récupère la transcription
   - 🤖 Génère un teaser attractif avec OpenAI
   - 📧 Envoie un email à **tous** les abonnés Brevo
   - ✅ Enregistre l'épisode comme "envoyé"
4. **Si l'épisode a déjà été envoyé** : Ne fait rien (évite les doublons)

---

## 📊 Template de l'Email Envoyé

Les abonnés reçoivent un email magnifique avec :

✅ **Badge "Nouvel Épisode"**  
✅ **Thumbnail** de l'épisode (image YouTube)  
✅ **Titre** de l'épisode  
✅ **Teaser** généré par IA (200 mots max)  
✅ **Bouton YouTube** (Call-to-action principal)  
✅ **Bouton Spotify** (alternatif)  
✅ **Liens réseaux sociaux** (YouTube, Spotify, Instagram, TikTok)  
✅ **Lien de désabonnement** (obligatoire)  

Le design est **responsive** et magnifique sur mobile et desktop ! 📱💻

---

## 🧪 Comment tester manuellement ?

### Test 1 : Vérifier que l'endpoint fonctionne

```bash
curl https://votre-site.netlify.app/api/newsletter/auto-send
```

Résultat :

```json
{
  "ok": true,
  "message": "Auto Newsletter API is ready. Use POST with Authorization header to trigger.",
  "endpoint": "/api/newsletter/auto-send",
  "method": "POST"
}
```

### Test 2 : Déclencher manuellement

```bash
curl -X POST https://votre-site.netlify.app/api/newsletter/auto-send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer votre-secret-aleatoire-123456"
```

### Test 3 : Tester avec un faux secret (doit échouer)

```bash
curl -X POST https://votre-site.netlify.app/api/newsletter/auto-send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer MAUVAIS_SECRET"
```

Résultat attendu :

```json
{
  "ok": false,
  "error": "Unauthorized"
}
```

✅ C'est sécurisé !

---

## 🔍 Suivre les envois

### Voir les épisodes déjà envoyés

Le fichier `data/sent-newsletters.json` contient la liste :

```json
[
  {
    "videoId": "xxxxx",
    "title": "#XX - Titre de l'épisode",
    "sentAt": "2026-01-26T12:00:00.000Z"
  }
]
```

### Réinitialiser (pour tester)

Si vous voulez **forcer un renvoi** pour tester :

```bash
echo "[]" > data/sent-newsletters.json
```

⚠️ **Attention** : Cela renverra la newsletter à tous vos abonnés !

---

## 🎛️ Paramètres personnalisables

### Fréquence du cron

**Recommandé** : Toutes les 3-6 heures (pour ne pas surcharger l'API)

- **Toutes les heures** : `0 * * * *`
- **Toutes les 3 heures** : `0 */3 * * *`
- **Toutes les 6 heures** : `0 */6 * * *`
- **Une fois par jour à 10h** : `0 10 * * *`

### Personnaliser le template

Le template d'email est dans la fonction `generateNewsletterTemplate()` du fichier :

```
src/app/api/newsletter/auto-send/route.ts
```

Vous pouvez modifier :
- Les couleurs
- Le texte
- Les boutons
- Le footer
- Etc.

---

## 🆘 Dépannage

### Problème : "Unauthorized"

**Cause** : Le secret est incorrect ou manquant.

**Solution** :
1. Vérifiez que `CRON_SECRET` est défini dans `.env.local` (local) et Netlify (production)
2. Vérifiez que le header `Authorization: Bearer XXX` est correct

### Problème : "No episodes found"

**Cause** : L'API YouTube ne retourne pas d'épisodes.

**Solution** :
1. Vérifiez que `NEXT_PUBLIC_YOUTUBE_CHANNEL_ID` est correct
2. Vérifiez le quota YouTube API

### Problème : "Failed to send newsletter"

**Cause** : Erreur avec Brevo.

**Solution** :
1. Vérifiez que toutes les variables Brevo sont configurées
2. Vérifiez que la clé API Brevo est valide
3. Vérifiez que la liste ID existe

### Problème : Le teaser n'est pas généré

**Cause** : Erreur OpenAI ou quota dépassé.

**Solution** :
1. Le système utilise un **fallback** : le résumé existant ou le titre
2. Vérifiez la clé API OpenAI
3. Vérifiez le quota OpenAI

---

## 📈 Statistiques et Suivi

### Dans Brevo

1. **Campagnes** → voir toutes les newsletters envoyées
2. **Rapports** :
   - Taux d'ouverture
   - Taux de clics
   - Désabonnements
3. **Contacts** → voir qui a reçu quoi

---

## 🎉 Résultat Final

Une fois tout configuré :

✅ **Publiez un épisode sur YouTube**  
⏳ **Attendez le prochain cron** (max 1-6h selon votre config)  
📧 **Tous vos abonnés reçoivent automatiquement un email magnifique**  
📊 **Consultez les stats dans Brevo**  

**Vous n'avez plus rien à faire !** 🚀

---

## 🔄 Workflow complet

```
Nouvel épisode YouTube publié
           ↓
Cron job appelle l'API (toutes les heures)
           ↓
Système détecte le nouvel épisode
           ↓
Récupère la transcription
           ↓
IA génère un teaser attractif
           ↓
Envoie l'email à tous les abonnés Brevo
           ↓
Enregistre l'épisode comme "envoyé"
           ↓
✅ TERMINÉ (ne renvoie plus pour cet épisode)
```

---

## 🎯 Points Clés

1. ✅ **Gratuit** : Toutes les solutions proposées sont gratuites
2. ✅ **Automatique** : Zéro intervention manuelle
3. ✅ **Sécurisé** : Token secret pour empêcher les abus
4. ✅ **Intelligent** : IA génère un teaser unique
5. ✅ **Sans doublon** : Chaque épisode n'est envoyé qu'une seule fois
6. ✅ **Professionnel** : Template d'email magnifique et responsive

---

## 📝 Checklist de Configuration

- [ ] Variable `CRON_SECRET` ajoutée (local + Netlify)
- [ ] Variable `NEXT_PUBLIC_BASE_URL` ajoutée sur Netlify
- [ ] `data/sent-newsletters.json` dans `.gitignore`
- [ ] Code déployé sur Netlify
- [ ] Compte cron-job.org créé
- [ ] Cron job configuré avec le bon URL et secret
- [ ] Test manuel réussi
- [ ] Premier envoi automatique confirmé

---

**Besoin d'aide ?** Consultez les logs Netlify ou testez manuellement avec curl ! 🚀
