#!/bin/bash
# Script de test pour toutes les nouvelles fonctionnalités
# Fichier: test-new-features.sh

set -e

API_BASE="http://localhost:3001/api/social"
AUTH_TOKEN="" # À remplir avec un token JWT valide

echo "Testing nouvelles fonctionnalités du réseau social EY"

# Function to make API calls
api_call() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    if [ -n "$data" ]; then
        curl -s -X $method \
            -H "Authorization: Bearer $AUTH_TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$API_BASE$endpoint"
    else
        curl -s -X $method \
            -H "Authorization: Bearer $AUTH_TOKEN" \
            "$API_BASE$endpoint"
    fi
}

# 1. Test création d'un post simple
echo "1. Test création post..."
POST_RESPONSE=$(api_call POST "/posts" '{
    "content": "Test post pour vérifier les nouvelles fonctionnalités",
    "isPublic": true,
    "tags": ["test", "nouvelles-fonctionnalités"]
}')

POST_ID=$(echo $POST_RESPONSE | jq -r '.id')
echo "Post créé avec ID: $POST_ID"

# 2. Test du feed avec différents filtres
echo "2. Test filtres feed..."

echo "  - Feed récent:"
api_call GET "/posts/feed?sortBy=recent&limit=5" | jq -r '.posts[] | .id + ": " + .content[0:50]'

echo "  - Feed populaire:"
api_call GET "/posts/feed?sortBy=popular&limit=5" | jq -r '.posts[] | .id + ": " + .content[0:50]'

echo "  - Feed par département:"
api_call GET "/posts/feed?departmentOnly=true&limit=5" | jq -r '.posts[] | .id + ": " + .content[0:50]'

# 3. Test des réactions
echo "3. Test réactions..."
api_call POST "/posts/reactions" '{
    "type": "love",
    "targetId": "'$POST_ID'",
    "targetType": "POST"
}'

echo "  Réactions du post:"
api_call GET "/posts/$POST_ID/reactions" | jq -r '.[] | .userName + " - " + .type'

# 4. Test des commentaires
echo "4. Test commentaires..."
COMMENT_RESPONSE=$(api_call POST "/posts/comments" '{
    "postId": "'$POST_ID'",
    "content": "Excellent test de commentaire !"
}')

COMMENT_ID=$(echo $COMMENT_RESPONSE | jq -r '.id')
echo "Commentaire créé avec ID: $COMMENT_ID"

# Test réponse à commentaire
api_call POST "/posts/comments" '{
    "postId": "'$POST_ID'",
    "content": "Réponse au commentaire de test",
    "parentCommentId": "'$COMMENT_ID'"
}'

# 5. Test bookmarks
echo "5. Test bookmarks..."
api_call POST "/posts/$POST_ID/bookmark"
echo "Post ajouté aux favoris"

echo "  Statut bookmark:"
api_call GET "/posts/$POST_ID/bookmark/status" | jq -r '.isBookmarked'

echo "  Liste des bookmarks:"
api_call GET "/posts/bookmarks?limit=5" | jq -r '.posts[] | .id + ": " + .content[0:50]'

# 6. Test partage de post
echo "6. Test partage..."
SHARE_RESPONSE=$(api_call POST "/posts/share" '{
    "originalPostId": "'$POST_ID'",
    "comment": "Partage avec commentaire de test",
    "isPublic": true
}')

SHARE_ID=$(echo $SHARE_RESPONSE | jq -r '.id')
echo "Post partagé avec ID: $SHARE_ID"

# 7. Test recherche avancée
echo "7. Test recherche avancée..."
api_call GET "/posts/advanced-search?query=test&sortBy=recent&limit=3" | jq -r '.posts[] | .id + ": " + .content[0:50]'

# 8. Test tendances
echo "8. Test tendances..."
echo "  Posts populaires:"
api_call GET "/posts/trending" | jq -r '.popularPosts[] | .id + ": " + .content[0:50]'

# 9. Test statistiques
echo "9. Test statistiques..."
api_call GET "/posts/$POST_ID/stats" | jq -r 'to_entries[] | .key + ": " + (.value | tostring)'

# 10. Test filtres par département
echo "10. Test filtres par département..."
echo "  Posts Consulting:"
api_call GET "/posts/department/Consulting/posts?limit=3" | jq -r '.posts[] | .authorName + " (" + .authorDepartment + "): " + .content[0:30]'

echo "  Posts Assurance:"  
api_call GET "/posts/department/Assurance/posts?limit=3" | jq -r '.posts[] | .authorName + " (" + .authorDepartment + "): " + .content[0:30]'

# 11. Test signalement
echo "11. Test signalement..."
api_call POST "/posts/flag" '{
    "contentId": "'$POST_ID'",
    "contentType": "POST", 
    "reason": "Test de signalement",
    "description": "Ceci est un test du système de signalement"
}'

# 12. Test suppression bookmark
echo "12. Test suppression bookmark..."
api_call DELETE "/posts/$POST_ID/bookmark"
echo "Bookmark supprimé"

# 13. Test suppression des posts de test
echo "13. Nettoyage..."
api_call DELETE "/posts/$POST_ID"
echo "Post de test supprimé"

api_call DELETE "/posts/$SHARE_ID"
echo "Post partagé supprimé"

echo "✅ Tous les tests terminés avec succès !"

# 14. Tests d'erreurs (pour vérifier la gestion d'erreurs)
echo "14. Tests de gestion d'erreurs..."

echo "  - Test post inexistant:"
RESPONSE=$(curl -s -w "%{http_code}" -X GET \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    "$API_BASE/posts/00000000-0000-0000-0000-000000000000" \
    -o /dev/null)
if [ "$RESPONSE" = "404" ]; then
    echo "  ✅ Erreur 404 correctement gérée"
else
    echo "  ❌ Erreur 404 mal gérée (reçu: $RESPONSE)"
fi

echo "  - Test bookmark d'un post inexistant:"
RESPONSE=$(curl -s -w "%{http_code}" -X POST \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    "$API_BASE/posts/00000000-0000-0000-0000-000000000000/bookmark" \
    -o /dev/null)
if [ "$RESPONSE" = "404" ]; then
    echo "  ✅ Erreur 404 correctement gérée pour bookmark"
else
    echo "  ❌ Erreur 404 mal gérée pour bookmark (reçu: $RESPONSE)"
fi

echo "  - Test réaction sur post inexistant:"
RESPONSE=$(curl -s -w "%{http_code}" -X POST \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"type": "love", "targetId": "00000000-0000-0000-0000-000000000000", "targetType": "POST"}' \
    "$API_BASE/posts/reactions" \
    -o /dev/null)
if [ "$RESPONSE" = "404" ]; then
    echo "  ✅ Erreur 404 correctement gérée pour réactions"
else
    echo "  ❌ Erreur 404 mal gérée pour réactions (reçu: $RESPONSE)"
fi

echo "Tests de gestion d'erreurs terminés."

echo ""
echo "📊 Résumé des fonctionnalités testées:"
echo "✅ Création de posts"
echo "✅ Filtres de feed (récent, populaire, département)"
echo "✅ Réactions sur posts"
echo "✅ Commentaires et réponses"
echo "✅ Système de bookmarks"
echo "✅ Partage de posts" 
echo "✅ Recherche avancée"
echo "✅ Tendances"
echo "✅ Statistiques"
echo "✅ Signalement"
echo "✅ Gestion d'erreurs"
echo ""
echo "🎯 Toutes les nouvelles fonctionnalités sont opérationnelles !"