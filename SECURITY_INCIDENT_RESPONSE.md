# 🚨 INCIDENT DE SÉCURITÉ - CLÉS API EXPOSÉES

## ⚠️ URGENT : Actions Immédiates Requises

Vos clés API ont été exposées publiquement sur GitHub. Suivez ces étapes **immédiatement** :

---

## 📋 Checklist de Sécurité

### ✅ ÉTAPE 1 : RÉVOQUER LES CLÉS EXPOSÉES (FAIRE EN PREMIER)

#### 1.1 Resend API Key
1. Allez sur https://resend.com/api-keys
2. Trouvez la clé : `re_ibj1PQd6_DmG9NGFuDc5X9ix3wh9QzFUL`
3. **SUPPRIMEZ** cette clé immédiatement
4. Créez une **nouvelle clé API**
5. Mettez à jour `.env.local` avec la nouvelle clé

#### 1.2 YouTube API Key
1. Allez sur https://console.cloud.google.com/apis/credentials
2. Trouvez la clé qui était dans `.env.local` (commence par `AIzaSy...`)
3. **SUPPRIMEZ** ou **régénérez** cette clé
4. Créez une nouvelle clé si nécessaire
5. Mettez à jour `.env.local` avec la nouvelle clé

#### 1.3 OpenAI API Key
1. Allez sur https://platform.openai.com/api-keys
2. Trouvez la clé qui était dans `.env.local` (commence par `sk-proj-...`)
3. **RÉVOQUEZ** cette clé immédiatement
4. Créez une nouvelle clé API
5. Mettez à jour `.env.local` avec la nouvelle clé

### ✅ ÉTAPE 2 : NETTOYER L'HISTORIQUE GIT

Une fois que TOUTES les clés ont été révoquées, exécutez :

```bash
cd /Users/wesleybentura/website_debriefpodcast

# Option 1 : Utiliser BFG Repo Cleaner (recommandé, plus rapide)
# Installer BFG si nécessaire
brew install bfg

# Remplacer toutes les occurrences des clés dans l'historique
bfg --replace-text secrets.txt

# Option 2 : Utiliser git filter-repo (alternative)
# Installer git-filter-repo si nécessaire
brew install git-filter-repo

# Créer un fichier avec les patterns à supprimer
# Note: Remplacez avec vos vraies clés exposées
cat > patterns.txt << 'EOF'
YOUR_RESEND_API_KEY_HERE
YOUR_YOUTUBE_API_KEY_HERE
YOUR_OPENAI_API_KEY_HERE
EOF

git filter-repo --replace-text patterns.txt

# Nettoyer
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Forcer la mise à jour sur GitHub (ATTENTION : casse l'historique pour les collaborateurs)
git push origin main --force
```

### ✅ ÉTAPE 3 : METTRE À JOUR NETLIFY

1. Allez sur https://app.netlify.com/
2. Sélectionnez votre site
3. Site settings → Environment variables
4. **METTEZ À JOUR** toutes les clés API avec les nouvelles valeurs :
   - `RESEND_API_KEY` → nouvelle clé Resend
   - `YOUTUBE_API_KEY` → nouvelle clé YouTube
   - `OPENAI_API_KEY` → nouvelle clé OpenAI

### ✅ ÉTAPE 4 : VÉRIFICATIONS

```bash
# Vérifier qu'aucune clé n'est présente dans les fichiers trackés
git grep -E "re_[a-zA-Z0-9]{32}|AIzaSy[a-zA-Z0-9_-]{33}|sk-[a-zA-Z0-9]{48}" || echo "✅ Aucune clé trouvée"

# Vérifier le .gitignore
cat .gitignore | grep ".env.local" || echo "⚠️ Ajouter .env.local au .gitignore"

# Vérifier que .env.local n'est pas tracké
git ls-files | grep ".env.local" && echo "❌ .env.local est tracké !" || echo "✅ .env.local n'est pas tracké"
```

---

## 📝 Ce qui a été fait

✅ J'ai retiré les clés des fichiers de documentation
✅ J'ai committé les changements
✅ J'ai créé ce guide de réponse à l'incident

## ⚠️ Ce que VOUS devez faire maintenant

1. **RÉVOQUER TOUTES LES CLÉS** (étape 1 ci-dessus) - **URGENT**
2. Nettoyer l'historique Git (étape 2)
3. Mettre à jour Netlify (étape 3)
4. Vérifier que tout est sécurisé (étape 4)

---

## 🔒 Prévention Future

Pour éviter que cela se reproduise :

1. **Ne jamais committer de fichiers `.env*`**
   - ✅ Déjà dans le `.gitignore`

2. **Utiliser des placeholders dans la documentation**
   - ✅ Déjà corrigé

3. **Vérifier avant chaque commit**
   ```bash
   git diff --cached | grep -E "(API|KEY|SECRET|TOKEN)" && echo "⚠️ ATTENTION : Possible clé API détectée"
   ```

4. **Utiliser des outils de scan**
   - Installer `git-secrets` : `brew install git-secrets`
   - Configurer : `git secrets --install`

5. **Rotation régulière des clés**
   - Changer les clés API tous les 3-6 mois

---

## 📞 Support

Si vous avez des questions ou besoin d'aide :
- Documentation Resend : https://resend.com/docs
- Documentation OpenAI : https://platform.openai.com/docs
- Documentation Google Cloud : https://cloud.google.com/docs

---

**🔴 RAPPEL : Révoquez d'abord les clés avant de nettoyer l'historique !**
