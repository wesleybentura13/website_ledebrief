# 📍 Où trouver les inscrits Newsletter dans Netlify

## 🎯 Emplacement exact

### Chemin complet :
```
Netlify Dashboard
  → [Votre Site]
    → Forms (menu latéral gauche)
      → newsletter (liste des formulaires)
        → Submissions (onglet par défaut)
```

---

## 📋 Instructions détaillées

### 1. Connexion à Netlify
- Allez sur : https://app.netlify.com
- Connectez-vous avec votre compte
- Vous verrez la liste de vos sites

### 2. Sélectionner votre site
- Cliquez sur votre site (probablement "website_ledebrief" ou similaire)
- Vous arrivez sur le dashboard du site

### 3. Trouver le menu Forms
**Dans le menu latéral GAUCHE**, cherchez :
```
Sites
Deploys
🔍 Forms     ← CLIQUEZ ICI
Functions
Integrations
Analytics
...
```

### 4. Voir le formulaire newsletter
Une fois dans "Forms", vous verrez :
- **Active forms** : Liste de tous vos formulaires
- Cherchez **"newsletter"** dans la liste
- Cliquez sur le nom "newsletter"

### 5. Consulter les inscriptions
Vous verrez maintenant :
- **Submissions** (onglet actif)
- Liste de toutes les soumissions avec :
  - Date
  - Email
  - Prénom (firstName)
  - Actions (Voir détails, Supprimer)

---

## ⚠️ Si le formulaire n'apparaît pas

### Cause probable : Le déploiement n'est pas encore terminé

**Vérifiez le statut du déploiement :**

1. Allez dans **Deploys** (menu latéral)
2. Regardez le dernier déploiement :
   - 🟢 **Published** = Déploiement réussi
   - 🟡 **Building** = En cours...
   - 🔴 **Failed** = Erreur

### Si le statut est "Building" :
- ⏰ **Attendez** que ça devienne "Published" (2-5 minutes)
- Le formulaire apparaîtra automatiquement dans "Forms"

### Si le statut est "Failed" :
1. Cliquez sur le déploiement
2. Regardez les logs d'erreur
3. Cherchez des erreurs de build

### Si le statut est "Published" mais pas de formulaire :
Le formulaire apparaîtra **après la première soumission**.

**Solution :** Testez l'inscription sur votre site en production :
1. Allez sur votre site (URL de production)
2. Scrollez jusqu'à la section Newsletter
3. Inscrivez-vous avec un email de test
4. Retournez dans Netlify → Forms
5. Le formulaire "newsletter" devrait maintenant apparaître !

---

## 📸 Captures d'écran aide-mémoire

### Navigation :
```
┌─────────────────────────────────────┐
│  Netlify Dashboard                  │
├─────────────────────────────────────┤
│  ◉ Sites                            │
│  ☐ Deploys                          │
│  ☐ Forms          ← ICI !           │
│  ☐ Functions                        │
│  ☐ Integrations                     │
└─────────────────────────────────────┘
```

### Page Forms :
```
┌─────────────────────────────────────┐
│  Forms                              │
├─────────────────────────────────────┤
│  Active forms                       │
│                                     │
│  📋 newsletter  (5 submissions)     │
│     ↑                               │
│     Cliquez ici                     │
└─────────────────────────────────────┘
```

### Page Submissions :
```
┌─────────────────────────────────────┐
│  newsletter                         │
│  ┌─────────────────────────────┐   │
│  │ Submissions │ Settings │... │   │
│  └─────────────────────────────┘   │
│                                     │
│  Date          Email       Name     │
│  Jan 25, 2026  test@...    John     │
│  Jan 24, 2026  user@...    Marie    │
│  ...                                │
│                                     │
│  [Export CSV]                       │
└─────────────────────────────────────┘
```

---

## 💡 Actions disponibles

Une fois sur la page des submissions :

### Voir une soumission :
- Cliquez sur une ligne
- Détails complets s'affichent

### Exporter en CSV :
- Bouton **"Export"** en haut à droite
- Télécharge un fichier CSV avec tous les inscrits

### Supprimer une soumission :
- Cliquez sur la ligne
- Bouton "Delete" dans les détails

### Configurer les notifications :
- Onglet **"Settings"**
- Vous pouvez configurer des notifications email à chaque soumission

---

## 🔍 Résolution de problèmes

### "Je ne vois pas Forms dans le menu"
- Scrollez dans le menu latéral gauche
- C'est entre "Deploys" et "Functions"
- Si vraiment absent : votre plan Netlify ne l'inclut pas (improbable)

### "Je vois Forms mais pas de formulaire 'newsletter'"
1. Le déploiement n'est pas terminé → Attendez
2. Aucune soumission encore → Testez une inscription
3. Le formulaire n'a pas été détecté → Vérifiez les logs de build

### "J'ai un formulaire mais pas de soumissions"
- Testez l'inscription sur votre site en production
- Vérifiez la console navigateur pour les erreurs
- Regardez les logs de la fonction `submission-created`

---

## 📞 URL directe

Une fois votre site déployé, l'URL directe sera :
```
https://app.netlify.com/sites/[VOTRE-SITE]/forms/newsletter
```

Remplacez `[VOTRE-SITE]` par le nom de votre site.

---

## ✅ Checklist rapide

- [ ] Aller sur https://app.netlify.com
- [ ] Sélectionner mon site
- [ ] Cliquer sur "Forms" dans le menu gauche
- [ ] Chercher "newsletter" dans la liste
- [ ] Cliquer sur "newsletter"
- [ ] Voir les soumissions !

---

**Si vous ne trouvez toujours pas, dites-moi à quelle étape vous êtes bloqué et je vous aide ! 🚀**
