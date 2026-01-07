# Problème de Transcription YouTube

## Problème Actuel

Le package `youtube-transcript` rencontre une erreur "fetch failed" lors de la récupération des transcriptions. Cela est probablement dû à des problèmes SSL/certificats sur votre système.

## Solutions

### Solution 1: Activer les sous-titres sur YouTube (Recommandé)

1. Allez sur YouTube Studio: https://studio.youtube.com/
2. Sélectionnez une vidéo
3. Allez dans "Sous-titres" dans le menu de gauche
4. Cliquez sur "Ajouter une langue"
5. Sélectionnez "Français" et choisissez "Générer automatiquement"
6. Répétez pour tous vos épisodes

Une fois les sous-titres activés, le package devrait pouvoir les récupérer.

### Solution 2: Utiliser l'API YouTube Data API v3

Nous avons créé une route alternative `/api/newsletter/transcript-youtube-api` qui utilise l'API YouTube officielle. Cependant, cela nécessite OAuth pour télécharger les captions.

### Solution 3: Télécharger manuellement les transcriptions

Vous pouvez télécharger les transcriptions depuis YouTube Studio et les ajouter manuellement au système.

### Solution 4: Utiliser Whisper API ou autre service de transcription

Alternatives:
- OpenAI Whisper API
- AssemblyAI
- Google Speech-to-Text

## Test Rapide

Pour vérifier si les sous-titres sont disponibles sur une vidéo:
1. Allez sur la vidéo YouTube
2. Cliquez sur les trois points (⋯)
3. Vérifiez "Afficher la transcription"

Si la transcription apparaît, les sous-titres sont disponibles et devraient fonctionner avec notre système.


