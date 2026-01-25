# Guide d'Inscription à la Newsletter

## 🎯 Fonctionnalités

Le système d'inscription à la newsletter comprend maintenant :

### ✅ Pour les nouveaux inscrits :
- **Email de bienvenue automatique** : Un message sympa et stylé dans les couleurs du Débrief
- Confirmation que l'inscription est bien prise en compte
- Liens vers YouTube, Spotify, Instagram
- Information sur ce qu'ils vont recevoir chaque semaine

### ✅ Pour vous (Wesley) :
- **Notification par email** à chaque nouvel inscrit
- Vous recevez l'email et le prénom de la personne
- Date et heure d'inscription
- Envoyé à : `wesleybentura@gmail.com` (configurable dans `.env.local`)

### ✅ Sauvegarde automatique :
- Tous les inscrits sont sauvegardés dans `data/newsletter-subscribers.json`
- Format : `{ email, firstName, subscribedAt }`
- Prêt pour l'envoi des newsletters hebdomadaires

## 📧 Configuration des Emails

Les emails sont envoyés via **Resend** avec les paramètres suivants :

```env
RESEND_API_KEY=your-resend-api-key-here
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_FROM_NAME=Le Débrief Podcast
ADMIN_EMAIL=your-email@example.com
```

### Personnaliser l'email d'expédition :
Pour utiliser votre propre domaine (ex: `newsletter@ledebrief.com`), vous devez :
1. Configurer le domaine dans Resend
2. Mettre à jour `RESEND_FROM_EMAIL` dans `.env.local`

## 🧪 Tester le système

### Méthode 1 : Via le site web
1. Ouvrez http://localhost:3000
2. Scrollez jusqu'à la section Newsletter
3. Entrez un email de test
4. Cliquez sur "S'abonner"
5. ✅ Vous devriez recevoir :
   - Un email de bienvenue sur l'email inscrit
   - Un email de notification sur `wesleybentura@gmail.com`

### Méthode 2 : Via curl (pour tester l'API)
```bash
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "Jean"
  }'
```

## 📂 Structure des fichiers

```
├── src/
│   ├── app/
│   │   └── api/
│   │       └── newsletter/
│   │           └── route.ts              # API d'inscription
│   ├── components/
│   │   └── NewsletterForm.tsx            # Formulaire frontend
│   └── lib/
│       └── email.ts                      # Fonctions d'envoi d'emails
└── data/
    └── newsletter-subscribers.json       # Liste des inscrits
```

## 🎨 Personnalisation des emails

Les templates d'emails se trouvent dans `src/lib/email.ts` :

- **`generateWelcomeEmailTemplate()`** : Email de bienvenue (design moderne avec gradients)
- **`generateAdminNotificationTemplate()`** : Email de notification pour l'admin
- **`generateEmailTemplate()`** : Email hebdomadaire avec le nouvel épisode

Vous pouvez modifier le contenu, les couleurs, les liens, etc. dans ces fonctions.

## 📊 Voir tous les inscrits

Pour consulter la liste complète des inscrits :

```bash
cat data/newsletter-subscribers.json | jq
```

## 🚀 Déploiement sur Netlify

Les variables d'environnement doivent être configurées dans :
**Netlify Dashboard → Site settings → Environment variables**

Ajoutez :
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_FROM_NAME`
- `ADMIN_EMAIL`

## ⚠️ Sécurité

- ❌ Ne commitez **JAMAIS** le fichier `.env.local`
- ✅ Le fichier `.gitignore` est déjà configuré pour l'exclure
- ✅ Les clés API sont côté serveur uniquement (pas exposées au client)
- ✅ Validation de format d'email avant inscription
- ✅ Vérification des doublons (impossible de s'inscrire deux fois)

## 📝 Maintenance

### Supprimer un inscrit
Éditez manuellement `data/newsletter-subscribers.json` et supprimez l'entrée correspondante.

### Exporter la liste
```bash
jq -r '.[] | [.email, .firstName, .subscribedAt] | @csv' data/newsletter-subscribers.json > subscribers.csv
```

### Statistiques
```bash
# Nombre total d'inscrits
jq 'length' data/newsletter-subscribers.json

# Inscrits des 7 derniers jours
jq '[.[] | select(.subscribedAt > (now - 7*24*60*60 | strftime("%Y-%m-%dT%H:%M:%S.%fZ")))] | length' data/newsletter-subscribers.json
```

## 🎉 C'est prêt !

Le système est maintenant opérationnel. Chaque nouvel inscrit recevra un email de bienvenue, et vous serez notifié à chaque nouvelle inscription !
