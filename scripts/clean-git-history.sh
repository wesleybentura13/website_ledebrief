#!/bin/bash

# Script pour nettoyer les clés API de l'historique Git
# ⚠️ IMPORTANT : Révoquez d'abord toutes les clés avant d'exécuter ce script !

set -e

echo "🚨 NETTOYAGE DE L'HISTORIQUE GIT"
echo "================================"
echo ""
echo "⚠️  AVERTISSEMENT IMPORTANT :"
echo "   Ce script va réécrire l'historique Git."
echo "   Assurez-vous d'avoir RÉVOQUÉ toutes les clés API exposées avant de continuer."
echo ""
read -p "Avez-vous révoqué toutes les clés API exposées ? (oui/non) " -n 3 -r
echo
if [[ ! $REPLY =~ ^[Oo][Uu][Ii]$ ]]
then
    echo "❌ Veuillez d'abord révoquer les clés API, puis relancez ce script."
    exit 1
fi

echo ""
echo "📝 Création du fichier de remplacement..."

# Créer un fichier avec les patterns à remplacer
# Note: Remplacez XXX par les vraies clés exposées avant d'exécuter
cat > /tmp/git-secrets-replace.txt << 'EOF'
RESEND_API_KEY_TO_REPLACE==>RESEND_API_KEY_REDACTED
YOUTUBE_API_KEY_TO_REPLACE==>YOUTUBE_API_KEY_REDACTED
OPENAI_API_KEY_TO_REPLACE==>OPENAI_API_KEY_REDACTED
wesleybentura@gmail.com==>admin@example.com
EOF

echo "⚠️  IMPORTANT : Vous devez éditer /tmp/git-secrets-replace.txt"
echo "   et remplacer les placeholders par les vraies clés exposées"
echo ""
read -p "Voulez-vous éditer le fichier maintenant ? (oui/non) " -n 3 -r
echo
if [[ $REPLY =~ ^[Oo][Uu][Ii]$ ]]
then
    ${EDITOR:-nano} /tmp/git-secrets-replace.txt
fi

echo "✅ Fichier de remplacement créé"
echo ""

# Vérifier si BFG est installé
if command -v bfg &> /dev/null; then
    echo "🔧 Utilisation de BFG Repo Cleaner..."
    echo ""
    
    # Créer un backup
    echo "💾 Création d'un backup..."
    cd ..
    if [ -d "website_debriefpodcast_backup" ]; then
        rm -rf website_debriefpodcast_backup
    fi
    cp -r website_debriefpodcast website_debriefpodcast_backup
    cd website_debriefpodcast
    echo "✅ Backup créé dans ../website_debriefpodcast_backup"
    echo ""
    
    # Nettoyer avec BFG
    echo "🧹 Nettoyage de l'historique..."
    bfg --replace-text /tmp/git-secrets-replace.txt
    
    echo ""
    echo "🗑️  Nettoyage des références..."
    git reflog expire --expire=now --all
    git gc --prune=now --aggressive
    
else
    echo "❌ BFG n'est pas installé."
    echo ""
    echo "Installation :"
    echo "  brew install bfg"
    echo ""
    echo "Ou utilisez git filter-repo :"
    echo "  brew install git-filter-repo"
    echo "  git filter-repo --replace-text /tmp/git-secrets-replace.txt"
    exit 1
fi

echo ""
echo "✅ Historique nettoyé !"
echo ""
echo "📤 Prochaines étapes :"
echo "   1. Vérifiez les changements : git log --oneline"
echo "   2. Poussez vers GitHub : git push origin main --force"
echo ""
echo "⚠️  ATTENTION : Le force push écrasera l'historique distant."
echo "   Si d'autres personnes travaillent sur ce repo, prévenez-les."
echo ""
read -p "Voulez-vous pousser maintenant ? (oui/non) " -n 3 -r
echo
if [[ $REPLY =~ ^[Oo][Uu][Ii]$ ]]
then
    echo "📤 Push en cours..."
    git push origin main --force
    echo ""
    echo "✅ Historique nettoyé et poussé sur GitHub !"
else
    echo "ℹ️  Vous pourrez pousser plus tard avec : git push origin main --force"
fi

echo ""
echo "🎉 Nettoyage terminé !"
echo ""
echo "🔍 Vérification finale..."
echo "   Vérifier qu'aucune clé n'est présente :"
echo "   git log -p | grep -E 're_[a-zA-Z0-9]{32}|AIzaSy|sk-proj-' && echo '❌ Clés trouvées!' || echo '✅ Aucune clé trouvée'"
echo ""

# Nettoyer le fichier temporaire
rm /tmp/git-secrets-replace.txt
