# 🚀 Quick Start - Automatisation Newsletter

## ✅ Ce qui a été créé

1. **`src/app/api/newsletter/auto-send/route.ts`** - L'endpoint principal qui gère tout
2. **`data/sent-newsletters.json`** - Fichier de tracking des épisodes envoyés
3. **`NEWSLETTER_AUTOMATION_GUIDE.md`** - Guide complet (à lire !)

---

## 🧪 Test Rapide (5 minutes)

### 1. Le serveur tourne déjà en local

Le serveur devrait déjà tourner sur `http://localhost:3000`

### 2. Testez l'endpoint

Ouvrez un terminal et lancez :

```bash
curl -X POST http://localhost:3000/api/newsletter/auto-send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer debrief-newsletter-secret-2026"
```

### 3. Résultat attendu

Si un nouvel épisode est détecté (pas encore envoyé) :

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
  "message": "Newsletter already sent for this episode"
}
```

---

## 📧 Que se passe-t-il ?

1. ✅ Détecte le dernier épisode YouTube
2. ✅ Récupère la transcription automatiquement
3. ✅ Génère un teaser attractif avec OpenAI
4. ✅ Envoie un email à **TOUS les abonnés Brevo**
5. ✅ Enregistre l'épisode pour ne plus le renvoyer

---

## ⚠️ Important avant de déployer

Le test en local va **vraiment envoyer** un email à tous vos abonnés Brevo !

Si vous voulez juste tester sans envoyer :
1. Commentez temporairement l'appel à `sendNewsletterToSubscribers()` dans le code
2. Ou créez une liste de test dans Brevo avec juste votre email

---

## 🚀 Prochaines étapes

1. **Lisez** `NEWSLETTER_AUTOMATION_GUIDE.md` (guide complet)
2. **Configurez** un cron job sur cron-job.org (gratuit)
3. **Déployez** sur Netlify
4. **Testez** en production

---

## 🎯 Configuration Netlify (rapide)

Ajoutez ces 2 nouvelles variables dans Netlify :

| Variable | Valeur |
|----------|--------|
| `CRON_SECRET` | `debrief-newsletter-secret-2026` |
| `NEXT_PUBLIC_BASE_URL` | `https://votre-site.netlify.app` |

Puis :

```bash
git add -A
git commit -m "Add newsletter automation system"
git push origin main
```

---

## 📖 Documentation Complète

Consultez **`NEWSLETTER_AUTOMATION_GUIDE.md`** pour :
- Configuration du cron job
- Personnalisation du template
- Dépannage
- Et bien plus !

---

**Vous êtes prêt ! 🎉**
